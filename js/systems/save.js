import { GameState } from '../core/gameState.js';
import { EquipmentSystem } from './equipment.js';
import { Pet } from '../entities/pet.js';
import { SpriteSystem } from './sprite.js';

const SAVE_KEY = 'gfpixel-save';
const SAVE_VERSION = 2;

export class SaveSystem {
  static newGame() {
    localStorage.removeItem(SAVE_KEY);
    GameState.quests = [];
    GameState.flags = {};
    GameState.progress = {};
    GameState.sprites = [];
    SpriteSystem.initSprites();
  }

  static saveGame() {
    if (!GameState.player) return;
    const player = GameState.player;
    
    // Serializar coleção de sprites e sprite ativo
    const petData = GameState.pet?.toSaveData ? GameState.pet.toSaveData() : GameState.pet;
    const spritesData = (GameState.sprites || []).map(s => (s.toSaveData ? s.toSaveData() : s));

    const saveData = {
      saveVersion: SAVE_VERSION,
      player: {
        lv: player.lv,
        exp: player.exp,
        expNext: player.expNext,
        gold: player.gold,
        hp: player.hp,
        mp: player.mp,
        materials: player.materials
      },
      pet: petData,
      sprites: spritesData,
      activeSpriteId: GameState.activeSpriteId || GameState.pet?.id,
      quests: GameState.quests,
      flags: GameState.flags,
      progress: GameState.progress,
      scene: GameState.currentScene?.id
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  }

  static loadGame() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (!data || data.saveVersion !== SAVE_VERSION || !GameState.player) {
        SpriteSystem.initSprites();
        return false;
      }

      const savedPlayer = { ...(data.player || {}) };
      delete savedPlayer.equipment;
      Object.assign(GameState.player, savedPlayer);
      GameState.inventory = [];
      GameState.quests = data.quests || [];
      GameState.flags = data.flags || {};
      GameState.progress = data.progress || {};

      // Carregar Sprites com compatibilidade retroativa
      if (Array.isArray(data.sprites) && data.sprites.length > 0) {
        GameState.sprites = data.sprites.map(sData => new Pet(GameState.player.x, GameState.player.y, sData));
        const active = GameState.sprites.find(s => s.id === data.activeSpriteId) || GameState.sprites[0];
        GameState.pet = active;
        GameState.activeSpriteId = active.id;
      } else if (data.pet) {
        // Migração de save legado que só continha 'data.pet'
        const upgradedPet = new Pet(GameState.player.x, GameState.player.y, data.pet);
        GameState.sprites = [upgradedPet];
        GameState.pet = upgradedPet;
        GameState.activeSpriteId = upgradedPet.id;
      } else {
        SpriteSystem.initSprites();
      }

      EquipmentSystem.recalcStats();
      return true;
    } catch (error) {
      console.warn('Save inválido ignorado.', error);
      SpriteSystem.initSprites();
      return false;
    }
  }
}
