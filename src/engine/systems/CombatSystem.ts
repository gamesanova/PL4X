import { BALANCE } from '@constants';
import { GameEngineEffect } from '@engine';
import { EntityModel } from '@engine/models';
import { ManagerRegistry } from '@engine/managers';
import { TileData } from '@engine/maps';
import { sample } from '@utils';

/**
 * Stateless system for target selection, damage calculation, and move-to-attack
 * pathfinding. Used by EntityCommandPhase for human attacks and by BotSystem
 * for bot turn resolution.
 */
export class CombatSystem {

  /**
   * Executes an attack from attacker to target. Resolves AOE targets, applies
   * damage with multipliers, removes dead entities, spends AP, and returns all
   * resulting effects.
   * @param managers - The manager registry.
   * @param attacker - The attacking entity.
   * @param target - The primary target entity.
   * @returns All effects produced by the attack.
   */
  executeAttack(managers: ManagerRegistry, attacker: EntityModel, target: EntityModel): GameEngineEffect[] {
    const aoeTargets = this.getAttackAoeTargets(managers, attacker, target);
    const from = { x: attacker.tileX, y: attacker.tileY };
    const effects: GameEngineEffect[] = [];

    for (const [entity, multiplier] of aoeTargets) {
      const damage = Math.ceil(this.calculateDamage(attacker, entity) * multiplier);
      entity.takeDamage(damage);

      if (entity === target) {
        effects.push({ type: 'ENTITY_ATTACKED', attacker, target: entity, from });
      }

      effects.push({ type: 'ENTITY_HEALTH_UPDATED', entity, amount: -damage, cause: attacker.damageType });

      if ((entity.healthCurrent ?? 0) <= 0) {
        managers.entity.removeEntity(entity);
        effects.push({ type: 'ENTITY_DIED', entity });
      }
    }

    attacker.spendAp(BALANCE.AP.COST.ATTACK);

    return effects;
  }

  /**
   * Returns true if the entity has a valid attack available this turn.
   * @param managers - The manager registry.
   * @param entity - The entity to check.
   * @returns True if at least one attack target is in range.
   */
  hasAttackAvailable(managers: ManagerRegistry, entity: EntityModel): boolean {
    return this.getAttackTargetTiles(managers, entity).size > 0;
  }

  /**
   * Returns all tiles containing valid attack targets for the given entity
   * from its current position. Convenience wrapper around getTargetTilesFrom.
   * @param managers - The manager registry.
   * @param entity - The entity to find targets for.
   * @returns The set of tiles containing valid targets.
   */
  getAttackTargetTiles(managers: ManagerRegistry, entity: EntityModel): Set<TileData> {
    const fromTile = managers.map.getTileAt(entity.tileX, entity.tileY);
    if (!fromTile) return new Set();
    return this.#getTargetTilesFrom(managers, entity, fromTile);
  }

  /**
   * Returns all attack targets for the given attacker and primary target as a
   * Map of entity to damage multiplier. The primary target always has multiplier
   * 1.0. If the attacker has aoe > 0, each ring up to that radius is checked
   * against BALANCE.DAMAGE.AOE for a falloff multiplier, stops early if the
   * ring index exceeds the AOE array length.
   * @param managers - The manager registry.
   * @param attacker - The attacking entity.
   * @param target - The primary target entity.
   * @returns A map of each affected entity to its damage multiplier.
   */
  getAttackAoeTargets(managers: ManagerRegistry, attacker: EntityModel, target: EntityModel): Map<EntityModel, number> {
    const result = new Map<EntityModel, number>();

    result.set(target, 1.0);

    if (!attacker.aoe) return result;

    for (let ring = 1; ring <= attacker.aoe; ring++) {
      const multiplier = BALANCE.DAMAGE.AOE[ring - 1];

      if (multiplier === undefined) break;

      const tiles = managers.map.getTileRing(target.tileX, target.tileY, ring);

      for (const tile of tiles) {
        const splash = managers.entity.getEntityAt(tile.x, tile.y);

        if (!splash) continue;
        if (splash === target) continue;
        if (splash.playerId === attacker.playerId) continue;

        result.set(splash, multiplier);
      }
    }

    return result;
  }

