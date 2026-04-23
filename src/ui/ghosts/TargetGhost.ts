import { ASSETS } from '@constants';
import { BaseGhost } from './BaseGhost';

const BEAD_RADIUS = 5;
const OUTER_DIST = 26;
const INNER_DIST = 8;

const CARDINAL = [
  { x: 0, y: -OUTER_DIST },
  { x: 0, y:  OUTER_DIST },
  { x: -OUTER_DIST, y: 0 },
  { x:  OUTER_DIST, y: 0 },
];

const CARDINAL_INNER = [
  { x: 0, y: -INNER_DIST },
  { x: 0, y:  INNER_DIST },
  { x: -INNER_DIST, y: 0 },
  { x:  INNER_DIST, y: 0 },
];

type GhostStyles = {
  bgInvalidColor: number;
  bgOpacity: number;
  beadAttackColor: number;
  beadMoveColor: number;
  beadDuration: number;
  aoeColor: number;
  aoeOpacity: number;
}

/**
 * Targeting ghost — animated reticle with a dual attack/move mode.
 * Four beads cycle inward from cardinal directions toward the center of the tile.
 * Red beads indicate an attack target; blue beads indicate a move destination.
 * Background sprite is shown with a tint on invalid tiles; hidden on valid tiles.
 * Renders above entities at depth 20.
 *
 * Accepts an optional aoe radius for blast area overlay.
 */
export class TargetGhost extends BaseGhost {
  #scene: Phaser.Scene;
  #styles: GhostStyles;
  #bg!: Phaser.GameObjects.Sprite;
  #beads: Phaser.GameObjects.Arc[] = [];
  #aoeCircle: Phaser.GameObjects.Arc | null = null;

  constructor(scene: Phaser.Scene, styles: GhostStyles, aoe?: number) {
    super(scene, 0, 0);
    this.#scene = scene;
    this.#styles = styles;

    this.#draw(aoe);
  }

  /**
   * Builds the background sprite, optional AoE circle, and animated beads,
   * then adds them to the container. Starts hidden; made visible on snapTo().
   * @param aoe - Optional AoE radius in tiles to render as a circle overlay.
   */
  #draw(aoe?: number) {
    const children: Phaser.GameObjects.GameObject[] = [];

    this.#bg = new Phaser.GameObjects.Sprite(this.scene, 0, 0, ASSETS.TERRAIN.KEY, ASSETS.TERRAIN.MAP.HIGHLIGHT)
      .setScale(ASSETS.TERRAIN.SCALE)
      .setTint(this.#styles.bgInvalidColor)
      .setAlpha(this.#styles.bgOpacity)
      .setVisible(false);
    children.push(this.#bg);

    if (aoe !== undefined) {
      const radius = aoe * ASSETS.TERRAIN.WIDTH;
      this.#aoeCircle = new Phaser.GameObjects.Arc(this.scene, 0, 0, radius, 0, 360, false, this.#styles.aoeColor, this.#styles.aoeOpacity);
      children.push(this.#aoeCircle);
    }

    for (let i = 0; i < 4; i++) {
      const bead = new Phaser.GameObjects.Arc(
        this.scene,
        CARDINAL[i].x, CARDINAL[i].y,
        BEAD_RADIUS, 0, 360, false, this.#styles.beadAttackColor, 1,
      );

      this.#scene.tweens.add({
        targets: bead,
        props: {
          x: { from: CARDINAL[i].x, to: CARDINAL_INNER[i].x },
          y: { from: CARDINAL[i].y, to: CARDINAL_INNER[i].y },
          alpha: { from: 1, to: 0 },
        },
        duration: this.#styles.beadDuration,
        repeat: -1,
        ease: 'Cubic.easeIn',
      });

      this.#beads.push(bead);
      children.push(bead);
    }

    this.add(children);
    this.setDepth(20);
    this.setVisible(false);
    this.scene.add.existing(this);
  }

  /**
   * Shows the invalid background tint when the tile is not a valid target or
   * reachable move destination. Hides it when valid.
   * @param valid - Whether the current tile is a valid target.
   */
  setValid(valid: boolean): void {
    this.#bg.setVisible(!valid);
  }

  /**
   * Toggles between attack mode (red beads) and move mode (blue beads).
   * Called each tile-over when the pathfinder is active to reflect whether
   * the hovered tile is an attack target or a move destination.
   * @param moving - True for move mode, false for attack mode.
   */
  setMoving(moving: boolean): void {
    const color = moving ? this.#styles.beadMoveColor : this.#styles.beadAttackColor;

    for (const bead of this.#beads) {
      bead.setFillStyle(color);
    }

    this.#aoeCircle?.setVisible(!moving);
  }

  /**
   * Kills all bead tweens before destroying the container to prevent
   * tween callbacks firing on destroyed objects.
   * @param fromScene - Passed through to the Phaser Container destroy call.
   */
  destroy(fromScene?: boolean): void {
    for (const bead of this.#beads) {
      this.#scene.tweens.killTweensOf(bead);
    }

    super.destroy(fromScene);
  }
}
