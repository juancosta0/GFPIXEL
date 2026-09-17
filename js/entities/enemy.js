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
import { QuestSystem } from '../systems/quests.js';
import { SaveSystem } from '../systems/save.js';
import { VFXSystem } from '../systems/vfx.js';
import { ParticleEffectsSystem } from '../systems/particleEffects.js';

let nextEnemyId = 1;

export class Enemy extends Entity {
  constructor(dbId, x, y) {
    const base = ENEMIES_DB[dbId];
    super(x, y, base.r);
    this.id = `enemy-${nextEnemyId++}`;
    this.base = base;
    this.enemyDbId = dbId;
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
    this.bossPhase = 1;
    this.previousBossPhase = 1;
    this.specialCooldown = 4;
    this.specialPending = false;
    this.telegraphTimer = 0;
    this.specialRadius = 72;
    this.patrolAngle = Math.random() * Math.PI * 2;
    this.introTimer = base.type === 'boss' ? 1.2 : 0;
  }

  die() {
    this.alive = false;
    this.updateState(AI_STATES.DEAD);
    this.respawnTimer = this.base.respawnTime;
    
    const g = Math.floor(Math.random() * (this.base.gold[1] - this.base.gold[0])) + this.base.gold[0];
    GameState.player.gold += g;
    ProgressionSystem.addExperience(GameState.player, this.base.exp);
    QuestSystem.onEvent('kill', this.enemyDbId);
    
    UISystem.logMsg(`Derrotou ${this.base.name}! +${g} Ouro`, 'gold');
    
    for (const item of LootSystem.roll(this)) LootSystem.spawnDrop(this.x, this.y, item);
    ParticleEffectsSystem.addImpact(this.x, this.y, this.base.type === 'boss' ? 'critical' : 'hit');
    if (this.base.type === 'boss') {
      UISystem.logMsg('✨ CHEFE DERROTADO!', 'gold');
      VFXSystem.bossPhase(this.x, this.y);
      SaveSystem.saveGame();
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
    if (this.introTimer > 0) {
      this.introTimer -= dt;
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
    this.updateBossSpecial(dt, p, d);
    
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

  updateBossSpecial(dt, player, distance) {
    if (this.base.type !== 'boss') return;
    this.bossPhase = this.hp <= this.base.maxHp * .33 ? 3 : this.hp <= this.base.maxHp * .66 ? 2 : 1;
    if (this.bossPhase !== this.previousBossPhase) {
      this.previousBossPhase = this.bossPhase;
      UISystem.logMsg(`${this.base.name} entrou na fase ${this.bossPhase}!`, 'dmg');
      VFXSystem.bossPhase(this.x, this.y);
    }
    if (this.telegraphTimer > 0) {
      this.telegraphTimer -= dt;
      if (this.telegraphTimer <= 0) {
        this.specialPending = false;
        if (distance <= this.specialRadius + player.r && CombatSystem.applyDamage(player, CombatSystem.calculateDamage(this, player, 1.25), this)) {
          player.hp = player.maxHp;
          player.updateState('dead');
          UISystem.logMsg('💀 Derrotado! Retornando ao refúgio.', 'dmg');
          SceneManager.loadScene('cidade', 800, 600);
        }
      }
      return;
    }
    this.specialCooldown -= dt;
    if (this.specialCooldown <= 0 && !this.specialPending) {
      this.specialPending = true;
      this.telegraphTimer = .75;
      this.specialRadius = 62 + this.bossPhase * 12;
      this.specialCooldown = Math.max(2.5, 5 - this.bossPhase * .7);
      UISystem.logMsg(`${this.base.name} prepara um ataque especial!`, 'dmg');
    }
  }

  draw(ctx, camera) {
    if (!this.alive) return;
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const bob = this.base.type === 'boss' ? Math.sin(GameState.elapsed * 2) * 2 : this.base.spriteKey === 'slime' ? Math.sin(GameState.elapsed * 5) * 2 : 0;
    
    const offset = this.base.size * 0.82;
    const slimeMotion = this.base.spriteKey === 'slime' ? Math.sin(GameState.elapsed * (this.state === AI_STATES.ATTACK ? 12 : 7)) : 0;
    const spriteWidth = this.base.size * (this.base.spriteKey === 'slime' ? 1 + slimeMotion * .06 : 1);
    const spriteHeight = this.base.size * (this.base.spriteKey === 'slime' ? 1 - slimeMotion * .045 : 1);
    const spriteState = this.state === AI_STATES.ATTACK ? 'attacking' : this.state === AI_STATES.CHASE || this.state === 'moving' ? 'moving' : 'idle';
    const introScale = this.base.type === 'boss' && this.introTimer > 0 ? 1 + (1.2 - this.introTimer) * .16 : 1;

    ctx.fillStyle = this.base.type === 'boss' ? 'rgba(35, 12, 22, .55)' : 'rgba(10, 18, 26, .38)';
    ctx.beginPath(); ctx.ellipse(sx, sy + 3, Math.max(13, this.base.size * .34), Math.max(4, this.base.size * .13), 0, 0, Math.PI * 2); ctx.fill();
    if (this.base.type === 'boss' || this.base.elite) {
      ctx.strokeStyle = this.base.type === 'boss' ? 'rgba(217, 90, 101, .42)' : 'rgba(244, 201, 106, .34)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(sx, sy + 3, Math.max(11, this.base.size * .28), Math.max(3, this.base.size * .1), 0, 0, Math.PI * 2); ctx.stroke();
    }
    
    ctx.save();
    if (this.lastHit && GameState.elapsed - this.lastHit.at < .12) ctx.filter = 'brightness(1.9)';
    SpriteSystem.draw(ctx, this.base.spriteKey, sx, sy + bob, { state: spriteState, frame: this.frameIndex, facing: this.facing, width: spriteWidth * introScale, height: spriteHeight * introScale, anchorY: this.base.size * .82 * introScale });
    ctx.restore();

    if (this.base.type === 'boss' && this.introTimer > 0) {
      ctx.globalAlpha = .25 + Math.sin(GameState.elapsed * 14) * .08;
      ctx.strokeStyle = '#d95a65';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(sx, sy, this.base.size * (.68 + (1.2 - this.introTimer) * .12), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (this.telegraphTimer > 0) {
      ctx.globalAlpha = .35 + Math.sin(this.telegraphTimer * 18) * .1;
      ctx.strokeStyle = this.bossPhase === 1 ? '#ef806c' : this.bossPhase === 2 ? '#f1d17a' : '#d95a65';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx, sy, this.specialRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (this.base.type === 'boss') {
      ctx.globalAlpha = .18 + this.bossPhase * .04;
      ctx.fillStyle = this.bossPhase === 1 ? '#78f3e3' : this.bossPhase === 2 ? '#f1d17a' : '#d95a65';
      ctx.beginPath(); ctx.arc(sx, sy + bob - offset / 2, offset * .8, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
    
    ctx.fillStyle = this.base.type === 'boss' ? '#ffe28a' : '#eef8f0';
    ctx.font = this.base.type === 'boss' ? 'bold 11px sans-serif' : '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.base.name, sx, sy - offset - 4);
    
    ctx.fillStyle = '#111';
    const barWidth = this.base.type === 'boss' ? 52 : this.base.elite ? 44 : 40;
    ctx.fillRect(sx - barWidth / 2, sy - offset + 5, barWidth, 5);
    ctx.fillStyle = this.base.type === 'boss' ? '#d98c4e' : this.base.elite ? '#e3b95f' : '#cc5965';
    ctx.fillRect(sx - barWidth / 2 + 1, sy - offset + 6, (barWidth - 2) * Math.max(0, this.hp / this.base.maxHp), 3);
  }
}
