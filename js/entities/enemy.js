import { Entity } from './entity.js';
import { ENEMIES_DB } from '../data/enemies.js';
import { GameState } from '../core/gameState.js';
import { UISystem } from '../ui/ui.js';
import { LootSystem } from '../systems/loot.js';
import { SceneManager } from '../core/sceneManager.js';
import { SpriteSystem } from '../systems/sprite.js';
import { CONFIG } from '../data/config.js';
import { CombatSystem } from '../systems/combat.js';
import { EnemyAISystem, AI_STATES } from '../systems/ai.js';
import { ProgressionSystem } from '../systems/progression.js';

let nextEnemyId = 1;

export class Enemy extends Entity {
  constructor(dbId, x, y) {
    const base = ENEMIES_DB[dbId];
    super(x, y, base.r);
    this.id = `enemy-${nextEnemyId++}`;
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
    this.movementSpeed = base.moveSpeed * CONFIG.ENEMY_SPEED_MULT;
    this.damage = base.damage ?? base.atk;
    this.defense = base.defense || 0;
    this.attackCooldown = base.attackCooldown ?? base.atkCd;
    this.aggroDuration = base.aggroDuration || 8;
    this.behaviorType = base.behaviorType || (base.type === 'boss' ? 'boss' : 'aggressive');
    this.wasAttacked = false;
    this.patrolAngle = Math.random() * Math.PI * 2;
  }

  die() {
    this.alive = false;
    this.updateState(AI_STATES.DEAD);
    this.respawnTimer = this.base.respawnTime;
    
    const g = Math.floor(Math.random() * (this.base.gold[1] - this.base.gold[0])) + this.base.gold[0];
    GameState.player.gold += g;
    ProgressionSystem.addExperience(GameState.player, this.base.exp);
    
    UISystem.logMsg(`Derrotou ${this.base.name}! +${g} Ouro`, 'gold');
    
    for (const item of LootSystem.roll(this)) LootSystem.spawnDrop(this.x, this.y, item);
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
          this.updateState(AI_STATES.IDLE);
          this.x = this.homeX;
          this.y = this.homeY;
        }
      }
      return;
    }
    
    super.update(dt);
    if (this.state === AI_STATES.HURT) {
      if (this.stateTimer < CONFIG.HURT_LOCK_TIME) return;
      this.updateState(AI_STATES.CHASE);
    }
    
    if (this.atkCd > 0) this.atkCd -= dt;
    
    const p = GameState.player;
    const d = Math.hypot(p.x - this.x, p.y - this.y);
    
    const homeDistance = Math.hypot(this.x - this.homeX, this.y - this.homeY);
    if (this.state === AI_STATES.IDLE && this.behaviorType !== 'passive' && EnemyAISystem.canAggro(this, d) && d < this.detectionRange) {
      this.updateState(AI_STATES.DETECT);
    }
    if (this.state === AI_STATES.DETECT) this.updateState(AI_STATES.CHASE);
    if (this.state === AI_STATES.ATTACK && this.stateTimer >= 0.18) this.updateState(AI_STATES.CHASE);
    
    if (this.state === AI_STATES.CHASE || this.state === 'moving') {
      if (EnemyAISystem.shouldLeash(this, homeDistance)) {
        this.updateState(AI_STATES.RETREAT);
      } else if (d > this.attackRange + p.r) {
        this.updateState(AI_STATES.CHASE);
        EnemyAISystem.moveTo(this, p.x, p.y, this.movementSpeed, dt);
      } else if (this.atkCd <= 0) {
        this.updateState(AI_STATES.ATTACK);
        this.atkCd = this.attackCooldown;
        if (CombatSystem.applyDamage(p, CombatSystem.calculateDamage(this, p), this)) {
          p.hp = p.maxHp;
          p.updateState('dead');
          UISystem.logMsg('💀 Derrotado! Retornando ao refúgio.', 'dmg');
          SceneManager.loadScene('cidade', 800, 600);
        }
      }
      if (d > this.detectionRange + this.leashRange) {
        this.updateState(AI_STATES.IDLE);
      }
    }
    if (this.state === AI_STATES.RETREAT) {
      const home = Math.hypot(this.homeX - this.x, this.homeY - this.y);
      if (home < 5) { this.wasAttacked = false; this.updateState(AI_STATES.IDLE); return; }
      EnemyAISystem.moveTo(this, this.homeX, this.homeY, this.movementSpeed, dt);
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
