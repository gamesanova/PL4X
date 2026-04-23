import { ASSETS } from '@constants';
import { BaseGhost } from './BaseGhost';

type GhostStyles = {
  bgColor: number;
  bgOpacity: number;
}

/**
 * Default hover ghost — simple terrain highlight that follows the cursor.
 * Always valid, renders below entities at depth 1.
 */
export class HoverGhost extends BaseGhost {
  #styles: GhostStyles;

  constructor(scene: Phaser.Scene, styles: GhostStyles) {
    super(scene, 0, 0);
    this.#styles = styles;

    this.#draw();
  }

  /**
   * Builds the highlight sprite and adds it to the container.
   * Starts hidden; made visible on the first snapTo() call.
   */
  #draw() {
    const sprite = new Phaser.GameObjects.Sprite(this.scene, 0, 0, ASSETS.TERRAIN.KEY, ASSETS.TERRAIN.MAP.HIGHLIGHT)
      .setScale(ASSETS.TERRAIN.SCALE)
      .setAlpha(this.#styles.bgOpacity)
      .setTint(this.#styles.bgColor);

    this.add(sprite);
    this.setDepth(1);
    this.setVisible(false);
    this.scene.add.existing(this);
  }


}
