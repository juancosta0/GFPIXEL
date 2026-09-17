import { GameState } from '../core/gameState.js';

export class VFXSystem {
  static spawn(type, x, y, options = {}) {
    const life = options.life ?? .35;
    GameState.vfx.push({
      type,
      x,
      y,
      angle: options.angle ?? 0,
      life,
      maxLife: life,
      scale: options.scale ?? 1,
      color: options.color ?? '#fff',
      radius: options.radius ?? 18,
      width: options.width ?? 2,
      length: options.length ?? 20
    });
  }

  static slash(x, y, angle, range, weaponType = 'SWORD') {
    const color = weaponType === 'BOW' ? '#ffd77a' : weaponType === 'STAFF' ? '#78f3e3' : '#f4f6ff';
    this.spawn('SlashEffect', x, y, { angle, scale: range / 64, life: .22, color, radius: 28, width: 4 });
  }

  static arrowTrail(x, y, angle) { this.spawn('ArrowTrail', x, y, { angle, life: .18, color: '#e7b65c', radius: 12, width: 2, length: 18 }); }
  static magicImpact(x, y, color = '#78f3e3') { this.spawn('MagicImpact', x, y, { life: .4, scale: 1.2, color, radius: 20, width: 3 }); }
  static bossPhase(x, y) { this.spawn('BossPhaseEffect', x, y, { life: .8, scale: 1.4, color: '#d95a65', radius: 24, width: 3 }); }
  static healPulse(x, y) { this.spawn('HealPulse', x, y, { life: .5, scale: 1.1, color: '#90f0b7', radius: 18, width: 2 }); }

  static update(dt) { GameState.vfx.forEach(effect => { effect.life -= dt; }); GameState.vfx = GameState.vfx.filter(effect => effect.life > 0); }

  static draw(ctx, camera) {
    for (const effect of GameState.vfx) {
      const alpha = Math.max(0, effect.life / effect.maxLife);
      const x = effect.x - camera.x, y = effect.y - camera.y;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(effect.angle);
      ctx.globalAlpha = alpha;

      if (effect.type === 'SlashEffect') {
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = effect.width;
        ctx.beginPath();
        ctx.moveTo(-effect.radius * 0.2, 0);
        ctx.arc(0, 0, effect.radius * effect.scale, -0.9, 0.9);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-effect.radius * 0.6, 0);
        ctx.lineTo(effect.radius * 0.95, 0);
        ctx.stroke();
      } else if (effect.type === 'MagicImpact' || effect.type === 'BossPhaseEffect' || effect.type === 'HealPulse') {
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = effect.width;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, (effect.radius + (1 - alpha) * 28) * effect.scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, (effect.radius * 0.55) * effect.scale, 0, Math.PI * 2);
        ctx.stroke();
      } else if (effect.type === 'ArrowTrail') {
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = effect.width;
        ctx.beginPath();
        ctx.moveTo(-effect.length, 0);
        ctx.lineTo(effect.length * 0.45, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(effect.length * 0.42, 0);
        ctx.lineTo(effect.length * 0.8, -2);
        ctx.lineTo(effect.length * 0.8, 2);
        ctx.closePath();
        ctx.fillStyle = effect.color;
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}