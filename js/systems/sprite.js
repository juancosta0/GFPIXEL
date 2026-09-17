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
    const pet = GameState.pet;
    if (!pet || pet.state !== 'following' || pet.energy < 15) {
      UISystem.logMsg('Sprite precisa estar seguindo e ter energia.', 'dmg');
      return;
    }
    const adjustedDuration = Math.max(2, duration / 60 * (1 - Math.min(.35, (pet.level - 1) * .05)));
    Object.assign(pet, { state: 'gathering', gatherTimer: adjustedDuration, taskDuration: adjustedDuration, taskName: name, gatherType: type, taskReward: `1-${1 + pet.level} ${name}`, energy: pet.energy - 15, mood: 'focado' });
    document.querySelectorAll('[id^="btnGather"]').forEach(button => { button.disabled = true; });
    UISystem.logMsg(`${pet.name} começou a coletar ${name}.`, 'sys');
    UISystem.updateSpritePanel();
  }

  static update(dt) {
    const pet = GameState.pet;
    const player = GameState.player;
    if (!pet || pet.state !== 'gathering') return;
    const blend = 1 - Math.exp(-5 * dt);
    pet.x += (player.x + 80 - pet.x) * blend;
    pet.y += (player.y - 60 - pet.y) * blend;
    pet.gatherTimer -= dt;
    if (pet.gatherTimer > 0) return;
    pet.state = 'following';
    const amount = Math.floor(Math.random() * (2 + pet.level)) + 1;
    player.materials[pet.gatherType] += amount;
    this.addExperience(pet, 10);
    pet.mood = 'feliz';
    pet.inventory.push({ type: pet.gatherType, quantity: amount });
    UISystem.logMsg(`${pet.name} encontrou ${amount}x ${pet.taskName} e voltou!`, 'gold');
    document.querySelectorAll('[id^="btnGather"]').forEach(button => { button.disabled = false; });
    UISystem.updateHUD();
    UISystem.updateSpritePanel();
  }

  static addExperience(pet, amount) {
    pet.xp += amount;
    while (pet.xp >= pet.xpNext) {
      pet.xp -= pet.xpNext;
      pet.level++;
      pet.xpNext = Math.round(pet.xpNext * 1.35);
      if (pet.level === 2) pet.abilities.push('coleta eficiente');
      if (pet.level === 3) pet.abilities.push('atividade avançada');
      UISystem.logMsg(`${pet.name} subiu para o nível ${pet.level}!`, 'gold');
    }
  }
}
