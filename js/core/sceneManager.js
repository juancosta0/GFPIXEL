import { GameState } from './gameState.js';
import { SCENES_DB } from '../data/scenes.js';
import { UISystem } from '../ui/ui.js';
import { Enemy } from '../entities/enemy.js';
import { Camera } from './camera.js';
import { IMAGES } from '../data/assets.js';
import { SpriteSystem } from '../systems/sprite.js';

export class SceneManager {
  static loadScene(sceneId, spawnX, spawnY) {
    if (GameState.isTransitioning) return;
    GameState.isTransitioning = true;
    
    document.getElementById('fadeOverlay').style.opacity = 1;
    setTimeout(() => {
      GameState.currentScene = SCENES_DB[sceneId];
      GameState.player.x = spawnX;
      GameState.player.y = spawnY;
      GameState.player.updateState('idle');
      
      Camera.setBounds(GameState.currentScene.width, GameState.currentScene.height);
      // Snap camera directly to player on load
      Camera.snapTo(GameState.player);
      
      document.getElementById('mapNameUI').textContent = `🗺️ ${GameState.currentScene.name}`;
      
      GameState.damageTexts = [];
      GameState.effects = [];
      GameState.projectiles = [];
      GameState.hitRegistry = new Set();
      GameState.drops = [];
      GameState.enemies = [];
      
      if (GameState.currentScene.spawns) {
        for (const spawn of GameState.currentScene.spawns) {
          const area = spawn.area;
          for (let i = 0; i < spawn.count; i++) {
            const rx = area.x1 + Math.random() * (area.x2 - area.x1);
            const ry = area.y1 + Math.random() * (area.y2 - area.y1);
            GameState.enemies.push(new Enemy(spawn.enemyId, rx, ry));
          }
        }
      }
      
      UISystem.logMsg(`Entrou em: ${GameState.currentScene.name}`, 'sys');
      document.getElementById('fadeOverlay').style.opacity = 0;
      setTimeout(() => { GameState.isTransitioning = false; }, 400);
    }, 400);
  }

  static checkPortals() {
    if(!GameState.currentScene || !GameState.currentScene.portals) return;
    const pRadius = GameState.player.r;
    for (const p of GameState.currentScene.portals) {
      if (Math.hypot(GameState.player.x - p.x, GameState.player.y - p.y) < pRadius + p.r) {
        this.loadScene(p.dest, p.spawnX, p.spawnY);
      }
    }
  }

