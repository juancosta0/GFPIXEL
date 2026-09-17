import { Entity } from './entity.js';
import { GameState } from '../core/gameState.js';
import { InputManager } from '../core/input.js';
import { EquipmentSystem } from '../systems/equipment.js';
import { UISystem } from '../ui/ui.js';
import { CONFIG } from '../data/config.js';
import { SpriteSystem } from '../systems/sprite.js';

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 14);
    this.speed = CONFIG.PLAYER_SPEED;
    this.lv = 1;
    this.exp = 0;
    this.expNext = CONFIG.BASE_EXP_REQ;
    this.gold = 0;
    
    this.materials = { minerals: 0, wood: 0, herbs: 0 };
    
    // Status
    this.baseAtk = 10;
    this.baseMaxHp = 100;
    this.baseMaxMp = 50;
    this.baseDef = 0;
    
    this.atk = 10;
    this.critChance = CONFIG.BASE_CRIT_CHANCE;
    this.hp = 100;
    this.maxHp = 100;
    this.mp = 50;
    this.maxMp = 50;
    this.def = 0;
    
    this.equipment = { weapon: null, armor: null, accessory: null };
    this.skillCds = [0, 0, 0, 0];
    this.mpRegenTimer = 0;
    
    this.interactionTarget = null;
  }

  addExp(amount) {
    this.exp += amount;
    while (this.exp >= this.expNext) {
      this.exp -= this.expNext;
      this.lv++;
      this.expNext = Math.round(this.expNext * CONFIG.EXP_CURVE);
      this.baseMaxHp += 20;
      this.baseAtk += 4;
      EquipmentSystem.recalcStats();
      this.hp = this.maxHp;
      UISystem.logMsg(`🌟 LEVEL UP! Nível ${this.lv}!`, 'sys');
    }
  }

  updateMovement(dt) {
    if (this.state === 'dead' || this.state === 'attacking' || this.state === 'casting') return;
    
    let dx = 0, dy = 0;
    if (InputManager.isPressed('w') || InputManager.isPressed('arrowup')) dy -= 1;
    if (InputManager.isPressed('s') || InputManager.isPressed('arrowdown')) dy += 1;
    if (InputManager.isPressed('a') || InputManager.isPressed('arrowleft')) dx -= 1;
    if (InputManager.isPressed('d') || InputManager.isPressed('arrowright')) dx += 1;
    
    if (dx !== 0 || dy !== 0) {
      this.updateState('moving');
      // Normalizar diagonal
      const len = Math.hypot(dx, dy);
      this.x += (dx / len) * this.speed * dt;
      this.y += (dy / len) * this.speed * dt;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        this.facing = dx > 0 ? 'right' : 'left';
      } else {
        this.facing = dy > 0 ? 'down' : 'up';
      }
    } else {
      this.updateState('idle');
    }
    
    // Camera / Map Limits
    const map = GameState.currentScene;
    if (map) {
      this.x = Math.max(CONFIG.WORLD_PADDING, Math.min(map.width - CONFIG.WORLD_PADDING, this.x));
      this.y = Math.max(CONFIG.WORLD_PADDING, Math.min(map.height - CONFIG.WORLD_PADDING, this.y));
    }
  }

  checkInteractions() {
    if (!GameState.currentScene) return;
    
    let closest = null;
    let minDist = CONFIG.INTERACT_RANGE;
    
    const checkList = (list) => {
      if(!list) return;
      for (const obj of list) {
        const dist = Math.hypot(this.x - obj.x, this.y - obj.y);
        if (dist < minDist) {
          minDist = dist;
          closest = obj;
        }
      }
    };
    
    checkList(GameState.currentScene.npcs);
    this.interactionTarget = closest;
    
    if (this.interactionTarget && InputManager.isJustPressed('e')) {
      this.interact(this.interactionTarget);
    }
  }

  interact(target) {
    UISystem.logMsg(`Interagiu com ${target.name}`, 'sys');
    // Implementar lógicas específicas por tipo depois
  }

  update(dt) {
    super.update(dt);
    if ((this.state === 'attacking' || this.state === 'casting') && this.stateTimer >= CONFIG.ATTACK_LOCK_TIME) {
      this.updateState('idle');
    }
    
    if (this.mp < this.maxMp) {
      this.mpRegenTimer += dt;
      if (this.mpRegenTimer >= CONFIG.MP_REGEN_INTERVAL) {
        this.mp = Math.min(this.maxMp, this.mp + CONFIG.MP_REGEN_RATE);
        this.mpRegenTimer = 0;
      }
    }
    
    this.updateMovement(dt);
    this.checkInteractions();
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    
    SpriteSystem.draw(ctx, 'player', sx, sy, { state: this.state, frame: this.frameIndex, facing: this.facing, anchorY: 42 });
    
    ctx.fillStyle = '#eef8f0';
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Você', sx, sy - 48);
  }
}
