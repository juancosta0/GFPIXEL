import { GameState } from '../core/gameState.js';
import { ParticleEffectsSystem } from './particleEffects.js';
import { CONFIG } from '../data/config.js';
import { getWeaponDefinition } from '../data/weapons.js';
import { Projectile } from '../entities/projectile.js';
import { VFXSystem } from './vfx.js';
import { Camera } from '../core/camera.js';

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
    ParticleEffectsSystem.addImpact(target.x, target.y, hit.crit ? 'critical' : 'hit');
    GameState.hitStop = CONFIG.HIT_STOP_TIME;
    Camera.shake(hit.crit ? 3 : 1.2, hit.crit ? .1 : .045);
    if (target.hp <= 0) return this.handleDeath(target);
    if (target !== GameState.player) target.updateState('hurt');
    return false;
  }
  static getWeaponAttack(player) {
    const definition = getWeaponDefinition(player.equipment.weapon);
    return { id: definition.id, name: definition.name, type: definition.attackType, animation: definition.attackAnimation.toLowerCase(), range: definition.attackRange, area: definition.hitboxType === 'arc' ? Math.PI / 1.55 : 0, damage: definition.damageMultiplier, mpCost: definition.category === 'STAFF' ? 3 : 0, cd: .32 / definition.attackSpeed, weapon: definition };
  }
  static beginWeaponAttack(skill) {
    const player = GameState.player;
    if (player.animationController && !player.animationController.finished && player.animationController.state !== 'IDLE') return;
    player.pendingAttack = skill;
    player.animationController.play(skill.weapon.attackAnimation, true);
    ParticleEffectsSystem.addWeaponCharge(player, skill.weapon.category);
  }
  static handleAnimationEvent(event, animation) {
    const player = GameState.player;
    const skill = player.pendingAttack;
    if (!skill) return;
    if (event === 'impact') this.resolveMeleeAttack(player, skill);
    if (event === 'release_arrow') this.releaseProjectile(player, skill, 'arrow');
    if (event === 'release_spell') this.releaseProjectile(player, skill, 'magic');
  }
  static resolveMeleeAttack(player, skill) {
    const hitbox = this.getHitbox(player, skill);
    for (const enemy of GameState.enemies) if (enemy.alive && this.isInsideHitbox(enemy, hitbox)) this.applyDamage(enemy, this.calculateDamage(player, enemy, skill.damage), player);
    ParticleEffectsSystem.addSlash(player.x, player.y, hitbox.angle, skill.range);
    VFXSystem.slash(player.x, player.y, hitbox.angle, skill.range, skill.weapon.category);
  }
  static releaseProjectile(player, skill, type) {
    const angle = this.angle(player.facing);
    const offset = 20;
    GameState.projectileEntities.push(new Projectile({ x: player.x + Math.cos(angle) * offset, y: player.y + Math.sin(angle) * offset - 8, angle, speed: skill.weapon.projectileSpeed, damage: skill.damage, owner: player, type, lifetime: skill.weapon.projectileLifetime }));
    ParticleEffectsSystem.addRelease(player.x + Math.cos(angle) * offset, player.y + Math.sin(angle) * offset, type);
    if (type === 'magic') VFXSystem.magicImpact(player.x + Math.cos(angle) * offset, player.y + Math.sin(angle) * offset - 8, '#78f3e3');
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
    this.beginWeaponAttack(this.getWeaponAttack(GameState.player));
  }
  static basicAttackSkill(player) {
    return { range: CONFIG.BASIC_ATTACK_RANGE, area: CONFIG.BASIC_ATTACK_ARC, damage: 1, animation: 'attacking' };
  }
  static handleDeath(target) { if (target === GameState.player) return true; target.die(); return true; }
  static executePlayerSkill(skill) {
    const player = GameState.player, angle = this.angle(player.facing);
    player.updateState(skill.animation);
    if (skill.type === 'heal') { player.hp = Math.min(player.maxHp, player.hp + skill.healAmt); ParticleEffectsSystem.addDamageText(player.x, player.y - 45, `+${skill.healAmt}`, '#7ef0b2'); return; }
    if (skill.type === 'projectile') {
      GameState.projectileEntities.push(new Projectile({ x: player.x + Math.cos(angle) * 20, y: player.y + Math.sin(angle) * 20 - 8, angle, speed: 390, lifetime: skill.range / 390, damage: skill.damage, owner: player, type: 'magic', collisionRadius: skill.area }));
      ParticleEffectsSystem.addRelease(player.x, player.y, 'magic');
      return;
    }
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
    for (let i = GameState.projectileEntities.length - 1; i >= 0; i--) {
      const projectile = GameState.projectileEntities[i];
      projectile.update(dt, GameState.enemies);
      if (projectile.life <= 0) GameState.projectileEntities.splice(i, 1);
    }
    for (let i = GameState.projectiles.length - 1; i >= 0; i--) {
      const p = GameState.projectiles[i]; p.x += Math.cos(p.angle) * p.speed * dt; p.y += Math.sin(p.angle) * p.speed * dt; p.life -= dt;
      const target = GameState.enemies.find(enemy => enemy.alive && Math.hypot(enemy.x - p.x, enemy.y - p.y) <= enemy.r + p.radius);
      if (target) { this.applyDamage(target, this.calculateDamage(GameState.player, target, p.skill.damage), GameState.player); p.life = 0; }
      if (p.life <= 0) GameState.projectiles.splice(i, 1);
    }
  }
  static draw(ctx, camera) { for (const projectile of GameState.projectileEntities) projectile.draw(ctx, camera); for (const p of GameState.projectiles) { const x = Math.round(p.x - camera.x), y = Math.round(p.y - camera.y); ctx.fillStyle = '#214869'; ctx.fillRect(x - 8, y - 8, 16, 16); ctx.fillStyle = '#75f4e5'; ctx.fillRect(x - 4, y - 4, 8, 8); } }
}