  /**
   * Calculates damage from attacker to target using the Civ6-style exponential
   * formula. Uses attack vs armor. Result is randomised plus or minus 15% and
   * rounded up.
   * @param attacker - The attacking entity.
   * @param target - The defending entity.
   * @returns The calculated damage amount.
   */
  calculateDamage(attacker: EntityModel, target: EntityModel): number {
    const delta = (attacker.attack ?? 0) - (target.armor ?? 0);
    const base = BALANCE.DAMAGE.BASE * Math.exp(delta / 25);
    const rand = 0.85 + Math.random() * 0.30;

    return Math.ceil(base * rand);
  }

  /**
   * Finds a reachable tile, within the given AP budget, from which the entity
   * has at least one valid attack target in range. Uses BFS so all candidates
   * at the minimum move cost are found before one is picked at random, preventing
   * the bot from always favoring the same neighbor direction. Returns the chosen
   * tile, its movement cost, and the precomputed target tiles from that position,
   * or null if no valid position exists within budget.
   * @param managers - The manager registry.
   * @param entity - The entity looking for a move-to-attack position.
   * @param moveBudget - The maximum AP the entity can spend on movement.
   * @returns The chosen tile, its cost, and available target tiles, or null.
   */
  findMoveToAttackTile(managers: ManagerRegistry, entity: EntityModel, moveBudget: number): { tile: TileData; cost: number; targetTiles: Set<TileData> } | null {
    const start = managers.map.getTileAt(entity.tileX, entity.tileY);
    if (!start) return null;

    const visited = new Set<TileData>([start]);
    const queue: { tile: TileData; cost: number }[] = [];

    for (const neighbor of start.neighbors) {
      if (!neighbor) continue;
      if (managers.entity.isTileOccupied(neighbor.x, neighbor.y)) continue;
      queue.push({ tile: neighbor, cost: BALANCE.AP.COST.MOVEMENT });
    }

    const candidates: { tile: TileData; cost: number; targetTiles: Set<TileData> }[] = [];
    let minCost = Infinity;

    while (queue.length) {
      const { tile, cost } = queue.shift()!;
      if (visited.has(tile)) continue;
      if (cost > minCost) continue;
      visited.add(tile);

      const targetTiles = this.#getTargetTilesFrom(managers, entity, tile);

      if (targetTiles.size > 0) {
        minCost = cost;
        candidates.push({ tile, cost, targetTiles });
        continue;
      }

      if (cost >= moveBudget) continue;

      for (const neighbor of tile.neighbors) {
        if (!neighbor) continue;
        if (visited.has(neighbor)) continue;
        if (managers.entity.isTileOccupied(neighbor.x, neighbor.y)) continue;
        queue.push({ tile: neighbor, cost: cost + BALANCE.AP.COST.MOVEMENT });
      }
    }

    return sample(candidates) ?? null;
  }

  /**
   * Returns all tiles containing valid attack targets for the given entity
   * when standing on fromTile. Valid targets belong to a different player
   * and are not incapacitated. Uses the entity's range ring so range > 1
   * is handled correctly.
   * @param managers - The manager registry.
   * @param entity - The entity to find targets for.
   * @param fromTile - The tile to evaluate targets from.
   * @returns The set of tiles containing valid targets from that position.
   */
  #getTargetTilesFrom(managers: ManagerRegistry, entity: EntityModel, fromTile: TileData): Set<TileData> {
    const tiles = managers.map.getTileRing(fromTile.x, fromTile.y, entity.range, 1);
    const result = new Set<TileData>();

    for (const tile of tiles) {
      const target = managers.entity.getEntityAt(tile.x, tile.y);

      if (!target) continue;
      if (target.isIncapacitated) continue;
      if (target.playerId === entity.playerId) continue;

      result.add(tile);
    }

    return result;
  }
}
