import { Entity } from './entity.js';
import { GameState } from '../core/gameState.js';
import { CONFIG } from '../data/config.js';
import { SpriteSystem } from '../systems/sprite.js';
import { SPRITE_CATEGORIES, SPRITE_PERSONALITIES, SPRITE_SKILL_TREE, SPRITE_FOODS } from '../data/spriteData.js';
import { UISystem } from '../ui/ui.js';
import { ParticleEffectsSystem } from '../systems/particleEffects.js';

export class Pet extends Entity {
  constructor(x, y, data = {}) {
    super(x, y, 7);
    this.id = data.id || 'sprite-lumi';
    this.name = data.name || 'Lumi';
    this.category = data.category || 'minerador';
    this.personality = data.personality || 'trabalhador';
    this.title = data.title || 'Mestre da Terra e Minérios';
    this.lore = data.lore || 'Seu leal companheiro Sprite.';
    
    // Níveis e Progressão
    this.level = data.level || 1;
    this.xp = data.xp || 0;
    this.xpNext = data.xpNext || Math.round(40 * Math.pow(this.level, 1.4));
    this.tier = this.calculateTier();
    this.skillPoints = data.skillPoints || 0;
    this.skills = data.skills ? { ...data.skills } : { colheita_abundante_1: 1 };
    
    // Energia, Saciedade e Amizade
    this.energy = data.energy ?? 100;
    this.maxEnergy = data.maxEnergy ?? 100;
    this.satiety = data.satiety ?? 80; // Saciedade (0-100)
    this.friendship = data.friendship ?? 25; // Amizade (0-100)
    this.mood = data.mood || 'feliz';
    this.specialty = data.specialty || this.category;
    
    // Estados de Atividade
    this.state = data.state || 'following'; // following, gathering, resting
    this.inventory = data.inventory ? [...data.inventory] : [];
    this.abilities = data.abilities ? [...data.abilities] : ['Coleta Eficiente', 'Aura Companheira'];
    
    // Tarefa atual
    this.gatherTimer = data.gatherTimer || 0;
    this.taskDuration = data.taskDuration || 0;
    this.taskName = data.taskName || '';
    this.gatherType = data.gatherType || '';
    this.taskReward = data.taskReward || '';
    
    // Métricas e Reações
    this.totalGathered = data.totalGathered || 0;
    this.totalCrafted = data.totalCrafted || 0;
    this.lastPettedTime = 0;
    this.reactionIcon = null;
    this.reactionTimer = 0;
    this.bubbleDialogue = '';
    this.bubbleTimer = 0;
    
    // Timers de atualização
    this.satietyTimer = 0;
    this.ambientParticleTimer = 0;
    this.combatSupportTimer = 0;
  }

  calculateTier() {
    if (this.level >= 20) return 3;
    if (this.level >= 10) return 2;
    return 1;
  }

  getCategoryData() {
    return SPRITE_CATEGORIES[this.category] || SPRITE_CATEGORIES.minerador;
  }

  getPersonalityData() {
    return SPRITE_PERSONALITIES[this.personality] || SPRITE_PERSONALITIES.trabalhador;
  }

  getFriendshipTitle() {
    if (this.friendship >= 100) return 'Alma Gêmea';
    if (this.friendship >= 75) return 'Inseparável';
    if (this.friendship >= 50) return 'Afeiçoado';
    if (this.friendship >= 25) return 'Amigável';
    return 'Tímido';
  }

  addExperience(amount) {
    if (this.level >= 30) {
      this.xp = this.xpNext;
      return;
    }
    this.xp += Math.max(0, Math.round(amount));
    let leveledUp = false;
    while (this.xp >= this.xpNext && this.level < 30) {
      this.xp -= this.xpNext;
      this.level++;
      this.skillPoints += 1;
      if (this.level % 5 === 0) this.skillPoints += 1; // Ponto bônus em marcos
      this.maxEnergy = Math.min(150, 100 + (this.level - 1) * 2);
      this.energy = this.maxEnergy;
      this.xpNext = Math.round(40 * Math.pow(this.level, 1.45));
      leveledUp = true;
      
      const prevTier = this.tier;
      this.tier = this.calculateTier();
      if (this.tier > prevTier) {
        this.showReaction('🌟', 3.5);
        this.say(`Evolução! Alcancei a Forma Tier ${this.tier}! Minhas asas e poderes aumentaram!`, 4.5);
        UISystem.logMsg(`✨ ${this.name} EVOLUIU para o Tier ${this.tier}! Novas formas visuais e auras desbloqueadas!`, 'gold');
        if (ParticleEffectsSystem?.addImpact) {
          ParticleEffectsSystem.addImpact(this.x, this.y, 'magic');
        }
      } else {
        this.showReaction('⚡', 2.0);
        this.say(`Subi para o nível ${this.level}! Ficando mais forte a cada dia!`, 3.0);
        UISystem.logMsg(`🌟 ${this.name} subiu para o Nível ${this.level}! (+1 Ponto de Especialização)`, 'gold');
      }
    }
    if (leveledUp) {
      UISystem.updateSpritePanel();
      if (window.UISystem?.updateSpriteManagerModal) {
        window.UISystem.updateSpriteManagerModal();
      }
    }
  }

