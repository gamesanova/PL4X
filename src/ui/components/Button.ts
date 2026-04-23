import { Panel, Text } from '@ui/components';

export type ButtonStyles = {
  x?: number;
  y?: number;
  width: number;
  height: number;
  bgColor: number;
  bevelTopColor: number;
  bevelBottomColor: number;
  bevel: number;
  label?: string;
  fontFamily?: string;
  fontSize?: string;
  color?: number;
  image?: string;
  padding?: number;
};

/**
 * Interactive container with a Panel background, optional text label or image,
 * and pointer events for press animation. Supports disabled and unavailable
 * states.
 */
export class Button extends Phaser.GameObjects.Container {
  #styles: ButtonStyles;
  #bg!: Phaser.GameObjects.Container;
  #image!: Phaser.GameObjects.Image;
  #text!: Phaser.GameObjects.Text;
  isDisabled: boolean = false;
  isUnavailable: boolean = false;

  constructor(scene: Phaser.Scene, styles: ButtonStyles) {
    super(scene, styles.x, styles.y);
    this.#styles = styles;

    this.#drawBg();
    this.#drawContent();
    this.#setEvents();

    scene.add.existing(this);
  }

  #drawBg() {
    this.#bg = new Panel(this.scene, {
      x: 0,
      y: 0,
      width: this.#styles.width,
      height: this.#styles.height,
      bgColor: this.#styles.bgColor,
      bevelTopColor: this.#styles.bevelTopColor,
      bevelBottomColor: this.#styles.bevelBottomColor,
      bevel: this.#styles.bevel,
    });

    this.addAt(this.#bg, 0);
  }

  #drawContent() {
    if (this.#styles.label) {
      this.#text = new Text(this.scene, {
        text: this.#styles.label,
        fontFamily: this.#styles.fontFamily,
        fontSize: this.#styles.fontSize,
        color: this.#styles.color,
      });
      this.#text.setOrigin(0.5);

      this.add(this.#text);
    } else if (this.#styles.image) {
      const padding = this.#styles.padding ?? 0;

      this.#image = this.scene.add.image(0, 0, this.#styles.image);

      const imageRatio = (this.#styles.height - this.#styles.bevel * 2 - padding * 2) / this.#image.height;

      this.#image.setScale(imageRatio);

      this.add(this.#image);
    }
  }

  #setEvents() {
    this.setSize(this.#styles.width, this.#styles.height);
    this.setInteractive({ cursor: 'pointer' });
    this.setDepth(1);

    this.on('pointerdown', () => this.setScale(0.95) );
    this.on('pointerup', () => this.setScale(1) );
  }

  setLabel(text: string) {
    this.#text?.setText(text);

    return this;
  }

  setImageFrame(value: number) {
    this.#image.setFrame(value);

    return this;
  }

  setDisabled(disabled: boolean) {
    this.isDisabled = disabled;

    if (disabled) {
      this.disableInteractive();
    } else {
      this.setInteractive({ cursor: 'pointer' });
    }

    return this;
  }

  setUnavailable(unavailable: boolean) {
    this.isUnavailable = unavailable;

    return this;
  }

  setStyles(styles: Partial<ButtonStyles>) {
    this.#bg.destroy();
    this.#styles = { ...this.#styles, ...styles };
    this.#drawBg();

    return this;
  }

  setOrigin(ox: number, oy: number) {
    this.x += this.#styles.width / 2 - (this.#styles.width * ox);
    this.y += this.#styles.height / 2 - (this.#styles.height * oy);

    return this;
  }
}
