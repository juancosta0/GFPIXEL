import { GameState } from '../core/gameState.js';
import { DropItem } from '../entities/dropItem.js';
import { CONFIG } from '../data/config.js';
import { UISystem } from '../ui/ui.js';
import { InventorySystem } from './inventory.js';
import { QuestSystem } from './quests.js';
import { ParticleEffectsSystem } from './particleEffects.js';

export class LootSystem {
  static roll(enemy) {
    const table = enemy.base.lootTable;
    if (!table) return enemy.base.drop && Math.random() <= 0.6 ? [enemy.base.drop] : [];
    const drops = [...(table.guaranteed || [])];
    for (const entry of [...(table.common || []), ...(table.rare || [])]) {
      if (Math.random() <= (entry.chance || 0)) {
        const minimum = entry.min || 1;
        const maximum = entry.max || minimum;
        drops.push({ ...entry.item, quantity: minimum + Math.floor(Math.random() * (maximum - minimum + 1)) });
      }
    }
    return drops;
  }

  static spawnDrop(x, y, item) {
    if (!item) return;
    GameState.drops.push(new DropItem(x, y, item));
  }

  static update(dt) {
    for (let i = GameState.drops.length - 1; i >= 0; i--) {
      let drop = GameState.drops[i];
      drop.life -= dt * 60;
      drop.age += dt;
      if (drop.life <= 0) {
        GameState.drops.splice(i, 1);
        continue;
      }
      
      if (Math.hypot(GameState.player.x - drop.x, GameState.player.y - drop.y) < GameState.player.r + drop.r) {
        if (InventorySystem.addItem(drop.item)) {
          UISystem.logMsg(`🎒 Item coletado: ${drop.item.name}`, 'sys');
          ParticleEffectsSystem.addImpact(drop.x, drop.y, 'magic');
          QuestSystem.onEvent('collect', drop.item.id || drop.item.name, drop.item.quantity || 1);
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
      
      const pulse = 0.65 + Math.sin(drop.age * 7) * 0.2;
      const bounce = Math.sin(drop.age * 5) * 3;
      const rarityColors = { legendary: '#ffe28a', epic: '#c8a6ff', rare: '#80a8ff', uncommon: '#70d6a2', common: '#78f3e3' };
      const color = rarityColors[drop.item.rarity || 'common'];
      ctx.fillStyle = `rgba(120, 243, 227, ${pulse * 0.22})`;
      ctx.beginPath();
      ctx.arc(sx, sy + bounce, drop.r + 7, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.save();
      ctx.translate(sx, sy + bounce);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = color;
      ctx.strokeStyle = '#f8f4d7';
      ctx.lineWidth = 1;
      ctx.fillRect(-drop.r, -drop.r, drop.r * 2, drop.r * 2);
      ctx.strokeRect(-drop.r, -drop.r, drop.r * 2, drop.r * 2);
      ctx.restore();
      ctx.fillStyle = '#f8f4d7';
      ctx.beginPath();
      ctx.arc(sx, sy + bounce - 1, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = color;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(drop.item.name, sx, sy - 15 + bounce);
    }
  }
}
