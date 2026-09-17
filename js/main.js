import { SpriteSystem } from './systems/sprite.js';
import { CraftingSystem } from './systems/crafting.js';
import { InventorySystem } from './systems/inventory.js';
import { EquipmentSystem } from './systems/equipment.js';
import { UISystem } from './ui/ui.js';
import { Game } from './core/game.js';

window.GameAPI = {
  spriteGather: (t, d, n) => SpriteSystem.startGathering(t, d, n),
  spriteCraft: (r) => CraftingSystem.craft(r),
  useItem: (i) => InventorySystem.useItem(i),
  unequipItem: (t) => EquipmentSystem.unequipItem(t),
  toggleWindows: () => UISystem.toggleWindow('playerWindows')
};

window.addEventListener('load', () => {
  try {
    Game.init();
  } catch (error) {
    console.error(error);
    const notice = document.getElementById('launchNotice');
    if (notice) notice.innerHTML = 'Não foi possível iniciar o jogo. Abra o console para ver o erro.';
  }
});
