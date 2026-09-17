import { GameState } from './gameState.js';
import { InputManager } from './input.js';
import { UISystem } from '../ui/ui.js';
import { Player } from '../entities/player.js';
import { Pet } from '../entities/pet.js';
import { SceneManager } from './sceneManager.js';
import { SkillSystem } from '../systems/skill.js';
import { SpriteSystem } from '../systems/sprite.js';
import { LootSystem } from '../systems/loot.js';
import { ParticleEffectsSystem } from '../systems/particleEffects.js';
import { Camera } from './camera.js';
import { GameLoop } from './gameLoop.js';
import { ITEMS_DB } from '../data/items.js';
import { EquipmentSystem } from '../systems/equipment.js';
import { CombatSystem } from '../systems/combat.js';

export class Game {
  static init() {
    const launchNotice = document.getElementById('launchNotice');
    if (launchNotice) launchNotice.remove();
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    
    InputManager.init();
    UISystem.init();
    
    Camera.init(window.innerWidth, window.innerHeight);
    
    GameState.player = new Player(800, 600);
    GameState.pet = new Pet(800, 600);
    GameState.inventory = [ITEMS_DB.arco_luar, ITEMS_DB.cajado_aqua, ITEMS_DB.lamina_raiz, ITEMS_DB.tunica_ilya, { ...ITEMS_DB.pocao_luz, quantity: 3 }];
    GameState.player.equipment.weapon = ITEMS_DB.espada_aprendiz;
    EquipmentSystem.recalcStats();
    
    window.addEventListener('resize', () => {
      GameState.canvasW = window.innerWidth;
      GameState.canvasH = window.innerHeight;
      this.canvas.width = GameState.canvasW;
      this.canvas.height = GameState.canvasH;
      this.ctx.imageSmoothingEnabled = false;
      Camera.resize(GameState.canvasW, GameState.canvasH);
    });
    
    this.canvas.width = GameState.canvasW;
    this.canvas.height = GameState.canvasH;
    
    SceneManager.loadScene('cidade', 800, 600);
    
    UISystem.logMsg('Sistema World 2D & Pixel Art Inicializado!', 'sys');
    
    GameLoop.start();
  }

  static update(dt) {
    if (GameState.isTransitioning) return;
    if (GameState.hitStop > 0) {
      GameState.hitStop = Math.max(0, GameState.hitStop - dt);
      ParticleEffectsSystem.update(dt);
      return;
    }
    
    SkillSystem.updateCooldowns(dt);
    
    GameState.player.update(dt);
    GameState.pet.update(dt);
    
    Camera.follow(GameState.player, dt);
    
    SceneManager.checkPortals();
    SpriteSystem.update(dt);
    CombatSystem.update(dt);
    
    if (GameState.currentScene && GameState.currentScene.combatAllowed) {
      for (const enemy of GameState.enemies) {
        enemy.update(dt);
      }
    }
    
    LootSystem.update(dt);
    ParticleEffectsSystem.update(dt);
  }

  static draw() {
    const ctx = this.ctx;
    
    ctx.clearRect(0, 0, GameState.canvasW, GameState.canvasH);
    
    // 1. Map background, tiles, border
    SceneManager.drawMap(ctx, Camera);
    
    // 2. Map objects (trees, etc) behind entities
    SceneManager.drawObjects(ctx, Camera);
    
    // 3. Portals
    SceneManager.drawPortals(ctx, Camera);
    
    // 4. Drops
    LootSystem.draw(ctx, Camera);
    
    // 5. NPCs (simple circles)
    SceneManager.drawNPCs(ctx, Camera);
    
    // 6. Entities sorted by Y for depth
    const entities = [];
    
    for (const enemy of GameState.enemies) {
      if (enemy.alive) entities.push(enemy);
    }
    entities.push(GameState.pet);
    entities.push(GameState.player);
    
    entities.sort((a, b) => a.sortY - b.sortY);
    
    for (const ent of entities) {
      if (ent.draw) {
        ent.draw(ctx, Camera);
      }
    }
    
    // 7. Effects on top
    ParticleEffectsSystem.draw(ctx, Camera);
    CombatSystem.draw(ctx, Camera);
    
    // 8. HUD (screen-space, independent of camera)
    UISystem.updateHUD();
  }
}
