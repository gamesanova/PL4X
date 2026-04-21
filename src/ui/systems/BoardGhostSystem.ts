import { UI_VARIANTS } from '@constants';
import { TileData } from '@engine/maps';
import { HoverGhost, TargetGhost } from '@ui/ghosts';
import { TerrainObject } from '@ui/objects';

/**
 * Discriminated union of all board ghost modes. HOVER is the default cursor
 * highlight. TARGET_ATTACK carries a viableTiles set used to determine valid
 * placement on show().
 */
export type BoardGhost =
  | { type: 'HOVER' }
  | { type: 'TARGET_ATTACK';  viableTiles: Set<TileData>; aoe?: number; };

/**
 * UI system that manages the active board ghost. A ghost is a visual overlay
 * that follows the cursor across tiles to indicate hover, placement validity,
 * or targeting. Only one ghost is active at a time — switching modes destroys
 * the previous ghost and creates the new one.
 *
 * show() and hide() are driven by tile pointer events in GameBoardView. Validity
 * is checked on show() against the viableTiles set when one is present.
 *
 * set() is a no-op when the incoming ghost matches the current mode signature.
 * Each type uses only the fields that would actually change the ghost visual:
 * - HOVER: type alone (there is only one hover ghost)
 * - TARGET_ATTACK: type alone (the graphic does not vary between invocations)
 */
export class BoardGhostSystem {
  #scene: Phaser.Scene;
  #ghost: HoverGhost | TargetGhost | null = null;
  #viableTiles: Set<string> | undefined;
  #lastKey: string = '';

  constructor(scene: Phaser.Scene) {
    this.#scene = scene;
    this.set({ type: 'HOVER' });
  }

  /**
   * Switches the active ghost mode. Destroys the current ghost and creates
   * the appropriate replacement.
   */
  set(ghost: BoardGhost) {
    const key = this.#getKey(ghost);

    if (key === this.#lastKey) return;

    this.#lastKey = key;

    switch (ghost.type) {
      case 'HOVER': this.#setHover(); return;
      case 'TARGET_ATTACK': this.#setTargetAttack(ghost); return;
    }
  }

  #getKey(ghost: BoardGhost): string {
    switch (ghost.type) {
      case 'TARGET_ATTACK': return `TARGET_ATTACK:${[...ghost.viableTiles].map(t => `${t.x},${t.y}`).sort().join('|')}`;
      default: return ghost.type;
    }
  }

  /**
   * Snaps the active ghost to the given tile and updates its validity state.
   * Valid is true when no viableTiles set is present or the tile is in the set.
   */
  move(tile: TerrainObject) {
    if (!this.#ghost) return;

    const valid = !this.#viableTiles || this.#viableTiles.has(tile.id);

    this.#ghost.snapTo(tile.x, tile.y);
    this.#ghost.setValid(valid);
  }

  /**
   * Shows the active ghost.
   */
  show() {
    this.#ghost?.setVisible(true);
  }

  /**
   * Hides the active ghost.
   */
  hide() {
    this.#ghost?.setVisible(false);
  }

  /**
   * Sets validity on the active ghost directly, bypassing the viableTiles check.
   */
  setValid(valid: boolean) {
    this.#ghost?.setValid(valid);
  }

  /**
   * Returns the active ghost if it is a TargetGhost, otherwise null.
   * TargetGhost is a special case — it supports a dual attack/move mode
   * that requires direct access to toggle its visual state at the call site.
   */
  targetGhost(): TargetGhost | null {
    return this.#ghost instanceof TargetGhost ? this.#ghost : null;
  }

  /**
   * Destroys the current ghost and replaces it with a default HoverGhost.
   * Clears the viableTiles set.
   */
  #setHover() {
    this.#ghost?.destroy();
    this.#ghost = new HoverGhost(this.#scene, { ...UI_VARIANTS.GHOST.HOVER });
    this.#viableTiles = undefined;
  }

  /**
   * Destroys the current ghost and creates a TargetGhost with an optional AoE radius.
   * Converts the TileData viable set to string keys once for O(1) show() lookups.
   */
  #setTargetAttack(ghost: BoardGhost & { type: 'TARGET_ATTACK' }) {
    this.#ghost?.destroy();
    this.#ghost = new TargetGhost(this.#scene, { ...UI_VARIANTS.GHOST.TARGET }, ghost.aoe);
    this.#viableTiles = new Set([...ghost.viableTiles].map(t => `${t.x},${t.y}`));
  }
}
