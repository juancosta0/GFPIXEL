export class Entity {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.state = 'idle'; // idle, moving, attacking, casting, hurt, dead
    this.facing = 'down'; // up, down, left, right
    this.animationTimer = 0;
    this.frameIndex = 0;
    this.stateTimer = 0;
    this.drawOffsetY = 0;
    this.toRemove = false;
  }

  updateState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.animationTimer = 0;
      this.frameIndex = 0;
      this.stateTimer = 0;
    }
  }

  update(dt) {
    this.stateTimer += dt;
    this.animationTimer += dt;
    if (this.animationTimer >= 1 / 8) {
      this.frameIndex++;
      this.animationTimer = 0;
    }
  }

  get sortY() { return this.y + this.r + this.drawOffsetY; }

  draw(ctx, camera) {
    // A ser sobrescrito por filhos
  }
}
