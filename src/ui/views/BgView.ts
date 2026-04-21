import { UI_SIZES, UI_VARIANTS } from '@constants';
import { Panel } from '@ui/components';

export class BgView {
  #scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.#scene = scene;

    this.#drawBg();
  }

  #drawBg() {
    new Panel(this.#scene, {
      x: UI_SIZES.PANEL.BG.width / 2,
      y: UI_SIZES.PANEL.BG.height / 2,
      ...UI_SIZES.PANEL.BG,
      ...UI_VARIANTS.PANEL.OUTSET,
    });
  }
}
