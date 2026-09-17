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
    ParticleEffectsSystem.addDamageText(target.x, target.y - target.r - 12, hit.crit ? `${hit.amount}!` : hit.amount, hit.crit ? '#ffe28a' : '#ff8b86');
    GameState.hitStop = CONFIG.HIT_STOP_TIME;
    if (target.hp <= 0) return this.handleDeath(target);
    if (target !== GameState.player) target.updateState('hurt');
    return false;
  }
  static handleDeath(target) { if (target === GameState.player) return true; target.die(); return true; }
  static executePlayerSkill(skill) {
    const player = GameState.player, angle = this.angle(player.facing);
    player.updateState(skill.animation);
    if (skill.type === 'heal') { player.hp = Math.min(player.maxHp, player.hp + skill.healAmt); ParticleEffectsSystem.addDamageText(player.x, player.y - 45, `+${skill.healAmt}`, '#7ef0b2'); return; }
    if (skill.type === 'projectile') { GameState.projectiles.push({ x: player.x + Math.cos(angle) * 25, y: player.y + Math.sin(angle) * 25, angle, speed: 390, life: skill.range / 390, radius: skill.area, skill }); return; }
    for (const enemy of GameState.enemies) {
      if (!enemy.alive) continue;
      const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      const difference = Math.abs(this.diff(Math.atan2(enemy.y - player.y, enemy.x - player.x), angle));
      if (distance <= skill.range + enemy.r && difference <= skill.area / 2) this.applyDamage(enemy, this.calculateDamage(player, enemy, skill.damage), player);
    }
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
