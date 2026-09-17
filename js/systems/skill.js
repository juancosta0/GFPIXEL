import { GameState } from '../core/gameState.js';
import { SKILLS_DB } from '../data/skills.js';
import { UISystem } from '../ui/ui.js';
import { CombatSystem } from './combat.js';

export class SkillSystem {
  static weaponSkill() {
    return CombatSystem.getWeaponAttack(GameState.player);
  }
  static useSkill(index) {
    if (GameState.isTransitioning || GameState.player.state === 'dead') return;
    const skill = index === 0 ? this.weaponSkill() : SKILLS_DB[index];
    if (!skill || GameState.player.skillCds[index] > 0) return;
    if (skill.type !== 'heal' && !GameState.currentScene.combatAllowed) return UISystem.logMsg('Zona segura. Ataques bloqueados.', 'dmg');
    if (GameState.player.mp < skill.mpCost) return UISystem.logMsg('Mana insuficiente.', 'dmg');
    GameState.player.mp -= skill.mpCost;
    GameState.player.skillCds[index] = skill.cd;
    if (index === 0) CombatSystem.beginWeaponAttack(skill);
    else CombatSystem.executePlayerSkill(skill);
  }
  static updateCooldowns(dt) { GameState.player.skillCds.forEach((cd, i) => { GameState.player.skillCds[i] = Math.max(0, cd - dt); }); }
}
