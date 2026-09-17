import { GameState } from '../core/gameState.js';

export class ParticleEffectsSystem {
  static addParticle(x, y, options = {}) {
    GameState.effects.push({ x, y, r: options.r || 2, maxR: options.maxR || options.r || 2, life: options.life || 18, color: options.color || '#fff', angle: options.angle || 0, kind: options.kind || 'burst' });
  }
  static addImpact(x, y, type = 'hit') {
    const color = type === 'critical' ? '#ffe28a' : type === 'magic' ? '#78f3e3' : '#eef8f0';
    for (let i = 0; i < (type === 'critical' ? 8 : 4); i++) this.addParticle(x, y, { r: 2, maxR: 8 + i * 2, life: 12 + i * 2, color, angle: i * Math.PI / 4 });
  }
  static addSlash(x, y, angle, range) { this.addPlayerAttackEffect(x, y, angle, range * .8); this.addImpact(x + Math.cos(angle) * range * .65, y + Math.sin(angle) * range * .65, 'hit'); }
  static addRelease(x, y, type) { this.addImpact(x, y, type === 'magic' ? 'magic' : 'hit'); }
  static addWeaponCharge(player, category) { if (category === 'STAFF') this.addParticle(player.x, player.y - 24, { r: 3, maxR: 9, life: 20, color: '#78f3e3' }); }
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
      if (e.kind === 'burst') {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(e.angle) * e.r, sy + Math.sin(e.angle) * e.r);
        ctx.stroke();
      }
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