  gainFriendship(amount) {
    const pers = this.getPersonalityData();
    const multiplier = pers.friendshipTaskBonus || 1;
    const finalAmt = Math.round(amount * multiplier);
    this.friendship = Math.min(100, Math.max(0, this.friendship + finalAmt));
    this.updateMood();
    UISystem.updateSpritePanel();
    if (window.UISystem?.updateSpriteManagerModal) {
      window.UISystem.updateSpriteManagerModal();
    }
  }

  feed(foodKey) {
    const food = SPRITE_FOODS[foodKey];
    if (!food) return false;
    
    // Verificar se jogador tem ouro
    if (GameState.player.gold < food.costGold) {
      UISystem.logMsg('Ouro insuficiente para comprar este petisco.', 'dmg');
      return false;
    }
    
    GameState.player.gold -= food.costGold;
    const pers = this.getPersonalityData();
    const energyMult = pers.feedEnergyBonus || 1;
    const friendMult = pers.friendshipFeedBonus || 1;
    
    const energyGained = Math.round(food.energy * energyMult);
    const friendGained = Math.round(food.friendship * friendMult);
    
    this.energy = Math.min(this.maxEnergy, this.energy + energyGained);
    this.satiety = Math.min(100, this.satiety + food.satiety);
    this.gainFriendship(friendGained);
    this.addExperience(food.xp);
    
    this.showReaction('❤️', 2.5);
    const feedDialogues = pers.dialogues?.feed || ['Que comida gostosa, mestre! Obrigado!'];
    const phrase = feedDialogues[Math.floor(Math.random() * feedDialogues.length)];
    this.say(phrase, 3.5);
    
    UISystem.logMsg(`🍎 Alimentou ${this.name} com ${food.name}! (+${energyGained} Energia, +${food.satiety} Saciedade, +${friendGained} Amizade)`, 'sys');
    this.updateMood();
    UISystem.updateHUD();
    UISystem.updateSpritePanel();
    if (window.UISystem?.updateSpriteManagerModal) {
      window.UISystem.updateSpriteManagerModal();
    }
    return true;
  }

  pet() {
    const now = Date.now();
    if (now - this.lastPettedTime < 20000) {
      const waitSec = Math.ceil((20000 - (now - this.lastPettedTime)) / 1000);
      this.say(`Hehe, cócegas! Espere mais ${waitSec}s para mais carinho!`, 2.5);
      return false;
    }
    
    this.lastPettedTime = now;
    this.gainFriendship(3);
    this.energy = Math.min(this.maxEnergy, this.energy + 5);
    this.showReaction('❤️', 3.0);
    
    const pers = this.getPersonalityData();
    const petDialogues = pers.dialogues?.pet || ['Adoro quando você faz carinho nas minhas asinhas!'];
    const phrase = petDialogues[Math.floor(Math.random() * petDialogues.length)];
    this.say(phrase, 3.5);
    
    UISystem.logMsg(`🥰 Você acariciou ${this.name}! (+3 Amizade, +5 Energia)`, 'gold');
    this.updateMood();
    return true;
  }

  toggleRest() {
    if (this.state === 'gathering') {
      UISystem.logMsg('O Sprite está ocupado coletando no momento!', 'dmg');
      return false;
    }
    if (this.state === 'resting') {
      this.state = 'following';
      this.say('Descansei bastante! Hora de acompanhar você de novo!', 2.5);
      this.showReaction('✨', 2.0);
      UISystem.logMsg(`${this.name} saiu do descanso e agora está te seguindo.`, 'sys');
    } else {
      this.state = 'resting';
      this.say('Vou tirar uma soneca na cabana dos Sprites... zzz...', 2.5);
      this.showReaction('💤', 3.0);
      UISystem.logMsg(`${this.name} foi para a cabana descansar e recuperar energia.`, 'sys');
    }
    UISystem.updateSpritePanel();
    if (window.UISystem?.updateSpriteManagerModal) {
      window.UISystem.updateSpriteManagerModal();
    }
    return true;
  }

