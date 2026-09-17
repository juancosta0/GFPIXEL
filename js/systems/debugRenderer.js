import { GameState } from '../core/gameState.js';

export class DebugRenderer {
  static draw(ctx, camera) {
    if (!GameState.debug.enabled) return;

    const drawRect = (x, y, w, h, color = '#58d5ff') => {
      const sx = x - camera.x;
      const sy = y - camera.y;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(sx - w / 2), Math.round(sy - h / 2), Math.round(w), Math.round(h));
      ctx.restore();
    };

    const drawAnchor = (x, y, label = '') => {
      const sx = x - camera.x;
      const sy = y - camera.y;
      ctx.save();
      ctx.fillStyle = '#ffdf70';
      ctx.beginPath();
      ctx.arc(Math.round(sx), Math.round(sy), 2, 0, Math.PI * 2);
      ctx.fill();
      if (label) {
        ctx.fillStyle = '#f6f7ff';
        ctx.font = '10px monospace';
        ctx.fillText(label, Math.round(sx + 4), Math.round(sy - 4));
      }
      ctx.restore();
    };

    if (GameState.debug.hitboxes) {
      if (GameState.player) drawRect(GameState.player.x, GameState.player.y, 18, 18, '#7ef0b2');
      for (const enemy of GameState.enemies) {
        if (enemy && enemy.alive) drawRect(enemy.x, enemy.y, enemy.r * 2, enemy.r * 2, '#ff7d7d');
      }
      for (const projectile of GameState.projectileEntities || []) {
        drawRect(projectile.x, projectile.y, 10, 10, '#ffd76c');
      }
    }

    if (GameState.debug.anchors && GameState.player?.anchorPoints) {
      for (const [name, point] of Object.entries(GameState.player.anchorPoints)) {
        drawAnchor(GameState.player.x + (point.x || 0), GameState.player.y + (point.y || 0), name);
      }
    }

    if (GameState.debug.enabled) {
      ctx.save();
      ctx.fillStyle = 'rgba(8, 13, 16, 0.7)';
      ctx.fillRect(12, 12, 220, 26);
      ctx.fillStyle = '#d6f6ff';
      ctx.font = '11px monospace';
      ctx.fillText('Art Debug: F1 toggles overlay', 20, 30);
      ctx.restore();
    }
  }
}
