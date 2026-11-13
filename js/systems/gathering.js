import { GameState } from '../core/gameState.js';
import { UISystem } from '../ui/ui.js';
import { ParticleEffectsSystem } from './particleEffects.js';
import { ITEMS_DB } from '../data/items.js';
import { InventorySystem } from './inventory.js';

export class GatheringSystem {
  static harvest(node) {
    if (node.depleted) {
      UISystem.logMsg('Este ponto de coleta está esgotado no momento. Ele se regenerará em breve.', 'dmg');
      return false;
    }

    const player = GameState.player;
    const pet = GameState.pet;
    const type = node.type; // 'ore_node', 'wood_node', 'herb_node'

    let resourceType = 'minerals';
    let resourceName = 'Minério';
    let catTarget = 'minerador';
    let icon = '⛏️';

    if (type === 'wood_node') {
      resourceType = 'wood';
      resourceName = 'Madeira';
      catTarget = 'silvestre';
      icon = '🪵';
    } else if (type === 'herb_node') {
      resourceType = 'herbs';
      resourceName = 'Ervas';
      catTarget = 'herbalista';
      icon = '🌿';
    }

    // Calcular rendimento
    const bonuses = pet?.getGatherBonuses ? pet.getGatherBonuses() : { extraYield: 0, doubleHarvestChance: 0, rareChanceBonus: 0 };
    let yieldAmount = Math.floor(Math.random() * 3) + 2 + (bonuses.extraYield || 0);

    // Bônus de afinidade do Sprite ativo
    let catBonusApplied = false;
    if (pet && pet.state === 'following' && pet.category === catTarget) {
      yieldAmount = Math.round(yieldAmount * 1.35);
      catBonusApplied = true;
    }

    // Toque da Terra: chance de dobro
    let doubled = false;
    if (Math.random() < (bonuses.doubleHarvestChance || 0)) {
      yieldAmount *= 2;
      doubled = true;
    }

    // Adicionar materiais ao jogador
    if (!player.materials) player.materials = { minerals: 0, wood: 0, herbs: 0 };
    player.materials[resourceType] = (player.materials[resourceType] || 0) + yieldAmount;
    player.addExp(15);

    // Recompensa para o Sprite
    if (pet && pet.state === 'following') {
      pet.addExperience(12);
      pet.gainFriendship(1);
      pet.totalGathered = (pet.totalGathered || 0) + yieldAmount;
      pet.showReaction('⛏️', 2.0);
      pet.say(`Boa colheita, mestre! Ajudando a extrair ${resourceName}!`, 2.5);
    }

    // Chance de tesouros bônus com especialização Explorador
    let extraLoot = null;
    if (Math.random() < (0.15 + (bonuses.rareChanceBonus || 0))) {
      if (resourceType === 'minerals' && Math.random() < 0.5) {
        const item = ITEMS_DB.pepita_ouro;
        if (item && InventorySystem.addItem({ ...item, quantity: 1 })) extraLoot = item.name;
      } else if (resourceType === 'herbs') {
        const item = ITEMS_DB.pocao_luz;
        if (item && InventorySystem.addItem({ ...item, quantity: 1 })) extraLoot = item.name;
      } else if (resourceType === 'wood' && Math.random() < 0.4) {
        const item = ITEMS_DB.cristal_arcano;
        if (item && InventorySystem.addItem({ ...item, quantity: 1 })) extraLoot = item.name;
      }
    }

    // Efeitos visuais no ponto
    ParticleEffectsSystem.addImpact(node.x, node.y, 'hit');
    ParticleEffectsSystem.addDamageText(node.x, node.y - 20, `+${yieldAmount} ${resourceName}!`, '#78f3e3');

    let logText = `${icon} Coletou ${yieldAmount}x ${resourceName}!`;
    if (catBonusApplied) logText += ` (Bônus de Afinidade de ${pet.name}! ✨)`;
    if (doubled) logText += ' (Colheita Duplicada! 🌾)';
    if (extraLoot) logText += ` (+Item Raro: ${extraLoot}! 💎)`;
    UISystem.logMsg(logText, 'gold');

    // Desgaste e resfriamento
    node.depleted = true;
    node.cooldown = 40; // 40 segundos para regenerar

    UISystem.updateHUD();
    return true;
  }

  static update(dt) {
    const scene = GameState.currentScene;
    if (!scene || !scene.objects) return;

    for (const obj of scene.objects) {
      if (obj.type && obj.type.endsWith('_node') && obj.depleted) {
        obj.cooldown = (obj.cooldown || 40) - dt;
        if (obj.cooldown <= 0) {
          obj.depleted = false;
          obj.cooldown = 0;
        }
      }
    }
  }
}
