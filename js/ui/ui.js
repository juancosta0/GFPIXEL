import { CONFIG } from '../data/config.js';
import { GameState } from '../core/gameState.js';
import { SPRITE_CATEGORIES, SPRITE_PERSONALITIES, SPRITE_SKILL_TREE, SPRITE_FOODS, DEFAULT_SPRITES } from '../data/spriteData.js';
import { SpriteSystem } from '../systems/sprite.js';
import { CraftingSystem } from '../systems/crafting.js';
import { BIOMES, WORLD_REGIONS } from '../data/worldMapData.js';
import { SceneManager } from '../core/sceneManager.js';

export class UISystem {
  static currentSpriteTab = 'overview';
  static selectedSpriteForWork = null;
  static currentMapFilter = 'all';

  static init() {
    const grid = document.getElementById('invGrid');
    if (grid) {
      grid.innerHTML = '';
      for (let i = 0; i < CONFIG.INV_MAX_SLOTS; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot'; 
        slot.id = 'inv-slot-' + i;
        slot.onclick = () => window.GameAPI.useItem(i);
        grid.appendChild(slot);
      }
    }
    this.updateHUD();
    this.updateUI();
    this.updateSpritePanel();
  }

  static updateHUD() {
    if (!GameState.player) return;
    const p = GameState.player;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    
    const hpFill = document.getElementById('hpFill');
    if (hpFill) hpFill.style.width = (p.hp / p.maxHp * 100) + '%';
    const mpFill = document.getElementById('mpFill');
    if (mpFill) mpFill.style.width = (p.mp / p.maxMp * 100) + '%';
    const expFill = document.getElementById('expFill');
    if (expFill) expFill.style.width = (p.exp / p.expNext * 100) + '%';

    set('pLv', p.lv);
    set('pGold', p.gold);
    set('pAtk', p.atk);

    const boss = GameState.enemies.find(enemy => enemy.alive && enemy.base.type === 'boss');
    const bossBar = document.getElementById('bossBar');
    if (bossBar) {
      bossBar.hidden = !boss;
      if (boss) {
        set('bossName', `${boss.base.name} · Fase ${boss.bossPhase}`);
        const bossFill = document.getElementById('bossFill');
        if (bossFill) bossFill.style.width = `${Math.max(0, boss.hp / boss.base.maxHp * 100)}%`;
      }
    }
    const tracker = document.getElementById('questTracker');
    if (tracker) {
      const quest = Object.values(GameState.quests || {}).find(item => item.status === 'active' || item.status === 'completed');
      tracker.hidden = !quest;
      if (quest) {
        const secondary = quest.secondary ? ` · ${quest.secondaryProgress}/${quest.secondary.required}` : '';
        tracker.innerHTML = `<strong>${quest.status === 'completed' ? 'OBJETIVO CONCLUÍDO' : quest.name}</strong><span>${quest.progress}/${quest.objective.required}${secondary}</span>`;
      }
    }
    (p.skillCds || []).forEach((cooldown, index) => {
      const slot = document.querySelector(`[data-skill="${index}"]`);
      if (!slot) return;
      slot.classList.toggle('on-cooldown', cooldown > 0);
      let indicator = slot.querySelector('.cooldown');
      if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'cooldown';
        slot.appendChild(indicator);
      }
      indicator.textContent = cooldown > 0 ? cooldown.toFixed(1) : '';
    });
    
