import { GameState } from '../core/gameState.js';

export class ParticleEffectsSystem {
  static addParticle(x, y, options = {}) {
    GameState.effects.push({
      x,
      y,
      r: options.r || 2,
      maxR: options.maxR || options.r || 2,
      life: options.life || 18,
      color: options.color || '#fff',
      angle: options.angle || 0,
      kind: options.kind || 'burst',
      driftX: options.driftX || 0,
      driftY: options.driftY || 0,
      style: options.style || 'spark'
    });
  }

  static addImpact(x, y, type = 'hit') {
    const color = type === 'critical' ? '#ffe28a' : type === 'magic' ? '#78f3e3' : type === 'arrow' ? '#f2c66d' : '#eef8f0';
    const count = type === 'critical' ? 10 : type === 'magic' ? 7 : 5;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      this.addParticle(x, y, {
        r: type === 'magic' ? 2 : 3,
        maxR: 8 + i * 2,
        life: 12 + i * 2,
        color,
        angle,
        driftX: Math.cos(angle) * (type === 'magic' ? 18 : 12),
        driftY: Math.sin(angle) * (type === 'magic' ? 18 : 12),
        style: type === 'magic' ? 'ring' : 'spark'
      });
    }
  }

  static addSlash(x, y, angle, range, weaponType = 'SWORD') {
    const color = weaponType === 'BOW' ? '#ffd77a' : weaponType === 'STAFF' ? '#7fe7ff' : '#f6f1d4';
    this.addPlayerAttackEffect(x, y, angle, range * .8, color);
    this.addImpact(x + Math.cos(angle) * range * .65, y + Math.sin(angle) * range * .65, weaponType === 'STAFF' ? 'magic' : 'hit');
  }

  static addRelease(x, y, type) { this.addImpact(x, y, type === 'magic' ? 'magic' : 'arrow'); }
  static addWeaponCharge(player, category) {
    const color = category === 'STAFF' ? '#7fe7ff' : category === 'BOW' ? '#f6cf62' : '#f3f0d4';
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      this.addParticle(player.x + Math.cos(angle) * 14, player.y - 26 + Math.sin(angle) * 14, {
        r: 2, maxR: 8, life: 18, color, angle, driftX: Math.cos(angle) * 12, driftY: Math.sin(angle) * 12, kind: 'burst', style: category === 'STAFF' ? 'ring' : 'spark'
      });
    }
  }

  static addDamageText(x, y, txt, color) {
    GameState.damageTexts.push({ x, y, txt, life: 40, color });
  }

  static addPlayerAttackEffect(x, y, angle, maxR, color = '#c7fff4') {
    GameState.effects.push({
      x: x + Math.cos(angle) * 20,
      y: y + Math.sin(angle) * 20,
      r: 5,
      maxR,
      life: 15,
      color,
      angle,
      kind: 'burst',
      driftX: Math.cos(angle) * 16,
      driftY: Math.sin(angle) * 16,
      style: 'arc'
    });
  }

  static addHealPulse(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      this.addParticle(x + Math.cos(angle) * 10, y + Math.sin(angle) * 10, {
        r: 2, maxR: 10, life: 22, color: '#8feec0', angle, driftX: Math.cos(angle) * 18, driftY: Math.sin(angle) * 18, kind: 'burst', style: 'spark'
      });
    }
  }

  static update(dt) {
    GameState.damageTexts = GameState.damageTexts.filter(t => {
      t.y -= 48 * dt;
      return (t.life -= dt * 60) > 0;
    });
    GameState.effects = GameState.effects.filter(e => {
      e.r += (e.maxR - e.r) * Math.min(1, 15 * dt);
      e.x += (e.driftX || 0) * dt;
      e.y += (e.driftY || 0) * dt;
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
      if (e.style === 'ring') {
        ctx.arc(sx, sy, e.r, 0, Math.PI * 2);
      } else if (e.style === 'arc') {
        ctx.arc(sx, sy, e.r, e.angle - 0.75, e.angle + 0.75);
      } else {
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(e.angle) * e.r, sy + Math.sin(e.angle) * e.r);
      }
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
