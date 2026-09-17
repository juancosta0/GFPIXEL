import { ART_CONFIG } from '../data/art.js';
import { IMAGES } from '../data/assets.js';

export class AssetManager {
  static cache = new Map();
  static initialized = false;

  static initialize() {
    if (this.initialized) return;
    for (const [id, image] of Object.entries(IMAGES || {})) {
      if (image) this.cache.set(id, image);
    }
    this.initialized = true;
  }

  static register(id, imageAsset) {
    if (!id || !imageAsset) return null;
    this.cache.set(id, imageAsset);
    return imageAsset;
  }

  static get(id) {
    this.initialize();
    return this.cache.get(id) || null;
  }

  static has(id) {
    return Boolean(this.get(id));
  }

  static getSprite(id, frame = 0, options = {}) {
    const source = this.get(id);
    if (!source) return null;
    const fallback = options.fallback || { width: ART_CONFIG.proportions.player.width, height: ART_CONFIG.proportions.player.height };
    return { source, frame, width: options.width || fallback.width, height: options.height || fallback.height };
  }
}
