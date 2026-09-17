import { Entity } from './entity.js';
import { GameState } from '../core/gameState.js';
import { InputManager } from '../core/input.js';
import { EquipmentSystem } from '../systems/equipment.js';
import { UISystem } from '../ui/ui.js';
import { CONFIG } from '../data/config.js';
import { SpriteSystem } from '../systems/sprite.js';
import { ProgressionSystem } from '../systems/progression.js';
import { NPCS_DB } from '../data/npcs.js';
import { DialogueSystem } from '../systems/dialogue.js';
import { QuestSystem } from '../systems/quests.js';
import { ChestSystem } from '../systems/chests.js';
import { ShopSystem } from '../systems/shop.js';
import { AnimationController } from '../systems/animation.js';
import { CombatSystem } from '../systems/combat.js';

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
    this.baseStats = { hp: 100, mp: 50, atk: 10, def: 0, crit: CONFIG.BASE_CRIT_CHANCE, speed: CONFIG.PLAYER_SPEED };
    this.baseAtk = this.baseStats.atk;
    this.baseMaxHp = this.baseStats.hp;
    this.baseMaxMp = this.baseStats.mp;
    this.baseDef = this.baseStats.def;
    this.temporaryBuffs = {};
    
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
    this.pendingAttack = null;
    this.animationController = new AnimationController(this, (event, animation) => CombatSystem.handleAnimationEvent(event, animation));
  }

  addExp(amount) {
    ProgressionSystem.addExperience(this, amount);
  }

  updateMovement(dt) {
    if (this.state === 'dead' || this.state.includes('attack') || this.state.includes('cast')) return;
    
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
    checkList((GameState.currentScene.objects || []).filter(object => object.type === 'chest' && !object.opened));
    this.interactionTarget = closest;
    
    if (this.interactionTarget && InputManager.isJustPressed('e')) {
      this.interact(this.interactionTarget);
    }
  }

  interact(target) {
    if (target.type === 'chest') return ChestSystem.open(target);
    const npc = NPCS_DB[target.id] || target;
    if (npc.function === 'shop') return ShopSystem.buy(npc.shop?.[0] || 'pocao_luz');
    const action = DialogueSystem.open(npc, npc.dialogue, 0);
    if (action === 'acceptQuest') {
      const questId = npc.quests?.find(id => GameState.quests[id]?.status === 'available');
      if (questId) QuestSystem.accept(questId);
      const completed = npc.quests?.find(id => GameState.quests[id]?.status === 'completed');
      if (completed) QuestSystem.claim(completed);
    }
    QuestSystem.onEvent('talk', npc.id);
  }

  update(dt) {
    super.update(dt);
    this.animationController.update(dt);
    if (this.animationController.finished) this.pendingAttack = null;
    
    if (this.mp < this.maxMp) {
      this.mpRegenTimer += dt;
      if (this.mpRegenTimer >= CONFIG.MP_REGEN_INTERVAL) {
        this.mp = Math.min(this.maxMp, this.mp + CONFIG.MP_REGEN_RATE);
        this.mpRegenTimer = 0;
      }
    }
    
    this.updateMovement(dt);
    if (!this.pendingAttack) this.animationController.play(this.state === 'moving' ? 'WALK' : 'IDLE');
    this.checkInteractions();
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    
    ctx.fillStyle = 'rgba(10, 18, 26, .35)';
    ctx.beginPath(); ctx.ellipse(sx, sy + 2, 15, 6, 0, 0, Math.PI * 2); ctx.fill();
    const animationState = this.animationController.state === 'WALK' ? 'moving' : this.animationController.state === 'IDLE' ? 'idle' : this.animationController.state.includes('STAFF') ? 'casting' : 'attacking';
    SpriteSystem.draw(ctx, 'player', sx, sy, { state: animationState, frame: this.animationController.getFrame(), facing: this.facing, anchorY: 42 });
    this.drawWeapon(ctx, sx, sy);
    
    ctx.fillStyle = '#eef8f0';
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Você', sx, sy - 48);
  }

  drawWeapon(ctx, x, y) {
    const weapon = this.equipment.weapon;
    if (!weapon) return;
    const direction = this.facing === 'left' ? -1 : this.facing === 'right' ? 1 : 0;
    ctx.save(); ctx.translate(x + direction * 10, y - 20);
    if (this.facing === 'up') ctx.globalAlpha = .85;
    ctx.rotate(this.facing === 'down' ? Math.PI / 2 : direction < 0 ? Math.PI : 0);
    if (weapon.weaponStyle === 'bow') {
      ctx.strokeStyle = '#d9a65a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 13, -Math.PI / 2, Math.PI / 2, direction < 0); ctx.stroke();
      ctx.strokeStyle = '#eef8f0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(0, 13); ctx.stroke();
    } else if (weapon.weaponStyle === 'staff') {
      ctx.strokeStyle = '#795442'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(0, -15); ctx.stroke();
      ctx.fillStyle = '#78f3e3'; ctx.shadowColor = '#78f3e3'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(0, -17, 4 + Math.sin(GameState.elapsed * 8), 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = '#d9e6e6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-2, 12); ctx.lineTo(0, -17); ctx.stroke();
      ctx.strokeStyle = '#e7b65c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, 1); ctx.lineTo(4, 1); ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }
}
