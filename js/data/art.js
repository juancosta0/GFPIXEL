export const ART_CONFIG = Object.freeze({
  baseResolution: { width: 960, height: 540 },
  pixelScale: 2,
  tileSize: 16,
  cameraSnap: true,
  imageSmoothing: false,
  spriteScale: 2,
  renderStrategy: 'pixel-perfect',
  viewportStrategy: 'integer-scale',
  worldPadding: 18,
  proportions: {
    player: { width: 32, height: 46 },
    npc: { width: 26, height: 34 },
    enemy: { width: 28, height: 34 },
    elite: { width: 34, height: 42 },
    boss: { width: 42, height: 54 },
    sprite: { width: 30, height: 34 },
    object: { width: 18, height: 18 },
    weapon: { width: 16, height: 32 },
    vfx: { radius: 12 }
  }
});

export const ART_BIBLE = Object.freeze({
  palette: {
    primary: '#81e3cd',
    secondary: '#f4c96a',
    accent: '#80a8ff',
    magic: '#7fe7ff',
    shadow: '#101922',
    highlight: '#f8f4d7',
    soil: '#3b5a4d',
    stone: '#6b7a86',
    wood: '#8f6347',
    dungeon: '#4b4456',
    ui: '#d5b36d',
    uiPanel: '#0f2d35'
  },
  pixelArt: {
    density: 'alta',
    contour: 'contorno definido',
    detailLevel: 'moderado com forte silhueta',
    shadows: 'sombras planas em 2-3 tons',
    contrast: 'alto em personagens e VFX, médio em ambientes',
    pixelSizing: 2,
    simplification: 'silhueta clara e legibilidade em primeiro lugar'
  },
  proportions: {
    player: 'mais alto que um inimigo comum; silhueta clara e corpo legível;',
    npc: 'ligeiramente menor que o player com proporções mais simples;',
    enemyCommon: 'altura média com porte compacto e agressividade visual;',
    elite: 'maior massa, silhueta mais larga e ameaçadora;',
    boss: 'maior que o player, com elementos dominantes e presença central;',
    sprite: 'menor, leve e aéreo, com asas ou brilho proeminente;',
    objects: 'são legíveis e não ultrapassam a linha do personagem;',
    weapons: 'trilho visual identificável, sempre visíveis e proporcionalmente consistentes'
  },
  layers: [
    'background',
    'distant decor',
    'ground',
    'objects',
    'entities',
    'foreground',
    'vfx',
    'ui'
  ],
  ui: {
    style: 'fantasy RPG',
    panels: 'molduras com borda e detalhe em dourado',
    buttons: 'alto contraste e símbolos legíveis',
    useIcons: 'ícones próprios, não emojis como base visual'
  },
  qualityChecklist: [
    'escala correta',
    'resolução correta',
    'pixel perfect',
    'paleta consistente',
    'sombra consistente',
    'iluminação consistente',
    'contorno consistente',
    'animação consistente',
    'proporção correta',
    'layer correto',
    'legibilidade',
    'integração correta'
  ]
});

export const ART_ASSET_LIBRARY = Object.freeze({
  player: { category: 'characters', states: ['idle', 'walk', 'attack', 'cast', 'hurt', 'death'] },
  slime: { category: 'enemies', states: ['idle', 'walk', 'attack', 'hurt', 'death'] },
  wolf: { category: 'enemies', states: ['idle', 'walk', 'attack', 'hurt', 'death'] },
  sprite: { category: 'companion', states: ['idle', 'fly', 'gather', 'happy', 'return'] },
  sword: { category: 'weapons', states: ['idle', 'attack'] },
  bow: { category: 'weapons', states: ['idle', 'draw', 'release'] },
  staff: { category: 'weapons', states: ['idle', 'cast'] },
  grass: { category: 'tiles', states: ['base', 'edge', 'transition'] },
  dirt: { category: 'tiles', states: ['base', 'edge', 'transition'] },
  stone: { category: 'tiles', states: ['base', 'edge', 'transition'] },
  tree: { category: 'environment', states: ['idle'] },
  flower: { category: 'environment', states: ['idle', 'sway'] },
  swordIcon: { category: 'ui', states: ['idle'] },
  bowIcon: { category: 'ui', states: ['idle'] },
  staffIcon: { category: 'ui', states: ['idle'] },
  potionIcon: { category: 'ui', states: ['idle'] }
});
