import { UI_VARIANTS } from '@constants';
import { Button, ButtonStyles } from '@ui/components';
import { toColumns } from '@utils';

type ButtonGroupOption = {
  lbl?: string;
  img?: string;
  imgFrame?: number;
};

type ButtonGroupConfig = {
  options: Record<string, ButtonGroupOption>;
  styles: ButtonStyles;
  value?: string;
  columns?: number;
  onSelect: (key: string) => void;
  onUnavailable?: (key: string) => void;
};

export class ButtonGroup {
  #buttons: Record<string, Button> = {};
  buttons: Button[];

  constructor(scene: Phaser.Scene, config: ButtonGroupConfig) {
    const list = Object.entries(config.options).map(([key, option]) => {
      this.#buttons[key] = new Button(scene, {
        label: option.lbl,
        image: option.img,
        ...config.styles || {},
        ...UI_VARIANTS.BUTTON[key === config.value ? 'PRIMARY' : 'SECONDARY'],
      });

      if (option.img && option.imgFrame) {
        this.#buttons[key].setImageFrame(option.imgFrame);
      }

      this.#buttons[key].on('pointerup', () => {
        if (this.#buttons[key].isUnavailable) {
          this.clearValue()
          config.onUnavailable?.(key);
        } else {
          config.onSelect(key);
          this.setValue(key);
        }
      });

      return scene.rexUI.add.label({
        background: this.#buttons[key],
        width: config.styles.width,
        height: config.styles.height,
      });
    });

    this.buttons = config.columns ? toColumns(list, config.columns) : list;
  }

  setValue(key: string) {
    Object.entries(this.#buttons).forEach(([k, b]) => {
      if (!b.isDisabled && !b.isUnavailable) {
        b.setStyles(UI_VARIANTS.BUTTON[k === key ? 'PRIMARY' : 'SECONDARY']);
      }
    });
  }

  clearValue() {
    Object.values(this.#buttons).forEach(b => {
      if (!b.isDisabled && !b.isUnavailable) {
        b.setStyles(UI_VARIANTS.BUTTON.SECONDARY);
      }
    });
  }

  setDisabled(key: string, disabled: boolean) {
    this.#buttons[key]
      .setDisabled(disabled)
      .setStyles(UI_VARIANTS.BUTTON[disabled ? 'DISABLED' : 'SECONDARY']);
  }

  setUnavailable(key: string, unavailable: boolean) {
    this.#buttons[key]
      .setUnavailable(unavailable)
      .setStyles(UI_VARIANTS.BUTTON[unavailable ? 'DISABLED' : 'SECONDARY']);
  }
}
