import { BALANCE } from '@constants';
import { GameEngineEffect } from '@engine';
import { EntityModel, PlayerModel } from '@engine/models';
import { ManagerRegistry } from '@engine/managers';
import { CombatSystem, MovementSystem } from '@engine/systems';
import { sample } from '@utils';

/**
 * Orchestrates the bot turn for all entities owned by a bot player. Each
 * entity runs three sequential phases against its own AP pool: attack an
 * adjacent target, move into attack range and attack, then spend remaining
 * AP on random movement.
 */
export class BotSystem {
  #combat: CombatSystem;
  #movement: MovementSystem;

  constructor(combat: CombatSystem, movement: MovementSystem) {
    this.#combat = combat;
    this.#movement = movement;
  }

  /**
   * Processes the full bot turn for all entities owned by the given player.
   * Returns an ordered list of effects covering every attack and move that
   * occurred.
   * @param managers - The manager registry.
   * @param player - The bot player whose turn is being processed.
   * @returns All effects produced by the bot turn.
   */
  processTurn(managers: ManagerRegistry, player: PlayerModel): GameEngineEffect[] {
    const units = managers.entity.getUnits(player.id);
    const effects: GameEngineEffect[] = [];

    for (const unit of units) {
      effects.push(...this.#processEntity(managers, player, unit));
    }

    return effects;
  }

  /**
   * Processes a single entity across three sequential phases: attack, move
   * and attack, then random movement. Incapacitated entities are skipped.
   * @param managers - The manager registry.
   * @param player - The owning bot player.
   * @param entity - The entity to process.
   * @returns All effects produced by the entity's actions.
   */
  #processEntity(managers: ManagerRegistry, player: PlayerModel, entity: EntityModel): GameEngineEffect[] {
    if (entity.isIncapacitated) return [];

    return [
      ...this.#checkAttack(managers, entity),
      ...this.#checkMoveAndAttack(managers, entity),
      ...this.#checkMove(managers, player, entity),
    ];
  }


  /**
   * Phase 1. Attacks an adjacent target if the entity has enough AP and a
   * valid target is in range. Picks randomly among available targets.
   * @param managers - The manager registry.
   * @param entity - The entity attempting to attack.
   * @returns The resulting attack effects, or empty if no attack was possible.
   */
  #checkAttack(managers: ManagerRegistry, entity: EntityModel): GameEngineEffect[] {
    if (!entity.hasAttackApAvailable()) return [];

    const targetTiles = this.#combat.getAttackTargetTiles(managers, entity);
    if (targetTiles.size === 0) return [];

    const targetTile = sample([...targetTiles]);
    if (!targetTile) return [];

    const target = managers.entity.getEntityAt(targetTile.x, targetTile.y);
    if (!target) return [];

    return this.#combat.executeAttack(managers, entity, target);
  }

  /**
   * Phase 2. Moves the entity to the nearest tile from which it can attack,
   * then attacks. Skipped if the entity lacks enough AP for at least one move
   * plus an attack, or if no reachable tile puts a target in range.
   * @param managers - The manager registry.
   * @param entity - The entity attempting to move and attack.
   * @returns The resulting move and attack effects.
   */
  #checkMoveAndAttack(managers: ManagerRegistry, entity: EntityModel): GameEngineEffect[] {
    const moveBudget = entity.apCurrent - BALANCE.AP.COST.ATTACK;
    if (moveBudget < BALANCE.AP.COST.MOVEMENT) return [];

    const result = this.#combat.findMoveToAttackTile(managers, entity, moveBudget);
    if (!result) return [];

    const effects: GameEngineEffect[] = [this.#movement.executeMove(managers, entity, result.tile, result.cost)];

    const targetTile = sample([...result.targetTiles]);
    if (!targetTile) return effects;

    const target = managers.entity.getEntityAt(targetTile.x, targetTile.y);
    if (!target) return effects;

    effects.push(...this.#combat.executeAttack(managers, entity, target));

    return effects;
  }

  /**
   * Phase 3. Spends remaining AP moving toward a random living enemy unit.
   * Each step picks randomly from the 3 neighbors closest to the target.
   * @param managers - The manager registry.
   * @param player - The owning bot player, used to identify enemies.
   * @param entity - The entity to move.
   * @returns The resulting move effects.
   */
  #checkMove(managers: ManagerRegistry, player: PlayerModel, entity: EntityModel): GameEngineEffect[] {
    const effects: GameEngineEffect[] = [];

    const enemies = managers.session.getPlayers()
      .filter(p => p.id !== player.id)
      .flatMap(p => managers.entity.getUnits(p.id));

    const target = sample(enemies);
    if (!target) return effects;

    while (entity.hasMoveApAvailable()) {
      const moveTile = this.#movement.getMoveTarget(managers, entity, { x: target.tileX, y: target.tileY });
      if (!moveTile) break;

      effects.push(this.#movement.executeMove(managers, entity, moveTile, BALANCE.AP.COST.MOVEMENT));
    }

    return effects;
  }
}
