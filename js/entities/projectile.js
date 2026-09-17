import { CombatSystem } from '../systems/combat.js';
import { ParticleEffectsSystem } from '../systems/particleEffects.js';
import { VFXSystem } from '../systems/vfx.js';

export class Projectile {
  constructor({ x, y, angle, speed, damage, owner, type, lifetime, collisionRadius = 8 }) {
    this.x = x; this.y = y; this.angle = angle; this.speed = speed; this.damage = damage; this.owner = owner;
    this.type = type; this.life = lifetime; this.collisionRadius = collisionRadius; this.rotation = angle; this.trail = [];
  }
  update(dt, enemies) {
    this.trail.push({ x: this.x, y: this.y, life: .18 });
    if (this.type === 'arrow') VFXSystem.arrowTrail(this.x, this.y, this.angle);
    if (this.trail.length > 8) this.trail.shift();
    this.trail.forEach(point => { point.life -= dt; });
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;
    this.life -= dt;
    const target = enemies.find(enemy => enemy.alive && Math.hypot(enemy.x - this.x, enemy.y - this.y) <= enemy.r + this.collisionRadius);
    if (target) {
      CombatSystem.applyDamage(target, CombatSystem.calculateDamage(this.owner, target, this.damage), this.owner);
      ParticleEffectsSystem.addImpact(this.x, this.y, this.type);
      if (this.type === 'magic') VFXSystem.magicImpact(this.x, this.y);
      this.life = 0;
    }
  }
  draw(ctx, camera) {
    for (const point of this.trail) {
      if (point.life <= 0) continue;
      ctx.globalAlpha = point.life / .18 * .35;
      ctx.fillStyle = this.type === 'arrow' ? '#e7b65c' : '#78f3e3';
      ctx.fillRect(point.x - camera.x - 2, point.y - camera.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
    const x = this.x - camera.x, y = this.y - camera.y;
    ctx.save(); ctx.translate(x, y); ctx.rotate(this.rotation);
    if (this.type === 'arrow') {
      ctx.fillStyle = '#e7b65c'; ctx.fillRect(-12, -1, 20, 2);
      ctx.fillStyle = '#eef8f0'; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(4, -4); ctx.lineTo(4, 4); ctx.closePath(); ctx.fill();
    } else {
      ctx.shadowColor = '#78f3e3'; ctx.shadowBlur = 12; ctx.fillStyle = '#dffff8'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#557497'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}