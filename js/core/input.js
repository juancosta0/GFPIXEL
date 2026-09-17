import { GameState } from './gameState.js';
import { SkillSystem } from '../systems/skill.js';
import { UISystem } from '../ui/ui.js';

export class InputManager {
  static keys = {}; static pressedThisFrame = {};
  static init() {
    window.addEventListener('keydown', event => {
      const key = event.key.toLowerCase();
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
      if (!this.keys[key]) this.pressedThisFrame[key] = true;
      this.keys[key] = true;
      if (GameState.isTransitioning) return;
      if (key === '1') SkillSystem.useSkill(0);
      if (key === '2') SkillSystem.useSkill(1);
      if (key === '3') SkillSystem.useSkill(2);
      if (key === '4') SkillSystem.useSkill(3);
      if (key === ' ') SkillSystem.useSkill(0);
      if (key === 'i') UISystem.toggleWindow('playerWindows');
    });
    window.addEventListener('keyup', event => { this.keys[event.key.toLowerCase()] = false; });
  }
  static isPressed(key) { return Boolean(this.keys[key]); }
  static isJustPressed(key) { return Boolean(this.pressedThisFrame[key]); }
  static clearFrame() { this.pressedThisFrame = {}; }
}
