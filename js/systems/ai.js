export const AI_STATES = Object.freeze({ IDLE: 'idle', PATROL: 'patrol', DETECT: 'detect', CHASE: 'chase', ATTACK: 'attack', HURT: 'hurt', RETREAT: 'retreat', DEAD: 'dead' });

export class EnemyAISystem {
  static canAggro(enemy, distance) {
    if (enemy.behaviorType === 'passive') return false;
    if (enemy.behaviorType === 'neutral') return Boolean(enemy.wasAttacked);
    return enemy.behaviorType === 'aggressive' || enemy.behaviorType === 'boss' || enemy.wasAttacked;
  }
  static shouldLeash(enemy, homeDistance) {
    return enemy.behaviorType !== 'boss' && homeDistance > enemy.leashRange;
  }
  static moveTo(enemy, x, y, speed, dt) {
    const distance = Math.hypot(x - enemy.x, y - enemy.y);
    if (!distance) return;
    enemy.x += (x - enemy.x) / distance * speed * dt;
    enemy.y += (y - enemy.y) / distance * speed * dt;
    enemy.facing = x >= enemy.x ? 'right' : 'left';
  }
}