import { GameState } from './gameState.js';
import { SCENES_DB } from '../data/scenes.js';
import { UISystem } from '../ui/ui.js';
import { Enemy } from '../entities/enemy.js';
import { Camera } from './camera.js';
import { IMAGES } from '../data/assets.js';
import { SpriteSystem } from '../systems/sprite.js';
import { QuestSystem } from '../systems/quests.js';
import { SaveSystem } from '../systems/save.js';
import { GatheringSystem } from '../systems/gathering.js';

export class SceneManager {
  static loadScene(sceneId, spawnX, spawnY) {
    if (GameState.isTransitioning) return;
    GameState.isTransitioning = true;
    
    document.getElementById('fadeOverlay').style.opacity = 1;
    setTimeout(() => {
      GameState.currentScene = SCENES_DB[sceneId] || SCENES_DB.cidade;
      QuestSystem.onEvent('visit', sceneId);

      // Registrar descoberta da região no Mapa-Múndi
      if (!GameState.discoveredScenes) GameState.discoveredScenes = [];
      if (!GameState.discoveredScenes.includes(sceneId)) {
        GameState.discoveredScenes.push(sceneId);
        UISystem.logMsg(`🗺️ Nova região descoberta: ${GameState.currentScene.name}!`, 'gold');
      }

      SaveSystem.saveGame();
      for (const object of GameState.currentScene.objects || []) {
        if (object.type === 'chest' && object.opened === undefined) object.opened = false;
        if (object.type && object.type.endsWith('_node') && object.depleted === undefined) object.depleted = false;
      }
      GameState.player.x = spawnX;
      GameState.player.y = spawnY;
      GameState.portalCooldown = .9;
      GameState.player.updateState('idle');
      
      Camera.setBounds(GameState.currentScene.width, GameState.currentScene.height);
      Camera.snapTo(GameState.player);
      
      const mapNameEl = document.getElementById('mapNameUI');
      if (mapNameEl) mapNameEl.textContent = `📍 ${GameState.currentScene.name}`;
      
      GameState.damageTexts = [];
      GameState.effects = [];
      GameState.vfx = [];
      GameState.projectiles = [];
      GameState.projectileEntities = [];
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
    if (GameState.portalCooldown > 0) {
      GameState.portalCooldown = Math.max(0, GameState.portalCooldown - GameState.deltaTime);
      return;
    }
    const pRadius = GameState.player.r;
    for (const p of GameState.currentScene.portals) {
      if (p.requires && !GameState.flags[p.requires]) continue;
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
      if (p.requires && !GameState.flags[p.requires]) {
        ctx.fillStyle = '#ff8080';
        ctx.globalAlpha = .85;
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒 Bloqueado', sx, sy - p.r - 12);
        ctx.globalAlpha = 1;
        continue;
      }
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, sx, sy - p.r - 12);
    }
  }

  static drawMap(ctx, camera) {
    const scene = GameState.currentScene;
    if (!scene) return;

    const baseThemeColors = {
      crypt: '#202734',
      desert: '#b8964e',
      mountain: '#383a44',
      oasis: '#345e4c',
      forest: '#18382b',
      meadow: '#263f3d',
      town: '#423c34'
    };
    ctx.fillStyle = baseThemeColors[scene.theme] || '#263f3d';
    ctx.fillRect(0, 0, camera.width, camera.height);

    const tileSize = 48;
    const startCol = Math.floor(camera.x / tileSize);
    const endCol = Math.floor((camera.x + camera.width) / tileSize);
    const startRow = Math.floor(camera.y / tileSize);
    const endRow = Math.floor((camera.y + camera.height) / tileSize);

    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const wx = c * tileSize;
        const wy = r * tileSize;
        if (wx < 0 || wy < 0 || wx >= scene.width || wy >= scene.height) continue;
        
        const sx = wx - camera.x;
        const sy = wy - camera.y;
        
        const tileImg = IMAGES[scene.tileKey];
        if (tileImg) {
          ctx.drawImage(tileImg, sx, sy, tileSize, tileSize);
        }
        if ((c * 7 + r * 11) % 9 === 0) {
          ctx.fillStyle = scene.theme === 'crypt' ? 'rgba(120,243,227,.08)' : scene.theme === 'desert' ? 'rgba(255,230,140,.12)' : 'rgba(255,235,170,.07)';
          ctx.fillRect(sx + 7, sy + 8, 2, 2);
        }
      }
    }
    
