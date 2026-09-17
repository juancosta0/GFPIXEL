export const WEAPON_DEFINITIONS = Object.freeze({
  sword: { id: 'sword', name: 'Espada', category: 'SWORD', attackType: 'melee', attackAnimation: 'SWORD_ATTACK', attackRange: 62, attackSpeed: 1, attackDelay: .14, impactFrame: 3, damageMultiplier: 1, hitboxType: 'arc', castTime: 0, projectileType: null, effects: ['SlashEffect'], audio: 'sword-swing', visualSet: 'steel' },
  greatsword: { id: 'greatsword', name: 'Lâmina pesada', category: 'SWORD', attackType: 'melee', attackAnimation: 'SWORD_ATTACK', attackRange: 82, attackSpeed: .82, attackDelay: .2, impactFrame: 4, damageMultiplier: 1.3, hitboxType: 'arc', castTime: 0, projectileType: null, effects: ['SlashEffect'], audio: 'greatsword-swing', visualSet: 'root' },
  bow: { id: 'bow', name: 'Arco', category: 'BOW', attackType: 'projectile', attackAnimation: 'BOW_ATTACK', attackRange: 360, attackSpeed: 1, attackDelay: .34, impactFrame: 5, damageMultiplier: 1.05, hitboxType: 'projectile', castTime: .34, projectileType: 'arrow', projectileSpeed: 430, projectileLifetime: .9, effects: ['ArrowTrail', 'ArrowHit'], audio: 'bow-release', visualSet: 'moon' },
  staff: { id: 'staff', name: 'Cajado', category: 'STAFF', attackType: 'projectile', attackAnimation: 'STAFF_CAST', attackRange: 380, attackSpeed: .86, attackDelay: .48, impactFrame: 6, damageMultiplier: 1.15, hitboxType: 'projectile', castTime: .48, projectileType: 'magic', projectileSpeed: 300, projectileLifetime: 1.3, effects: ['MagicProjectile', 'MagicImpact'], audio: 'staff-cast', visualSet: 'aqua' }
});

export function getWeaponDefinition(item) {
  return WEAPON_DEFINITIONS[item?.weaponStyle || 'sword'] || WEAPON_DEFINITIONS.sword;
}