  learnSkill(branchId, skillId) {
    const branch = SPRITE_SKILL_TREE[branchId];
    if (!branch) return false;
    const skill = branch.skills.find(s => s.id === skillId);
    if (!skill) return false;
    
    const curLevel = this.skills[skillId] || 0;
    if (curLevel >= skill.maxLevel) {
      UISystem.logMsg('Esta habilidade já está no nível máximo!', 'dmg');
      return false;
    }
    if (this.skillPoints < skill.cost) {
      UISystem.logMsg('Pontos de especialização insuficientes!', 'dmg');
      return false;
    }
    if (skill.requires && (this.skills[skill.requires] || 0) < 1) {
      UISystem.logMsg('Requer a habilidade anterior na árvore!', 'dmg');
      return false;
    }
    
    this.skillPoints -= skill.cost;
    this.skills[skillId] = curLevel + 1;
    this.showReaction('🌟', 2.5);
    this.say(`Aprendi a especialização: ${skill.name} (Nv. ${this.skills[skillId]})!`, 3.0);
    UISystem.logMsg(`✨ ${this.name} aprimorou [${skill.name}] para o Nível ${this.skills[skillId]}!`, 'gold');
    
    // Recalcular bônus do jogador
    if (window.EquipmentSystem?.recalcStats) {
      window.EquipmentSystem.recalcStats();
    }
    UISystem.updateSpritePanel();
    if (window.UISystem?.updateSpriteManagerModal) {
      window.UISystem.updateSpriteManagerModal();
    }
    return true;
  }

  showReaction(icon, duration = 2.5) {
    this.reactionIcon = icon;
    this.reactionTimer = duration;
  }

  say(text, duration = 3.0) {
    this.bubbleDialogue = text;
    this.bubbleTimer = duration;
  }

  updateMood() {
    if (this.satiety < 15) {
      this.mood = 'faminto';
    } else if (this.energy < 20) {
      this.mood = 'cansado';
    } else if (this.friendship >= 75 && this.energy >= 70 && this.satiety >= 60) {
      this.mood = 'radiante';
    } else if (this.energy >= 40 && this.satiety >= 35) {
      this.mood = 'feliz';
    } else {
      this.mood = 'calmo';
    }
  }

  getSkillLevel(skillId) {
    return this.skills[skillId] || 0;
  }

  // Bônus consolidados para sistemas externos
  getGatherBonuses() {
    const cat = this.getCategoryData();
    const pers = this.getPersonalityData();
    let extraYield = this.getSkillLevel('colheita_abundante_1');
    let speedMult = 1.0 - this.getSkillLevel('passo_ligeiro_1') * 0.15;
    let doubleHarvestChance = this.getSkillLevel('toque_da_terra') * 0.20;
    
    if (this.skills.mestre_coletor) {
      extraYield += 3;
    }
    if (cat.baseBonus?.gatherSpeed) {
      speedMult -= cat.baseBonus.gatherSpeed;
    }
    // Bônus de amizade reduz tempo e aumenta rendimento
    const friendBonus = (this.friendship / 100) * 0.20; // até -20% tempo
    speedMult = Math.max(0.4, speedMult - friendBonus);
    
    return {
      extraYield,
      speedMult,
      doubleHarvestChance,
      energyRefund: this.skills.mestre_coletor ? 10 : 0,
      catMultiplier: cat.baseBonus?.gatherBonus || {},
      rareChanceBonus: (pers.rareFindBonus || 0) + (this.getSkillLevel('instinto_raro') * 0.25)
    };
  }

  getExplorerBonuses() {
    const pers = this.getPersonalityData();
    return {
      lootRareBonus: this.getSkillLevel('olhos_de_aguia') * 0.10 + (pers.rareFindBonus || 0),
      bonusGoldChance: this.getSkillLevel('radar_de_tesouro') * 0.15,
      rareMatChance: this.getSkillLevel('instinto_raro') * 0.25,
      playerGoldMult: this.skills.cacador_lendario ? 0.35 : 0,
      highRarityDropBonus: this.skills.cacador_lendario ? 0.20 : 0
    };
  }

