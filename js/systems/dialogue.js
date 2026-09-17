import { UISystem } from '../ui/ui.js';

export class DialogueSystem {
  static open(npc, dialogue, choiceIndex = 0) {
    const line = dialogue?.[0];
    if (!line) return;
    UISystem.logMsg(`${npc.name}: ${line.text}`, 'sys');
    const choice = line.choices?.[choiceIndex];
    if (choice?.action === 'acceptQuest') return choice.action;
    return choice?.action || 'close';
  }
}