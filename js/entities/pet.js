import { Entity } from './entity.js';
import { GameState } from '../core/gameState.js';
import { CONFIG } from '../data/config.js';
import { SpriteSystem } from '../systems/sprite.js';

export class Pet extends Entity {
  constructor(x, y) {
    super(x, y, 6);
    this.state = 'follow';
    this.gatherTimer = 0;
    this.taskName = '';
    this.gatherType = '';
  }

  update(dt) {
    super.update(dt);
    const player = GameState.player;
    
    if (this.state === 'follow') {
      const blend = 1 - Math.exp(-8 * dt);
      this.x += (player.x - 30 - this.x) * blend;
      this.y += (player.y - 20 - this.y) * blend;
      this.y += Math.sin(GameState.elapsed * 5) * 12 * dt;
    }
    // gather state is handled by SpriteSystem
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    
    SpriteSystem.draw(ctx, 'pet', sx, sy, { state: this.state, frame: this.frameIndex, anchorY: 25 });
    
    if (this.state === 'gather') {
      ctx.fillStyle = '#00ffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Coletando...', sx, sy - 14);
    }
  }
}
