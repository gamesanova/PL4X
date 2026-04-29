import Phaser from 'phaser';
import { ASSETS, SETTINGS } from '@constants';

/**
 * The initial scene. Responsible for preloading all game assets, disabling the
 * context menu, setting up the responsive canvas resizer, then handing off to
 * MenuScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  /**
   * Loads all game assets by iterating the ASSETS constants. Each asset is
   * loaded as a spritesheet using its configured dimensions.
   */
  preload() {
    this.load.image('logo-plax-full', `./assets/logo-plax-full.png?v=${import.meta.env.VITE_BUILD_TIME}`);
    this.load.image('logo-gamesanova', `./assets/logo-gamesanova.png?v=${import.meta.env.VITE_BUILD_TIME}`);

    Object.entries(ASSETS).forEach(([key, asset]) => {
      key = key.toLowerCase();

      this.load.spritesheet(key, `./assets/${key}.png?v=${import.meta.env.VITE_BUILD_TIME}`, {
          frameWidth: asset.WIDTH,
          frameHeight: asset.HEIGHT,
      });
    });
  }

  /**
   * Disables the right-click context menu, sets up the canvas resizer, then
   * transitions to MenuScene.
   */
  create() {
    this.input.mouse?.disableContextMenu();
    this.#setupResizer();
    this.#generateColorDots();

    this.scene.start('MenuScene');
  }

  /**
   * Generates a spritesheet texture with one 100x100 dot per player color.
   * Frames are ordered to match the index of each key in SETTINGS.COLOR.OPTIONS.
   */
  #generateColorDots() {
    const size = 100;
    const options = Object.values(SETTINGS.COLOR.OPTIONS);
    const g = this.add.graphics();

    options.forEach((option, i) => {
      g.fillStyle(option.color);
      g.fillCircle(size / 2 + i * size, size / 2, size / 2);
    });

    g.generateTexture('color_dots', size * options.length, size);
    g.destroy();

    const texture = this.textures.get('color_dots');
    options.forEach((_, i) => texture.add(i, 0, i * size, 0, size, size));
  }

  /**
   * Attaches a ResizeObserver to the canvas container so the Phaser scale
   * manager refreshes whenever the container dimensions change.
   */
  #setupResizer() {
    const container = this.scale.parent;

    if (container) {
      const observer = new ResizeObserver(() => {
        this.scale.refresh();
      });

      observer.observe(container);
    }
  }
}