    set('mMinerals', p.materials.minerals);
    set('mWood', p.materials.wood);
    set('mHerbs', p.materials.herbs);
    const hint = document.getElementById('interactionHint');
    if (hint) {
      const target = p.interactionTarget;
      hint.classList.toggle('visible', Boolean(target));
      if (target) {
        const span = hint.querySelector('span');
        if (span) {
          if (target.type === 'chest') span.textContent = 'Abrir baú';
          else if (target.type === 'ore_node') span.textContent = 'Minerar veio de minério';
          else if (target.type === 'wood_node') span.textContent = 'Extrair madeira';
          else if (target.type === 'herb_node') span.textContent = 'Colher ervas místicas';
          else span.textContent = target.text?.replace('E - ', '') || `Interagir com ${target.name}`;
        }
      }
    }
  }

  static updateUI() {
    if (!GameState.player) return;
    // Inventario
    for (let i = 0; i < CONFIG.INV_MAX_SLOTS; i++) {
      const slot = document.getElementById('inv-slot-' + i);
      if (!slot) continue;
      if (i < GameState.inventory.length) {
        const item = GameState.inventory[i];
        const stats = item.stats || { attack: item.bonusAtk, hp: item.bonusHp };
        const statsHtml = stats.attack ? `<br><span class="item-stats">+${stats.attack} Atk</span>` : stats.hp ? `<br><span class="item-stats">+${stats.hp} HP</span>` : '';
        const equipped = GameState.player.equipment[item.type];
        const equippedStats = equipped?.stats || {};
        const comparison = equipped ? `\nAtual: ${equipped.name} | Atk ${equippedStats.attack || 0} -> ${stats.attack || 0} | HP ${equippedStats.hp || 0} -> ${stats.hp || 0}` : '';
        slot.title = `${item.name}\n${item.description || ''}\nNível ${item.level || 1}${comparison}`;
        slot.innerHTML = `<span class="rarity-${item.rarity || 'common'}">${item.icon || ''} ${item.name}</span>${statsHtml}${item.quantity > 1 ? `<span class="item-stats">x${item.quantity}</span>` : ''}`;
      } else {
        slot.innerHTML = '';
        slot.title = '';
      }
    }
    
    // Equipamentos
    ['weapon', 'armor', 'accessory'].forEach(type => {
      const slot = document.getElementById('eq-' + type);
      if (!slot) return;
      const item = GameState.player.equipment[type];
      const label = type === 'weapon' ? 'Arma' : type === 'armor' ? 'Armadura' : 'Acessório';
      
      if (item) {
        const stats = item.stats || { attack: item.bonusAtk, hp: item.bonusHp };
        let statsHtml = stats.attack ? `<br><span class="item-stats">+${stats.attack} Atk</span>` : (stats.hp ? `<br><span class="item-stats">+${stats.hp} HP</span>` : '');
        slot.innerHTML = `<span class="equip-label">${label}</span><br><span class="rarity-${item.rarity || 'common'}">${item.name}</span>${statsHtml}`;
      } else {
        slot.innerHTML = `<span class="equip-label">${label}</span><br>Vazio`;
      }
    });
  }

  static updateSpritePanel() {
    const pet = GameState.pet;
    if (!pet) return;
    const set = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
    const cat = pet.getCategoryData ? pet.getCategoryData() : SPRITE_CATEGORIES.minerador;
    
    set('spriteName', `${cat.icon} ${pet.name}`);
    set('spriteLevel', `Lv. ${pet.level} (T${pet.tier || 1})`);
    set('spriteXp', `${pet.xp}/${pet.xpNext}`);
    set('spriteEnergy', `${Math.round(pet.energy)}%`);
    set('spriteTask', pet.state === 'gathering' ? pet.taskName : pet.state === 'resting' ? 'Descansando (Cabana)' : 'Seguindo');
    set('spriteTime', pet.state === 'gathering' ? `${Math.max(0, pet.gatherTimer).toFixed(1)}s` : '-');
    set('spriteReward', pet.taskReward || '-');

    // Elementos adicionais do HUD aprimorado se presentes
    const moodEl = document.getElementById('spriteMood');
    if (moodEl) {
      const moodIcons = { radiante: '❤️ Radiante', feliz: '😊 Feliz', calmo: '🕊️ Sereno', cansado: '😴 Cansado', faminto: '🍖 Faminto' };
      moodEl.textContent = moodIcons[pet.mood] || pet.mood;
    }
    const friendEl = document.getElementById('spriteFriendship');
    if (friendEl && pet.getFriendshipTitle) {
      friendEl.textContent = `${pet.getFriendshipTitle()} (${pet.friendship}/100)`;
    }
    const satietyEl = document.getElementById('spriteSatiety');
    if (satietyEl) {
      satietyEl.textContent = `${pet.satiety}%`;
    }
  }

  static toggleWindow(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
    if (el.style.display === 'flex') {
      this.updateUI();
    }
  }

  static toggleSpriteManager(tab = null) {
    const dialog = document.getElementById('spriteManagerModal');
    if (!dialog) return;

    if (dialog.open) {
      dialog.close();
    } else {
      dialog.showModal();
      if (tab) {
        this.switchSpriteTab(tab);
      } else {
        this.switchSpriteTab(this.currentSpriteTab || 'overview');
      }
      this.updateSpriteManagerModal();
    }
  }

  static toggleWorldMap() {
    const dialog = document.getElementById('worldMapModal');
    if (!dialog) return;

    if (dialog.open) {
      dialog.close();
    } else {
      dialog.showModal();
      this.updateWorldMapModal();
    }
  }

  static setWorldMapFilter(filter) {
    this.currentMapFilter = filter;
    document.querySelectorAll('.wm-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.updateWorldMapModal();
  }

  static fastTravel(sceneId) {
    const currentScene = GameState.currentScene;
    if (currentScene && currentScene.combatAllowed) {
      this.logMsg('Você só pode iniciar Viagem Rápida a partir de uma Cidade ou área pacífica!', 'dmg');
      return;
    }
    const region = WORLD_REGIONS[sceneId];
    if (!region) return;
    const discovered = (GameState.discoveredScenes || []).includes(sceneId);
    if (!discovered) {
      this.logMsg('Região ainda não descoberta!', 'dmg');
      return;
    }

    this.toggleWorldMap();
    SceneManager.loadScene(sceneId, 800, 600);
    this.logMsg(`✨ Viajou rapidamente para ${region.name}!`, 'gold');
  }

  static updateWorldMapModal() {
    const dialog = document.getElementById('worldMapModal');
    if (!dialog || !dialog.open) return;

    const discoveredList = GameState.discoveredScenes || ['cidade'];
    const currentSceneId = GameState.currentScene?.id || 'cidade';
    const totalRegions = Object.keys(WORLD_REGIONS).length;
    const discoveredCount = discoveredList.length;

    const countEl = document.getElementById('wmDiscoveredCount');
    if (countEl) countEl.textContent = `${discoveredCount} / ${totalRegions}`;
    
    const discoveredBiomes = new Set();
    discoveredList.forEach(id => {
      const r = WORLD_REGIONS[id];
      if (r) discoveredBiomes.add(r.biome);
    });
    const biomesEl = document.getElementById('wmBiomesCount');
    if (biomesEl) biomesEl.textContent = `${discoveredBiomes.size} / ${Object.keys(BIOMES).length}`;

    const container = document.getElementById('wmRegionsGrid');
    if (!container) return;

    let html = '';
    for (const [id, region] of Object.entries(WORLD_REGIONS)) {
      if (this.currentMapFilter && this.currentMapFilter !== 'all' && region.biome !== this.currentMapFilter) {
        continue;
      }

      const isCurrent = id === currentSceneId;
      const isDiscovered = discoveredList.includes(id);
      let isUnlocked = true;
      if (region.unlockReq && !GameState.flags?.[region.unlockReq]) {
        isUnlocked = false;
      }

      const biomeData = BIOMES[region.biome] || BIOMES.city;
      let statusBadge = '';
      let cardClass = '';

      if (isCurrent) {
        cardClass = 'current-location';
        statusBadge = '<span class="wm-status-badge here">📍 Você está aqui</span>';
      } else if (isDiscovered) {
        cardClass = 'discovered';
        statusBadge = '<span class="wm-status-badge discovered">✓ Descoberta</span>';
      } else if (isUnlocked) {
        cardClass = 'available';
        statusBadge = '<span class="wm-status-badge available">✨ Disponível para Exploração</span>';
      } else {
        cardClass = 'locked';
        statusBadge = '<span class="wm-status-badge locked">🔒 Bloqueada</span>';
      }

      const canFastTravel = isDiscovered && !GameState.currentScene?.combatAllowed && region.biome === 'city';

      html += `
        <div class="wm-region-card ${cardClass}" style="border-left: 4px solid ${region.color};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span class="wm-region-title">${region.icon} ${isDiscovered || isUnlocked ? region.name : 'Região Inexplorada'}</span>
              <div style="font-size:10px; color:#c5d8d1; margin-top:2px;">
                <span style="color:${biomeData.color}">${biomeData.icon} ${region.biomeName}</span> · <span style="color:#f1c40f">Nível Recomendado: Lv. ${region.recLevel}</span>
              </div>
            </div>
            ${statusBadge}
          </div>

          <p class="wm-region-desc">
            ${isDiscovered ? region.desc : isUnlocked ? 'Esta região está conectada a Safael e pronta para ser explorada.' : `Bloqueada. Requisito: ${region.unlockDesc || 'Progresso em missões'}.`}
          </p>

          ${(isDiscovered || isUnlocked) ? `
            <div class="wm-region-details">
              <div><strong>Pontos Notáveis:</strong> ${region.features.join(' · ')}</div>
              <div><strong>Criaturas Nativas:</strong> ${region.monsters.join(' · ')}</div>
              <div><strong>Recursos Abundantes:</strong> ${region.resources.join(' · ')}</div>
            </div>
          ` : ''}

          <div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center;">
            ${!isUnlocked ? `<span style="font-size:10px; color:#ff8080">🔒 ${region.unlockDesc}</span>` : '<span></span>'}
            ${canFastTravel && !isCurrent ? `<button class="sprite-btn" style="width:auto; padding:3px 10px;" onclick="GameAPI.fastTravel('${id}')">Teleportar (Viagem Rápida)</button>` : ''}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  static switchSpriteTab(tabName) {
    this.currentSpriteTab = tabName;
    const tabButtons = document.querySelectorAll('.sm-tab-btn');
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    const panes = document.querySelectorAll('.sm-tab-pane');
    panes.forEach(pane => {
      pane.style.display = pane.id === `sm-pane-${tabName}` ? 'block' : 'none';
    });

    this.updateSpriteManagerModal();
  }

  static updateSpriteManagerModal() {
    const dialog = document.getElementById('spriteManagerModal');
    if (!dialog || !dialog.open) return;

    const pet = GameState.pet;
    if (!pet) return;

    const cat = pet.getCategoryData ? pet.getCategoryData() : SPRITE_CATEGORIES.minerador;
    const pers = pet.getPersonalityData ? pet.getPersonalityData() : SPRITE_PERSONALITIES.trabalhador;

    // Header do Modal
    const titleEl = document.getElementById('smHeaderName');
    if (titleEl) titleEl.textContent = `${pet.name} — ${cat.title}`;
    const badgeEl = document.getElementById('smHeaderBadges');
    if (badgeEl) {
      badgeEl.innerHTML = `
        <span class="sm-badge" style="border-color:${cat.color}; color:${cat.color}">${cat.icon} ${cat.name}</span>
        <span class="sm-badge" style="border-color:#f1d17a; color:#f1d17a">${pers.icon} ${pers.name}</span>
        <span class="sm-badge" style="border-color:#80a8ff; color:#80a8ff">Tier ${pet.tier} (Lv. ${pet.level})</span>
        <span class="sm-badge" style="border-color:#ff8fa3; color:#ff8fa3">Amizade: ${pet.getFriendshipTitle()} (${pet.friendship}%)</span>
      `;
    }

    // Atualizar aba ativa
    if (this.currentSpriteTab === 'overview') {
      this.renderOverviewTab(pet, cat, pers);
    } else if (this.currentSpriteTab === 'skills') {
      this.renderSkillsTab(pet);
    } else if (this.currentSpriteTab === 'feeding') {
      this.renderFeedingTab(pet);
    } else if (this.currentSpriteTab === 'work') {
      this.renderWorkTab(pet);
    } else if (this.currentSpriteTab === 'roster') {
      this.renderRosterTab(pet);
    }
  }

  static renderOverviewTab(pet, cat, pers) {
    const pane = document.getElementById('sm-pane-overview');
    if (!pane) return;

    const comp = pet.getCompanionBonuses ? pet.getCompanionBonuses() : {};
    const moodIcons = { radiante: '❤️ Radiante', feliz: '😊 Feliz', calmo: '🕊️ Sereno', cansado: '😴 Cansado', faminto: '🍖 Faminto' };

    pane.innerHTML = `
      <div class="sm-overview-grid">
        <div class="sm-card sm-avatar-card">
          <div class="sm-avatar-preview" style="background:radial-gradient(circle, ${cat.glowColor} 0%, rgba(10,25,30,0.8) 70%)">
            <span style="font-size:42px">${cat.icon}</span>
            <div class="sm-tier-tag">Forma Visual: Tier ${pet.tier} (${pet.level < 10 ? 'Bebê' : pet.level < 20 ? 'Evoluído' : 'Guardião Supremo'})</div>
          </div>
          <h3 style="margin-top:8px; color:#f1d17a">${pet.name}</h3>
          <p style="font-size:11px; color:#c5d8d1; margin-bottom:10px">${pet.lore || cat.description}</p>
          
          <div class="sm-button-group">
            <button class="sprite-btn" onclick="GameAPI.petSprite('${pet.id}')">🥰 Acariciar (Carinho)</button>
            <button class="sprite-btn" onclick="GameAPI.toggleRestSprite('${pet.id}')">${pet.state === 'resting' ? '☀️ Acordar e Seguir' : '💤 Enviar para Descansar'}</button>
          </div>
        </div>

        <div class="sm-card">
          <h4 style="color:#f1d17a; border-bottom:1px solid #45696b; padding-bottom:4px; margin-bottom:8px">📊 Estado e Vínculo</h4>
          
          <div class="sm-stat-bar-group">
            <div class="sm-bar-label"><span>Nível ${pet.level} (EXP)</span> <span>${pet.xp} / ${pet.xpNext}</span></div>
            <div class="bar"><div style="background:linear-gradient(#f4dc84, #ba793e); width:${Math.min(100, pet.xp / pet.xpNext * 100)}%"></div></div>
          </div>

          <div class="sm-stat-bar-group">
            <div class="sm-bar-label"><span>Energia</span> <span>${Math.round(pet.energy)} / ${pet.maxEnergy}</span></div>
            <div class="bar"><div style="background:linear-gradient(#78e7e2, #277b8b); width:${Math.min(100, pet.energy / pet.maxEnergy * 100)}%"></div></div>
          </div>

          <div class="sm-stat-bar-group">
            <div class="sm-bar-label"><span>Saciedade</span> <span>${pet.satiety} / 100</span></div>
            <div class="bar"><div style="background:linear-gradient(#f2a365, #d95a65); width:${pet.satiety}%"></div></div>
          </div>

          <div class="sm-stat-bar-group">
            <div class="sm-bar-label"><span>Amizade (${pet.getFriendshipTitle()})</span> <span>${pet.friendship} / 100</span></div>
            <div class="bar"><div style="background:linear-gradient(#ff8fa3, #c95c77); width:${pet.friendship}%"></div></div>
          </div>

          <div style="margin-top:10px; font-size:11px; color:#d4d4d8; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div><strong>Humor:</strong> ${moodIcons[pet.mood] || pet.mood}</div>
            <div><strong>Estado:</strong> ${pet.state === 'gathering' ? `⛏️ Coletando (${pet.gatherTimer.toFixed(1)}s)` : pet.state === 'resting' ? '💤 Na Cabana' : '👣 Acompanhando'}</div>
            <div><strong>Total Coletado:</strong> ${pet.totalGathered || 0} itens</div>
            <div><strong>Total Forjado:</strong> ${pet.totalCrafted || 0} armas</div>
          </div>
        </div>

        <div class="sm-card sm-full-col">
          <h4 style="color:#78f3e3; border-bottom:1px solid #45696b; padding-bottom:4px; margin-bottom:8px">🛡️ Benefícios Ativos no Jogador (Especialização Companheiro)</h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:8px; font-size:11px;">
            <div class="sm-bonus-box"><b>+${Math.round(comp.hpMult * 100 || 0)}%</b> HP Máximo (+${(comp.hpRegen || 0).toFixed(1)}/s)</div>
            <div class="sm-bonus-box"><b>+${Math.round(comp.mpMult * 100 || 0)}%</b> MP Máximo (+${(comp.mpRegen || 0).toFixed(1)}/s)</div>
            <div class="sm-bonus-box"><b>+${comp.defBonus || 0}</b> Defesa do Jogador</div>
            <div class="sm-bonus-box"><b>+${comp.atkBonus || 0}</b> Ataque Bônus</div>
            <div class="sm-bonus-box"><b>+${Math.round((comp.critBonus || 0) * 100)}%</b> Chance de Crítico</div>
            <div class="sm-bonus-box"><b>+${Math.round((comp.speedBonus || 0) * 100)}%</b> Velocidade de Movimento</div>
          </div>
          <div style="margin-top:8px; font-size:11px; color:#f1d17a">
            <strong>Habilidade Exclusiva de ${cat.name}:</strong> [${cat.exclusiveSkill.name}] — ${cat.exclusiveSkill.desc}
          </div>
        </div>
      </div>
    `;
  }

  static renderSkillsTab(pet) {
    const pane = document.getElementById('sm-pane-skills');
    if (!pane) return;

    let branchesHtml = '';
    for (const [branchKey, branch] of Object.entries(SPRITE_SKILL_TREE)) {
      let skillsHtml = '';
      for (const skill of branch.skills) {
        const curLvl = pet.skills[skill.id] || 0;
        const isMax = curLvl >= skill.maxLevel;
        const hasReq = !skill.requires || (pet.skills[skill.requires] || 0) >= 1;
        const canAfford = pet.skillPoints >= skill.cost;
        const canLearn = !isMax && hasReq && canAfford;

        let statusText = isMax ? '<span style="color:#78f3e3">✓ Nível Máximo</span>' : `Nível ${curLvl}/${skill.maxLevel} (Custo: ${skill.cost} Pt)`;
        if (!hasReq) statusText = `<span style="color:#ff8080">Requer ${branch.skills.find(s=>s.id===skill.requires)?.name}</span>`;

        skillsHtml += `
          <div class="sm-skill-card ${curLvl > 0 ? 'learned' : ''} ${!hasReq ? 'locked' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="color:#f1d17a">${skill.name}</strong>
              <span class="sm-skill-tier">T${skill.tier}</span>
            </div>
            <p style="font-size:10px; color:#c5d8d1; margin:4px 0;">${skill.desc}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
              <span style="font-size:10px">${statusText}</span>
              ${!isMax ? `<button class="sm-btn-upgrade" ${!canLearn ? 'disabled' : ''} onclick="GameAPI.learnSpriteSkill('${branchKey}', '${skill.id}', '${pet.id}')">${curLvl > 0 ? 'Aprimorar' : 'Aprender'}</button>` : ''}
            </div>
          </div>
        `;
      }

      branchesHtml += `
        <div class="sm-branch-col">
          <div class="sm-branch-header">
            <h4>${branch.icon} ${branch.name.replace('Especialização: ', '')}</h4>
            <p style="font-size:10px; color:#a1a1aa">${branch.description}</p>
          </div>
          <div class="sm-skills-list">${skillsHtml}</div>
        </div>
      `;
    }

    pane.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:6px 10px; background:#0e2428; border:1px solid #45696b;">
        <div>
          <strong style="color:#f1d17a; font-size:13px">Pontos de Especialização Disponíveis:</strong>
          <span style="font-size:14px; font-weight:bold; color:#78f3e3; margin-left:6px">${pet.skillPoints} Pts</span>
        </div>
        <span style="font-size:10px; color:#a1a1aa">Ganha 1 ponto a cada nível do Sprite para distribuir livremente entre as 4 áreas.</span>
      </div>
      <div class="sm-branches-grid">${branchesHtml}</div>
    `;
  }

  static renderFeedingTab(pet) {
    const pane = document.getElementById('sm-pane-feeding');
    if (!pane) return;

    let foodsHtml = '';
    for (const [foodKey, food] of Object.entries(SPRITE_FOODS)) {
      const canAfford = GameState.player.gold >= food.costGold;
      foodsHtml += `
        <div class="sm-food-card">
          <div style="display:flex; gap:10px; align-items:center;">
            <span style="font-size:32px">${food.icon}</span>
            <div>
              <strong style="color:#f1d17a; font-size:12px">${food.name}</strong>
              <div style="font-size:10px; color:#78f3e3">+${food.energy} Energia · +${food.satiety} Saciedade</div>
              <div style="font-size:10px; color:#ff8fa3">+${food.friendship} Amizade · +${food.xp} XP do Sprite</div>
            </div>
          </div>
          <p style="font-size:10px; color:#a1a1aa; margin:6px 0;">${food.desc}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <span style="font-size:11px; color:#f1c40f">💰 ${food.costGold} Ouro</span>
            <button class="sprite-btn" style="width:auto; padding:4px 12px;" ${!canAfford ? 'disabled' : ''} onclick="GameAPI.feedSprite('${foodKey}', '${pet.id}')">Alimentar</button>
          </div>
        </div>
      `;
    }

    pane.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="sm-card">
          <h4 style="color:#f1d17a; margin-bottom:8px">🍎 Cardápio dos Sprites</h4>
          <p style="font-size:11px; color:#a1a1aa; margin-bottom:10px">Alimentar seu Sprite recupera sua energia de trabalho, aumenta sua saciedade e fortalece os laços de amizade!</p>
          <div style="display:flex; flex-direction:column; gap:8px;">${foodsHtml}</div>
        </div>

        <div class="sm-card">
          <h4 style="color:#78f3e3; margin-bottom:8px">⛺ Cabana de Descanso dos Sprites</h4>
          <p style="font-size:11px; color:#a1a1aa; margin-bottom:10px">Quando cansado, envie seu companheiro para a caminha da cabana. A taxa de recuperação de energia é acelerada para <b>+14/s</b> e seu humor melhora!</p>
          
          <div style="background:#0e2428; border:2px solid #45696b; padding:12px; text-align:center; margin-bottom:12px;">
            <div style="font-size:36px; margin-bottom:6px">${pet.state === 'resting' ? '💤🛌' : '🌟🕊️'}</div>
            <strong style="color:#f1d17a">${pet.name} está ${pet.state === 'resting' ? 'Dormindo na Cabana' : 'Ativo e Acompanhando'}</strong>
            <div style="font-size:11px; color:#78f3e3; margin-top:4px">Energia Atual: ${Math.round(pet.energy)} / ${pet.maxEnergy}</div>
          </div>

          <button class="sprite-btn primary-highlight" onclick="GameAPI.toggleRestSprite('${pet.id}')">
            ${pet.state === 'resting' ? '☀️ Acordar Sprite e Voltar a Seguir' : '💤 Enviar Sprite para Descansar na Cabana'}
          </button>
        </div>
      </div>
    `;
  }

  static renderWorkTab(pet) {
    const pane = document.getElementById('sm-pane-work');
    if (!pane) return;

    const targetSprite = this.selectedSpriteForWork ? (SpriteSystem.getSprite(this.selectedSpriteForWork) || pet) : pet;
    const cat = targetSprite.getCategoryData ? targetSprite.getCategoryData() : SPRITE_CATEGORIES.minerador;
    const bonuses = targetSprite.getGatherBonuses ? targetSprite.getGatherBonuses() : {};

    // Opções de Sprites possuídos
    let spriteOptionsHtml = '';
    (GameState.sprites || [pet]).forEach(s => {
      spriteOptionsHtml += `<option value="${s.id}" ${s.id === targetSprite.id ? 'selected' : ''}>${s.name} (${s.getCategoryData().name} Lv.${s.level} - ${s.state})</option>`;
    });

    pane.innerHTML = `
      <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:12px;">
        <div class="sm-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
            <h4 style="color:#f1d17a">⛏️ Central de Expedições</h4>
            <div>
              <label style="font-size:10px; color:#a1a1aa">Trabalhador: </label>
              <select id="smWorkSpriteSelect" style="background:#0e2428; color:#fff; border:1px solid #45696b; font-size:11px; padding:2px 4px;" onchange="window.UISystem.setWorkSprite(this.value)">
                ${spriteOptionsHtml}
              </select>
            </div>
          </div>
          
          <div style="font-size:11px; color:#c5d8d1; margin-bottom:10px">
            Sprite Selecionado: <strong>${targetSprite.name}</strong> · Energia: <strong>${Math.round(targetSprite.energy)}%</strong> · Estado: <strong>${targetSprite.state}</strong>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <div class="sm-expedition-card">
              <div>
                <strong style="color:#3498db">⛏️ Mineração em Ilya</strong>
                <div style="font-size:10px; color:#a1a1aa">Coleta pedras, ferro e minérios brutos. Afinidade com Minerador.</div>
                <div style="font-size:10px; color:#78f3e3">Estimativa: ${1 + (bonuses.extraYield || 0)}-${3 + targetSprite.level + (bonuses.extraYield || 0)} Minérios</div>
              </div>
              <button class="sprite-btn" style="width:auto; padding:5px 12px;" onclick="GameAPI.spriteGather('minerals', 120, 'Minérios', '${targetSprite.id}')">Iniciar (2s)</button>
            </div>

            <div class="sm-expedition-card">
              <div>
                <strong style="color:#d35400">🪵 Exploração Florestal de Safael</strong>
                <div style="font-size:10px; color:#a1a1aa">Colhe madeira de carvalho e cipós. Afinidade com Silvestre.</div>
                <div style="font-size:10px; color:#78f3e3">Estimativa: ${1 + (bonuses.extraYield || 0)}-${3 + targetSprite.level + (bonuses.extraYield || 0)} Madeira</div>
              </div>
              <button class="sprite-btn" style="width:auto; padding:5px 12px;" onclick="GameAPI.spriteGather('wood', 240, 'Madeira', '${targetSprite.id}')">Iniciar (4s)</button>
            </div>

            <div class="sm-expedition-card">
              <div>
                <strong style="color:#2ecc71">🌿 Colheita Botânica de Safael</strong>
                <div style="font-size:10px; color:#a1a1aa">Colhe ervas medicinais e flores raras. Afinidade com Herbalista.</div>
                <div style="font-size:10px; color:#78f3e3">Estimativa: ${1 + (bonuses.extraYield || 0)}-${3 + targetSprite.level + (bonuses.extraYield || 0)} Ervas</div>
              </div>
              <button class="sprite-btn" style="width:auto; padding:5px 12px;" onclick="GameAPI.spriteGather('herbs', 360, 'Ervas', '${targetSprite.id}')">Iniciar (6s)</button>
            </div>
          </div>
        </div>

        <div class="sm-card">
          <h4 style="color:#e27276; margin-bottom:8px">🔨 Forja Assistida por Sprite</h4>
          <p style="font-size:10px; color:#a1a1aa; margin-bottom:8px">Crie equipamentos poderosos com auxílio das bênçãos do seu Sprite.</p>

          <div style="background:#0e2428; border:1px solid #45696b; padding:10px; margin-bottom:10px;">
            <div style="font-size:11px; color:#f1d17a"><strong>⚔️ Espada Longa</strong> (Nível 1)</div>
            <div style="font-size:10px; color:#a1a1aa">Custo: 3 Minérios, 2 Madeiras</div>
            <div style="font-size:10px; color:#78f3e3; margin-top:4px">
              Bônus do Sprite: +${Math.round((targetSprite.getCraftBonuses?.().craftRareChance || 0)*100)}% Chance Rara · +${Math.round((targetSprite.getCraftBonuses?.().craftEpicChance || 0)*100)}% Chance Épica
            </div>
            <button class="sprite-btn" style="margin-top:8px;" onclick="GameAPI.spriteCraft('Espada Longa', '${targetSprite.id}')">⚔️ Forjar Espada Longa</button>
          </div>
        </div>
      </div>
    `;
  }

  static setWorkSprite(id) {
    this.selectedSpriteForWork = id;
    this.updateSpriteManagerModal();
  }

  static renderRosterTab(activePet) {
    const pane = document.getElementById('sm-pane-roster');
    if (!pane) return;

    const sprites = GameState.sprites || [activePet];
    let rosterHtml = '';

    sprites.forEach(sprite => {
      const cat = sprite.getCategoryData ? sprite.getCategoryData() : SPRITE_CATEGORIES.minerador;
      const pers = sprite.getPersonalityData ? sprite.getPersonalityData() : SPRITE_PERSONALITIES.trabalhador;
      const isActive = sprite.id === activePet.id;

      rosterHtml += `
        <div class="sm-roster-card ${isActive ? 'active-pet' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#f1d17a; font-size:13px">${cat.icon} ${sprite.name}</strong>
            <span class="sm-badge" style="border-color:${cat.color}; color:${cat.color}">${cat.name}</span>
          </div>
          <div style="font-size:10px; color:#c5d8d1; margin:4px 0;">Personalidade: <strong>${pers.name}</strong> · Tier ${sprite.tier} (Lv.${sprite.level})</div>
          <div style="font-size:10px; color:#78f3e3">Energia: ${Math.round(sprite.energy)}% · Estado: ${sprite.state}</div>
          <div style="margin-top:8px;">
            ${isActive ? '<span style="color:#78f3e3; font-weight:bold; font-size:11px">★ Companheiro Ativo</span>' : `<button class="sprite-btn" style="width:auto; padding:4px 10px;" onclick="GameAPI.setActiveSprite('${sprite.id}')">Definir como Ativo</button>`}
          </div>
        </div>
      `;
    });

    // Altar de Adoção de novos Sprites
    const ownedIds = new Set(sprites.map(s => s.id));
    const availableToAdopt = DEFAULT_SPRITES.filter(s => !ownedIds.has(s.id));
    let adoptHtml = '';

    if (availableToAdopt.length === 0) {
      adoptHtml = '<div style="font-size:11px; color:#a1a1aa; padding:10px;">Você já despertou todos os Sprites sagrados de Safael conhecidos! Parabéns!</div>';
    } else {
      availableToAdopt.forEach(sData => {
        const cat = SPRITE_CATEGORIES[sData.category];
        const pers = SPRITE_PERSONALITIES[sData.personality];
        const canAfford = GameState.player.gold >= 50;

        adoptHtml += `
          <div class="sm-adopt-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="color:#f1d17a">${cat.icon} ${sData.name}</strong>
              <span class="sm-badge" style="border-color:${cat.color}; color:${cat.color}">${cat.name}</span>
            </div>
            <p style="font-size:10px; color:#c5d8d1; margin:4px 0;">${sData.lore}</p>
            <div style="font-size:10px; color:#78f3e3">Personalidade: ${pers.name} (${pers.description})</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
              <span style="font-size:11px; color:#f1c40f">💰 50 Ouro</span>
              <button class="sprite-btn primary-highlight" style="width:auto; padding:4px 12px;" ${!canAfford ? 'disabled' : ''} onclick="GameAPI.adoptSprite('${sData.id}')">Despertar Sprite</button>
            </div>
          </div>
        `;
      });
    }

    pane.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="sm-card">
          <h4 style="color:#f1d17a; margin-bottom:8px">👥 Meus Companheiros Sprites (${sprites.length})</h4>
          <p style="font-size:10px; color:#a1a1aa; margin-bottom:10px">Selecione qual Sprite acompanhará você na exploração e concederá bônus ao seu personagem.</p>
          <div style="display:flex; flex-direction:column; gap:8px;">${rosterHtml}</div>
        </div>

        <div class="sm-card">
          <h4 style="color:#78f3e3; margin-bottom:8px">✨ Altar dos Sprites Sagrados</h4>
          <p style="font-size:10px; color:#a1a1aa; margin-bottom:10px">Desperte novos Sprites com personalidades e categorias únicas para expandir sua oficina!</p>
          <div style="display:flex; flex-direction:column; gap:8px;">${adoptHtml}</div>
        </div>
      </div>
    `;
  }

  static logMsg(msg, cls = '') {
    const log = document.getElementById('log');
    if (!log) return;
    const p = document.createElement('div');
    p.className = cls;
    p.textContent = msg;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
    while (log.children.length > 50) log.removeChild(log.firstChild);
  }
}

if (typeof window !== 'undefined') window.UISystem = UISystem;
