// Pequenas artes originais em canvas. Cada pixel lógico tem 3px e é exportado como Data URL.
const PX = 3;
const FRAME = 24;
const fill = (ctx, color, x, y, w = 1, h = 1) => { ctx.fillStyle = color; ctx.fillRect(x * PX, y * PX, w * PX, h * PX); };

function sheet(frames, painter) {
  const canvas = document.createElement('canvas');
  canvas.width = FRAME * PX * frames;
  canvas.height = FRAME * PX;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  for (let frame = 0; frame < frames; frame++) {
    ctx.save();
    ctx.translate(frame * FRAME * PX, 0);
    painter(ctx, frame);
    ctx.restore();
  }
  return canvas.toDataURL();
}

function tile(base, flecks, seed) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 48;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, 48, 48);
  for (let i = 0; i < 19; i++) {
    const x = (seed * 17 + i * 19) % 46;
    const y = (seed * 11 + i * 13) % 46;
    ctx.fillStyle = flecks[i % flecks.length];
    ctx.fillRect(x, y, i % 4 === 0 ? 3 : 2, i % 3 === 0 ? 3 : 2);
  }
  return canvas.toDataURL();
}

const COLORS = { ink: '#18202b', shade: '#30404a', silver: '#9ab7bb', glow: '#78f3e3', gold: '#e7b65c', skin: '#f0c7a1', hair: '#5a3444', cloak: '#5a76c9', cloth: '#b9d3ef', red: '#d95a65', green: '#5ea86b', moss: '#39705d', bone: '#d8d2b7', violet: '#9e6bc9' };

function playerArt(ctx, frame) {
  const walk = [0, 1, 0, -1][Math.max(0, frame - 1) % 4] || 0;
  const y = frame === 5 ? 1 : 3 + (frame === 2 ? 1 : 0);
  fill(ctx, COLORS.ink, 8, y + 1, 8, 7); fill(ctx, COLORS.hair, 9, y, 6, 3);
  fill(ctx, COLORS.skin, 10, y + 3, 4, 3); fill(ctx, COLORS.cloak, 7, y + 7, 10, 7);
  fill(ctx, COLORS.cloth, 9, y + 8, 6, 4); fill(ctx, COLORS.ink, 8, y + 14, 3, 4);
  fill(ctx, COLORS.ink, 13, y + 14, 3, 4); fill(ctx, COLORS.silver, 8, y + 8, 1, 5);
  fill(ctx, COLORS.ink, 8 + walk, y + 18, 3, 2); fill(ctx, COLORS.ink, 13 - walk, y + 18, 3, 2);
  if (frame === 5) { fill(ctx, COLORS.ink, 15, y + 7, 2, 2); fill(ctx, COLORS.silver, 17, y + 3, 1, 7); fill(ctx, '#eef7ff', 18, y + 1, 1, 5); fill(ctx, COLORS.gold, 16, y + 9, 3, 1); }
}

function slimeArt(ctx, frame) {
  const jump = frame === 2 ? -2 : frame === 1 ? 1 : 0;
  const body = frame === 3 ? '#d76e99' : '#6cbdc0';
  fill(ctx, COLORS.ink, 5, 11 + jump, 14, 7); fill(ctx, body, 6, 10 + jump, 12, 7);
  fill(ctx, '#b9f4e8', 8, 9 + jump, 5, 2); fill(ctx, COLORS.ink, 8, 13 + jump, 2, 2); fill(ctx, COLORS.ink, 14, 13 + jump, 2, 2);
  if (frame === 3) { fill(ctx, '#efb2ca', 3, 12, 3, 2); fill(ctx, '#efb2ca', 18, 12, 3, 2); }
}

function wolfArt(ctx, frame) {
  const step = frame === 2 ? 2 : frame === 1 ? -1 : 0;
  fill(ctx, COLORS.ink, 4, 9, 15, 8); fill(ctx, '#617483', 5, 10, 13, 6);
  fill(ctx, COLORS.ink, 15, 6, 5, 7); fill(ctx, '#8397a0', 16, 7, 3, 5); fill(ctx, COLORS.red, 18, 9, 1, 1);
  fill(ctx, COLORS.ink, 15, 4, 2, 4); fill(ctx, COLORS.ink, 18, 4, 2, 4);
  fill(ctx, COLORS.ink, 6 + step, 16, 3, 4); fill(ctx, COLORS.ink, 13 - step, 16, 3, 4);
  fill(ctx, '#b9c6c8', 6, 11, 4, 2); if (frame === 3) fill(ctx, COLORS.red, 20, 10, 3, 2);
}