  getCraftBonuses() {
    const cat = this.getCategoryData();
    const pers = this.getPersonalityData();
    let saveMaterialChance = this.getSkillLevel('economia_magica') * 0.15;
    let craftRareChance = this.getSkillLevel('forja_refinada') * 0.15 + (cat.baseBonus?.craftRareChance || 0) + (pers.craftQualityBonus || 0);
    let craftEpicChance = this.getSkillLevel('martelo_do_artifice') * 0.10 + (cat.baseBonus?.craftEpicChance || 0);
    let bonusAtkMult = this.getSkillLevel('martelo_do_artifice') * 0.15 + (cat.baseBonus?.craftBonus?.weaponAtk || 0);
    
    if (this.skills.obra_prima_celestial) {
      bonusAtkMult += 0.25;
      craftEpicChance += 0.15;
    }
    
    return {
      saveMaterialChance,
      craftRareChance,
      craftEpicChance,
      bonusAtkMult,
      stellarEnchant: Boolean(this.skills.obra_prima_celestial)
    };
  }

  getCompanionBonuses() {
    const cat = this.getCategoryData();
    const pers = this.getPersonalityData();
    
    let hpMult = this.getSkillLevel('aura_vitalidade') * 0.10 + (cat.baseBonus?.companionHp || 0);
    let hpRegen = this.getSkillLevel('aura_vitalidade') * 2 + (cat.baseBonus?.healAura || 0);
    let mpMult = this.getSkillLevel('harmonia_arcana') * 0.15 + (cat.baseBonus?.companionMp || 0);
    let mpRegen = this.getSkillLevel('harmonia_arcana') * 1.5;
    let defBonus = this.getSkillLevel('escudo_guardiao') * 6 + (cat.baseBonus?.companionDef || 0) + (pers.combatDefBonus || 0);
    let critBonus = this.getSkillLevel('escudo_guardiao') * 0.05;
    let speedBonus = 0;
    let atkBonus = pers.combatAtkBonus || 0;
    
    if (this.skills.uniao_das_almas) {
      speedBonus += 0.15;
      atkBonus += 10;
    }
    
    // Escala com amizade (até +25% de eficácia)
    const friendshipScale = 1.0 + (this.friendship / 100) * 0.25;
    
    return {
      hpMult: hpMult * friendshipScale,
      hpRegen: hpRegen * friendshipScale,
      mpMult: mpMult * friendshipScale,
      mpRegen: mpRegen * friendshipScale,
      defBonus: Math.round(defBonus * friendshipScale),
      critBonus: critBonus * friendshipScale,
      speedBonus,
      atkBonus: Math.round(atkBonus * friendshipScale),
      healOnKill: this.skills.uniao_das_almas ? 50 : 0
    };
  }

