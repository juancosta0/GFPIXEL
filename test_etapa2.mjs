// test_etapa2.mjs — Verificação automática da Etapa 2 (Expansão do Mundo)
// Roda com: node test_etapa2.mjs

// Mock mínimo de ambiente browser
globalThis.window = globalThis;
globalThis.document = {
  getElementById: (id) => ({ id, style: {}, innerHTML: '', textContent: '', classList: { add:()=>{}, remove:()=>{} }, showModal:()=>{}, close:()=>{} }),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: (tag) => ({ tagName: tag, style: {}, innerHTML: '', appendChild: () => {}, classList: { add:()=>{}, remove:()=>{} } })
};
globalThis.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] ?? null; },
  setItem(k, v) { this._store[k] = v; },
  removeItem(k) { delete this._store[k]; }
};
globalThis.HTMLElement = class {};
globalThis.CanvasRenderingContext2D = class {};
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16);
globalThis.cancelAnimationFrame = clearTimeout;
globalThis.AudioContext = class {
  createOscillator() { return { connect:()=>{}, start:()=>{}, stop:()=>{}, frequency:{ setValueAtTime:()=>{} } }; }
  createGain() { return { connect:()=>{}, gain:{ setValueAtTime:()=>{}, linearRampToValueAtTime:()=>{} } }; }
  destination = {};
};
globalThis.Image = class { set src(_){} };
globalThis.performance = { now: () => Date.now() };

// Canvas stub — necessário pois assets.js chama document.createElement('canvas').getContext('2d')
const _ctxStub = {
  fillStyle: '', strokeStyle: '', globalAlpha: 1, font: '', textAlign: 'left',
  fillRect:()=>{}, strokeRect:()=>{}, clearRect:()=>{},
  fillText:()=>{}, strokeText:()=>{},
  beginPath:()=>{}, closePath:()=>{}, moveTo:()=>{}, lineTo:()=>{},
  arc:()=>{}, ellipse:()=>{}, rect:()=>{},
  fill:()=>{}, stroke:()=>{},
  save:()=>{}, restore:()=>{},
  translate:()=>{}, rotate:()=>{}, scale:()=>{}, transform:()=>{},
  drawImage:()=>{}, putImageData:()=>{}, getImageData:()=>({ data:[] }),
  createLinearGradient:()=>({ addColorStop:()=>{} }),
  createRadialGradient:()=>({ addColorStop:()=>{} }),
  createPattern:()=>{},
  clip:()=>{}, setTransform:()=>{},
  measureText:(t)=>({ width: t.length * 7 }),
  imageSmoothingEnabled: false,
};
const _canvasStub = {
  width: 0, height: 0,
  getContext: () => _ctxStub,
  toDataURL: () => 'data:image/png;base64,stub',
  style: {},
};
// Override createElement to return canvas stub for 'canvas' tags
const _origCreateElement = globalThis.document.createElement.bind(globalThis.document);
globalThis.document.createElement = (tag) => {
  if (tag === 'canvas') return Object.assign({}, _canvasStub, { width:0, height:0 });
  return _origCreateElement(tag);
};

let passed = 0;
let failed = 0;

