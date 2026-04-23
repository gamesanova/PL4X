import { UI_VARIANTS } from '@constants';
import { GameEngineHighlight } from '@engine';
import { TerrainObject } from '@ui/objects';

export type BoardHighlightType = GameEngineHighlight | 'MOVE_ENTITY';

export type BoardHighlights = { type: BoardHighlightType; tiles: Set<TerrainObject> };

// Lower index = higher priority. When multiple types cover the same tile,
// the highest-priority type is rendered. Removing it reverts to the next.
const PRIORITY: BoardHighlightType[] = ['ACTIVE_ENTITY', 'TARGET_ENTITY', 'MOVE_ENTITY', 'SPAWN', 'COMMAND_AVAILABLE'];

/**
 * Manages tile highlight overlays on the board. Highlights are grouped by
 * BoardHighlightType and tracked as sets of TerrainObjects so they can be
 * cleared as a unit. When multiple types cover the same tile, only the
 * highest-priority type is rendered. Removing a type auto-reverts to the
 * next active type so lower-priority highlights are never stomped permanently.
 */
export class BoardHighlightSystem {
  #tiles: Map<BoardHighlightType, Set<TerrainObject>> = new Map([
    ['ACTIVE_ENTITY', new Set()],
    ['SPAWN', new Set()],
    ['TARGET_ENTITY', new Set()],
    ['COMMAND_AVAILABLE', new Set()],
    ['MOVE_ENTITY', new Set()],
  ]);

  // Tracks which type is currently rendered on each tile.
  #visible: Map<TerrainObject, BoardHighlightType> = new Map();

  /**
   * Reconciles the current highlighted set against an incoming set. Tiles only
   * in the new set are highlighted (if priority permits); tiles only in the
   * current set are removed (with fallback to lower-priority types if present).
   * @param highlights - The incoming highlight type and tile set to reconcile against.
   */
  diffHighlights(highlights: BoardHighlights): void {
    const current  = this.#tiles.get(highlights.type)!;
    const priority = PRIORITY.indexOf(highlights.type);

    for (const tile of highlights.tiles) {
      if (!current.has(tile)) {
        current.add(tile);

        const visibleType = this.#visible.get(tile);
        const visiblePriority = visibleType ? PRIORITY.indexOf(visibleType) : Infinity;

        if (priority < visiblePriority) {
          tile.setHighlight(UI_VARIANTS.HIGHLIGHT[highlights.type]);
          this.#visible.set(tile, highlights.type);
        }
      }
    }

    for (const tile of current) {
      if (!highlights.tiles.has(tile)) {
        current.delete(tile);

        if (this.#visible.get(tile) === highlights.type) {
          this.#revert(tile, highlights.type);
        }
      }
    }
  }

  /**
   * Removes the highlight type from all its tiles, reverting each to the next
   * active type if one exists, or fully unsetting the highlight if not.
   * @param type - The highlight type to remove.
   */
  removeHighlights(type: BoardHighlightType): void {
    this.#tiles.get(type)?.forEach(tile => {
      if (this.#visible.get(tile) === type) {
        this.#revert(tile, type);
      }
    });

    this.#tiles.get(type)?.clear();
  }

  /**
   * Switches a tile away from the given type. Finds the next highest-priority
   * type still covering this tile and calls setHighlight for it, or calls
   * unsetHighlight if nothing else is covering it.
   * @param tile - The terrain object to revert.
   * @param fromType - The highlight type being removed.
   */
  #revert(tile: TerrainObject, fromType: BoardHighlightType): void {
    const fallback = PRIORITY.find(t => t !== fromType && this.#tiles.get(t)?.has(tile));

    if (fallback) {
      tile.setHighlight(UI_VARIANTS.HIGHLIGHT[fallback]);
      this.#visible.set(tile, fallback);
    } else {
      tile.unsetHighlight(UI_VARIANTS.HIGHLIGHT[fromType]);
      this.#visible.delete(tile);
    }
  }
}
