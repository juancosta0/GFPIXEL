export const QUESTS_DB = {
  slime_problem: {
    id: 'slime_problem', name: 'Problema na pradaria', description: 'Ajude o Guia de Ilya a controlar as gelatinas lunares.',
    objective: { type: 'kill', target: 'gelatina_lunar', required: 3 },
    secondary: { type: 'collect', target: 'nucleo_lunar', required: 2 },
    reward: { xp: 45, gold: 30, flags: ['slime_problem_done'] }, status: 'available'
  },
  root_investigation: {
    id: 'root_investigation', name: 'Investigação da raiz', description: 'Investigue o Bosque da Raiz após ajudar a pradaria.',
    objective: { type: 'visit', target: 'bosqueRaiz', required: 1 },
    reward: { xp: 80, gold: 65, flags: ['unlockedDungeon'] }, requires: 'slime_problem_done', status: 'locked'
  }
};