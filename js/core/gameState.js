export const GameState = {
  player: null,
  pet: null,
  currentScene: null,
  
  inventory: [],
  enemies: [],
  drops: [],
  effects: [],
  damageTexts: [],
  quests: [],
  flags: {}, 
  progress: {}, 
  
  isTransitioning: false,
  hitStop: 0,
  projectiles: [],
  hitRegistry: new Set(),
  
  canvasW: window.innerWidth,
  canvasH: window.innerHeight,
  
  deltaTime: 0,
  elapsed: 0
};
