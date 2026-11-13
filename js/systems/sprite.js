import { GameState } from '../core/gameState.js';
import { UISystem } from '../ui/ui.js';
import { IMAGES, SPRITES } from '../data/assets.js';
import { DEFAULT_SPRITES, SPRITE_CATEGORIES } from '../data/spriteData.js';
import { Pet } from '../entities/pet.js';
import { InventorySystem } from './inventory.js';
import { ITEMS_DB } from '../data/items.js';
import { EquipmentSystem } from './equipment.js';

export class SpriteSystem {
  static draw(ctx, key, x, y, options = {}) {
    const definition = SPRITES[key];
    const image = IMAGES[key];
    if (!definition || !image?.complete) return;
    const stateFrames = definition.states?.[options.state] || definition.states?.idle || [0];
    const frame = stateFrames[options.frame % stateFrames.length];
    const width = options.width || options.size || definition.drawSize;
    const height = options.height || options.size || definition.drawSize;
    const anchorY = options.anchorY ?? height / 2;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (options.facing === 'left') ctx.scale(-1, 1);
    ctx.drawImage(image, frame * definition.frameSize, 0, definition.frameSize, definition.frameSize,
      -Math.floor(width / 2), -Math.floor(anchorY), width, height);
    ctx.restore();
  }

  static initSprites() {
    if (!GameState.sprites || GameState.sprites.length === 0) {
      GameState.sprites = [];
      const defaultLumi = new Pet(800, 600, DEFAULT_SPRITES[0]);
      GameState.sprites.push(defaultLumi);
      GameState.pet = defaultLumi;
      GameState.activeSpriteId = defaultLumi.id;
    } else if (!GameState.pet) {
      GameState.pet = GameState.sprites[0];
      GameState.activeSpriteId = GameState.sprites[0].id;
    }
  }

  static getSprite(id) {
    if (!GameState.sprites) return null;
    return GameState.sprites.find(s => s.id === id) || (GameState.pet?.id === id ? GameState.pet : null);
  }

  static setActiveSprite(id) {
    const sprite = this.getSprite(id);
    if (!sprite) {
      UISystem.logMsg('Sprite não encontrado.', 'dmg');
      return false;
    }
    if (GameState.pet && GameState.pet.id === sprite.id) {
      UISystem.logMsg(`${sprite.name} já é seu companheiro ativo!`, 'sys');
      return true;
    }

    // Posicionar novo companheiro perto do jogador
    if (GameState.player) {
      sprite.x = GameState.player.x - 20;
      sprite.y = GameState.player.y - 20;
    }

    GameState.pet = sprite;
    GameState.activeSpriteId = sprite.id;
    sprite.showReaction('✨', 2.5);
    sprite.say(`Estou aqui com você, mestre! Vamos juntos!`, 3.0);
    UISystem.logMsg(`🌟 ${sprite.name} agora é seu companheiro ativo!`, 'gold');

    // Atualizar bônus de companheiro no personagem
    EquipmentSystem.recalcStats();
    UISystem.updateSpritePanel();
    if (UISystem.updateSpriteManagerModal) {
      UISystem.updateSpriteManagerModal();
    }
    return true;
  }

  static adoptSprite(spriteData) {
    if (!GameState.sprites) GameState.sprites = [];
    if (GameState.sprites.some(s => s.id === spriteData.id)) {
      UISystem.logMsg(`Você já possui o Sprite ${spriteData.name}!`, 'dmg');
      return false;
    }

    const adoptCost = 50;
    if (GameState.player.gold < adoptCost) {
      UISystem.logMsg(`Ouro insuficiente para despertar este Sprite (${adoptCost} Ouro necessário).`, 'dmg');
      return false;
    }

    GameState.player.gold -= adoptCost;
    const newSprite = new Pet(GameState.player.x, GameState.player.y, spriteData);
    GameState.sprites.push(newSprite);

    UISystem.logMsg(`🎉 Você despertou o Sprite ${newSprite.name} (${newSprite.getCategoryData().name})!`, 'gold');
    newSprite.showReaction('🌟', 3.0);
    newSprite.say(`Muito prazer, mestre! Eu sou ${newSprite.name}!`, 3.5);

    UISystem.updateHUD();
    UISystem.updateSpritePanel();
    if (UISystem.updateSpriteManagerModal) {
      UISystem.updateSpriteManagerModal();
    }
    return true;
  }

