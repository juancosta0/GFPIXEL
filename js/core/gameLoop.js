import { GameState } from './gameState.js';
import { Game } from './game.js';
import { InputManager } from './input.js';

export class GameLoop {
  static lastTime = 0;
  static accumulator = 0;
  static step = 1 / 60;
  static running = false;
  static start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }
  static loop(time) {
    const frameTime = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;
    this.accumulator += frameTime;
    while (this.accumulator >= this.step) {
      GameState.deltaTime = this.step;
      GameState.elapsed += this.step;
      Game.update(this.step);
      InputManager.clearFrame();
      this.accumulator -= this.step;
    }
    Game.draw(this.accumulator / this.step);
    requestAnimationFrame(this.loop.bind(this));
  }
}
