import { GameState } from '../core/gameState.js';
import { EquipmentSystem } from './equipment.js';
import { UISystem } from '../ui/ui.js';
import { CONFIG } from '../data/config.js';

export class InventorySystem {
  static addItem(item, quantity = item?.quantity || 1) {
    if (!item) return false;
    const normalized = { ...item, id: item.id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') };
    const existing = normalized.stackable && GameState.inventory.find(entry => entry.id === normalized.id);
    if (existing) { existing.quantity = (existing.quantity || 1) + quantity; return true; }
    if (GameState.inventory.length >= CONFIG.INV_MAX_SLOTS) return false;
    GameState.inventory.push({ ...normalized, quantity: normalized.stackable ? quantity : 1 });
    return true;
  }
  static useItem(index) {
    if (GameState.player.state.includes('attack') || GameState.player.state.includes('cast')) return;
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
