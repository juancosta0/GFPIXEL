import { GameState } from '../core/gameState.js';
import { ParticleEffectsSystem } from './particleEffects.js';
import { CONFIG } from '../data/config.js';

export class CombatSystem {
  static angle(facing) { return facing === 'right' ? 0 : facing === 'down' ? Math.PI / 2 : facing === 'left' ? Math.PI : -Math.PI / 2; }
  static diff(a, b) { return Math.atan2(Math.sin(a - b), Math.cos(a - b)); }
  static calculateDamage(attacker, defender, multiplier = 1) {
    const crit = Math.random() < (attacker.critChance || 0);
    const defense = defender.def ?? defender.base?.defense ?? 0;
    return { amount: Math.max(CONFIG.MIN_DAMAGE, Math.round(((attacker.atk || attacker.base?.atk || 1) * multiplier - defense * .65) * (crit ? CONFIG.CRIT_MULT : 1))), crit };
  }
  static applyDamage(target, hit, source = null) {
    if (target.alive === false) return false;
    target.hp = Math.max(0, target.hp - hit.amount);
    target.lastHit = { ...hit, source, at: GameState.elapsed };
    if (target.wasAttacked !== undefined) target.wasAttacked = true;
    ParticleEffectsSystem.addDamageText(target.x, target.y - target.r - 12, hit.crit ? `${hit.amount}!` : hit.amount, hit.crit ? '#ffe28a' : '#ff8b86');
    GameState.hitStop = CONFIG.HIT_STOP_TIME;
    if (target.hp <= 0) return this.handleDeath(target);
    if (target !== GameState.player) target.updateState('hurt');
    return false;
  }
  static getHitbox(attacker, skill) {
    const angle = this.angle(attacker.facing);
    return { x: attacker.x, y: attacker.y, angle, range: skill.range, arc: skill.area || Math.PI * 2 };
  }
  static isInsideHitbox(target, hitbox) {
    const dx = target.x - hitbox.x, dy = target.y - hitbox.y;
    const distance = Math.hypot(dx, dy);
    if (distance > hitbox.range + target.r) return false;
    if (hitbox.arc >= Math.PI * 2) return true;
    return Math.abs(this.diff(Math.atan2(dy, dx), hitbox.angle)) <= hitbox.arc / 2;
  }
  static basicAttack() {
    const player = GameState.player;
    const skill = { ...this.basicAttackSkill(player), id: 'basic-attack' };
    player.updateState(skill.animation);
    const hitbox = this.getHitbox(player, skill);
    const hitId = `${player.id || 'player'}:${GameState.elapsed}`;
    for (const enemy of GameState.enemies) {
      if (enemy.alive && !GameState.hitRegistry.has(`${hitId}:${enemy.id}`) && this.isInsideHitbox(enemy, hitbox)) {
        GameState.hitRegistry.add(`${hitId}:${enemy.id}`);
        this.applyDamage(enemy, this.calculateDamage(player, enemy, skill.damage), player);
      }
    }
    GameState.hitRegistry.clear();
    ParticleEffectsSystem.addPlayerAttackEffect(player.x, player.y, hitbox.angle, skill.range * .7);
  }
  static basicAttackSkill(player) {
    return { range: CONFIG.BASIC_ATTACK_RANGE, area: CONFIG.BASIC_ATTACK_ARC, damage: 1, animation: 'attacking' };
  }
  static handleDeath(target) { if (target === GameState.player) return true; target.die(); return true; }
  static executePlayerSkill(skill) {
    const player = GameState.player, angle = this.angle(player.facing);
    player.updateState(skill.animation);
    if (skill.type === 'heal') { player.hp = Math.min(player.maxHp, player.hp + skill.healAmt); ParticleEffectsSystem.addDamageText(player.x, player.y - 45, `+${skill.healAmt}`, '#7ef0b2'); return; }
    if (skill.type === 'projectile') { GameState.projectiles.push({ x: player.x + Math.cos(angle) * 25, y: player.y + Math.sin(angle) * 25, angle, speed: 390, life: skill.range / 390, radius: skill.area, skill }); return; }
    const hitbox = this.getHitbox(player, skill);
    const hitId = `${player.id || 'player'}:${GameState.elapsed}:${skill.id}`;
    for (const enemy of GameState.enemies) {
      if (!enemy.alive) continue;
      if (!GameState.hitRegistry.has(`${hitId}:${enemy.id}`) && this.isInsideHitbox(enemy, hitbox)) {
        GameState.hitRegistry.add(`${hitId}:${enemy.id}`);
        this.applyDamage(enemy, this.calculateDamage(player, enemy, skill.damage), player);
      }
    }
    GameState.hitRegistry.clear();
    ParticleEffectsSystem.addPlayerAttackEffect(player.x, player.y, angle, skill.range * .7);
  }
  static update(dt) {
    for (let i = GameState.projectiles.length - 1; i >= 0; i--) {
      const p = GameState.projectiles[i]; p.x += Math.cos(p.angle) * p.speed * dt; p.y += Math.sin(p.angle) * p.speed * dt; p.life -= dt;
      const target = GameState.enemies.find(enemy => enemy.alive && Math.hypot(enemy.x - p.x, enemy.y - p.y) <= enemy.r + p.radius);
      if (target) { this.applyDamage(target, this.calculateDamage(GameState.player, target, p.skill.damage), GameState.player); p.life = 0; }
      if (p.life <= 0) GameState.projectiles.splice(i, 1);
    }
  }
  static draw(ctx, camera) { for (const p of GameState.projectiles) { const x = Math.round(p.x - camera.x), y = Math.round(p.y - camera.y); ctx.fillStyle = '#214869'; ctx.fillRect(x - 8, y - 8, 16, 16); ctx.fillStyle = '#75f4e5'; ctx.fillRect(x - 4, y - 4, 8, 8); } }
}
