import { CONFIG } from '../data/config.js';
import { EquipmentSystem } from './equipment.js';
import { UISystem } from '../ui/ui.js';
import { SaveSystem } from './save.js';

export const REGIONS = Object.freeze({
  cidade: { recommendedLevel: 1, difficulty: 'safe', rewards: [] },
  pradariaLunar: { recommendedLevel: 1, difficulty: 'intro', rewards: ['materials'] },
  bosqueRaiz: { recommendedLevel: 3, difficulty: 'mechanics', rewards: ['equipment'] },
  criptaAqua: { recommendedLevel: 6, difficulty: 'advanced', rewards: ['rare equipment'] }
});

export class ProgressionSystem {
  static addExperience(player, amount) {
    player.exp += Math.max(0, amount);
    while (player.exp >= player.expNext) {
      player.exp -= player.expNext;
      player.lv++;
      player.expNext = Math.round(CONFIG.BASE_EXP_REQ * Math.pow(player.lv, CONFIG.EXP_CURVE));
      player.baseMaxHp += CONFIG.LEVEL_REWARDS.hp;
      player.baseMaxMp += CONFIG.LEVEL_REWARDS.mp;
      player.baseAtk += CONFIG.LEVEL_REWARDS.atk;
      player.baseDef += CONFIG.LEVEL_REWARDS.def;
      EquipmentSystem.recalcStats();
      player.hp = player.maxHp;
      player.mp = player.maxMp;
      UISystem.logMsg(`LEVEL UP! Nível ${player.lv}!`, 'sys');
      SaveSystem.saveGame();
    }
    UISystem.updateHUD();
  }
}