function mushroomArt(ctx, frame) {
  const sway = frame === 2 ? 1 : frame === 1 ? -1 : 0;
  fill(ctx, COLORS.ink, 8 + sway, 12, 8, 8); fill(ctx, COLORS.bone, 10 + sway, 13, 4, 6);
  fill(ctx, COLORS.ink, 5 + sway, 7, 14, 8); fill(ctx, '#c95c77', 6 + sway, 8, 12, 6);
  fill(ctx, '#ffd5c0', 8 + sway, 9, 2, 2); fill(ctx, '#ffd5c0', 14 + sway, 11, 2, 2);
  if (frame === 3) { fill(ctx, '#d97796', 3, 10, 3, 3); fill(ctx, '#d97796', 18, 10, 3, 3); }
}

function wispArt(ctx, frame) {
  const bob = frame % 3 === 1 ? -1 : frame % 3 === 2 ? 1 : 0;
  fill(ctx, COLORS.ink, 8, 7 + bob, 8, 10); fill(ctx, '#557497', 9, 8 + bob, 6, 8);
  fill(ctx, COLORS.glow, 10, 10 + bob, 1, 1); fill(ctx, COLORS.glow, 14, 10 + bob, 1, 1);
  fill(ctx, '#9aeae5', 10, 14 + bob, 4, 2); fill(ctx, COLORS.glow, 6, 16 + bob, 2, 3); fill(ctx, COLORS.glow, 16, 16 + bob, 2, 3);
  if (frame === 3) { fill(ctx, '#b6fff8', 3, 10, 3, 1); fill(ctx, '#b6fff8', 18, 10, 3, 1); }
}

function golemArt(ctx, frame) {
  const stomp = frame === 2 ? 1 : 0;
  fill(ctx, COLORS.ink, 6, 5, 12, 15); fill(ctx, '#687174', 7, 6, 10, 13);
  fill(ctx, '#9da5a3', 9, 7, 6, 3); fill(ctx, COLORS.glow, 9, 11, 2, 1); fill(ctx, COLORS.glow, 13, 11, 2, 1);
  fill(ctx, COLORS.ink, 4, 11, 3, 7); fill(ctx, COLORS.ink, 17, 11, 3, 7); fill(ctx, '#596467', 5, 12, 2, 5); fill(ctx, '#596467', 17, 12, 2, 5);
  fill(ctx, COLORS.ink, 8, 18 + stomp, 3, 3); fill(ctx, COLORS.ink, 13, 18 - stomp, 3, 3);
}

function queenArt(ctx, frame) { slimeArt(ctx, frame); fill(ctx, COLORS.gold, 8, 4, 8, 2); fill(ctx, COLORS.gold, 9, 2, 2, 3); fill(ctx, COLORS.gold, 13, 1, 2, 4); fill(ctx, COLORS.violet, 10, 6, 4, 2); }
function rootArt(ctx, frame) { golemArt(ctx, frame); fill(ctx, '#795442', 5, 4, 3, 8); fill(ctx, '#795442', 16, 4, 3, 8); fill(ctx, COLORS.moss, 8, 4, 8, 3); fill(ctx, COLORS.green, 6, 2, 12, 3); }
function lichArt(ctx, frame) { wispArt(ctx, frame); fill(ctx, COLORS.violet, 7, 5, 10, 3); fill(ctx, '#e9e2d1', 10, 6, 4, 4); fill(ctx, COLORS.gold, 11, 3, 2, 2); }
function petArt(ctx, frame) { const bob = frame % 2; fill(ctx, COLORS.ink, 8, 8 + bob, 8, 8); fill(ctx, COLORS.gold, 9, 8 + bob, 6, 6); fill(ctx, '#fff1a5', 10, 9 + bob, 4, 2); fill(ctx, COLORS.glow, 11, 12 + bob, 2, 2); }

function swordWeaponArt(ctx, frame) {
  fill(ctx, COLORS.silver, 12, 1, 2, 20);
  fill(ctx, COLORS.gold, 10, 4, 6, 2);
  fill(ctx, COLORS.ink, 11, 1, 4, 2);
  fill(ctx, '#f0f7ff', 12, 20, 2, 5);
  fill(ctx, COLORS.silver, 13, 20, 1, 4); fill(ctx, COLORS.ink, 11, 22, 1, 2); fill(ctx, COLORS.ink, 16, 22, 1, 2);
}

function bowWeaponArt(ctx, frame) {
  fill(ctx, COLORS.ink, 13, 4, 2, 16);
  fill(ctx, COLORS.silver, 10, 5, 2, 14); fill(ctx, COLORS.silver, 15, 5, 2, 14);
  fill(ctx, COLORS.ink, 8, 8, 2, 1); fill(ctx, COLORS.ink, 18, 8, 2, 1);
  fill(ctx, '#eef8f0', 7, 10, 18, 1); fill(ctx, COLORS.gold, 4, 9, 2, 2); fill(ctx, COLORS.gold, 18, 9, 2, 2);
}

