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
  
  isTransitioning: false,
  hitStop: 0,
  projectiles: [],
  projectileEntities: [],
  hitRegistry: new Set(),
  
  canvasW: window.innerWidth,
  canvasH: window.innerHeight,
  
  deltaTime: 0,
  elapsed: 0
};
