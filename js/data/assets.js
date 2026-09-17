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

const painters = { player: playerArt, slime: slimeArt, wolf: wolfArt, mushroom: mushroomArt, wisp: wispArt, golem: golemArt, slimeQueen: queenArt, rootGuardian: rootArt, cryptLich: lichArt, pet: petArt };
export const ASSETS_DB = {
  player: sheet(6, playerArt), slime: sheet(4, slimeArt), wolf: sheet(4, wolfArt), mushroom: sheet(4, mushroomArt),
  wisp: sheet(4, wispArt), golem: sheet(4, golemArt), slimeQueen: sheet(4, queenArt), rootGuardian: sheet(4, rootArt), cryptLich: sheet(4, lichArt), pet: sheet(3, petArt),
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
