import { GameState } from '../core/gameState.js';
import { EquipmentSystem } from './equipment.js';
import { UISystem } from '../ui/ui.js';
import { CONFIG } from '../data/config.js';

export class InventorySystem {
  static useItem(index) {
    const item = GameState.inventory[index];
    if (!item || item.type === 'material') return;
    if (item.type === 'consumable') {
      GameState.player.hp = Math.min(GameState.player.maxHp, GameState.player.hp + (item.stats?.heal || 0));
      item.quantity = (item.quantity || 1) - 1;
      if (item.quantity <= 0) GameState.inventory.splice(index, 1);
      UISystem.updateHUD(); UISystem.updateUI(); return;
    }
    
    const currentEquip = GameState.player.equipment[item.type];
    GameState.player.equipment[item.type] = item;
    GameState.inventory.splice(index, 1);
    
    if (currentEquip) GameState.inventory.push(currentEquip);
    
    EquipmentSystem.recalcStats();
    UISystem.updateUI();
  }
}
