import { Entity } from './entity.js';
import { ENEMIES_DB } from '../data/enemies.js';
import { GameState } from '../core/gameState.js';
import { UISystem } from '../ui/ui.js';
import { LootSystem } from '../systems/loot.js';
import { SceneManager } from '../core/sceneManager.js';
import { SpriteSystem } from '../systems/sprite.js';
import { CONFIG } from '../data/config.js';
import { CombatSystem } from '../systems/combat.js';

export class Enemy extends Entity {
  constructor(dbId, x, y) {
    const base = ENEMIES_DB[dbId];
    super(x, y, base.r);
    this.base = base;
    this.hp = base.maxHp;
    this.state = 'idle';
    this.atkCd = 0;
    this.alive = true;
    this.homeX = x;
    this.homeY = y;
    this.respawnTimer = 0;
    this.detectionRange = base.aggro;
    this.attackRange = base.attackRange || base.r + 18;
    this.leashRange = base.leashRange || base.aggro * 2.5;
    this.behaviorType = base.behaviorType || (base.type === 'boss' ? 'boss' : 'aggressive');
    this.patrolAngle = Math.random() * Math.PI * 2;
  }

  die() {
    this.alive = false;
    this.updateState('dead');
    this.respawnTimer = this.base.respawnTime;
    
    const g = Math.floor(Math.random() * (this.base.gold[1] - this.base.gold[0])) + this.base.gold[0];
    GameState.player.gold += g;
    GameState.player.addExp(this.base.exp);
    
    UISystem.logMsg(`Derrotou ${this.base.name}! +${g} Ouro`, 'gold');
    
    if (this.base.type === 'boss' || Math.random() <= 0.6) {
      LootSystem.spawnDrop(this.x, this.y, this.base.drop);
    }
    if (this.base.type === 'boss') {
      UISystem.logMsg('✨ CHEFE DERROTADO!', 'gold');
    }
  }

  update(dt) {
    if (!this.alive) {
      if (this.base.type !== 'boss') {
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          this.hp = this.base.maxHp;
          this.alive = true;
          this.updateState('idle');
          this.x = this.homeX;
          this.y = this.homeY;
        }
      }
      return;
    }
    
    super.update(dt);
    if (this.state === 'hurt') {
      if (this.stateTimer < CONFIG.HURT_LOCK_TIME) return;
      this.updateState('aggro');
    }
    
    if (this.atkCd > 0) this.atkCd -= dt;
    
    const p = GameState.player;
    const d = Math.hypot(p.x - this.x, p.y - this.y);
    
    const homeDistance = Math.hypot(this.x - this.homeX, this.y - this.homeY);
    if (this.state === 'idle' && this.behaviorType !== 'passive' && d < this.detectionRange) {
      this.updateState('aggro');
    }
    if (this.state === 'attacking' && this.stateTimer >= 0.18) this.updateState('aggro');
    
    if (this.state === 'aggro' || this.state === 'moving') {
      if (homeDistance > this.leashRange && this.base.type !== 'boss') {
        this.updateState('retreat');
      } else if (d > this.attackRange + p.r) {
        this.updateState('moving');
        this.x += (p.x - this.x) / d * this.base.moveSpeed * CONFIG.ENEMY_SPEED_MULT * dt;
        this.y += (p.y - this.y) / d * this.base.moveSpeed * CONFIG.ENEMY_SPEED_MULT * dt;
        this.facing = (p.x - this.x) > 0 ? 'right' : 'left';
      } else if (this.atkCd <= 0) {
        this.updateState('attacking');
        this.atkCd = this.base.atkCd;
        if (CombatSystem.applyDamage(p, CombatSystem.calculateDamage(this, p), this)) {
          p.hp = p.maxHp;
          p.updateState('dead');
          UISystem.logMsg('💀 Derrotado! Retornando ao refúgio.', 'dmg');
          SceneManager.loadScene('cidade', 800, 600);
        }
      }
      if (d > this.base.aggro * 2.5) {
        this.updateState('idle');
      }
    }
    if (this.state === 'retreat') {
      const home = Math.hypot(this.homeX - this.x, this.homeY - this.y);
      if (home < 5) { this.updateState('idle'); return; }
      this.x += (this.homeX - this.x) / home * this.base.moveSpeed * dt;
      this.y += (this.homeY - this.y) / home * this.base.moveSpeed * dt;
    }
  }

  draw(ctx, camera) {
    if (!this.alive) return;
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    
    const offset = this.base.size * 0.82;
    
    SpriteSystem.draw(ctx, this.base.spriteKey, sx, sy, { state: this.state, frame: this.frameIndex, facing: this.facing, size: this.base.size, anchorY: this.base.size * 0.82 });
    
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.base.name, sx, sy - offset - 4);
    
    ctx.fillStyle = '#111';
    ctx.fillRect(sx - 20, sy - offset + 5, 40, 5);
    ctx.fillStyle = this.base.type === 'boss' ? '#d98c4e' : '#cc5965';
    ctx.fillRect(sx - 19, sy - offset + 6, 38 * (this.hp / this.base.maxHp), 3);
  }
}