function ok(label, cond, detail = '') {
  if (cond) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

// ───────────────────────────────────────────────
// 1. worldMapData.js
// ───────────────────────────────────────────────
console.log('\n📌 worldMapData.js');
let BIOMES, WORLD_REGIONS;
try {
  ({ BIOMES, WORLD_REGIONS } = await import('./js/data/worldMapData.js'));
  ok('Importação ok', true);
  ok('BIOMES possui 6 biomas', Object.keys(BIOMES).length === 6, `Encontrados: ${Object.keys(BIOMES).join(', ')}`);
  ok('WORLD_REGIONS possui 17+ regiões', Object.keys(WORLD_REGIONS).length >= 17, `Total: ${Object.keys(WORLD_REGIONS).length}`);
  ok('cidade existe no mapa', !!WORLD_REGIONS.cidade);
  ok('desertoDourado existe', !!WORLD_REGIONS.desertoDourado);
  ok('picoNevado existe', !!WORLD_REGIONS.picoNevado);
  ok('criptaAqua existe', !!WORLD_REGIONS.criptaAqua);
  ok('tronoAqua existe', !!WORLD_REGIONS.tronoAqua);
  const allHaveCoords = Object.values(WORLD_REGIONS).every(r => r.coords?.x != null && r.coords?.y != null);
  ok('Todas as regiões têm coordenadas', allHaveCoords);
} catch(e) {
  console.error(`  ❌ Falha ao importar: ${e.message}`);
  failed++;
}

// ───────────────────────────────────────────────
// 2. progression.js — REGIONS expandido
// ───────────────────────────────────────────────
console.log('\n📌 progression.js — REGIONS');
try {
  const { REGIONS } = await import('./js/systems/progression.js');
  ok('Importação ok', true);
  ok('17 regiões no REGIONS', Object.keys(REGIONS).length >= 17, `Total: ${Object.keys(REGIONS).length}`);
  ok('picoNevado em REGIONS', !!REGIONS.picoNevado);
  ok('picoNevado level 4', REGIONS.picoNevado?.recommendedLevel === 4);
  ok('tronoAqua em REGIONS', !!REGIONS.tronoAqua);
  ok('cordilheiraVentos em REGIONS', !!REGIONS.cordilheiraVentos);
} catch(e) {
  console.error(`  ❌ Falha ao importar: ${e.message}`);
  failed++;
}

// ───────────────────────────────────────────────
// 3. gameState.js — discoveredScenes
// ───────────────────────────────────────────────
console.log('\n📌 gameState.js — discoveredScenes');
try {
  const { GameState } = await import('./js/core/gameState.js');
  ok('Importação ok', true);
  ok('discoveredScenes existe', Array.isArray(GameState.discoveredScenes));
  ok('cidade descoberta por padrão', GameState.discoveredScenes.includes('cidade'));
} catch(e) {
  console.error(`  ❌ Falha ao importar: ${e.message}`);
  failed++;
}

// ───────────────────────────────────────────────
// 4. enemies.js — inimigos regionais
// ───────────────────────────────────────────────
console.log('\n📌 enemies.js — inimigos regionais');
try {
  const { ENEMIES_DB } = await import('./js/data/enemies.js');
  ok('Importação ok', true);
  ok('escorpiao_duna existe', !!ENEMIES_DB.escorpiao_duna, 'Inimigo do deserto');
  ok('golem_areia existe', !!ENEMIES_DB.golem_areia);
  ok('aguia_vento existe', !!ENEMIES_DB.aguia_vento, 'Inimigo da montanha');
  ok('lobo_granito existe', !!ENEMIES_DB.lobo_granito);
  ok('colosso_neves existe', !!ENEMIES_DB.colosso_neves, 'Boss da montanha');
  ok('espectro_cristal existe', !!ENEMIES_DB.espectro_cristal, 'Inimigo da gruta');
} catch(e) {
  console.error(`  ❌ Falha ao importar: ${e.message}`);
  failed++;
}

// ───────────────────────────────────────────────
// 5. npcs.js — NPCs do mundo
// ───────────────────────────────────────────────
console.log('\n📌 npcs.js — NPCs do mundo');
try {
  const { NPCS_DB } = await import('./js/data/npcs.js');
  ok('Importação ok', true);
  ok('npc_nomad_tariq existe', !!NPCS_DB.npc_nomad_tariq, 'NPC do deserto');
  ok('npc_alchemist_zaid existe', !!NPCS_DB.npc_alchemist_zaid, 'Alquimista do oásis');
  ok('npc_druid_elowen existe', !!NPCS_DB.npc_druid_elowen, 'Druida da floresta');
  ok('npc_hermit_peak existe', !!NPCS_DB.npc_hermit_peak, 'Eremita do pico');
  ok('npc_miner_borin existe', !!NPCS_DB.npc_miner_borin, 'Minerador da gruta');
} catch(e) {
  console.error(`  ❌ Falha ao importar: ${e.message}`);
  failed++;
}

// ───────────────────────────────────────────────
// 6. quests.js — Novas missões
// ───────────────────────────────────────────────
console.log('\n📌 quests.js — novas missões');
try {
  const { QUESTS_DB } = await import('./js/data/quests.js');
  ok('Importação ok', true);
  ok('desert_expedition existe', !!QUESTS_DB.desert_expedition);
  ok('mountain_trial existe', !!QUESTS_DB.mountain_trial);
} catch(e) {
  console.error(`  ❌ Falha ao importar: ${e.message}`);
  failed++;
}

// ───────────────────────────────────────────────
// 7. gathering.js — estrutura do sistema
// ───────────────────────────────────────────────
console.log('\n📌 gathering.js — sistema de coleta');
try {
  const mod = await import('./js/systems/gathering.js');
  ok('Importação ok', true);
  ok('GatheringSystem exportado', !!mod.GatheringSystem);
  const GS = mod.GatheringSystem;
  ok('GatheringSystem.update é função', typeof GS.update === 'function');
  ok('GatheringSystem.harvest é função', typeof GS.harvest === 'function');
  // Nodes são gerenciados via GameState.currentScene.objects — não há array estático em GatheringSystem
} catch(e) {
  console.error(`  ❌ Falha ao importar: ${e.message}`);
  failed++;
}

// ───────────────────────────────────────────────
// 8. scenes.js — novas cenas
// ───────────────────────────────────────────────
console.log('\n📌 scenes.js — novas cenas biômicas');
try {
  const { SCENES_DB } = await import('./js/data/scenes.js');
  ok('Importação ok', true);
  const expected = ['cidade', 'planiciesSafael', 'cavernaSombria', 'arenaReiSlime',
    'desertoDourado', 'portoOasis', 'ruinasSolares', 'cordilheiraVentos',
    'picoNevado', 'grutaCristalina', 'bosqueRaiz', 'florestaSussurros',
    'santuarioRaiz', 'criptaAqua'];
  for (const sc of expected) {
    ok(`Cena "${sc}" existe`, !!SCENES_DB[sc]);
  }
} catch(e) {
  console.error(`  ❌ Falha ao importar: ${e.message}`);
  failed++;
}

// ───────────────────────────────────────────────
// RESULTADO FINAL
// ───────────────────────────────────────────────
console.log('\n' + '─'.repeat(50));
console.log(`\n📊 RESULTADO: ${passed} aprovados, ${failed} falhos\n`);
if (failed === 0) {
  console.log('🎉 Todos os testes passaram! Pronto para commit.\n');
  process.exit(0);
} else {
  console.log('⚠️  Corrija os erros acima antes do commit.\n');
  process.exit(1);
}
