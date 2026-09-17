import { IMAGES } from '../data/assets.js';
import { GameState } from '../core/gameState.js';

export class ArtPreviewSystem {
  static canvas = null;
  static ctx = null;
  static visible = false;

  static init() {
    const wrap = document.getElementById('artPreview');
    if (!wrap) return;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 320;
    this.canvas.height = 180;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    wrap.appendChild(this.canvas);
    this.visible = false;
    wrap.style.display = 'none';
  }

  static setVisible(next) {
    this.visible = next;
    const wrap = document.getElementById('artPreview');
    if (!wrap) return;
    wrap.style.display = this.visible ? 'block' : 'none';
  }

  static toggle() {
    this.setVisible(!this.visible);
  }

  static draw() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#0e1a20';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const sampleItems = [
      { key: 'player', x: 32, y: 64, state: 'idle', frame: Math.floor(GameState.elapsed * 8) % 4 },
      { key: 'slime', x: 104, y: 74, state: 'moving', frame: Math.floor(GameState.elapsed * 10) % 2 },
      { key: 'wolf', x: 176, y: 68, state: 'moving', frame: Math.floor(GameState.elapsed * 12) % 2 },
      { key: 'pet', x: 250, y: 82, state: 'follow', frame: Math.floor(GameState.elapsed * 6) % 3 },
      { key: 'swordWeapon', x: 54, y: 140, state: 'idle', frame: 0 },
      { key: 'bowWeapon', x: 118, y: 140, state: 'idle', frame: 0 },
      { key: 'staffWeapon', x: 182, y: 140, state: 'idle', frame: 0 },
      { key: 'potionIcon', x: 246, y: 146, state: 'idle', frame: 0 }
    ];

    for (const item of sampleItems) {
      const image = IMAGES[item.key];
      if (!image || !image.complete) continue;
      const size = item.key.includes('Weapon') ? 28 : item.key === 'pet' ? 22 : 34;
      this.ctx.save();
      this.ctx.translate(item.x, item.y);
      this.ctx.drawImage(image, 0, 0, image.width, image.height, -size / 2, -size / 2, size, size);
      this.ctx.restore();
    }

    this.ctx.strokeStyle = '#d5b36d';
    this.ctx.strokeRect(6, 6, this.canvas.width - 12, this.canvas.height - 12);
    this.ctx.fillStyle = '#e9f1ff';
    this.ctx.font = '10px monospace';
    this.ctx.fillText('Art Preview', 14, 20);
  }
}
