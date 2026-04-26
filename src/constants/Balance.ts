/**
 * The master config for all game balancing. Damage multipliers, costs, difficulty
 * scaling, and similar tuning values all live here so they can be adjusted from
 * one place without digging through game logic.
 */
export const BALANCE = Object.freeze({
  // AP costs for units.
  AP: {
    BASE: 3,
    COST: {
      MOVEMENT: 1,
      ATTACK: 2,
    },
  },

  // Base attribute values for units.
  ATTRIBUTE: {
    BASE: {
      HEALTH: 100,
      REGEN: 1,
      ATTACK: 50,
      ARMOR: 50,
      SCORE: 5,
    },
  },

  // Base damage when attack/armor are of equal value. So for a
  // base of 100 health it would require roughly 4 attacks to vanquish the entity.
  DAMAGE: {
    AOE: [0.5, 0.3, 0.1],
    BASE: 30,
  },
});
