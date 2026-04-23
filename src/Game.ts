import Phaser from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import RexBoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';

import { BootScene, MenuScene, PlayScene } from '@scenes';
import { UI_SIZES } from '@constants';

/**
 * Phaser.Game subclass that registers the RexUI and RexBoard plugins and
 * bootstraps all scenes.
 */
export class Game extends Phaser.Game {
  constructor() {
    super({
      parent: 'app',
      plugins: {
        scene: [
          { key: 'rexUI', plugin: RexUIPlugin, mapping: 'rexUI' },
          { key: 'rexBoard', plugin: RexBoardPlugin, mapping: 'rexBoard' },
        ],
      },
      scene: [BootScene, MenuScene, PlayScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: UI_SIZES.PANEL.BG.width,
        height: UI_SIZES.PANEL.BG.height,
      },
    });
  }
}
