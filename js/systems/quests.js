import { GameState } from '../core/gameState.js';
import { QUESTS_DB } from '../data/quests.js';
import { UISystem } from '../ui/ui.js';
import { SaveSystem } from './save.js';

export class QuestSystem {
  static init() {
    if (!GameState.quests || Array.isArray(GameState.quests) || Object.keys(GameState.quests).length === 0) GameState.quests = Object.fromEntries(Object.keys(QUESTS_DB).map(id => [id, { ...QUESTS_DB[id], progress: 0, secondaryProgress: 0, status: QUESTS_DB[id].status }]));
  }
  static accept(id) {
    this.init();
    const quest = GameState.quests[id];
    if (!quest || quest.status !== 'available') return false;
    quest.status = 'active';
    UISystem.logMsg(`Missão aceita: ${quest.name}`, 'gold');
    this.updateUI();
    SaveSystem.saveGame();
    return true;
  }
  static onEvent(type, target, amount = 1) {
    this.init();
    const completedBefore = new Set(Object.values(GameState.quests).filter(quest => quest.status === 'completed').map(quest => quest.id));
    for (const quest of Object.values(GameState.quests)) {
      if (quest.status !== 'active') continue;
      if (quest.objective.type === type && quest.objective.target === target) quest.progress = Math.min(quest.objective.required, quest.progress + amount);
      if (quest.secondary?.type === type && quest.secondary.target === target) quest.secondaryProgress = Math.min(quest.secondary.required, quest.secondaryProgress + amount);
      if (quest.objective.type === 'visit' && type === 'visit' && quest.objective.target === target) quest.progress = quest.objective.required;
      if (quest.progress >= quest.objective.required && (!quest.secondary || quest.secondaryProgress >= quest.secondary.required)) quest.status = 'completed';
    }
    for (const quest of Object.values(GameState.quests)) {
      if (!completedBefore.has(quest.id) && quest.status === 'completed') {
        if (quest.id === 'root_investigation') GameState.flags.unlockedDungeon = true;
        UISystem.logMsg(`Objetivo concluído: ${quest.name}`, 'gold');
      }
    }
    for (const quest of Object.values(GameState.quests)) {
      if (quest.status === 'locked' && quest.requires && GameState.flags[quest.requires]) quest.status = quest.id === 'king_slime' ? 'active' : 'available';
    }
    this.updateUI();
  }
  static claim(id) {
    const quest = GameState.quests[id];
    if (!quest || quest.status !== 'completed') return false;
    quest.status = 'claimed';
    GameState.player.addExp(quest.reward.xp || 0);
    GameState.player.gold += quest.reward.gold || 0;
    for (const flag of quest.reward.flags || []) GameState.flags[flag] = true;
    for (const next of Object.values(GameState.quests)) if (next.requires && GameState.flags[next.requires]) next.status = 'available';
    UISystem.logMsg(`Missão concluída: ${quest.name}`, 'gold');
    this.updateUI();
    SaveSystem.saveGame();
    return true;
  }
  static updateUI() {
    const log = document.getElementById('questLog');
    if (!log) return;
    this.init();
    log.innerHTML = Object.values(GameState.quests).filter(quest => quest.status !== 'locked' && quest.status !== 'claimed').map(quest => {
      const marker = quest.status === 'completed' ? '?' : quest.status === 'available' ? '!' : '';
      const secondary = quest.secondary ? ` + ${quest.secondaryProgress}/${quest.secondary.required}` : '';
      return `<div class="quest-entry"><b>${marker} ${quest.name}</b><br><span>${quest.description}</span><br><small>${quest.progress}/${quest.objective.required}${secondary}</small></div>`;
    }).join('') || '<span>Nenhuma missão ativa.</span>';
  }
}