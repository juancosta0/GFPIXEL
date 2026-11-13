import { SpriteSystem } from './systems/sprite.js';
import { CraftingSystem } from './systems/crafting.js';
import { InventorySystem } from './systems/inventory.js';
import { EquipmentSystem } from './systems/equipment.js';
import { UISystem } from './ui/ui.js';
import { Game } from './core/game.js';
import { GameState } from './core/gameState.js';
import { DEFAULT_SPRITES } from './data/spriteData.js';

window.GameAPI = {
  spriteGather: (t, d, n, sId) => SpriteSystem.startGathering(t, d, n, sId),
  spriteCraft: (r, sId) => CraftingSystem.craft(r, sId),
  useItem: (i) => InventorySystem.useItem(i),
  unequipItem: (t) => EquipmentSystem.unequipItem(t),
  toggleWindows: () => UISystem.toggleWindow('playerWindows'),
  toggleSpriteManager: (tab) => UISystem.toggleSpriteManager(tab),
  switchSpriteTab: (t) => UISystem.switchSpriteTab(t),
  feedSprite: (foodKey, spriteId) => {
    const s = spriteId ? SpriteSystem.getSprite(spriteId) : GameState.pet;
    if (s) s.feed(foodKey);
  },
  petSprite: (spriteId) => {
    const s = spriteId ? SpriteSystem.getSprite(spriteId) : GameState.pet;
    if (s) s.pet();
  },
  toggleRestSprite: (spriteId) => {
    const s = spriteId ? SpriteSystem.getSprite(spriteId) : GameState.pet;
    if (s) s.toggleRest();
  },
  learnSpriteSkill: (branchId, skillId, spriteId) => {
    const s = spriteId ? SpriteSystem.getSprite(spriteId) : GameState.pet;
    if (s) s.learnSkill(branchId, skillId);
  },
  setActiveSprite: (spriteId) => SpriteSystem.setActiveSprite(spriteId),
  adoptSprite: (spriteId) => {
    const def = DEFAULT_SPRITES.find(s => s.id === spriteId);
    if (def) SpriteSystem.adoptSprite(def);
  },
  toggleWorldMap: () => UISystem.toggleWorldMap(),
  setWorldMapFilter: (f) => UISystem.setWorldMapFilter(f),
  fastTravel: (s) => UISystem.fastTravel(s)
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
