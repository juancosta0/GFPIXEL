const ring = (type, cx, cy, amount, radius) => Array.from({ length: amount }, (_, i) => ({ type, x: cx + Math.cos(i * 2.4) * radius, y: cy + Math.sin(i * 2.4) * radius }));

export const SCENES_DB = {
  cidade: {
    id: 'cidade', name: 'Refúgio de Ilya', type: 'city', combatAllowed: false, theme: 'town', tileKey: 'tileTown', width: 1680, height: 1200,
    portals: [{ x: 1615, y: 600, r: 32, color: '#78f3e3', dest: 'pradariaLunar', spawnX: 130, spawnY: 850, text: 'Pradaria Lunar' }, { x: 300, y: 310, r: 32, color: '#6bcf8b', dest: 'bosqueRaiz', spawnX: 220, spawnY: 930, text: 'Bosque da Raiz' }, { x: 1320, y: 310, r: 32, color: '#a879df', dest: 'criptaAqua', spawnX: 160, spawnY: 860, text: 'Cripta Aqua' }],
    spawns: [], npcs: [{ id: 'npc_blacksmith', name: 'Mestre Ferreiro', x: 810, y: 560, r: 20, type: 'crafting', color: '#d18b52', text: 'E - Forjar' }, { id: 'npc_guide', name: 'Guia de Ilya', x: 690, y: 630, r: 18, type: 'dialogue', color: '#7696d6', text: 'E - Falar' }],
    objects: [{ type: 'fountain', x: 810, y: 760 }, { type: 'chest', x: 610, y: 700 }, { type: 'chest', x: 1030, y: 700 }, { type: 'banner', x: 500, y: 520 }, { type: 'banner', x: 1120, y: 520 }, ...ring('lamp', 810, 760, 6, 180)]
  },
  pradariaLunar: {
    id: 'pradariaLunar', name: 'Pradaria da Lua Rubra', type: 'field', combatAllowed: true, theme: 'meadow', tileKey: 'tileMeadow', width: 2200, height: 1800,
    portals: [{ x: 70, y: 850, r: 32, color: '#78f3e3', dest: 'cidade', spawnX: 1510, spawnY: 600, text: 'Refúgio de Ilya' }, { x: 1980, y: 230, r: 32, color: '#d080d8', dest: 'covilLunar', spawnX: 400, spawnY: 660, text: 'Covil da Rainha' }, { x: 1120, y: 1720, r: 32, color: '#6bcf8b', dest: 'bosqueRaiz', spawnX: 220, spawnY: 930, text: 'Bosque da Raiz' }],
    spawns: [{ enemyId: 'gelatina_lunar', count: 13, area: { x1: 260, y1: 240, x2: 1850, y2: 1450 } }, { enemyId: 'cogumelo_espinho', count: 7, area: { x1: 500, y1: 480, x2: 1760, y2: 1500 } }], npcs: [],
    objects: [{ type: 'crystal', x: 480, y: 410 }, { type: 'crystal', x: 1520, y: 880 }, { type: 'ruin', x: 1100, y: 400 }, { type: 'chest', x: 840, y: 1160 }, ...ring('flower', 1080, 930, 12, 260)]
  },
  bosqueRaiz: {
    id: 'bosqueRaiz', name: 'Bosque da Raiz Antiga', type: 'forest', combatAllowed: true, theme: 'forest', tileKey: 'tileForest', width: 2200, height: 1800,
    portals: [{ x: 80, y: 920, r: 32, color: '#6bcf8b', dest: 'pradariaLunar', spawnX: 1100, spawnY: 1600, text: 'Pradaria Lunar' }, { x: 1980, y: 260, r: 32, color: '#d0ad68', dest: 'santuarioRaiz', spawnX: 400, spawnY: 660, text: 'Santuário da Raiz' }, { x: 1100, y: 1700, r: 32, color: '#78f3e3', dest: 'criptaAqua', spawnX: 160, spawnY: 860, text: 'Cripta Aqua' }],
    spawns: [{ enemyId: 'lobo_raiz', count: 12, area: { x1: 260, y1: 260, x2: 1840, y2: 1420 } }, { enemyId: 'cogumelo_espinho', count: 9, area: { x1: 420, y1: 400, x2: 1770, y2: 1500 } }], npcs: [],
    objects: [{ type: 'tree', x: 400, y: 350 }, { type: 'tree', x: 620, y: 440 }, { type: 'tree', x: 1450, y: 400 }, { type: 'tree', x: 1600, y: 850 }, { type: 'crystal', x: 1130, y: 990 }, { type: 'ruin', x: 810, y: 710 }, ...ring('mushroom', 1100, 850, 13, 300)]
  },
  criptaAqua: {
    id: 'criptaAqua', name: 'Cripta das Marés Mortas', type: 'crypt', combatAllowed: true, theme: 'crypt', tileKey: 'tileCrypt', width: 2100, height: 1650,
    portals: [{ x: 65, y: 850, r: 32, color: '#78f3e3', dest: 'bosqueRaiz', spawnX: 1100, spawnY: 1580, text: 'Bosque da Raiz' }, { x: 1880, y: 250, r: 32, color: '#a879df', dest: 'tronoAqua', spawnX: 410, spawnY: 660, text: 'Trono das Marés' }],
    spawns: [{ enemyId: 'espectro_aqua', count: 13, area: { x1: 260, y1: 250, x2: 1800, y2: 1350 } }, { enemyId: 'sentinela_osso', count: 8, area: { x1: 500, y1: 380, x2: 1700, y2: 1350 } }], npcs: [],
    objects: [{ type: 'altar', x: 1080, y: 740 }, { type: 'chest', x: 720, y: 1100 }, { type: 'chest', x: 1420, y: 1080 }, { type: 'ruin', x: 480, y: 420 }, { type: 'ruin', x: 1660, y: 430 }, ...ring('torch', 1080, 740, 8, 270)]
  },
  covilLunar: { id: 'covilLunar', name: 'Covil da Rainha Lunar', type: 'bossroom', combatAllowed: true, theme: 'meadow', tileKey: 'tileMeadow', width: 860, height: 800, portals: [{ x: 430, y: 750, r: 32, color: '#78f3e3', dest: 'pradariaLunar', spawnX: 1850, spawnY: 310, text: 'Sair do Covil' }], spawns: [{ enemyId: 'rainha_gelatina', count: 1, area: { x1: 430, y1: 330, x2: 430, y2: 330 } }], npcs: [], objects: [{ type: 'crystal', x: 210, y: 250 }, { type: 'crystal', x: 650, y: 250 }, ...ring('flower', 430, 350, 9, 230)] },
  santuarioRaiz: { id: 'santuarioRaiz', name: 'Santuário do Carvalho', type: 'bossroom', combatAllowed: true, theme: 'forest', tileKey: 'tileForest', width: 860, height: 800, portals: [{ x: 430, y: 750, r: 32, color: '#6bcf8b', dest: 'bosqueRaiz', spawnX: 1850, spawnY: 350, text: 'Sair do Santuário' }], spawns: [{ enemyId: 'guardiao_raiz', count: 1, area: { x1: 430, y1: 330, x2: 430, y2: 330 } }], npcs: [], objects: [{ type: 'tree', x: 215, y: 280 }, { type: 'tree', x: 650, y: 280 }, { type: 'ruin', x: 430, y: 210 }, ...ring('mushroom', 430, 370, 10, 220)] },
  tronoAqua: { id: 'tronoAqua', name: 'Trono das Marés Mortas', type: 'bossroom', combatAllowed: true, theme: 'crypt', tileKey: 'tileCrypt', width: 860, height: 800, portals: [{ x: 430, y: 750, r: 32, color: '#78f3e3', dest: 'criptaAqua', spawnX: 1760, spawnY: 340, text: 'Sair da Cripta' }], spawns: [{ enemyId: 'lich_cripta', count: 1, area: { x1: 430, y1: 330, x2: 430, y2: 330 } }], npcs: [], objects: [{ type: 'altar', x: 430, y: 220 }, { type: 'torch', x: 200, y: 330 }, { type: 'torch', x: 660, y: 330 }, { type: 'chest', x: 290, y: 520 }, { type: 'chest', x: 570, y: 520 }] }
};