  static drawPortals(ctx, camera) {
    if(!GameState.currentScene || !GameState.currentScene.portals) return;
    for (const p of GameState.currentScene.portals) {
      const sx = p.x - camera.x;
      const sy = p.y - camera.y;
      
      const pulse = Math.floor(Math.sin(Date.now() / 180) * 2);
      ctx.fillStyle = '#17202a';
      ctx.fillRect(sx - p.r - 5, sy - 8, (p.r + 5) * 2, 22);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(sx - p.r + 2, sy - 5 + pulse, (p.r - 2) * 2, 15);
      ctx.fillStyle = '#e8ffff';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(sx - p.r + 10, sy - 2 + pulse, (p.r - 10) * 2, 4);
      ctx.globalAlpha = 1;
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, sx, sy - p.r - 12);
    }
  }

  static drawMap(ctx, camera) {
    const scene = GameState.currentScene;
    if (!scene) return;

    ctx.fillStyle = scene.theme === 'crypt' ? '#202734' : '#263f3d';
    ctx.fillRect(0, 0, camera.width, camera.height);

    // Tiles do mapa (simulados)
    const tileSize = 48;
    const startCol = Math.floor(camera.x / tileSize);
    const endCol = Math.floor((camera.x + camera.width) / tileSize);
    const startRow = Math.floor(camera.y / tileSize);
    const endRow = Math.floor((camera.y + camera.height) / tileSize);

    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        // Tile pos
        const wx = c * tileSize;
        const wy = r * tileSize;
        // Evita desenhar fora do mapa real
        if (wx < 0 || wy < 0 || wx >= scene.width || wy >= scene.height) continue;
        
        const sx = wx - camera.x;
        const sy = wy - camera.y;
        
        const tileImg = IMAGES[scene.tileKey];
        if (tileImg) {
          ctx.drawImage(tileImg, sx, sy, tileSize, tileSize);
        }
      }
    }
    
    // Limits
    ctx.strokeStyle = scene.theme === 'crypt' ? '#78f3e3' : '#2f544f';
    ctx.lineWidth = 4;
    ctx.strokeRect(-camera.x, -camera.y, scene.width, scene.height);
  }

  static drawObjects(ctx, camera) {
    if (!GameState.currentScene || !GameState.currentScene.objects) return;
    for (const obj of GameState.currentScene.objects) {
      if (!camera.isVisible(obj.x, obj.y)) continue;
      const sx = Math.round(obj.x - camera.x);
      const sy = Math.round(obj.y - camera.y);
      
      this.drawObject(ctx, obj.type, sx, sy);
    }
  }

  static drawNPCs(ctx, camera) {
    if (!GameState.currentScene || !GameState.currentScene.npcs) return;
    for (const npc of GameState.currentScene.npcs) {
      const sx = npc.x - camera.x;
      const sy = npc.y - camera.y;
      
      SpriteSystem.draw(ctx, 'player', sx, sy, { state: 'idle', frame: 0, size: 42, anchorY: 36 });
      ctx.fillStyle = npc.color;
      ctx.fillRect(sx - 9, sy - 25, 18, 3);
      
      ctx.fillStyle = '#fff';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(npc.name, sx, sy - npc.r - 4);
    }
  }

  static drawObject(ctx, type, x, y) {
    const rect = (color, dx, dy, w, h) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x + dx), Math.round(y + dy), w, h); };
    if (type === 'tree') {
      rect('#172b2c', -24, -54, 48, 42); rect('#275447', -21, -58, 42, 38); rect('#417a58', -15, -63, 30, 20); rect('#6fa463', -8, -66, 16, 10); rect('#604235', -7, -20, 14, 26); rect('#8a5d43', -3, -25, 6, 28);
    } else if (type === 'crystal') {
      rect('#152938', -16, -9, 32, 10); rect('#2e7190', -10, -40, 20, 32); rect('#78f3e3', -6, -48, 12, 36); rect('#d0fffb', -2, -40, 4, 24);
    } else if (type === 'chest') {
      rect('#251b1d', -18, -14, 36, 22); rect('#875237', -15, -12, 30, 17); rect('#d9994d', -15, -8, 30, 3); rect('#e5bd60', -3, -5, 6, 8);
    } else if (type === 'ruin') {
      rect('#252934', -26, -18, 52, 20); rect('#555766', -21, -45, 14, 30); rect('#555766', 7, -45, 14, 30); rect('#777989', -19, -48, 10, 5); rect('#777989', 9, -48, 10, 5); rect('#78f3e3', -2, -30, 4, 10);
    } else if (type === 'altar' || type === 'fountain') {
      rect('#252937', -34, -15, 68, 20); rect('#4c5861', -28, -27, 56, 17); rect('#7f9295', -20, -33, 40, 8); rect(type === 'fountain' ? '#78f3e3' : '#a879df', -12, -25, 24, 6); rect('#c9dad2', -4, -52, 8, 21);
    } else if (type === 'torch' || type === 'lamp') {
      rect('#202633', -4, -28, 8, 30); rect('#59646b', -7, -31, 14, 7); rect('#78f3e3', -4, -39, 8, 10); rect('#dffff8', -2, -43, 4, 6);
    } else if (type === 'banner') {
      rect('#25242f', -3, -44, 6, 45); rect('#d7aa55', -12, -41, 24, 5); rect('#5a76c9', -10, -36, 20, 20); rect('#d8eaff', -3, -32, 6, 8);
    } else if (type === 'mushroom') {
      rect('#3e2c38', -8, -10, 16, 12); rect('#c15d78', -12, -20, 24, 13); rect('#ffd4bd', -5, -17, 4, 4); rect('#ffd4bd', 4, -13, 4, 4);
    } else if (type === 'flower') {
      rect('#2c634e', -2, -8, 4, 10); rect('#cf76d4', -7, -13, 14, 8); rect('#fff3a0', -2, -10, 4, 4);
    }
  }
}
