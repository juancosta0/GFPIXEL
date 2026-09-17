import { ART_CONFIG } from '../data/art.js';

export const GameState = {
  player: null,
  pet: null,
  currentScene: null,
  
  inventory: [],
  enemies: [],
  drops: [],
  effects: [],
  vfx: [],
  damageTexts: [],
  quests: [],
  flags: {}, 
  progress: {}, 
  paused: false,
  debug: {
    enabled: false,
    hitboxes: true,
    anchors: true
  },
  
  isTransitioning: false,
  portalCooldown: 0,
  hitStop: 0,
  projectiles: [],
  projectileEntities: [],
  hitRegistry: new Set(),
  
  canvasW: ART_CONFIG.baseResolution.width,
  canvasH: ART_CONFIG.baseResolution.height,
  
  deltaTime: 0,
  elapsed: 0
};
