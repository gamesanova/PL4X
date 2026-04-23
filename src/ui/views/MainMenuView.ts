import { EVENTS, I18N, SETTINGS, UI, UI_SIZES, UI_VARIANTS } from '@constants';
import type { GameSettingsColorKey } from '@constants';
import { GameSettings } from '@engine';
import { Button, ButtonGroup, Panel, Text } from '@ui/components';

export class MainMenuView {
  #scene!: Phaser.Scene;
  #settings!: GameSettings;
  #menu!: RexPlugins.UI.Sizer;

  constructor(scene: Phaser.Scene, settings: GameSettings) {
    this.#scene = scene;
    this.#settings = settings;

    this.#drawMenu();
    this.#drawLogo();
    this.#drawFooter();

    // EXAMPLE: Saving for later.
    // this.#scene.events.emit(EVENTS.PLAYER.ADD, { name: 'Player 2', isBot: true, faction: 'Greece' });
    // this.#scene.events.emit(EVENTS.PLAYER.REMOVE, 1);  // index
    // this.#scene.events.emit(EVENTS.PLAYER.UPDATE, { index: 0, faction: 'Rome' });
  }

  #drawMenu() {
    this.#menu = this.#scene.rexUI.add.sizer({
      x: this.#scene.scale.width / 2,
      y: this.#scene.scale.height / 2,
      orientation: 'y',
      space: { item: UI.SPACING.MARGIN.MD },
    })
    .setOrigin(0.5, 0.5);

    this.#menu.add(this.#getBtnsDifficulty());
    this.#menu.add(this.#getBtnsColor());
    this.#menu.add(this.#getBtnStart());
    this.#menu.setDepth(1).layout();

    new Panel(this.#scene, {
      x: UI_SIZES.PANEL.BG.width / 2,
      y: UI_SIZES.PANEL.BG.height / 2,
      width: this.#menu.width + (UI_SIZES.PANEL.BG.bevel + UI.SPACING.MARGIN.MD) * 2,
      height: this.#menu.height + (UI_SIZES.PANEL.BG.bevel + UI.SPACING.MARGIN.MD) * 2,
      bevel: UI_SIZES.PANEL.BG.bevel,
      ...UI_VARIANTS.PANEL.INSET,
    })
    .setDepth(0)
    .setOrigin(0.5, 0.5);
  }

  #drawLogo() {
    const logo = this.#scene.add.image(0, 0, 'logo-plax-full');
    const menuTop = this.#menu.y - this.#menu.height / 2;

    logo.setPosition(
      this.#scene.scale.width / 2,
      menuTop - Math.ceil(logo.height / 2) - UI_SIZES.PANEL.BG.bevel - UI.SPACING.MARGIN.MD - UI.SPACING.MARGIN.MD * 2,
    ).setDepth(1);
  }

  #drawFooter() {
    const menuBottom = this.#menu.y + this.#menu.height / 2 + UI_SIZES.PANEL.BG.bevel + UI.SPACING.MARGIN.MD + UI.SPACING.MARGIN.MD * 2;

    const styles = {
      ...UI_SIZES.TEXT.SM,
      ...UI_VARIANTS.TEXT.PRIMARY,
    };

    // Logo and brand
    const footer1 = this.#scene.rexUI.add.sizer({
      x: this.#scene.scale.width / 2,
      y: menuBottom,
      orientation: 'x',
      space: { item: UI.SPACING.GAP.MD },
    })
    .setOrigin(0.5, 0);

    const logo   = this.#scene.add.image(0, 0, 'logo-gamesanova').setOrigin(1, 0.5);
    const brand = new Text(this.#scene, { text: ' Gamesanova', ...styles }).setOrigin(0, 0.5);

    logo.setScale(30 / logo.height);
    footer1.add(logo).add(brand).layout();

    // Url
    const footer2 = this.#scene.rexUI.add.sizer({
      x: this.#scene.scale.width / 2,
      y: menuBottom + footer1.height + UI.SPACING.GAP.MD,
      orientation: 'x',
      space: { item: UI.SPACING.GAP.MD },
    })
    .setOrigin(0.5, 0);

    const year = new Date().getFullYear();
    const copy = new Text(this.#scene, { text: `\u00A9 ${year} `, ...styles }).setOrigin(1, 0.5);
    const url = new Text(this.#scene, { text: 'www.gamesanova.com', ...styles });

    url.setInteractive({ useHandCursor: true });
    url.on('pointerup', () => window.open('https://www.gamesanova.com', '_blank'));
    footer2.add(copy).add(url).layout();
  }


  #getBtnsColor() {
    const colorCount = Object.keys(SETTINGS.COLOR.OPTIONS).length;
    const diffCount = Object.keys(SETTINGS.DIFFICULTY.OPTIONS).length;
    const totalWidth = UI_SIZES.BUTTON.WIDE.MD.width * diffCount + UI.SPACING.GAP.MD * (diffCount - 1);
    const size = (totalWidth - UI.SPACING.GAP.MD * (colorCount - 1)) / colorCount;

    const colorOptions = Object.fromEntries(
      Object.keys(SETTINGS.COLOR.OPTIONS).map((key, i) => [key, { img: 'color_dots', imgFrame: i }]),
    );

    return this.#scene.rexUI.add.buttons({
      space: { item: UI.SPACING.GAP.MD },
      buttons: new ButtonGroup(this.#scene, {
        styles: {
          ...UI_SIZES.BUTTON.SQ.MD,
          ...UI_VARIANTS.BUTTON.SECONDARY,
          width: size,
          height: size,
        },
        options: colorOptions,
        value: this.#settings.color,
        onSelect: (key) => this.#scene.events.emit(EVENTS.MAIN_MENU.COLOR, key as GameSettingsColorKey),
      }).buttons,
    })
    .layout();
  }

  #getBtnsDifficulty() {
    return this.#scene.rexUI.add.buttons({
      space: { item: UI.SPACING.GAP.MD },
      buttons: new ButtonGroup(this.#scene, {
        styles: { ...UI_SIZES.BUTTON.WIDE.MD, ...UI_VARIANTS.BUTTON.SECONDARY },
        options: SETTINGS.DIFFICULTY.OPTIONS,
        value: this.#settings.difficulty,
        onSelect: (key) => this.#scene.events.emit(EVENTS.MAIN_MENU.DIFFICULTY, key),
      }).buttons,
    })
    .layout();
  }


  #getBtnStart() {
    const keys = Object.keys(SETTINGS.DIFFICULTY.OPTIONS).length;

    return new Button(this.#scene, {
      label: I18N.EN.LBL.start,
      ...UI_SIZES.BUTTON.WIDE.MD,
      ...UI_VARIANTS.BUTTON.SECONDARY,
      width: UI_SIZES.BUTTON.WIDE.MD.width * keys + UI.SPACING.GAP.MD * (keys - 1),
    })
    .on('pointerup', () => this.#scene.events.emit(EVENTS.MAIN_MENU.START));
  }
}
