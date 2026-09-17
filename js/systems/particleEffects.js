import { GameState } from '../core/gameState.js';

export class ParticleEffectsSystem {
  static addDamageText(x, y, txt, color) {
    GameState.damageTexts.push({ x, y, txt, life: 40, color });
  }

  static addPlayerAttackEffect(x, y, angle, maxR) {
    GameState.effects.push({
      x: x + Math.cos(angle) * 20,
      y: y + Math.sin(angle) * 20,
      r: 5,
      maxR: maxR,
      life: 15,
      color: '#c7fff4',
      angle
    });
  }

  static update(dt) {
    GameState.damageTexts = GameState.damageTexts.filter(t => {
      t.y -= 48 * dt;
      return (t.life -= dt * 60) > 0;
    });
    GameState.effects = GameState.effects.filter(e => {
      e.r += (e.maxR - e.r) * Math.min(1, 15 * dt);
      return (e.life -= dt * 60) > 0;
    });
  }

  static draw(ctx, camera) {
    if (!camera) return;
    
    for (const e of GameState.effects) {
      const sx = e.x - camera.x;
      const sy = e.y - camera.y;
      ctx.strokeStyle = e.color;
      ctx.globalAlpha = e.life / 15;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sx, sy, e.r, e.angle - 0.75, e.angle + 0.75);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;

    for (const t of GameState.damageTexts) {
      const sx = t.x - camera.x;
      const sy = t.y - camera.y;
      ctx.fillStyle = t.color;
      ctx.globalAlpha = Math.min(1, t.life / 20);
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(t.txt).startsWith('+') ? t.txt : '-' + t.txt, sx, sy);
    }
    ctx.globalAlpha = 1;
  }
}
