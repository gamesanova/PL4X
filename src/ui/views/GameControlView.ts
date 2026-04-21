import { EVENTS, I18N, UI, UI_SIZES, UI_VARIANTS } from '@constants';
import { Button, LabelValue, Panel } from '@ui/components';

const LABEL_KEYS = ['score', 'turn'] as const;
export type GameControlLabels = Record<typeof LABEL_KEYS[number], string>;

export class GameControlView {
  #scene: Phaser.Scene;
  #labels = {} as Record<keyof GameControlLabels, LabelValue>;

  constructor(scene: Phaser.Scene) {
    this.#scene = scene;

    this.#drawBg();
    this.#drawButtons();
    this.#drawLabels();
    this.#drawLogo();
  }

  #drawBg() {
    new Panel(this.#scene, {
      x: UI_SIZES.PANEL.CONTROL.bevel + UI.SPACING.MARGIN.MD,
      y: UI_SIZES.PANEL.CONTROL.bevel + UI.SPACING.MARGIN.MD,
      ...UI_SIZES.PANEL.CONTROL,
      ...UI_VARIANTS.PANEL.INSET,
    })
    .setOrigin(0, 0);
  }

  #drawButtons() {
    const sizer = this.#scene.rexUI.add.sizer({
      x: UI_SIZES.PANEL.BG.width - (UI_SIZES.PANEL.CONTROL.bevel + UI.SPACING.MARGIN.MD) * 2,
      y: (UI_SIZES.PANEL.CONTROL.bevel + UI.SPACING.MARGIN.MD) * 2,
      orientation: 'x',
      space: { item: UI.SPACING.GAP.MD },
    })
    .setOrigin(1, 0);

    sizer.add(
      new Button(this.#scene, {
        label: I18N.EN.LBL.help,
        ...UI_SIZES.BUTTON.WIDE.MD,
        ...UI_VARIANTS.BUTTON.SECONDARY,
      })
      .on('pointerdown', () => this.#scene.events.emit(EVENTS.GAME_CONTROL.HELP)),
    );

    sizer.add(
      new Button(this.#scene, {
        label: I18N.EN.LBL.menu,
        ...UI_SIZES.BUTTON.WIDE.MD,
        ...UI_VARIANTS.BUTTON.SECONDARY,
      })
      .on('pointerdown', () => this.#scene.events.emit(EVENTS.GAME_CONTROL.MENU)),
    );

    sizer.layout();
  }

  #drawLabels() {
    const sizer = this.#scene.rexUI.add.sizer({
      x: UI_SIZES.PANEL.BG.width / 2 + (UI_SIZES.PANEL.CONTROL.bevel + UI.SPACING.MARGIN.MD) * 2,
      y: (UI_SIZES.PANEL.CONTROL.bevel + UI.SPACING.MARGIN.MD) * 2,
      orientation: 'x',
      space: { item: UI.SPACING.MARGIN.MD },
    })
    .setOrigin(0.5, 0);

    LABEL_KEYS.forEach((key) => {
      this.#labels[key] = new LabelValue(this.#scene, {
        width: 200,
        height: UI_SIZES.BUTTON.WIDE.MD.height,
        text: I18N.EN.LBL[key] + ': ',
        value: '0',
        ...UI_SIZES.TEXT.MD,
        ...UI_VARIANTS.TEXT.PRIMARY,
      });

      sizer.add(this.#labels[key]);
    });

    sizer.layout();
  }

  #drawLogo() {
    const x = (UI_SIZES.PANEL.CONTROL.bevel + UI.SPACING.MARGIN.MD) * 2;
    const y = (UI_SIZES.PANEL.CONTROL.bevel + UI.SPACING.MARGIN.MD) + UI_SIZES.PANEL.CONTROL.height / 2;
    const image = this.#scene.add.image(x, y, 'logo-plax-full').setOrigin(0, 0.5);

    image.setScale(UI_SIZES.BUTTON.WIDE.MD.height / image.height);
  }

  renderLabels(labels: Partial<GameControlLabels>) {
    const keys = Object.keys(labels) as (keyof GameControlLabels)[];

    for (const key of keys) {
      this.#labels[key].setValue(labels[key] ?? '');
    }
  }
}
