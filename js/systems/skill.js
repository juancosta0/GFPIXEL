import { GameState } from '../core/gameState.js';
import { SKILLS_DB } from '../data/skills.js';
import { UISystem } from '../ui/ui.js';
import { CombatSystem } from './combat.js';

export class SkillSystem {
  static weaponSkill() {
    const style = GameState.player.equipment.weapon?.weaponStyle || 'sword';
    if (style === 'bow') return { ...SKILLS_DB[0], name: 'Flecha Lunar', type: 'projectile', range: 310, area: 12, damage: 1.05 };
    if (style === 'staff') return { ...SKILLS_DB[0], name: 'Dardo Arcano', type: 'projectile', range: 340, area: 16, damage: 1.15, mpCost: 3, animation: 'casting' };
    if (style === 'greatsword') return { ...SKILLS_DB[0], name: 'Arco da Raiz', type: 'cone', range: 76, area: Math.PI / 1.15, damage: 1.3 };
    return SKILLS_DB[0];
  }
  static useSkill(index) {
    if (GameState.isTransitioning || GameState.player.state === 'dead') return;
    const skill = index === 0 ? this.weaponSkill() : SKILLS_DB[index];
    if (!skill || GameState.player.skillCds[index] > 0) return;
    if (skill.type !== 'heal' && !GameState.currentScene.combatAllowed) return UISystem.logMsg('Zona segura. Ataques bloqueados.', 'dmg');
    if (GameState.player.mp < skill.mpCost) return UISystem.logMsg('Mana insuficiente.', 'dmg');
    GameState.player.mp -= skill.mpCost; GameState.player.skillCds[index] = skill.cd; CombatSystem.executePlayerSkill(skill);
  }
  static updateCooldowns(dt) { GameState.player.skillCds.forEach((cd, i) => { GameState.player.skillCds[i] = Math.max(0, cd - dt); }); }
}
