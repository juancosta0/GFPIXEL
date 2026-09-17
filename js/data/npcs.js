export const NPCS_DB = {
  npc_guide: { id: 'npc_guide', name: 'Guia de Ilya', sprite: 'player', function: 'quest', quests: ['slime_problem', 'root_investigation'], dialogue: [{ text: 'A pradaria precisa de ajuda. Você pode investigar?', choices: [{ text: 'Aceitar missão', action: 'acceptQuest' }, { text: 'Depois', action: 'close' }] }] },
  npc_blacksmith: { id: 'npc_blacksmith', name: 'Mestre Ferreiro', sprite: 'player', function: 'crafting', dialogue: [{ text: 'Traga materiais e posso forjar algo útil.', choices: [{ text: 'Fechar', action: 'close' }] }] },
  npc_merchant: { id: 'npc_merchant', name: 'Mercadora Nara', sprite: 'player', function: 'shop', shop: ['pocao_luz'], dialogue: [{ text: 'Tenho suprimentos para sua jornada.', choices: [{ text: 'Fechar', action: 'close' }] }] }
};