  static startGathering(type, duration, name, spriteId = null) {
    const sprite = spriteId ? this.getSprite(spriteId) : GameState.pet;
    if (!sprite) {
      UISystem.logMsg('Nenhum Sprite selecionado para a tarefa.', 'dmg');
      return;
    }
    if (sprite.state === 'gathering') {
      UISystem.logMsg(`${sprite.name} já está em uma expedição de coleta!`, 'dmg');
      return;
    }
    if (sprite.state === 'resting') {
      UISystem.logMsg(`${sprite.name} está descansando. Acorde-o antes de enviar em missão.`, 'dmg');
      return;
    }

    const pers = sprite.getPersonalityData();
    const bonuses = sprite.getGatherBonuses();
    
    // Custo de energia base 15, reduzido por Trabalhador
    const baseEnergyCost = Math.round(15 * (pers.energyCostMultiplier || 1.0));
    if (sprite.energy < baseEnergyCost) {
      UISystem.logMsg(`${sprite.name} não tem energia suficiente (${sprite.energy}/${baseEnergyCost}). Alimente-o ou envie-o para descansar!`, 'dmg');
      return;
    }

    // Duração ajustada por nível, amizade e especialização Coletor
    let calculatedDuration = Math.max(2, (duration / 60) * bonuses.speedMult * (1 - Math.min(0.35, (sprite.level - 1) * 0.04)));
    
    // Estimar recompensa
    const minYield = 1 + bonuses.extraYield;
    const maxYield = Math.max(minYield + 1, 2 + sprite.level + bonuses.extraYield);

    sprite.state = 'gathering';
    sprite.gatherTimer = calculatedDuration;
    sprite.taskDuration = calculatedDuration;
    sprite.taskName = name;
    sprite.gatherType = type;
    sprite.taskReward = `${minYield}-${maxYield} ${name}`;
    sprite.energy = Math.max(0, sprite.energy - baseEnergyCost);
    sprite.updateMood();

    sprite.showReaction('⛏️', 2.0);
    const gatherDialogues = pers.dialogues?.gather || [`Partindo para coletar ${name}!`];
    sprite.say(gatherDialogues[Math.floor(Math.random() * gatherDialogues.length)], 3.0);

    // Desabilitar botões rápidos no HUD se for o pet ativo
    if (sprite === GameState.pet) {
      document.querySelectorAll('[id^="btnGather"]').forEach(button => { button.disabled = true; });
    }

    UISystem.logMsg(`⛏️ ${sprite.name} iniciou expedição de ${name} (${calculatedDuration.toFixed(1)}s).`, 'sys');
    UISystem.updateSpritePanel();
    if (UISystem.updateSpriteManagerModal) {
      UISystem.updateSpriteManagerModal();
    }
  }

  static update(dt) {
    if (!GameState.sprites || GameState.sprites.length === 0) return;
    const player = GameState.player;

    for (const sprite of GameState.sprites) {
      // Se não for o pet ativo, executa sua própria rotina de atualização (ex: descanso, saciedade)
      if (sprite !== GameState.pet) {
        sprite.update(dt);
      }

      if (sprite.state !== 'gathering') continue;

      // Animação de acompanhamento do pet ativo durante coleta
      if (sprite === GameState.pet && player) {
        const blend = 1 - Math.exp(-5 * dt);
        sprite.x += (player.x + 60 - sprite.x) * blend;
        sprite.y += (player.y - 45 - sprite.y) * blend;
      }

      sprite.gatherTimer -= dt;
      if (sprite.gatherTimer > 0) continue;

      // Conclusão da coleta!
      sprite.state = 'following';
      const bonuses = sprite.getGatherBonuses();
      const expBonuses = sprite.getExplorerBonuses();
      const cat = sprite.getCategoryData();

      // Quantidade base
      let amount = Math.floor(Math.random() * (2 + sprite.level)) + 1 + bonuses.extraYield;
      
      // Bônus de afinidade da categoria (ex: Minerador ganha +35% de minérios)
      if (cat.preferredGather === sprite.gatherType || cat.preferredGather === 'any') {
        const catMult = cat.baseBonus?.gatherBonus?.[sprite.gatherType] || 1.35;
        amount = Math.round(amount * catMult);
      }

      // Toque da Terra: chance de dobro
      let doubled = false;
      if (Math.random() < bonuses.doubleHarvestChance) {
        amount *= 2;
        doubled = true;
      }

      if (player && player.materials && player.materials[sprite.gatherType] !== undefined) {
        player.materials[sprite.gatherType] += amount;
      }

      // Reembolso de energia do Mestre Coletor
      if (bonuses.energyRefund > 0) {
        sprite.energy = Math.min(sprite.maxEnergy, sprite.energy + bonuses.energyRefund);
      }

      // Explorador: Chance de encontrar Ouro bônus
      let bonusGold = 0;
      if (Math.random() < expBonuses.bonusGoldChance) {
        bonusGold = Math.floor(Math.random() * 25) + 15;
        player.gold += bonusGold;
      }

      // Explorador: Chance de achar materiais raros (Cristal Arcano, Pepita de Ouro, Essência de Safael)
      let foundRare = null;
      if (Math.random() < expBonuses.rareMatChance) {
        const rareKeys = ['cristal_arcano', 'pepita_ouro', 'essencia_safael'];
        const chosenKey = rareKeys[Math.floor(Math.random() * rareKeys.length)];
        const rareItem = ITEMS_DB[chosenKey];
        if (rareItem && InventorySystem.addItem({ ...rareItem, quantity: 1 })) {
          foundRare = rareItem.name;
        }
      }

      // Progressão do Sprite
      sprite.addExperience(16 + sprite.level * 2);
      sprite.gainFriendship(2);
      sprite.totalGathered += amount;
      sprite.showReaction('🌟', 2.5);
      
      let msg = `✨ ${sprite.name} voltou com ${amount}x ${sprite.taskName}!`;
      if (doubled) msg += ' (Colheita Duplicada! 🌾)';
      if (bonusGold > 0) msg += ` (+${bonusGold} Ouro encontrado! 💰)`;
      if (foundRare) msg += ` (+Tesouro Raro: ${foundRare}! 💎)`;
      
      UISystem.logMsg(msg, 'gold');
      sprite.say(`Missão cumprida! Trouxe bastante ${sprite.taskName}!`, 3.0);

      // Reabilitar botões no HUD se for o pet ativo
      if (sprite === GameState.pet) {
        document.querySelectorAll('[id^="btnGather"]').forEach(button => { button.disabled = false; });
      }

      UISystem.updateHUD();
      UISystem.updateSpritePanel();
      if (UISystem.updateSpriteManagerModal) {
        UISystem.updateSpriteManagerModal();
      }
    }
  }

  static addExperience(pet, amount) {
    if (!pet) return;
    pet.addExperience(amount);
  }
}