function staffWeaponArt(ctx, frame) {
  fill(ctx, COLORS.ink, 14, 1, 2, 18);
  fill(ctx, '#7b5e4a', 13, 1, 4, 2); fill(ctx, COLORS.gold, 12, 19, 6, 2);
  fill(ctx, COLORS.glow, 14, 18, 2, 2); fill(ctx, '#d5f9ff', 13, 20, 4, 2);
}

function arrowProjectileArt(ctx, frame) {
  fill(ctx, COLORS.ink, 7, 2, 2, 2); fill(ctx, COLORS.gold, 8, 1, 10, 4); fill(ctx, '#f7f9ff', 18, 1, 4, 4); fill(ctx, COLORS.ink, 3, 2, 3, 2);
}

function magicProjectileArt(ctx, frame) {
  fill(ctx, COLORS.glow, 3, 2, 18, 4); fill(ctx, '#dffff8', 7, 1, 8, 6); fill(ctx, '#8bbdf9', 9, 0, 4, 8);
}

function swordIconArt(ctx, frame) { swordWeaponArt(ctx, frame); }
function bowIconArt(ctx, frame) { bowWeaponArt(ctx, frame); }
function staffIconArt(ctx, frame) { staffWeaponArt(ctx, frame); }
function potionIconArt(ctx, frame) {
  fill(ctx, '#7fe7ff', 11, 2, 6, 20); fill(ctx, '#dffbff', 10, 2, 8, 4); fill(ctx, '#d38a4d', 1, 9, 22, 10); fill(ctx, '#f4e4b9', 6, 12, 12, 6); fill(ctx, '#e8766e', 10, 17, 8, 4);
}

function treePropArt(ctx, frame) {
  fill(ctx, '#4e2c1d', 11, 18, 11, 17); fill(ctx, '#2f7a58', 5, 8, 21, 14); fill(ctx, '#3c8f66', 8, 5, 14, 11); fill(ctx, '#dbdca5', 12, 3, 4, 9); fill(ctx, '#d9f0a7', 6, 9, 7, 4); fill(ctx, '#d9f0a7', 17, 9, 7, 4);
}

function crystalPropArt(ctx, frame) {
  fill(ctx, '#1d2e3c', 12, 20, 7, 6); fill(ctx, '#76d7d8', 7, 7, 17, 18); fill(ctx, '#d8ffff', 11, 3, 8, 5); fill(ctx, '#a3f0ff', 9, 10, 12, 14);
}

function chestPropArt(ctx, frame) {
  fill(ctx, '#3b211a', 4, 12, 22, 11); fill(ctx, '#8b5932', 6, 8, 18, 10); fill(ctx, '#d9a551', 7, 5, 16, 4); fill(ctx, '#f5d18b', 12, 7, 4, 5);
}

function ruinPropArt(ctx, frame) {
  fill(ctx, '#2a2e38', 6, 14, 18, 13); fill(ctx, '#606a7f', 2, 6, 6, 18); fill(ctx, '#606a7f', 20, 6, 6, 18); fill(ctx, '#9ab5c7', 8, 2, 13, 6); fill(ctx, '#78f3e3', 13, 10, 4, 9);
}

function altarPropArt(ctx, frame) {
  fill(ctx, '#2a2d39', 4, 15, 22, 10); fill(ctx, '#5a5c76', 7, 6, 16, 10); fill(ctx, '#d7d8f4', 10, 3, 10, 4); fill(ctx, '#a879df', 9, 9, 12, 4); fill(ctx, '#eae6ff', 12, 13, 4, 8);
}

function fountainPropArt(ctx, frame) {
  fill(ctx, '#2a2d39', 5, 13, 20, 10); fill(ctx, '#5d7185', 8, 5, 14, 9); fill(ctx, '#78f3e3', 9, 2, 12, 5); fill(ctx, '#dffdfc', 11, 0, 8, 4);
}

function torchPropArt(ctx, frame) {
  fill(ctx, '#2a2d39', 12, 10, 6, 15); fill(ctx, '#596a76', 9, 7, 12, 4); fill(ctx, '#82ecff', 11, 2, 8, 7); fill(ctx, '#fff5c3', 13, 3, 4, 4);
}

function bannerPropArt(ctx, frame) {
  fill(ctx, '#2d2b35', 12, 1, 4, 22); fill(ctx, '#d9a856', 1, 6, 20, 5); fill(ctx, '#5a76c9', 4, 11, 14, 9); fill(ctx, '#deebff', 10, 14, 4, 5);
}

function flowerPropArt(ctx, frame) {
  fill(ctx, '#3d7d5d', 11, 16, 6, 10); fill(ctx, '#db7dcf', 5, 9, 5, 5); fill(ctx, '#db7dcf', 17, 9, 5, 5); fill(ctx, '#ffd85b', 11, 4, 6, 6); fill(ctx, '#f8f3b8', 13, 6, 2, 2);
}

