import { BALANCE, EntityDamageType, EntityWeaponType, EntityUnitKey, GameSettingsColorKey } from '@constants';

type EntityConfig = {
  aoe: number | null;
  armor: number | null;
  attack: number | null;
  attacks?: number | null;
  color: GameSettingsColorKey;
  weaponType: EntityWeaponType;
  damageType: EntityDamageType;
  frame: number;
  health: number | null;
  id: string;
  layer: number;
  name: string;
  playerId: string;
  range: number;
  regen?: number;
  scale: number;
  texture: string;
  tileX: number;
  tileY: number;
  variant: EntityUnitKey;
  ap?: number;
}

/**
 * Base class for all entities in the game. Holds the shared stat and identity
 * data used by units. Status flags such as isDazed are derived from runtime
 * counters rather than configuration.
 */
export class EntityModel {
  aoe: number | null;
  apCurrent: number;
  apMax: number;
  armor: number | null;
  attack: number | null;
  attacksCurrent: number | null;
  attacksMax: number | null;
  color: GameSettingsColorKey;
  weaponType: EntityWeaponType;
  damageType: EntityDamageType;
  frame: number;
  healthCurrent: number | null;
  healthMax: number | null;
  id: string;
  dazedCounter: number = 0;
  isDisabled: boolean = false;
  layer: number;
  name: string;
  playerId: string;
  range: number;
  regen: number;
  scale: number;
  texture: string;
  tileX: number;
  tileY: number;
  variant: EntityUnitKey;

  constructor(config: EntityConfig) {
    this.aoe = config.aoe;
    this.apCurrent = config.ap ?? BALANCE.AP.BASE;
    this.apMax = config.ap ?? BALANCE.AP.BASE;
    this.armor = config.armor;
    this.attack = config.attack;
    this.attacksCurrent = config.attacks ?? null;
    this.attacksMax = config.attacks ?? null;
    this.color = config.color;
    this.weaponType = config.weaponType;
    this.damageType = config.damageType;
    this.frame = config.frame;
    this.healthCurrent = config.health;
    this.healthMax = config.health;
    this.id = config.id;
    this.layer = config.layer;
    this.name = config.name;
    this.playerId = config.playerId;
    this.range = config.range;
    this.regen = config.regen ?? 0;
    this.scale = config.scale;
    this.texture = config.texture;
    this.tileX = config.tileX;
    this.tileY = config.tileY;
    this.variant = config.variant;
  }

  /**
   * Returns true if the entity has any AP remaining this turn.
   * @returns True if apCurrent is greater than zero.
   */
  hasApAvailable(): boolean {
    return this.apCurrent > 0;
  }

  /**
   * Returns true if the entity has enough AP to perform an attack.
   * @returns True if apCurrent meets the attack AP cost.
   */
  hasAttackApAvailable(): boolean {
    return this.apCurrent >= BALANCE.AP.COST.ATTACK;
  }

  /**
   * Returns true if the entity has enough AP to perform a move.
   * @returns True if apCurrent meets the movement AP cost.
   */
  hasMoveApAvailable(): boolean {
    return this.apCurrent >= BALANCE.AP.COST.MOVEMENT;
  }

  /**
   * Deducts the given amount from the entity's AP, floored at zero.
   * @param amount - The AP cost to deduct.
   */
  spendAp(amount: number): void {
    this.apCurrent = Math.max(0, this.apCurrent - amount);
  }

  /**
   * Resets the entity's AP to its maximum. Called at the start of the human turn.
   */
  resetAp(): void {
    this.apCurrent = this.apMax;
  }

  /**
   * Returns true if the entity currently has a daze counter above zero.
   * @returns True if dazedCounter is greater than zero.
   */
  get isDazed(): boolean {
    return this.dazedCounter > 0;
  }

  /**
   * Returns true if the entity is prevented from acting this turn by any
   * status effect. Currently covers dazed. Additional incapacitating statuses
   * should be added here as they are introduced.
   * @returns True if any incapacitating status is active.
   */
  get isIncapacitated(): boolean {
    return this.isDazed;
  }

  /**
   * Returns true if the entity has at least one attack remaining this turn.
   * Returns false if the entity does not track attacks (null).
   * @returns True if attacksCurrent is a positive number.
   */
  get hasAttackAvailable(): boolean {
    return this.attacksCurrent !== null && this.attacksCurrent > 0;
  }

  /**
   * Decrements the remaining attack count by one. No-ops if the entity does
   * not track attacks.
   */
  useAttack(): void {
    if (this.attacksCurrent !== null) {
      this.attacksCurrent = Math.max(0, this.attacksCurrent - 1);
    }
  }

  /**
   * Resets the remaining attack count to the entity's maximum. No-ops if the
   * entity does not track attacks.
   */
  resetAttacks(): void {
    if (this.attacksMax !== null) {
      this.attacksCurrent = this.attacksMax;
    }
  }

  /**
   * Sets the daze counter to the given number of turns. Defaults to 1.
   * @param turns - Number of turns to daze the entity for.
   */
  daze(turns: number = 1): void {
    this.dazedCounter = turns;
  }

  /**
   * Decrements the daze counter by one, floored at zero. The entity is
   * considered undazed once the counter reaches zero.
   */
  decrementDaze(): void {
    this.dazedCounter = Math.max(0, this.dazedCounter - 1);
  }

  /**
   * Restores health by the given amount, capped at the entity's maximum health.
   * Uses a null check rather than a truthiness check so that entities at 0 health
   * can still regen. No-ops if the entity has no health stat assigned, as some
   * entity types do not track health at all.
   * @param amount - The amount of health to restore.
   */
  regenHealth(amount: number): void {
    if (this.healthCurrent !== null && this.healthMax !== null) {
      this.healthCurrent = Math.min(this.healthMax, this.healthCurrent + amount);
    }
  }

  /**
   * Reduces health by the given amount, floored at zero. The truthiness guard
   * covers entities with no health pool (null) and those already at 0 health,
   * neither of which should take further damage.
   * @param amount - The amount of damage to apply.
   */
  takeDamage(amount: number): void {
    if (this.healthCurrent) {
      this.healthCurrent = Math.max(0, this.healthCurrent - amount);
    }
  }
}
