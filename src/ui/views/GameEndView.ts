import { EVENTS, I18N, UI, UI_SIZES, UI_VARIANTS } from '@constants';
import { Bg, Button } from '@ui/components';

export class GameEndView {
  #scene: Phaser.Scene;
  #container: Phaser.GameObjects.Container;
  #header!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.#scene = scene;
    this.#container = scene.add.container(0, 0).setAlpha(0).setDepth(1000).setVisible(false);

    this.#drawBg();
    this.#drawMenu();
  }

  #drawBg() {
    const bg = new Bg(this.#scene, {
      x: 0,
      y: 0,
      ...UI_SIZES.OVERLAY.BG,
      ...UI_VARIANTS.OVERLAY.DARK,
    })
    .setOrigin(0, 0);

    this.#container.add(bg);
  }

  #drawMenu() {
    const cx = this.#scene.scale.width / 2;
    const cy = this.#scene.scale.height / 2;

    this.#header = this.#scene.add.text(0, 0, '', {
      fontFamily: UI.FONT.FAMILY.PRIMARY,
      fontSize: UI_SIZES.TEXT.X2.fontSize,
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    const menu = this.#scene.rexUI.add.sizer({
      x: cx,
      y: cy,
      orientation: 'y',
      space: { item: UI.SPACING.GAP.MD },
    })
    .setOrigin(0.5, 0.5);

    menu.add(this.#header);
    menu.add(this.#getButton(I18N.EN.LBL.restart, EVENTS.GAME_MENU.RESTART));
    menu.add(this.#getButton(I18N.EN.LBL.quit, EVENTS.GAME_MENU.QUIT));
    menu.layout();

    this.#container.add(menu);
  }

  #getButton(label: string, event: string) {
    const button = new Button(this.#scene, {
      label: label,
      ...UI_SIZES.BUTTON.WIDE.LG,
      ...UI_VARIANTS.BUTTON.SECONDARY,
    });

    button.on('pointerup', () => {
      this.#scene.events.emit(event);
    });

    return button;
  }

  hide() {
    this.#scene.tweens.add({
      targets: this.#container,
      alpha: 0,
      duration: UI_VARIANTS.OVERLAY.DARK.duration,
      ease: 'Sine.easeIn',
      onComplete: () => this.#container.setVisible(false),
    });
  }

  show(win: boolean) {
    this.#header.setText((win ? I18N.EN.LBL.gameWin : I18N.EN.LBL.gameOver).toUpperCase());

    this.#container.setVisible(true);

    this.#scene.tweens.add({
      targets: this.#container,
      alpha: 1,
      duration: UI_VARIANTS.OVERLAY.DARK.duration,
      ease: 'Sine.easeIn',
    });
  }
}