    ctx.strokeStyle = scene.theme === 'crypt' ? '#78f3e3' : scene.theme === 'desert' ? '#f4c96a' : '#2f544f';
    ctx.lineWidth = 4;
    ctx.strokeRect(-camera.x, -camera.y, scene.width, scene.height);
  }

  static drawObjects(ctx, camera) {
    if (!GameState.currentScene || !GameState.currentScene.objects) return;
    for (const obj of GameState.currentScene.objects) {
      if (!camera.isVisible(obj.x, obj.y)) continue;
      const sx = Math.round(obj.x - camera.x);
      const sy = Math.round(obj.y - camera.y);
      
      this.drawObject(ctx, obj.type, sx, sy, obj);
    }
  }

  static drawLighting(ctx, camera) {
    const scene = GameState.currentScene;
    if (!scene) return;
    
    if (scene.theme === 'crypt' || scene.theme === 'cavern') {
      ctx.save();
      ctx.fillStyle = 'rgba(8, 10, 19, .32)';
      ctx.fillRect(0, 0, camera.width, camera.height);
      const lights = (scene.objects || []).filter(object => ['torch', 'crystal', 'altar'].includes(object.type));
      if (scene.type === 'bossroom') lights.push({ x: 430, y: 360, radius: 180, color: 'rgba(217, 90, 101, .22)' });
      for (const light of lights) {
        const sx = light.x - camera.x;
        const sy = light.y - camera.y - (light.type === 'torch' ? 28 : 0);
        const radius = light.radius || (light.type === 'crystal' ? 110 : light.type === 'altar' ? 130 : 95);
        const color = light.color || (light.type === 'torch' ? 'rgba(242, 214, 111, .22)' : 'rgba(120, 243, 227, .2)');
        const gradient = ctx.createRadialGradient(sx, sy, 2, sx, sy, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(sx, sy, radius, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    } else if (scene.theme === 'desert') {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 201, 106, 0.08)';
      ctx.fillRect(0, 0, camera.width, camera.height);
      ctx.restore();
    } else if (scene.theme === 'mountain') {
      ctx.save();
      ctx.fillStyle = 'rgba(154, 183, 187, 0.09)';
      ctx.fillRect(0, 0, camera.width, camera.height);
      ctx.restore();
    } else if (scene.theme === 'oasis') {
      ctx.save();
      ctx.fillStyle = 'rgba(120, 243, 227, 0.06)';
      ctx.fillRect(0, 0, camera.width, camera.height);
      ctx.restore();
    }
  }

  static drawForeground(ctx, camera) {
    const scene = GameState.currentScene;
    if (!scene) return;
    for (const obj of scene.objects || []) {
      if ((obj.type !== 'tree' && obj.type !== 'mountain_pine') || !camera.isVisible(obj.x, obj.y)) continue;
      const sx = obj.x - camera.x, sy = obj.y - camera.y;
      ctx.globalAlpha = .75;
      ctx.fillStyle = obj.type === 'mountain_pine' ? '#274b3d' : '#39705d';
      ctx.beginPath(); ctx.arc(sx - 12, sy - 46, 18, 0, Math.PI * 2); ctx.arc(sx + 10, sy - 52, 22, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  static drawNPCs(ctx, camera) {
    if (!GameState.currentScene || !GameState.currentScene.npcs) return;
    for (const npc of GameState.currentScene.npcs) {
      const sx = npc.x - camera.x;
      const sy = npc.y - camera.y + Math.sin(GameState.elapsed * 2.2 + npc.x) * 1.2;
      
      ctx.fillStyle = 'rgba(10, 18, 26, .32)';
      ctx.beginPath(); ctx.ellipse(sx, sy + 3, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
      SpriteSystem.draw(ctx, 'player', sx, sy, { state: 'idle', frame: Math.floor(GameState.elapsed * 3 + npc.x) % 2, size: 42, anchorY: 36 });
      ctx.fillStyle = npc.color;
      ctx.fillRect(sx - 9, sy - 25, 18, 3);
      
      ctx.fillStyle = '#fff';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(npc.name, sx, sy - npc.r - 4);
      const questId = npc.quests?.find(id => GameState.quests?.[id]?.status === 'available') || npc.quests?.find(id => GameState.quests?.[id]?.status === 'completed');
      if (questId) {
        ctx.fillStyle = GameState.quests[questId].status === 'completed' ? '#d9f07a' : '#f1d17a';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(GameState.quests[questId].status === 'completed' ? '?' : '!', sx, sy - npc.r - 22);
      }
    }
  }

  static drawObject(ctx, type, x, y, obj = {}) {
    const rect = (color, dx, dy, w, h) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x + dx), Math.round(y + dy), w, h); };
    const pulse = .75 + Math.sin(Date.now() / 240 + x) * .25;
    const imageKeyMap = {
      tree: 'treeProp',
      crystal: 'crystalProp',
      chest: 'chestProp',
      ruin: 'ruinProp',
      altar: 'altarProp',
      fountain: 'fountainProp',
      torch: 'torchProp',
      lamp: 'lampProp',
      banner: 'bannerProp',
      mushroom: 'flowerProp',
      flower: 'flowerProp'
    };
    const imageKey = imageKeyMap[type];
    if (imageKey && IMAGES[imageKey]) {
      const image = IMAGES[imageKey];
      const size = type === 'tree' ? 54 : type === 'crystal' ? 42 : type === 'fountain' || type === 'altar' ? 52 : type === 'banner' ? 34 : 36;
      ctx.save();
      ctx.translate(Math.round(x), Math.round(y));
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
      ctx.restore();
      return;
    }

    if (type === 'tree') {
      rect('#172b2c', -24, -54, 48, 42); rect('#275447', -21, -58, 42, 38); rect('#417a58', -15, -63, 30, 20); rect('#6fa463', -8, -66, 16, 10); rect('#604235', -7, -20, 14, 26); rect('#8a5d43', -3, -25, 6, 28);
    } else if (type === 'crystal') {
      rect('#152938', -16, -9, 32, 10); rect('#2e7190', -10, -40, 20, 32); ctx.shadowColor = '#78f3e3'; ctx.shadowBlur = 10 * pulse; rect('#78f3e3', -6, -48, 12, 36); ctx.shadowBlur = 0; rect('#d0fffb', -2, -40, 4, 24);
    } else if (type === 'chest') {
      rect('#251b1d', -18, -14, 36, 22); rect('#875237', -15, -12, 30, 17); rect('#d9994d', -15, -8, 30, 3); rect('#e5bd60', -3, -5, 6, 8);
    } else if (type === 'ruin') {
      rect('#252934', -26, -18, 52, 20); rect('#555766', -21, -45, 14, 30); rect('#555766', 7, -45, 14, 30); rect('#777989', -19, -48, 10, 5); rect('#777989', 9, -48, 10, 5); rect('#78f3e3', -2, -30, 4, 10);
    } else if (type === 'altar' || type === 'fountain') {
      rect('#252937', -34, -15, 68, 20); rect('#4c5861', -28, -27, 56, 17); rect('#7f9295', -20, -33, 40, 8); rect(type === 'fountain' ? '#78f3e3' : '#a879df', -12, -25, 24, 6); rect('#c9dad2', -4, -52, 8, 21);
    } else if (type === 'torch' || type === 'lamp') {
      rect('#202633', -4, -28, 8, 30); rect('#59646b', -7, -31, 14, 7); ctx.shadowColor = '#78f3e3'; ctx.shadowBlur = 14 * pulse; rect('#78f3e3', -4, -39, 8, 10); rect('#dffff8', -2, -43, 4, 6); ctx.shadowBlur = 0;
    } else if (type === 'banner') {
      rect('#25242f', -3, -44, 6, 45); rect('#d7aa55', -12, -41, 24, 5); rect('#5a76c9', -10, -36, 20, 20); rect('#d8eaff', -3, -32, 6, 8);
    } else if (type === 'mushroom') {
      rect('#3e2c38', -8, -10, 16, 12); rect('#c15d78', -12, -20, 24, 13); rect('#ffd4bd', -5, -17, 4, 4); rect('#ffd4bd', 4, -13, 4, 4);
    } else if (type === 'flower') {
      rect('#2c634e', -2, -8, 4, 10); rect('#cf76d4', -7, -13, 14, 8); rect('#fff3a0', -2, -10, 4, 4);
    } else if (type === 'cactus') {
      rect('#1d3d2c', -8, -34, 16, 36); rect('#2d6348', -6, -32, 12, 32);
      rect('#2d6348', -18, -26, 12, 6); rect('#2d6348', -18, -34, 6, 12);
      rect('#2d6348', 6, -20, 12, 6); rect('#2d6348', 12, -28, 6, 12);
      rect('#ffd97d', -4, -18, 2, 2); rect('#ffd97d', 2, -10, 2, 2);
    } else if (type === 'dune_rock') {
      rect('#42301c', -20, -14, 40, 18); rect('#8a673c', -18, -12, 36, 14); rect('#d4a968', -12, -8, 24, 6);
    } else if (type === 'obelisk') {
      rect('#262018', -10, -52, 20, 54); rect('#6b5a3e', -8, -48, 16, 48); rect('#bfa063', -6, -44, 12, 42);
      rect('#f1d17a', -2, -32, 4, 12); rect('#f1d17a', -4, -40, 8, 4);
    } else if (type === 'mountain_pine') {
      rect('#14241d', -18, -48, 36, 38); rect('#234235', -15, -54, 30, 24); rect('#386150', -10, -60, 20, 16); rect('#558772', -5, -64, 10, 8);
      rect('#422d22', -5, -14, 10, 16);
    } else if (type === 'cliff_boulder') {
      rect('#20242e', -22, -18, 44, 22); rect('#464c5c', -19, -15, 38, 17); rect('#7c8599', -12, -10, 24, 8);
    } else if (type === 'ore_node') {
      if (obj.depleted) {
        rect('#1a1c22', -14, -8, 28, 10); rect('#2c303a', -12, -6, 24, 6);
      } else {
        rect('#22242e', -16, -14, 32, 18); rect('#484c59', -14, -12, 28, 14);
        const sparkle = Math.sin(Date.now() / 200 + x) * 2;
        rect('#78f3e3', -8, -14 + sparkle, 6, 8); rect('#e8ffff', -6, -12 + sparkle, 2, 4);
        rect('#f4c96a', 2, -10 - sparkle, 7, 7); rect('#fff8d4', 4, -8 - sparkle, 3, 3);
      }
    } else if (type === 'wood_node') {
      if (obj.depleted) {
        rect('#1f140f', -16, -8, 32, 10); rect('#40281b', -14, -6, 28, 6);
      } else {
        rect('#2b1c15', -18, -14, 36, 18); rect('#66412e', -16, -12, 32, 14);
        rect('#9e6b48', -12, -8, 24, 8); rect('#78f3e3', -2, -6, 4, 4);
      }
    } else if (type === 'herb_node') {
      if (obj.depleted) {
        rect('#12261b', -12, -8, 24, 10); rect('#1c402d', -10, -6, 20, 6);
      } else {
        rect('#173b28', -16, -16, 32, 18); rect('#2f7a50', -14, -18, 28, 18); rect('#5ea86b', -10, -22, 20, 16);
        rect('#ff8fa3', -6, -16, 5, 5); rect('#ff8fa3', 3, -20, 4, 4); rect('#fff3a0', -4, -14, 2, 2);
      }
    }
  }
}
