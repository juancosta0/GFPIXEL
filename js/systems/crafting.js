import { GameState } from '../core/gameState.js';
import { RECIPES_DB } from '../data/recipes.js';
import { UISystem } from '../ui/ui.js';
import { CONFIG } from '../data/config.js';

export class CraftingSystem {
  static craft(recipeName) {
    const rec = RECIPES_DB[recipeName];
    if (!rec) return;

    for (let mat in rec.cost) {
      if (GameState.player.materials[mat] < rec.cost[mat]) {
        return UISystem.logMsg(`❌ Recursos insuficientes!`, 'dmg');
      }
    }

    for (let mat in rec.cost) {
      GameState.player.materials[mat] -= rec.cost[mat];
    }
    UISystem.updateHUD();

    setTimeout(() => {
      const rng = Math.random();
      let rarity = 'common', multiplier = 1.0, rarityName = 'Comum';
      if (rng <= 0.10) { rarity = 'epic'; multiplier = 1.8; rarityName = 'Épico'; }
      else if (rng <= 0.40) { rarity = 'rare'; multiplier = 1.35; rarityName = 'Raro'; }

      const finalAtk = Math.round(rec.baseAtk * multiplier);
      const craftedItem = { name: `${recipeName} [${rarityName}]`, type: rec.type, bonusAtk: finalAtk, rarity: rarity };

      if (GameState.inventory.length < CONFIG.INV_MAX_SLOTS) {
        GameState.inventory.push(craftedItem);
        UISystem.logMsg(`✨ Forjou ${craftedItem.name} (+${finalAtk} Atk)!`, 'gold');
        UISystem.updateUI();
      } else {
        UISystem.logMsg(`🎒 Mochila cheia!`, 'dmg');
      }
    }, 1000);
  }
}