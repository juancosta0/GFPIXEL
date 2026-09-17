import { ITEMS_DB } from '../data/items.js';
import { InventorySystem } from './inventory.js';
import { GameState } from '../core/gameState.js';
import { UISystem } from '../ui/ui.js';

export class ShopSystem {
  static buy(itemId) {
    const item = ITEMS_DB[itemId];
    if (!item || GameState.player.gold < item.sellPrice * 2) return UISystem.logMsg('Ouro insuficiente.', 'dmg');
    if (!InventorySystem.addItem(item)) return UISystem.logMsg('Inventário cheio.', 'dmg');
    GameState.player.gold -= item.sellPrice * 2;
    UISystem.logMsg(`Comprou ${item.name}.`, 'gold');
    UISystem.updateUI();
  }
}