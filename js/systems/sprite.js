import { GameState } from '../core/gameState.js';
import { UISystem } from '../ui/ui.js';
import { IMAGES, SPRITES } from '../data/assets.js';

export class SpriteSystem {
  static draw(ctx, key, x, y, options = {}) {
    const definition = SPRITES[key];
    const image = IMAGES[key];
    if (!definition || !image?.complete) return;
    const stateFrames = definition.states?.[options.state] || definition.states?.idle || [0];
    const frame = stateFrames[options.frame % stateFrames.length];
    const width = options.width || options.size || definition.drawSize;
    const height = options.height || options.size || definition.drawSize;
    const anchorY = options.anchorY ?? height / 2;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (options.facing === 'left') ctx.scale(-1, 1);
    ctx.drawImage(image, frame * definition.frameSize, 0, definition.frameSize, definition.frameSize,
      -Math.floor(width / 2), -Math.floor(anchorY), width, height);
    ctx.restore();
  }

  static startGathering(type, duration, name) {
    if (GameState.pet.state !== 'follow') return;
    Object.assign(GameState.pet, { state: 'gather', gatherTimer: duration / 60, taskName: name, gatherType: type });
    document.querySelectorAll('[id^="btnGather"]').forEach(button => { button.disabled = true; });
    UISystem.logMsg(`Sprite coletando ${name}...`, 'sys');
  }

  static update(dt) {
    const pet = GameState.pet;
    const player = GameState.player;
    if (!pet || pet.state !== 'gather') return;
    const blend = 1 - Math.exp(-5 * dt);
    pet.x += (player.x + 80 - pet.x) * blend;
    pet.y += (player.y - 60 - pet.y) * blend;
    pet.gatherTimer -= dt;
    if (pet.gatherTimer > 0) return;
    pet.state = 'follow';
    const amount = Math.floor(Math.random() * 3) + 1;
    player.materials[pet.gatherType] += amount;
    UISystem.logMsg(`Sprite obteve ${amount}x ${pet.taskName}!`, 'gold');
    document.querySelectorAll('[id^="btnGather"]').forEach(button => { button.disabled = false; });
    UISystem.updateHUD();
  }
}
