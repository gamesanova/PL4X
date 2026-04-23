import { PlayerModel } from '@engine/models';
import { ManagerRegistry } from '@engine/managers';
import { TileData } from '@engine/maps';

/**
 * Handles unit command logic, determining which units have actions available
 * this turn. Called by HumanSystem on turn start and by unit phases on cancel
 * to restore the actionable tile highlight.
 */
export class EntityCommandSystem {

  /**
   * Returns all tiles occupied by units owned by the given player that have
   * actions available this turn (not incapacitated and unit has AP remaining).
   * @param managers - The manager registry.
   * @param player - The player whose actionable units to find.
   * @returns The set of tiles with actionable units.
   */
  getActionableTiles(managers: ManagerRegistry, player: PlayerModel): Set<TileData> {
    const actionable = new Set<TileData>();

    for (const unit of managers.entity.getUnits(player.id)) {
      if (unit.isIncapacitated || !unit.hasApAvailable()) continue;

      const tile = managers.map.getTileAt(unit.tileX, unit.tileY);

      if (tile) { actionable.add(tile); }
    }

    return actionable;
  }
}
