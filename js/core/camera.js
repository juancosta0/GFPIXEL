import { CONFIG } from '../data/config.js';

export class Camera {
  static x = 0; static y = 0; static width = 800; static height = 600;
  static mapWidth = 800; static mapHeight = 600;
  static init(width, height) { this.resize(width, height); }
  static resize(width, height) { this.width = width; this.height = height; this.clamp(); }
  static setBounds(width, height) { this.mapWidth = width; this.mapHeight = height; this.clamp(); }
  static clamp() {
    this.x = Math.max(0, Math.min(this.x, Math.max(0, this.mapWidth - this.width)));
    this.y = Math.max(0, Math.min(this.y, Math.max(0, this.mapHeight - this.height)));
  }
  static snapTo(target) { this.x = target.x - this.width / 2; this.y = target.y - this.height / 2; this.clamp(); }
  static follow(target, dt) {
    if (!target) return;
    const blend = 1 - Math.exp(-CONFIG.CAMERA_LERP * dt);
    this.x += (target.x - this.width / 2 - this.x) * blend;
    this.y += (target.y - this.height / 2 - this.y) * blend;
    this.clamp();
  }
  static worldToScreen(x, y) { return { x: x - this.x, y: y - this.y }; }
  static screenToWorld(x, y) { return { x: x + this.x, y: y + this.y }; }
  static isVisible(x, y, padding = 64) { return x >= this.x - padding && x <= this.x + this.width + padding && y >= this.y - padding && y <= this.y + this.height + padding; }
}
