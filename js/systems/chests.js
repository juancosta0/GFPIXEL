import { ITEMS_DB } from '../data/items.js';
import { InventorySystem } from './inventory.js';
import { SaveSystem } from './save.js';
import { UISystem } from '../ui/ui.js';

const WEAPONS = ['espada_aprendiz', 'arco_luar', 'cajado_aqua', 'lamina_raiz'];
const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export class ChestSystem {
  static open(chest) {
    if (chest.opened) return;
    const base = ITEMS_DB[WEAPONS[Math.floor(Math.random() * WEAPONS.length)]];
    const rarity = RARITIES[Math.min(RARITIES.length - 1, Math.floor(Math.random() * RARITIES.length))];
    const multiplier = { common: 1, uncommon: 1.15, rare: 1.35, epic: 1.65, legendary: 2 }[rarity];
    const item = { ...base, id: `${base.id}_${rarity}_${Date.now()}`, name: `${base.name} (${rarity})`, rarity, stats: { ...base.stats, attack: Math.round((base.stats.attack || 0) * multiplier) } };
    chest.opened = true;
    if (InventorySystem.addItem(item)) UISystem.logMsg(`Baú aberto: encontrou ${item.name}!`, 'gold');
    else UISystem.logMsg('Baú aberto, mas o inventário está cheio.', 'dmg');
    SaveSystem.saveGame();
  }
}