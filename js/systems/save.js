import { GameState } from '../core/gameState.js';
import { EquipmentSystem } from './equipment.js';

const SAVE_KEY = 'gfpixel-save';
const SAVE_VERSION = 1;

export class SaveSystem {
  static newGame() {
    localStorage.removeItem(SAVE_KEY);
    GameState.quests = [];
    GameState.flags = {};
    GameState.progress = {};
  }
  static saveGame() {
    if (!GameState.player) return;
    const player = GameState.player;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ saveVersion: SAVE_VERSION, player: { lv: player.lv, exp: player.exp, expNext: player.expNext, gold: player.gold, hp: player.hp, mp: player.mp, materials: player.materials, equipment: player.equipment }, inventory: GameState.inventory, pet: GameState.pet, quests: GameState.quests, flags: GameState.flags, progress: GameState.progress, scene: GameState.currentScene?.id }));
  }
  static loadGame() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (!data || data.saveVersion !== SAVE_VERSION || !GameState.player) return false;
      Object.assign(GameState.player, data.player);
      GameState.player.equipment = data.player.equipment || {};
      GameState.inventory = data.inventory || [];
      GameState.quests = data.quests || [];
      GameState.flags = data.flags || {};
      GameState.progress = data.progress || {};
      if (data.pet) Object.assign(GameState.pet, data.pet);
      EquipmentSystem.recalcStats();
      return true;
    } catch (error) {
      console.warn('Save inválido ignorado.', error);
      return false;
    }
  }
}