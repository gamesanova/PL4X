/**
 * Base class for all board ghost overlays. Ghosts are Container game objects
 * that follow the cursor across tiles to give visual feedback for hover,
 * placement, and targeting modes.
 *
 * snapTo() positions the ghost on a tile and makes it visible.
 * setValid() updates the visual state to indicate placement validity.
 */
export abstract class BaseGhost extends Phaser.GameObjects.Container {

  /**
   * Moves the ghost to the given world position and makes it visible.
   */
  snapTo(x: number, y: number): void {
    this.setPosition(x, y);
  }

  /** Hover ghost is always valid — no-op. */
  setValid(_valid: boolean): void {}
}
