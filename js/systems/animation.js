export const ANIMATION_DEFINITIONS = Object.freeze({
  IDLE: { frames: [0, 1, 0, 1], frameDuration: .18, loop: true, nextState: 'IDLE', interruptible: true },
  WALK: { frames: [1, 2, 3, 4], frameDuration: .1, loop: true, nextState: 'WALK', interruptible: true },
  SWORD_ATTACK: { frames: [5, 5, 5, 5, 5, 0], frameDuration: .055, loop: false, events: { 3: 'impact' }, nextState: 'IDLE', interruptible: false },
  BOW_ATTACK: { frames: [0, 1, 2, 3, 4, 5, 0], frameDuration: .08, loop: false, events: { 5: 'release_arrow' }, nextState: 'IDLE', interruptible: false },
  STAFF_CAST: { frames: [0, 1, 2, 3, 4, 5, 5, 0], frameDuration: .09, loop: false, events: { 6: 'release_spell' }, nextState: 'IDLE', interruptible: false },
  HURT: { frames: [0, 5], frameDuration: .08, loop: false, nextState: 'IDLE', interruptible: false },
  DEATH: { frames: [0, 1, 2, 3, 4, 5], frameDuration: .12, loop: false, nextState: 'DEATH', interruptible: false }
});

export class AnimationController {
  constructor(owner, onEvent) {
    this.owner = owner;
    this.onEvent = onEvent;
    this.state = 'IDLE';
    this.frame = 0;
    this.elapsed = 0;
    this.finished = false;
  }
  play(state, force = false) {
    const definition = ANIMATION_DEFINITIONS[state] || ANIMATION_DEFINITIONS.IDLE;
    if (!force && this.state === state) return;
    if (!force && !ANIMATION_DEFINITIONS[this.state]?.interruptible && !this.finished) return;
    this.state = state;
    this.frame = 0;
    this.elapsed = 0;
    this.finished = false;
    this.owner.updateState(state.toLowerCase());
  }
  update(dt) {
    const definition = ANIMATION_DEFINITIONS[this.state] || ANIMATION_DEFINITIONS.IDLE;
    this.elapsed += dt;
    while (this.elapsed >= definition.frameDuration) {
      this.elapsed -= definition.frameDuration;
      const previous = this.frame;
      this.frame++;
      const event = definition.events?.[this.frame];
      if (event && this.onEvent) this.onEvent(event, this.state, this.frame);
      if (this.frame >= definition.frames.length) {
        if (definition.loop) this.frame = 0;
        else { this.frame = definition.frames.length - 1; this.finished = true; this.owner.updateState(definition.nextState.toLowerCase()); }
      }
      if (previous === this.frame && !definition.loop) break;
    }
  }
  getFrame() { return (ANIMATION_DEFINITIONS[this.state] || ANIMATION_DEFINITIONS.IDLE).frames[this.frame] || 0; }
}