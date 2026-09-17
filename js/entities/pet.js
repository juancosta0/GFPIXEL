import { Entity } from './entity.js';
import { GameState } from '../core/gameState.js';
import { CONFIG } from '../data/config.js';
import { SpriteSystem } from '../systems/sprite.js';

export class Pet extends Entity {
  constructor(x, y) {
    super(x, y, 6);
    this.id = 'sprite-1';
    this.name = 'Lumi';
    this.level = 1;
    this.xp = 0;
    this.xpNext = 40;
    this.energy = 100;
    this.mood = 'feliz';
    this.specialty = 'exploração';
    this.state = 'following';
    this.inventory = [];
    this.abilities = ['coleta básica'];
    this.gatherTimer = 0;
    this.taskDuration = 0;
    this.taskName = '';
    this.gatherType = '';
    this.taskReward = '';
  }

  update(dt) {
    super.update(dt);
    const player = GameState.player;
    
    if (this.state === 'following') {
      const blend = 1 - Math.exp(-8 * dt);
      this.x += (player.x - 30 - this.x) * blend;
      this.y += (player.y - 20 - this.y) * blend;
      this.y += Math.sin(GameState.elapsed * 5) * 12 * dt;
    }
    if (this.state === 'resting') {
      this.energy = Math.min(100, this.energy + dt * 8);
      if (this.energy >= 100) this.state = 'following';
    }
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    
    SpriteSystem.draw(ctx, 'pet', sx, sy, { state: this.state, frame: this.frameIndex, anchorY: 25 });
    
    if (this.state === 'gathering') {
      ctx.fillStyle = '#00ffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Coletando...', sx, sy - 14);
    }
    ctx.fillStyle = '#fff';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.name} Lv.${this.level}`, sx, sy - 28);
  }
}