  update(dt) {
    super.update(dt);
    const player = GameState.player;
    if (!player) return;

    // Timers de balão e reações
    if (this.reactionTimer > 0) {
      this.reactionTimer -= dt;
      if (this.reactionTimer <= 0) this.reactionIcon = null;
    }
    if (this.bubbleTimer > 0) {
      this.bubbleTimer -= dt;
      if (this.bubbleTimer <= 0) this.bubbleDialogue = '';
    }

    // Decaimento suave de saciedade (1 ponto a cada 40s)
    this.satietyTimer += dt;
    if (this.satietyTimer >= 40) {
      this.satietyTimer = 0;
      if (this.satiety > 0) {
        this.satiety = Math.max(0, this.satiety - 1);
        this.updateMood();
      }
    }

    // Suporte de combate: cura de emergência se Herbalista
    if (this.category === 'herbalista' && this.state === 'following' && player.hp > 0 && player.hp < player.maxHp * 0.35) {
      this.combatSupportTimer += dt;
      if (this.combatSupportTimer >= 25) {
        this.combatSupportTimer = 0;
        player.hp = Math.min(player.maxHp, player.hp + 75);
        this.showReaction('💚', 2.5);
        this.say('Bálsamo Restaurador ativado! Cuide-se, mestre!', 3.0);
        UISystem.logMsg(`🌿 ${this.name} usou Bálsamo Restaurador em você (+75 HP)!`, 'sys');
        if (ParticleEffectsSystem?.addImpact) {
          ParticleEffectsSystem.addImpact(player.x, player.y, 'heal');
        }
        UISystem.updateHUD();
      }
    }

    // Suporte passivo: regeneração de HP do companheiro
    const comp = this.getCompanionBonuses();
    if (comp.hpRegen > 0 && this.state === 'following' && player.hp > 0 && player.hp < player.maxHp) {
      player.hp = Math.min(player.maxHp, player.hp + comp.hpRegen * dt);
    }

    // Comportamento por estado
    if (this.state === 'following') {
      const blend = 1 - Math.exp(-8 * dt);
      const targetX = player.facing === 'left' ? player.x + 32 : player.x - 32;
      const targetY = player.y - 24;
      this.x += (targetX - this.x) * blend;
      this.y += (targetY - this.y) * blend;
      this.y += Math.sin(GameState.elapsed * 4.5) * 10 * dt;
      
      // Regeneração de energia suave quando alimentado
      if (this.satiety > 50 && this.energy < this.maxEnergy) {
        this.energy = Math.min(this.maxEnergy, this.energy + dt * 0.5);
      }
    } else if (this.state === 'resting') {
      const pers = this.getPersonalityData();
      const restSpeed = (pers.restRegenBonus || 1.0) * 14.0;
      this.energy = Math.min(this.maxEnergy, this.energy + dt * restSpeed);
      this.updateMood();
      
      // Quando totalmente restaurado, volta a seguir
      if (this.energy >= this.maxEnergy) {
        this.energy = this.maxEnergy;
        this.state = 'following';
        this.say('Energia 100%! Pronto para voar ao seu lado!', 3.0);
        this.showReaction('✨', 2.5);
        UISystem.logMsg(`✨ ${this.name} descansou completamente e voltou a acompanhar você!`, 'sys');
        UISystem.updateSpritePanel();
      }
    }
  }

