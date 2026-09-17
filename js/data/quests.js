export const QUESTS_DB = {
  slime_problem: {
    id: 'slime_problem', name: 'Problemas nas Planícies', description: 'Derrote Slimes de Safael e traga seus núcleos ao Guia de Ilya.',
    objective: { type: 'kill', target: 'slime_safael', required: 3 },
    secondary: { type: 'collect', target: 'nucleo_safael', required: 2 },
    reward: { xp: 55, gold: 35, flags: ['slime_problem_done'] }, status: 'available'
  },
  root_investigation: {
    id: 'root_investigation', name: 'A entrada da caverna', description: 'Encontre a passagem para a Caverna Sombria nas Planícies de Safael.',
    objective: { type: 'visit', target: 'cavernaSombria', required: 1 },
    reward: { xp: 90, gold: 70, flags: ['unlockedDungeon'] }, requires: 'slime_problem_done', status: 'locked'
  },
  king_slime: {
    id: 'king_slime', name: 'O Rei Slime Sombrio', description: 'Atravesse a caverna e derrote o Rei Slime Sombrio.',
    objective: { type: 'kill', target: 'rei_slime_sombrio', required: 1 },
    reward: { xp: 260, gold: 180, flags: ['king_slime_defeated'] }, requires: 'unlockedDungeon', status: 'locked'
  }
};