import { CONFIG } from '../data/config.js';
import { GameState } from '../core/gameState.js';

export class UISystem {
  static init() {
    const grid = document.getElementById('invGrid');
    grid.innerHTML = '';
    for (let i = 0; i < CONFIG.INV_MAX_SLOTS; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot'; 
      slot.id = 'inv-slot-' + i;
      slot.onclick = () => window.GameAPI.useItem(i);
      grid.appendChild(slot);
    }
    this.updateHUD();
    this.updateUI();
  }

  static updateHUD() {
    if (!GameState.player) return;
    const p = GameState.player;
    document.getElementById('hpFill').style.width = (p.hp / p.maxHp * 100) + '%';
    document.getElementById('mpFill').style.width = (p.mp / p.maxMp * 100) + '%';
    document.getElementById('expFill').style.width = (p.exp / p.expNext * 100) + '%';
    document.getElementById('pLv').textContent = p.lv;
    document.getElementById('pGold').textContent = p.gold;
    document.getElementById('pAtk').textContent = p.atk;
    p.skillCds.forEach((cooldown, index) => {
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
    
    document.getElementById('mMinerals').textContent = p.materials.minerals;
    document.getElementById('mWood').textContent = p.materials.wood;
    document.getElementById('mHerbs').textContent = p.materials.herbs;
    const hint = document.getElementById('interactionHint');
    const target = p.interactionTarget;
    hint.classList.toggle('visible', Boolean(target));
    if (target) hint.querySelector('span').textContent = target.text?.replace('E - ', '') || `Interagir com ${target.name}`;
  }

  static updateUI() {
    if (!GameState.player) return;
    // Inventario
    for (let i = 0; i < CONFIG.INV_MAX_SLOTS; i++) {
      const slot = document.getElementById('inv-slot-' + i);
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
      }
    }
    
    // Equipamentos
    ['weapon', 'armor', 'accessory'].forEach(type => {
      const slot = document.getElementById('eq-' + type);
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

  static toggleWindow(id) {
    const el = document.getElementById(id);
    el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
    if (el.style.display === 'flex') {
      this.updateUI();
    }
  }

  static logMsg(msg, cls = '') {
    const log = document.getElementById('log');
    const p = document.createElement('div');
    p.className = cls;
    p.textContent = msg;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
    while (log.children.length > 50) log.removeChild(log.firstChild);
  }
}