  draw(ctx, camera) {
    const sx = Math.round(this.x - camera.x);
    const sy = Math.round(this.y - camera.y);
    const cat = this.getCategoryData();
    const bob = Math.sin(GameState.elapsed * 5) * 3;
    const wingFlap = Math.sin(GameState.elapsed * 16) * 4;
    
    ctx.save();
    
    // 1. Sombra projetada no chão
    ctx.fillStyle = 'rgba(10, 18, 26, 0.35)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 18, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Aura mágica conforme Tier e Categoria
    if (this.tier >= 2 || this.mood === 'radiante') {
      const auraRadius = this.tier === 3 ? 18 : 13;
      const auraAlpha = 0.25 + Math.sin(GameState.elapsed * 6) * 0.12;
      ctx.fillStyle = cat.glowColor.replace('0.45', `${auraAlpha}`);
      ctx.beginPath();
      ctx.arc(sx, sy + bob, auraRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Efeitos de Tier 3: Orbes e Glifos Orbitais
    if (this.tier === 3) {
      for (let i = 0; i < 3; i++) {
        const orbitAngle = GameState.elapsed * 3 + (i * Math.PI * 2) / 3;
        const ox = sx + Math.cos(orbitAngle) * 18;
        const oy = sy + bob + Math.sin(orbitAngle) * 8;
        ctx.fillStyle = cat.color;
        ctx.beginPath();
        ctx.arc(ox, oy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Asinhas animadas
    ctx.fillStyle = 'rgba(235, 248, 255, 0.82)';
    ctx.strokeStyle = cat.color;
    ctx.lineWidth = 1;
    // Asa esquerda
    ctx.beginPath();
    ctx.ellipse(sx - 8 - Math.abs(wingFlap) * 0.5, sy + bob - 4, this.tier === 3 ? 10 : 7, this.tier === 3 ? 5 : 4, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Asa direita
    ctx.beginPath();
    ctx.ellipse(sx + 8 + Math.abs(wingFlap) * 0.5, sy + bob - 4, this.tier === 3 ? 10 : 7, this.tier === 3 ? 5 : 4, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 5. Corpo do Sprite (Forma Pixel Art Chibi)
    // Contorno
    ctx.fillStyle = '#18202b';
    ctx.fillRect(sx - 7, sy + bob - 7, 14, 14);
    // Corpo na cor da Categoria
    ctx.fillStyle = cat.color;
    ctx.fillRect(sx - 6, sy + bob - 6, 12, 12);
    
    // Olhos e Expressão
    if (this.state === 'resting') {
      // Olhinhos fechados dormindo
      ctx.fillStyle = '#18202b';
      ctx.fillRect(sx - 4, sy + bob - 2, 3, 1);
      ctx.fillRect(sx + 1, sy + bob - 2, 3, 1);
    } else {
      // Olhinhos expressivos
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - 4, sy + bob - 3, 3, 3);
      ctx.fillRect(sx + 1, sy + bob - 3, 3, 3);
      ctx.fillStyle = '#18202b';
      ctx.fillRect(sx - 3, sy + bob - 2, 2, 2);
      ctx.fillRect(sx + 2, sy + bob - 2, 2, 2);
      // Brilho dos olhos
      ctx.fillStyle = '#78f3e3';
      ctx.fillRect(sx - 4, sy + bob - 3, 1, 1);
      ctx.fillRect(sx + 1, sy + bob - 3, 1, 1);
    }
    // Bochechas rosadas
    ctx.fillStyle = '#ff8fa3';
    ctx.fillRect(sx - 5, sy + bob, 2, 1);
    ctx.fillRect(sx + 3, sy + bob, 2, 1);

    // 6. Adorno visual de Categoria e Tier
    if (this.tier >= 2) {
      ctx.fillStyle = '#f4c96a';
      // Mini coroa/tiara no topo
      ctx.fillRect(sx - 4, sy + bob - 10, 8, 2);
      ctx.fillRect(sx - 5, sy + bob - 12, 2, 2);
      ctx.fillRect(sx - 1, sy + bob - 13, 2, 3);
      ctx.fillRect(sx + 3, sy + bob - 12, 2, 2);
      // Gema central da coroa
      ctx.fillStyle = cat.color;
      ctx.fillRect(sx - 1, sy + bob - 11, 2, 2);
    }

    // 7. Reação visual (❤️, 💤, ⛏️, 🌟)
    if (this.reactionIcon) {
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.reactionIcon, sx, sy + bob - 18);
    } else if (this.state === 'resting') {
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#a1d8f7';
      ctx.textAlign = 'center';
      const zOffset = Math.sin(GameState.elapsed * 3) * 3;
      ctx.fillText('💤 zZ', sx + 12, sy + bob - 12 + zOffset);
    } else if (this.state === 'gathering') {
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⛏️', sx, sy + bob - 18);
    }

    // 8. Balão de fala flutuante
    if (this.bubbleDialogue) {
      ctx.font = '10px Georgia, serif';
      const textWidth = ctx.measureText(this.bubbleDialogue).width;
      const bw = Math.min(180, Math.max(70, textWidth + 14));
      const bh = 22;
      const bx = sx - bw / 2;
      const by = sy + bob - 44;

      ctx.fillStyle = 'rgba(10, 28, 31, 0.94)';
      ctx.strokeStyle = '#d2aa59';
      ctx.lineWidth = 1.5;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);

      // Ponta do balão
      ctx.fillStyle = '#d2aa59';
      ctx.beginPath();
      ctx.moveTo(sx - 3, by + bh);
      ctx.lineTo(sx + 3, by + bh);
      ctx.lineTo(sx, by + bh + 4);
      ctx.fill();

      ctx.fillStyle = '#fff6d5';
      ctx.textAlign = 'center';
      ctx.fillText(this.bubbleDialogue, sx, by + 14, bw - 8);
    }

    // 9. Nome e Nível do Sprite
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.name} [Lv.${this.level}]`, sx, sy + bob + 16);

    ctx.restore();
  }

  toSaveData() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      personality: this.personality,
      title: this.title,
      lore: this.lore,
      level: this.level,
      xp: this.xp,
      xpNext: this.xpNext,
      tier: this.tier,
      skillPoints: this.skillPoints,
      skills: this.skills,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      satiety: this.satiety,
      friendship: this.friendship,
      mood: this.mood,
      specialty: this.specialty,
      state: this.state,
      totalGathered: this.totalGathered,
      totalCrafted: this.totalCrafted,
      gatherTimer: this.gatherTimer,
      taskDuration: this.taskDuration,
      taskName: this.taskName,
      gatherType: this.gatherType,
      taskReward: this.taskReward
    };
  }

  loadSaveData(data) {
    if (!data) return;
    Object.assign(this, data);
    this.tier = this.calculateTier();
    this.maxEnergy = this.maxEnergy || Math.min(150, 100 + (this.level - 1) * 2);
    this.skills = this.skills || {};
    this.satiety = this.satiety ?? 80;
    this.friendship = this.friendship ?? 25;
    this.updateMood();
  }
}
