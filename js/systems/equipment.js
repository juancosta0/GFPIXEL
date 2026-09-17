import { GameState } from '../core/gameState.js';
import { UISystem } from '../ui/ui.js';
import { CONFIG } from '../data/config.js';

export class EquipmentSystem {
  static unequipItem(type) {
    const item = GameState.player.equipment[type];
    if (!item || GameState.inventory.length >= CONFIG.INV_MAX_SLOTS) return;
    
    GameState.inventory.push(item);
    GameState.player.equipment[type] = null;
    this.recalcStats();
    UISystem.updateUI();
  }

  static recalcStats() {
    const p = GameState.player;
    p.atk = p.baseAtk;
    p.maxHp = p.baseMaxHp;
    p.maxMp = p.baseMaxMp;
    p.def = p.baseDef;
    p.critChance = p.baseStats?.crit ?? CONFIG.BASE_CRIT_CHANCE;
    p.speed = p.baseStats?.speed ?? CONFIG.PLAYER_SPEED;
    
    for (const item of Object.values(p.equipment)) {
      if (!item) continue;
      const stats = item.stats || { attack: item.bonusAtk, hp: item.bonusHp };
      p.atk += stats.attack || 0; p.maxHp += stats.hp || 0; p.maxMp += stats.mp || 0; p.def += stats.defense || 0; p.critChance += stats.crit || 0;
    }
    p.atk += p.temporaryBuffs?.attack || 0;
    p.def += p.temporaryBuffs?.defense || 0;
    
    if (p.hp > p.maxHp) p.hp = p.maxHp;
    if (p.mp > p.maxMp) p.mp = p.maxMp;
    UISystem.updateHUD();
  }
}
