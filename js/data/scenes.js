const ring = (type, cx, cy, amount, radius) => Array.from({ length: amount }, (_, i) => ({ type, x: cx + Math.cos(i * 2.4) * radius, y: cy + Math.sin(i * 2.4) * radius }));

export const SCENES_DB = {
  // ===== CIDADE PRINCIPAL =====
  cidade: {
    id: 'cidade', name: 'Cidade de Ilya', type: 'city', combatAllowed: false, theme: 'town', tileKey: 'tileTown', width: 1720, height: 1280,
    portals: [
      { x: 1620, y: 640, r: 32, color: '#78f3e3', dest: 'planiciesSafael', spawnX: 260, spawnY: 700, text: 'Estrada para Safael' },
      { x: 100, y: 640, r: 32, color: '#9ab7bb', dest: 'cordilheiraVentos', spawnX: 2000, spawnY: 850, text: 'Cordilheira dos Ventos' },
      { x: 860, y: 1200, r: 32, color: '#f4c96a', dest: 'desertoDourado', spawnX: 1100, spawnY: 200, text: 'Deserto de Duna Dourada' },
      { x: 320, y: 310, r: 32, color: '#6bcf8b', dest: 'bosqueRaiz', spawnX: 220, spawnY: 930, text: 'Bosque da Raiz' },
      { x: 1380, y: 310, r: 32, color: '#a879df', dest: 'criptaAqua', spawnX: 160, spawnY: 860, text: 'Cripta Aqua' },
      { x: 1540, y: 980, r: 32, color: '#d0ad68', dest: 'jardimNebuloso', spawnX: 100, spawnY: 700, text: 'Jardim Nebuloso' }
    ],
    spawns: [],
    npcs: [
      { id: 'npc_blacksmith', name: 'Mestre Ferreiro', x: 810, y: 560, r: 20, type: 'crafting', color: '#d18b52', text: 'E - Forjar' },
      { id: 'npc_guide', name: 'Guia de Ilya', x: 690, y: 630, r: 18, type: 'dialogue', color: '#7696d6', text: 'E - Falar' },
      { id: 'npc_merchant', name: 'Mercadora Nara', x: 930, y: 560, r: 18, type: 'shop', color: '#d9a65a', text: 'E - Comprar' }
    ],
    objects: [
      { type: 'fountain', x: 810, y: 760 },
      { type: 'chest', x: 610, y: 700 },
      { type: 'chest', x: 1030, y: 700 },
      { type: 'banner', x: 500, y: 520 },
      { type: 'banner', x: 1120, y: 520 },
      { type: 'tree', x: 360, y: 420 },
      { type: 'tree', x: 1260, y: 420 },
      ...ring('lamp', 810, 760, 6, 180),
      ...ring('flower', 810, 760, 8, 250)
    ]
  },

  // ===== PLANÍCIES =====
  planiciesSafael: {
    id: 'planiciesSafael', name: 'Planícies de Safael', type: 'field', combatAllowed: true, theme: 'meadow', tileKey: 'tileMeadow', width: 1950, height: 1400,
    portals: [
      { x: 70, y: 700, r: 32, color: '#78f3e3', dest: 'cidade', spawnX: 1520, spawnY: 640, text: 'Cidade de Ilya' },
      { x: 1820, y: 300, r: 32, color: '#a879df', dest: 'cavernaSombria', requires: 'slime_problem_done', spawnX: 260, spawnY: 640, text: 'Caverna Sombria' }
    ],
    spawns: [
      { enemyId: 'slime_safael', count: 7, area: { x1: 360, y1: 320, x2: 1500, y2: 1020 } },
      { enemyId: 'gelatina_lunar', count: 4, area: { x1: 500, y1: 500, x2: 1600, y2: 1100 } }
    ],
    npcs: [],
    objects: [
      { type: 'tree', x: 430, y: 360 },
      { type: 'tree', x: 1460, y: 450 },
      { type: 'ruin', x: 900, y: 500 },
      { type: 'altar', x: 1210, y: 870 },
      { type: 'chest', x: 560, y: 940 }, // Baú da planície
      { type: 'chest', x: 1750, y: 1200 }, // Baú escondido no canto
      { type: 'ore_node', x: 1350, y: 320, text: 'Veio de Minério' },
      { type: 'wood_node', x: 480, y: 450, text: 'Tronco de Madeira' },
      { type: 'herb_node', x: 780, y: 880, text: 'Arbusto de Ervas' },
      { type: 'crystal', x: 1560, y: 930 },
      ...ring('flower', 760, 760, 12, 250),
      ...ring('mushroom', 1080, 700, 7, 180)
    ]
  },

  // ===== CAVERNAS & DUNGEONS =====
  cavernaSombria: {
    id: 'cavernaSombria', name: 'Caverna Sombria', type: 'dungeon', combatAllowed: true, theme: 'crypt', tileKey: 'tileCrypt', width: 1550, height: 1150,
    portals: [
      { x: 70, y: 640, r: 32, color: '#a879df', dest: 'planiciesSafael', spawnX: 1720, spawnY: 340, text: 'Planícies de Safael' },
      { x: 1420, y: 470, r: 32, color: '#d95a65', dest: 'arenaReiSlime', spawnX: 430, spawnY: 680, text: 'Arena do Rei Slime' },
      { x: 780, y: 1080, r: 32, color: '#7fe7ff', dest: 'grutaCristalina', spawnX: 200, spawnY: 300, text: 'Fenda da Gruta Cristalina' }
    ],
    spawns: [
      { enemyId: 'slime_caverna', count: 6, area: { x1: 340, y1: 300, x2: 1120, y2: 850 } },
      { enemyId: 'sentinela_osso', count: 3, area: { x1: 800, y1: 380, x2: 1200, y2: 780 } }
    ],
    npcs: [
      { id: 'npc_miner_borin', name: 'Minerador Borin', x: 300, y: 600, r: 18, type: 'dialogue', color: '#b8964e', text: 'E - Conversar' }
    ],
    objects: [
      { type: 'ruin', x: 350, y: 320 },
      { type: 'crystal', x: 600, y: 430 },
      { type: 'torch', x: 840, y: 300 },
      { type: 'torch', x: 1100, y: 740 },
      { type: 'altar', x: 1180, y: 480 },
      { type: 'crystal', x: 1300, y: 850 },
      { type: 'chest', x: 1450, y: 250 }, // Baú escondido na caverna
      { type: 'ore_node', x: 500, y: 850, text: 'Veio de Minério' },
      { type: 'ore_node', x: 950, y: 350, text: 'Veio de Minério' },
      ...ring('mushroom', 700, 760, 8, 190)
    ]
  },

  arenaReiSlime: {
    id: 'arenaReiSlime', name: 'Arena do Rei Slime Sombrio', type: 'bossroom', combatAllowed: true, theme: 'crypt', tileKey: 'tileCrypt', width: 860, height: 800,
    portals: [
      { x: 430, y: 750, r: 32, color: '#a879df', dest: 'cavernaSombria', spawnX: 1300, spawnY: 470, text: 'Sair da arena' },
      { x: 430, y: 100, r: 32, color: '#ffd700', dest: 'camaraSecreta', requires: 'king_slime_defeated', spawnX: 400, spawnY: 650, text: 'Fenda Secreta do Tesouro' }
    ],
    spawns: [
      { enemyId: 'rei_slime_sombrio', count: 1, area: { x1: 430, y1: 340, x2: 430, y2: 340 } }
    ],
    npcs: [],
    objects: [
      { type: 'crystal', x: 210, y: 250 },
      { type: 'crystal', x: 650, y: 250 },
      { type: 'torch', x: 180, y: 430 },
      { type: 'torch', x: 680, y: 430 },
      { type: 'altar', x: 430, y: 190 },
      ...ring('mushroom', 430, 420, 10, 220)
    ]
  },

  // ===== ÁREA SECRETA 1: CÂMARA SECRETA DO REI SLIME =====
  camaraSecreta: {
    id: 'camaraSecreta', name: 'Câmara Secreta do Rei Slime', type: 'secret', combatAllowed: false, theme: 'crypt', tileKey: 'tileCavern', width: 840, height: 750,
    portals: [
      { x: 400, y: 700, r: 32, color: '#ffd700', dest: 'arenaReiSlime', spawnX: 430, spawnY: 180, text: 'Voltar à Arena' }
    ],
    spawns: [],
    npcs: [],
    objects: [
      { type: 'altar', x: 400, y: 260 },
      { type: 'chest', x: 280, y: 340 }, // Baú 1
      { type: 'chest', x: 400, y: 390 }, // Baú 2
      { type: 'chest', x: 520, y: 340 }, // Baú 3
      { type: 'crystal', x: 180, y: 240 },
      { type: 'crystal', x: 620, y: 240 },
      { type: 'ore_node', x: 180, y: 480, text: 'Veio de Cristal Arcano' },
      { type: 'ore_node', x: 620, y: 480, text: 'Veio de Pepitas de Ouro' }
    ]
  },

  // ===== BIOMA DESERTO =====
  desertoDourado: {
    id: 'desertoDourado', name: 'Deserto de Duna Dourada', type: 'field', combatAllowed: true, theme: 'desert', tileKey: 'tileDesert', width: 2200, height: 1650,
    portals: [
      { x: 1100, y: 80, r: 32, color: '#78f3e3', dest: 'cidade', spawnX: 860, spawnY: 1120, text: 'Cidade de Ilya' },
      { x: 120, y: 850, r: 32, color: '#78f3e3', dest: 'portoOasis', spawnX: 1380, spawnY: 600, text: 'Oásis de Kaslow' },
      { x: 2100, y: 850, r: 32, color: '#e7b65c', dest: 'ruinasSolares', spawnX: 180, spawnY: 650, text: 'Ruínas do Templo Solar' }
    ],
    spawns: [
      { enemyId: 'escorpiao_duna', count: 8, area: { x1: 350, y1: 300, x2: 1850, y2: 1350 } },
      { enemyId: 'serpente_sol', count: 6, area: { x1: 400, y1: 400, x2: 1750, y2: 1200 } },
      { enemyId: 'golem_areia', count: 3, area: { x1: 700, y1: 500, x2: 1500, y2: 1100 } }
    ],
    npcs: [
      { id: 'npc_nomad_tariq', name: 'Nômade Tariq', x: 960, y: 450, r: 18, type: 'dialogue', color: '#e7b65c', text: 'E - Conversar' }
    ],
    objects: [
      { type: 'cactus', x: 420, y: 380 },
      { type: 'cactus', x: 650, y: 720 },
      { type: 'cactus', x: 1540, y: 420 },
      { type: 'cactus', x: 1720, y: 920 },
      { type: 'dune_rock', x: 800, y: 700 },
      { type: 'dune_rock', x: 1350, y: 850 },
      { type: 'obelisk', x: 1100, y: 850 },
      { type: 'chest', x: 1980, y: 350 }, // Baú escondido no deserto
      { type: 'ore_node', x: 1650, y: 650, text: 'Veio de Minério Dourado' },
      { type: 'herb_node', x: 500, y: 850, text: 'Flor do Deserto' }
    ]
  },

  portoOasis: {
    id: 'portoOasis', name: 'Oásis de Kaslow', type: 'city', combatAllowed: false, theme: 'oasis', tileKey: 'tileOasis', width: 1500, height: 1100,
    portals: [
      { x: 1420, y: 600, r: 32, color: '#f4c96a', dest: 'desertoDourado', spawnX: 200, spawnY: 850, text: 'Deserto de Duna Dourada' },
      { x: 120, y: 300, r: 32, color: '#78f3e3', dest: 'recantoOculto', spawnX: 680, spawnY: 380, text: 'Recanto Oculto da Água' }
    ],
    spawns: [],
    npcs: [
      { id: 'npc_alchemist_zaid', name: 'Alquimista Zaid', x: 750, y: 520, r: 18, type: 'shop', color: '#78f3e3', text: 'E - Comprar Elixires' }
    ],
    objects: [
      { type: 'fountain', x: 750, y: 650 },
      { type: 'tree', x: 420, y: 400 },
      { type: 'tree', x: 1050, y: 400 },
      { type: 'banner', x: 620, y: 480 },
      { type: 'banner', x: 880, y: 480 },
      { type: 'chest', x: 400, y: 320 }, // Baú do oásis atrás da palmeira
      ...ring('flower', 750, 650, 8, 190)
    ]
  },

  recantoOculto: {
    id: 'recantoOculto', name: 'Recanto Oculto do Oásis', type: 'secret', combatAllowed: false, theme: 'oasis', tileKey: 'tileOasis', width: 800, height: 700,
    portals: [
      { x: 720, y: 380, r: 32, color: '#78f3e3', dest: 'portoOasis', spawnX: 200, spawnY: 300, text: 'Voltar ao Oásis' }
    ],
    spawns: [],
    npcs: [],
    objects: [
      { type: 'fountain', x: 380, y: 350 },
      { type: 'chest', x: 220, y: 250 }, // Baú raro da nascente
      { type: 'herb_node', x: 240, y: 420, text: 'Arbusto de Ervas Sagradas' },
      { type: 'herb_node', x: 500, y: 420, text: 'Erva de Cura Mágica' },
      { type: 'wood_node', x: 520, y: 250, text: 'Palmeira Sagrada' },
      ...ring('flower', 380, 350, 7, 160)
    ]
  },

  ruinasSolares: {
    id: 'ruinasSolares', name: 'Ruínas do Templo Solar', type: 'dungeon', combatAllowed: true, theme: 'desert', tileKey: 'tileDesert', width: 1750, height: 1300,
    portals: [
      { x: 100, y: 650, r: 32, color: '#f4c96a', dest: 'desertoDourado', spawnX: 1980, spawnY: 850, text: 'Deserto de Duna Dourada' }
    ],
    spawns: [
      { enemyId: 'golem_areia', count: 5, area: { x1: 300, y1: 280, x2: 1500, y2: 950 } },
      { enemyId: 'serpente_sol', count: 6, area: { x1: 350, y1: 300, x2: 1450, y2: 1000 } }
    ],
    npcs: [],
    objects: [
      { type: 'ruin', x: 420, y: 400 },
      { type: 'ruin', x: 1250, y: 400 },
      { type: 'altar', x: 880, y: 550 },
      { type: 'obelisk', x: 620, y: 550 },
      { type: 'obelisk', x: 1140, y: 550 },
      { type: 'chest', x: 880, y: 320 }, // Baú de ouro ancestral
      { type: 'ore_node', x: 1450, y: 750, text: 'Veio de Minério Solar' }
    ]
  },

  // ===== BIOMA MONTANHA =====
  cordilheiraVentos: {
    id: 'cordilheiraVentos', name: 'Cordilheira dos Ventos', type: 'mountain', combatAllowed: true, theme: 'mountain', tileKey: 'tileMountain', width: 2200, height: 1700,
    portals: [
      { x: 2100, y: 850, r: 32, color: '#78f3e3', dest: 'cidade', spawnX: 180, spawnY: 640, text: 'Cidade de Ilya' },
      { x: 1100, y: 80, r: 32, color: '#a3f0ff', dest: 'picoNevado', requires: 'king_slime_defeated', spawnX: 480, spawnY: 760, text: 'Pico da Tempestade' },
      { x: 200, y: 850, r: 32, color: '#7fe7ff', dest: 'grutaCristalina', spawnX: 1650, spawnY: 650, text: 'Gruta dos Cristais' }
    ],
    spawns: [
      { enemyId: 'aguia_vento', count: 7, area: { x1: 350, y1: 250, x2: 1850, y2: 1350 } },
      { enemyId: 'lobo_granito', count: 7, area: { x1: 400, y1: 350, x2: 1800, y2: 1300 } }
    ],
    npcs: [
      { id: 'npc_hermit_peak', name: 'Eremita das Alturas', x: 920, y: 400, r: 18, type: 'dialogue', color: '#9ab7bb', text: 'E - Conversar' }
    ],
    objects: [
      { type: 'mountain_pine', x: 420, y: 380 },
      { type: 'mountain_pine', x: 1550, y: 480 },
      { type: 'mountain_pine', x: 1680, y: 1100 },
      { type: 'cliff_boulder', x: 650, y: 680 },
      { type: 'cliff_boulder', x: 1350, y: 780 },
      { type: 'altar', x: 1100, y: 550 },
      { type: 'chest', x: 320, y: 250 }, // Baú escondido na beira do penhasco
      { type: 'ore_node', x: 750, y: 320, text: 'Veio de Ferro Maciço' },
      { type: 'ore_node', x: 1450, y: 880, text: 'Veio de Granito Puro' },
      { type: 'wood_node', x: 480, y: 500, text: 'Pinheiro das Alturas' }
    ]
  },

  picoNevado: {
    id: 'picoNevado', name: 'Pico da Tempestade', type: 'bossroom', combatAllowed: true, theme: 'mountain', tileKey: 'tileMountain', width: 960, height: 850,
    portals: [
      { x: 480, y: 800, r: 32, color: '#9ab7bb', dest: 'cordilheiraVentos', spawnX: 1100, spawnY: 180, text: 'Descer a Cordilheira' }
    ],
    spawns: [
      { enemyId: 'colosso_neves', count: 1, area: { x1: 480, y1: 380, x2: 480, y2: 380 } }
    ],
    npcs: [],
    objects: [
      { type: 'altar', x: 480, y: 240 },
      { type: 'crystal', x: 250, y: 280 },
      { type: 'crystal', x: 710, y: 280 },
      { type: 'chest', x: 480, y: 160 } // Baú da relíquia do colosso
    ]
  },

  grutaCristalina: {
    id: 'grutaCristalina', name: 'Gruta dos Cristais Cintilantes', type: 'cavern', combatAllowed: true, theme: 'crypt', tileKey: 'tileCavern', width: 1850, height: 1350,
    portals: [
      { x: 1750, y: 650, r: 32, color: '#9ab7bb', dest: 'cordilheiraVentos', spawnX: 300, spawnY: 850, text: 'Cordilheira dos Ventos' },
      { x: 100, y: 350, r: 32, color: '#80a8ff', dest: 'cavernaSombria', spawnX: 780, spawnY: 980, text: 'Caverna Sombria' }
    ],
    spawns: [
      { enemyId: 'espectro_cristal', count: 8, area: { x1: 350, y1: 250, x2: 1550, y2: 1050 } },
      { enemyId: 'slime_caverna', count: 6, area: { x1: 400, y1: 300, x2: 1450, y2: 1100 } }
    ],
    npcs: [],
    objects: [
      { type: 'crystal', x: 450, y: 350 },
      { type: 'crystal', x: 850, y: 450 },
      { type: 'crystal', x: 1350, y: 380 },
      { type: 'crystal', x: 920, y: 880 },
      { type: 'ore_node', x: 550, y: 280, text: 'Veio de Cristal Arcano' },
      { type: 'ore_node', x: 1200, y: 750, text: 'Veio de Cristal Arcano' },
      { type: 'ore_node', x: 720, y: 920, text: 'Veio de Ouro Puro' },
      { type: 'chest', x: 1450, y: 920 } // Baú das profundezas
    ]
  },

  // ===== BIOMA FLORESTA =====
  bosqueRaiz: {
    id: 'bosqueRaiz', name: 'Bosque da Raiz Antiga', type: 'forest', combatAllowed: true, theme: 'forest', tileKey: 'tileForest', width: 2200, height: 1800,
    portals: [
      { x: 80, y: 920, r: 32, color: '#6bcf8b', dest: 'cidade', spawnX: 420, spawnY: 340, text: 'Cidade de Ilya' },
      { x: 1980, y: 260, r: 32, color: '#d0ad68', dest: 'santuarioRaiz', spawnX: 400, spawnY: 660, text: 'Santuário da Raiz' },
      { x: 1100, y: 1700, r: 32, color: '#70d6a2', dest: 'florestaSussurros', spawnX: 200, spawnY: 400, text: 'Floresta dos Sussurros' }
    ],
    spawns: [
      { enemyId: 'lobo_raiz', count: 10, area: { x1: 260, y1: 260, x2: 1840, y2: 1420 } },
      { enemyId: 'cogumelo_espinho', count: 8, area: { x1: 420, y1: 400, x2: 1770, y2: 1500 } }
    ],
    npcs: [],
    objects: [
      { type: 'tree', x: 400, y: 350 },
      { type: 'tree', x: 620, y: 440 },
      { type: 'tree', x: 1450, y: 400 },
      { type: 'tree', x: 1600, y: 850 },
      { type: 'crystal', x: 1130, y: 990 },
      { type: 'ruin', x: 810, y: 710 },
      { type: 'wood_node', x: 880, y: 480, text: 'Tronco Ancestral' },
      { type: 'herb_node', x: 1350, y: 980, text: 'Arbusto de Ervas' },
      { type: 'chest', x: 1850, y: 1500 }, // Baú escondido no bosque
      ...ring('mushroom', 1100, 850, 13, 300)
    ]
  },

  florestaSussurros: {
    id: 'florestaSussurros', name: 'Floresta dos Sussurros', type: 'forest', combatAllowed: true, theme: 'forest', tileKey: 'tileForest', width: 2100, height: 1600,
    portals: [
      { x: 100, y: 400, r: 32, color: '#6bcf8b', dest: 'bosqueRaiz', spawnX: 1100, spawnY: 1600, text: 'Bosque da Raiz' }
    ],
    spawns: [
      { enemyId: 'lobo_raiz', count: 7, area: { x1: 300, y1: 300, x2: 1700, y2: 1300 } },
      { enemyId: 'cogumelo_espinho', count: 7, area: { x1: 400, y1: 350, x2: 1650, y2: 1350 } }
    ],
    npcs: [
      { id: 'npc_druid_elowen', name: 'Guardiã Elowen', x: 1050, y: 650, r: 18, type: 'dialogue', color: '#5ea86b', text: 'E - Conversar' }
    ],
    objects: [
      { type: 'tree', x: 500, y: 400 },
      { type: 'tree', x: 850, y: 350 },
      { type: 'tree', x: 1350, y: 450 },
      { type: 'altar', x: 1050, y: 550 },
      { type: 'wood_node', x: 620, y: 700, text: 'Tronco de Madeira Viva' },
      { type: 'herb_node', x: 1250, y: 700, text: 'Flor Feérica' },
      { type: 'chest', x: 1650, y: 350 }, // Baú da guardiã
      ...ring('flower', 1050, 650, 8, 200)
    ]
  },

  santuarioRaiz: {
    id: 'santuarioRaiz', name: 'Santuário do Carvalho', type: 'bossroom', combatAllowed: true, theme: 'forest', tileKey: 'tileForest', width: 860, height: 800,
    portals: [
      { x: 430, y: 750, r: 32, color: '#6bcf8b', dest: 'bosqueRaiz', spawnX: 1850, spawnY: 350, text: 'Sair do Santuário' }
    ],
    spawns: [
      { enemyId: 'guardiao_raiz', count: 1, area: { x1: 430, y1: 330, x2: 430, y2: 330 } }
    ],
    npcs: [],
    objects: [
      { type: 'tree', x: 215, y: 280 },
      { type: 'tree', x: 650, y: 280 },
      { type: 'ruin', x: 430, y: 210 },
      { type: 'chest', x: 430, y: 520 },
      ...ring('mushroom', 430, 370, 10, 220)
    ]
  },

  // ===== REGIÕES AQUA & LUNAR =====
  criptaAqua: {
    id: 'criptaAqua', name: 'Cripta das Marés Mortas', type: 'crypt', combatAllowed: true, theme: 'crypt', tileKey: 'tileCrypt', width: 2100, height: 1650,
    portals: [
      { x: 65, y: 850, r: 32, color: '#78f3e3', dest: 'cidade', spawnX: 1300, spawnY: 360, text: 'Cidade de Ilya' },
      { x: 1880, y: 250, r: 32, color: '#a879df', dest: 'tronoAqua', spawnX: 410, spawnY: 660, text: 'Trono das Marés' }
    ],
    spawns: [
      { enemyId: 'espectro_aqua', count: 11, area: { x1: 260, y1: 250, x2: 1800, y2: 1350 } },
      { enemyId: 'sentinela_osso', count: 7, area: { x1: 500, y1: 380, x2: 1700, y2: 1350 } }
    ],
    npcs: [],
    objects: [
      { type: 'altar', x: 1080, y: 740 },
      { type: 'chest', x: 720, y: 1100 },
      { type: 'chest', x: 1420, y: 1080 },
      { type: 'ruin', x: 480, y: 420 },
      { type: 'ruin', x: 1660, y: 430 },
      ...ring('torch', 1080, 740, 8, 270)
    ]
  },

  tronoAqua: {
    id: 'tronoAqua', name: 'Trono das Marés Mortas', type: 'bossroom', combatAllowed: true, theme: 'crypt', tileKey: 'tileCrypt', width: 860, height: 800,
    portals: [
      { x: 430, y: 750, r: 32, color: '#78f3e3', dest: 'criptaAqua', spawnX: 1760, spawnY: 340, text: 'Sair da Cripta' }
    ],
    spawns: [
      { enemyId: 'lich_cripta', count: 1, area: { x1: 430, y1: 330, x2: 430, y2: 330 } }
    ],
    npcs: [],
    objects: [
      { type: 'altar', x: 430, y: 220 },
      { type: 'torch', x: 200, y: 330 },
      { type: 'torch', x: 660, y: 330 },
      { type: 'chest', x: 290, y: 520 },
      { type: 'chest', x: 570, y: 520 }
    ]
  },

  jardimNebuloso: {
    id: 'jardimNebuloso', name: 'Jardim Nebuloso', type: 'field', combatAllowed: true, theme: 'meadow', tileKey: 'tileMeadow', width: 1900, height: 1450,
    portals: [
      { x: 70, y: 700, r: 32, color: '#78f3e3', dest: 'cidade', spawnX: 1450, spawnY: 850, text: 'Cidade de Ilya' }
    ],
    spawns: [
      { enemyId: 'raposa_cristal', count: 9, area: { x1: 320, y1: 260, x2: 1600, y2: 1150 } }
    ],
    npcs: [],
    objects: [
      { type: 'crystal', x: 480, y: 410 },
      { type: 'chest', x: 1400, y: 900 },
      ...ring('flower', 980, 720, 10, 240)
    ]
  }
};
