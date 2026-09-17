import { GameState } from '../core/gameState.js';
import { DropItem } from '../entities/dropItem.js';
import { CONFIG } from '../data/config.js';
import { UISystem } from '../ui/ui.js';

export class LootSystem {
  static spawnDrop(x, y, item) {
    if (!item) return;
    GameState.drops.push(new DropItem(x, y, item));
  }

  static update(dt) {
    for (let i = GameState.drops.length - 1; i >= 0; i--) {
      let drop = GameState.drops[i];
      drop.life -= dt * 60;
      if (drop.life <= 0) {
        GameState.drops.splice(i, 1);
        continue;
      }
      
      if (Math.hypot(GameState.player.x - drop.x, GameState.player.y - drop.y) < GameState.player.r + drop.r) {
        if (GameState.inventory.length < CONFIG.INV_MAX_SLOTS) {
          GameState.inventory.push(drop.item);
          UISystem.logMsg(`🎒 Item coletado: ${drop.item.name}`, 'sys');
          UISystem.updateUI();
          GameState.drops.splice(i, 1);
        }
      }
    }
  }

  static draw(ctx, camera) {
    for (const drop of GameState.drops) {
      const sx = drop.x - camera.x;
      const sy = drop.y - camera.y;
      
      // Pulsating glow
      const pulse = 0.6 + Math.sin(Date.now() / 200) * 0.4;
      
      ctx.fillStyle = `rgba(0, 255, 255, ${pulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(sx, sy, drop.r + 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(sx, sy, drop.r, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(drop.item.name, sx, sy - 12);
    }
  }
}
