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
      radius: options.radius ?? 18
    });
  }

  static slash(x, y, angle, range, weaponType = 'sword') {
    const color = weaponType === 'BOW' ? '#ffd77a' : weaponType === 'STAFF' ? '#78f3e3' : '#f4f6ff';
    this.spawn('SlashEffect', x, y, { angle, scale: range / 64, life: .22, color, radius: 28 });
  }

  static arrowTrail(x, y, angle) { this.spawn('ArrowTrail', x, y, { angle, life: .18, color: '#e7b65c', radius: 12 }); }
  static magicImpact(x, y, color = '#78f3e3') { this.spawn('MagicImpact', x, y, { life: .4, scale: 1.2, color, radius: 20 }); }
  static bossPhase(x, y) { this.spawn('BossPhaseEffect', x, y, { life: .8, scale: 1.4, color: '#d95a65', radius: 24 }); }

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
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius * effect.scale, -.8, .8);
        ctx.stroke();
      } else if (effect.type === 'MagicImpact' || effect.type === 'BossPhaseEffect') {
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, (effect.radius + (1 - alpha) * 28) * effect.scale, 0, Math.PI * 2);
        ctx.stroke();
      } else if (effect.type === 'ArrowTrail') {
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();
      }

      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}