import { BALANCE, I18N } from '@constants';

/**
 * ENTITIES
 *
 * Definitions for every in-game entity. Covers stats, names, and any properties
 * unique to their type. This is the source of truth for what an entity is before
 * it becomes a live object in the engine.
 */
export const ENTITIES = Object.freeze({
  UNIT: {
    OPTIONS: {
      ARCHER: {
        name: I18N.EN.UNIT.ARCHER.name,
        weaponType: 'BOW' as EntityWeaponType,
        damageType: 'PHYSICAL' as EntityDamageType,
        health: BALANCE.ATTRIBUTE.BASE.HEALTH,
        regen: BALANCE.ATTRIBUTE.BASE.REGEN,
        attack: BALANCE.ATTRIBUTE.BASE.ATTACK,
        armor: BALANCE.ATTRIBUTE.BASE.ARMOR,
        score: BALANCE.ATTRIBUTE.BASE.SCORE,
        range: 3,
        aoe: 1,
      },
    },
  },
});

export type EntityDamageType = 'PHYSICAL';
export type EntityWeaponType = 'MELEE' | 'BOW';
export type EntityUnitKey = keyof typeof ENTITIES.UNIT.OPTIONS;
