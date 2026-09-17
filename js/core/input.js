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
    window.addEventListener('blur', () => { this.keys = {}; this.pressedThisFrame = {}; });
    window.addEventListener('keydown', event => {
      const key = event.key.toLowerCase();
      if (key === 'p') {
        GameState.paused = !GameState.paused;
        UISystem.logMsg(GameState.paused ? 'Jogo pausado.' : 'Jogo retomado.', 'sys');
      }
      if (key === 'f1') {
        GameState.debug.enabled = !GameState.debug.enabled;
        UISystem.logMsg(GameState.debug.enabled ? 'Debug artístico ativado.' : 'Debug artístico desativado.', 'sys');
      }
      if (key === 'f2') {
        const ArtPreviewSystem = (await import('../systems/artPreview.js')).ArtPreviewSystem;
        ArtPreviewSystem.toggle();
      }
    });
  }
  static isPressed(key) { return Boolean(this.keys[key]); }
  static isJustPressed(key) { return Boolean(this.pressedThisFrame[key]); }
  static clearFrame() { this.pressedThisFrame = {}; }
}