function lampPropArt(ctx, frame) {
  fill(ctx, '#2d2d38', 11, 16, 8, 8); fill(ctx, '#a2b2b8', 8, 8, 14, 10); fill(ctx, '#f2d66f', 11, 3, 8, 8); fill(ctx, '#fff7c7', 13, 5, 4, 4);
}

const painters = { player: playerArt, slime: slimeArt, wolf: wolfArt, mushroom: mushroomArt, wisp: wispArt, golem: golemArt, slimeQueen: queenArt, rootGuardian: rootArt, cryptLich: lichArt, pet: petArt, swordWeapon: swordWeaponArt, bowWeapon: bowWeaponArt, staffWeapon: staffWeaponArt, arrowProjectile: arrowProjectileArt, magicProjectile: magicProjectileArt, swordIcon: swordIconArt, bowIcon: bowIconArt, staffIcon: staffIconArt, potionIcon: potionIconArt, treeProp: treePropArt, crystalProp: crystalPropArt, chestProp: chestPropArt, ruinProp: ruinPropArt, altarProp: altarPropArt, fountainProp: fountainPropArt, torchProp: torchPropArt, bannerProp: bannerPropArt, flowerProp: flowerPropArt, lampProp: lampPropArt };
export const ASSETS_DB = {
  player: sheet(6, playerArt), slime: sheet(4, slimeArt), wolf: sheet(4, wolfArt), mushroom: sheet(4, mushroomArt),
  wisp: sheet(4, wispArt), golem: sheet(4, golemArt), slimeQueen: sheet(4, queenArt), rootGuardian: sheet(4, rootArt), cryptLich: sheet(4, lichArt), pet: sheet(3, petArt),
  swordWeapon: sheet(1, swordWeaponArt), bowWeapon: sheet(1, bowWeaponArt), staffWeapon: sheet(1, staffWeaponArt),
  arrowProjectile: sheet(1, arrowProjectileArt), magicProjectile: sheet(1, magicProjectileArt),
  swordIcon: sheet(1, swordIconArt), bowIcon: sheet(1, bowIconArt), staffIcon: sheet(1, staffIconArt), potionIcon: sheet(1, potionIconArt),
  treeProp: sheet(1, treePropArt), crystalProp: sheet(1, crystalPropArt), chestProp: sheet(1, chestPropArt), ruinProp: sheet(1, ruinPropArt), altarProp: sheet(1, altarPropArt), fountainProp: sheet(1, fountainPropArt), torchProp: sheet(1, torchPropArt), bannerProp: sheet(1, bannerPropArt), flowerProp: sheet(1, flowerPropArt), lampProp: sheet(1, lampPropArt),
  tileMeadow: tile('#466d58', ['#598061', '#355849', '#7b8959'], 3), tileForest: tile('#294d47', ['#386a5a', '#1d3937', '#587657'], 7),
  tileCrypt: tile('#3e3e4a', ['#50515e', '#2c3038', '#60616c'], 11), tileTown: tile('#6a6258', ['#817767', '#514b47', '#978a70'], 17)
};

export const SPRITES = Object.freeze({
  player: { frameSize: 72, drawSize: 48, states: { idle: [0], moving: [1, 2, 3, 4], attacking: [5], casting: [5] } },
  slime: { frameSize: 72, drawSize: 44, states: { idle: [0], moving: [1, 2], attacking: [3] } },
  wolf: { frameSize: 72, drawSize: 48, states: { idle: [0], moving: [1, 2], attacking: [3] } },
  mushroom: { frameSize: 72, drawSize: 44, states: { idle: [0], moving: [1, 2], attacking: [3] } },
  wisp: { frameSize: 72, drawSize: 48, states: { idle: [0], moving: [1, 2], attacking: [3] } },
  golem: { frameSize: 72, drawSize: 54, states: { idle: [0], moving: [1, 2], attacking: [3] } },
  slimeQueen: { frameSize: 72, drawSize: 64, states: { idle: [0], moving: [1, 2], attacking: [3] } },
  rootGuardian: { frameSize: 72, drawSize: 68, states: { idle: [0], moving: [1, 2], attacking: [3] } },
  cryptLich: { frameSize: 72, drawSize: 66, states: { idle: [0], moving: [1, 2], attacking: [3] } },
  pet: { frameSize: 72, drawSize: 30, states: { idle: [0], follow: [0, 1, 2], gather: [0, 1, 2] } }
});

export const IMAGES = {};
for (const [key, source] of Object.entries(ASSETS_DB)) { IMAGES[key] = new Image(); IMAGES[key].src = source; }
