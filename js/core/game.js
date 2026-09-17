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
import { QuestSystem } from '../systems/quests.js';
import { SaveSystem } from '../systems/save.js';
import { VFXSystem } from '../systems/vfx.js';
import { ART_CONFIG } from '../data/art.js';
import { AssetManager } from '../systems/assetManager.js';
import { DebugRenderer } from '../systems/debugRenderer.js';
import { ArtPreviewSystem } from '../systems/artPreview.js';

export class Game {
  static saveTimer = 0;
  static init() {
    const launchNotice = document.getElementById('launchNotice');
    if (launchNotice) launchNotice.remove();
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = ART_CONFIG.imageSmoothing;
    AssetManager.initialize();
    ArtPreviewSystem.init();
    
    InputManager.init();
    UISystem.init();
    
    const baseWidth = ART_CONFIG.baseResolution.width;
    const baseHeight = ART_CONFIG.baseResolution.height;
    GameState.canvasW = baseWidth;
    GameState.canvasH = baseHeight;
    Camera.init(baseWidth, baseHeight);
    
    GameState.player = new Player(800, 600);
    GameState.pet = new Pet(800, 600);
    GameState.inventory = [];
    GameState.player.equipment.weapon = ITEMS_DB.espada_basica;
    EquipmentSystem.recalcStats();
    SaveSystem.loadGame();
    QuestSystem.init();
    QuestSystem.updateUI();
    
    window.addEventListener('resize', () => {
      GameState.canvasW = ART_CONFIG.baseResolution.width;
      GameState.canvasH = ART_CONFIG.baseResolution.height;
      this.canvas.width = GameState.canvasW;
      this.canvas.height = GameState.canvasH;
      this.ctx.imageSmoothingEnabled = ART_CONFIG.imageSmoothing;
      Camera.resize(GameState.canvasW, GameState.canvasH);
    });
    
    this.canvas.width = GameState.canvasW;
    this.canvas.height = GameState.canvasH;
    
    SceneManager.loadScene('cidade', 800, 600);
    
    UISystem.logMsg('Sistema World 2D & Pixel Art Inicializado!', 'sys');
    
    GameLoop.start();
    window.addEventListener('beforeunload', () => SaveSystem.saveGame());
  }

  static update(dt) {
    if (GameState.paused) return;
    if (GameState.isTransitioning) return;
    if (GameState.hitStop > 0) {
      GameState.hitStop = Math.max(0, GameState.hitStop - dt);
      ParticleEffectsSystem.update(dt);
      return;
    }
    
    SkillSystem.updateCooldowns(dt);
    this.saveTimer += dt;
    if (this.saveTimer >= 30) { this.saveTimer = 0; SaveSystem.saveGame(); }
    
    GameState.player.update(dt);
    GameState.pet.update(dt);
    UISystem.updateSpritePanel();
    
    Camera.follow(GameState.player, dt);
    Camera.update(dt);
    
    SceneManager.checkPortals();
    SpriteSystem.update(dt);
    CombatSystem.update(dt);
    
    if (GameState.currentScene && GameState.currentScene.combatAllowed) {
      for (const enemy of GameState.enemies) {
        const distance = Math.hypot(enemy.x - GameState.player.x, enemy.y - GameState.player.y);
        if (distance < Math.max(GameState.canvasW, GameState.canvasH) * 1.5) enemy.update(dt);
      }
    }
    
    LootSystem.update(dt);
    ParticleEffectsSystem.update(dt);
    VFXSystem.update(dt);
  }

  static draw() {
    const ctx = this.ctx;
    
    ctx.clearRect(0, 0, GameState.canvasW, GameState.canvasH);
    ctx.save();
    ctx.translate(Camera.shakeX, Camera.shakeY);
    
    // 1. Map background, tiles, border
    SceneManager.drawMap(ctx, Camera);
    
    // 2. Map objects (trees, etc) behind entities
    SceneManager.drawObjects(ctx, Camera);
    SceneManager.drawLighting(ctx, Camera);
    
    // 3. Portals
    SceneManager.drawPortals(ctx, Camera);
    
    // 4. Drops
    LootSystem.draw(ctx, Camera);
    
    // 5. NPCs (simple circles)
    SceneManager.drawNPCs(ctx, Camera);
    
    // 6. Entities sorted by Y for depth
    const entities = [];
    
    for (const enemy of GameState.enemies) {
      if (enemy.alive && Camera.isVisible(enemy.x, enemy.y)) entities.push(enemy);
    }
    entities.push(GameState.pet);
    entities.push(GameState.player);
    
    entities.sort((a, b) => a.sortY - b.sortY);
    
    for (const ent of entities) {
      if (ent.draw) {
        ent.draw(ctx, Camera);
      }
    }
    SceneManager.drawForeground(ctx, Camera);
    
    // 7. Effects on top
    ParticleEffectsSystem.draw(ctx, Camera);
    VFXSystem.draw(ctx, Camera);
    CombatSystem.draw(ctx, Camera);
    DebugRenderer.draw(ctx, Camera);
    ctx.restore();
    
    // 8. HUD (screen-space, independent of camera)
    UISystem.updateHUD();
    ArtPreviewSystem.draw();
  }
}
