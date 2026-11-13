import { GameState } from '../core/gameState.js';
import { RECIPES_DB } from '../data/recipes.js';
import { UISystem } from '../ui/ui.js';
import { InventorySystem } from './inventory.js';

export class CraftingSystem {
  static craft(recipeName, spriteId = null) {
    const rec = RECIPES_DB[recipeName];
    if (!rec) return;

    const sprite = spriteId ? GameState.sprites?.find(s => s.id === spriteId) : GameState.pet;

    for (let mat in rec.cost) {
      if ((GameState.player.materials[mat] || 0) < rec.cost[mat]) {
        return UISystem.logMsg(`❌ Recursos insuficientes para forjar ${recipeName}!`, 'dmg');
      }
    }

    const craftBonuses = sprite?.getCraftBonuses ? sprite.getCraftBonuses() : {
      saveMaterialChance: 0,
      craftRareChance: 0,
      craftEpicChance: 0,
      bonusAtkMult: 0,
      stellarEnchant: false
    };

    // Chance de economizar materiais (Especialização Artesão)
    let savedMaterials = false;
    if (Math.random() < craftBonuses.saveMaterialChance) {
      savedMaterials = true;
      UISystem.logMsg(`✨ [Economia Rúnica] ${sprite.name} ajudou a economizar os materiais da forja!`, 'gold');
    } else {
      for (let mat in rec.cost) {
        GameState.player.materials[mat] -= rec.cost[mat];
      }
    }
    UISystem.updateHUD();

    if (sprite) {
      sprite.showReaction('🔨', 2.0);
      const pers = sprite.getPersonalityData();
      const craftDialogues = pers.dialogues?.craft || ['Batendo o martelo rúnico!'];
      sprite.say(craftDialogues[Math.floor(Math.random() * craftDialogues.length)], 2.5);
    }

    setTimeout(() => {
      const rng = Math.random();
      let rarity = 'common', multiplier = 1.0, rarityName = 'Comum';
      
      const epicThreshold = 0.10 + craftBonuses.craftEpicChance;
      const rareThreshold = 0.40 + craftBonuses.craftRareChance;

      if (rng <= epicThreshold) {
        rarity = 'epic';
        multiplier = 1.85 + craftBonuses.bonusAtkMult;
        rarityName = 'Épico';
      } else if (rng <= rareThreshold) {
        rarity = 'rare';
        multiplier = 1.40 + craftBonuses.bonusAtkMult;
        rarityName = 'Raro';
      } else {
        multiplier = 1.0 + craftBonuses.bonusAtkMult;
      }

      const baseAtk = rec.baseAtk || rec.output?.stats?.attack || 15;
      const finalAtk = Math.round(baseAtk * multiplier);
      const enchantTag = craftBonuses.stellarEnchant ? ' ★ Astral' : '';
      const craftedItem = {
        ...(rec.output || {}),
        name: `${recipeName} [${rarityName}]${enchantTag}`,
        type: rec.type,
        stats: { ...(rec.output?.stats || {}), attack: finalAtk },
        rarity,
        description: `Forjado com auxílio de ${sprite ? sprite.name : 'Sprite'} (${rarityName}).`,
        level: 1,
        stackable: false
      };

      if (InventorySystem.addItem(craftedItem)) {
        UISystem.logMsg(`✨ Forjou ${craftedItem.name} (+${finalAtk} Atk)!`, 'gold');
        if (sprite) {
          sprite.addExperience(25);
          sprite.gainFriendship(3);
          sprite.totalCrafted = (sprite.totalCrafted || 0) + 1;
          sprite.showReaction('🌟', 2.5);
        }
        UISystem.updateUI();
        if (UISystem.updateSpriteManagerModal) {
          UISystem.updateSpriteManagerModal();
        }
      } else {
        UISystem.logMsg(`🎒 Mochila cheia! O item foi perdido.`, 'dmg');
      }
    }, 800);
  }
}
