import { BALANCE } from '@constants';
import { GameEngineEffect } from '@engine';
import { EntityModel } from '@engine/models';
import { ManagerRegistry } from '@engine/managers';
import { TileData } from '@engine/maps';
import { dist, sample } from '@utils';

/**
 * Stateless system for movement target selection. Used by EntityCommandPhase
 * for unit moves.
 */
export class MovementSystem {

  /**
   * Moves the entity to the given tile, spends the given AP cost, and returns
   * the ENTITY_MOVED effect.
   * @param managers - The manager registry.
   * @param entity - The entity to move.
   * @param target - The destination tile.
   * @param ap - The AP cost to spend.
   * @returns The ENTITY_MOVED effect.
   */
  executeMove(managers: ManagerRegistry, entity: EntityModel, target: TileData, ap: number): GameEngineEffect {
    const from = { x: entity.tileX, y: entity.tileY };

    managers.entity.moveEntity(entity, target.x, target.y);
    entity.spendAp(ap);

    return { type: 'ENTITY_MOVED', entity, from };
  }

  /**
   * Returns the AP cost to reach the target tile via BFS, or -1 if unreachable
   * within the given AP budget. Each step costs BALANCE.AP.COST.MOVEMENT.
   * Occupied tiles are not traversed.
   * @param managers - The manager registry.
   * @param entity - The entity attempting to move.
   * @param target - The destination tile.
   * @param ap - The AP budget available for movement.
   * @returns The AP cost to reach the target, or -1 if unreachable.
   */
  getMoveCost(managers: ManagerRegistry, entity: EntityModel, target: TileData, ap: number): number {
    const start = managers.map.getTileAt(entity.tileX, entity.tileY);
    if (!start) return -1;

    const visited = new Set<TileData>();
    const queue: { tile: TileData; cost: number }[] = [{ tile: start, cost: 0 }];

    while (queue.length) {
      const { tile, cost } = queue.shift()!;
      if (tile === target) return cost;
      if (visited.has(tile)) continue;
      visited.add(tile);
      if (cost >= ap) continue;

      for (const neighbor of tile.neighbors) {
        if (!neighbor) continue;
        if (visited.has(neighbor)) continue;
        if (managers.entity.isTileOccupied(neighbor.x, neighbor.y)) continue;
        queue.push({ tile: neighbor, cost: cost + BALANCE.AP.COST.MOVEMENT });
      }
    }

    return -1;
  }

  /**
   * Returns a random unoccupied neighbor tile, or null if all neighbors are
   * blocked. Used by BotSystem for undirected random movement.
   * @param managers - The manager registry.
   * @param entity - The entity to find a random move for.
   * @returns A random unoccupied neighbor tile, or null.
   */
  getRandomMoveTarget(managers: ManagerRegistry, entity: EntityModel): TileData | null {
    const tile = managers.map.getTileAt(entity.tileX, entity.tileY);
    if (!tile) return null;

    const neighbors = tile.neighbors.filter((n): n is TileData => n !== null && !managers.entity.isTileOccupied(n.x, n.y));
    return sample(neighbors) ?? null;
  }

  /**
   * Returns the best unoccupied neighbor tile that moves the entity closer to
   * the given target position, or null if all neighbors are blocked. Picks
   * randomly among the 3 closest neighbors to add variance, falling back to
   * remaining neighbors if those are all occupied.
   * @param managers - The manager registry.
   * @param entity - The entity to move.
   * @param toward - Target position to move toward.
   * @param toward.x - X coordinate of the target.
   * @param toward.y - Y coordinate of the target.
   * @returns The best available neighbor tile, or null.
   */
  getMoveTarget(managers: ManagerRegistry, entity: EntityModel, toward: { x: number; y: number }): TileData | null {
    const tile = managers.map.getTileAt(entity.tileX, entity.tileY);

    if (!tile) return null;

    const neighbors = tile.neighbors.filter((n): n is TileData => n !== null);
    const sorted = [...neighbors].sort((a, b) => dist(a, toward) - dist(b, toward));
    const closest = sorted.slice(0, 3);
    const fallback = sorted.slice(3);

    return (
      sample(closest.filter(t => !managers.entity.isTileOccupied(t.x, t.y))) ??
      sample(fallback.filter(t => !managers.entity.isTileOccupied(t.x, t.y))) ??
      null
    );
  }
}
