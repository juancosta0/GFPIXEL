export const SKILLS_DB = [
  { id: 0, name: 'Ataque da Arma', description: 'Ataque definido pela arma equipada.', type: 'weapon', cd: 0.32, range: 58, area: Math.PI / 1.55, damage: 1, mpCost: 0, animation: 'attacking' },
  { id: 1, name: 'Corte Crescente', description: 'Um arco largo à frente.', type: 'cone', cd: 2.1, range: 86, area: Math.PI / 1.15, damage: 1.8, mpCost: 12, animation: 'attacking' },
  { id: 2, name: 'Orbe Aqua', description: 'Projétil mágico de maré arcana.', type: 'projectile', cd: 1.25, range: 330, area: 18, damage: 1.35, mpCost: 10, animation: 'casting' },
  { id: 3, name: 'Luz Restauradora', description: 'Recupera vida.', type: 'heal', cd: 5, range: 0, area: 0, healAmt: 45, mpCost: 8, animation: 'casting' }
];
