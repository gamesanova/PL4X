import { Label } from '@ui/components';

type LabelValueStyles = {
  x?: number;
  y?: number;
  width?: number;
  height: number;
  widthLabel?: number;
  widthValue?: number;
  text: string;
  value: number | string;
  fontFamily: string;
  fontSize: string;
  color: number;
};

/**
 * Paired label and value rendered side by side. Used for stat display rows
 * in control and command panels.
 */
export class LabelValue extends Phaser.GameObjects.Container {
  #scene!: Phaser.Scene;
  #text!: Label;
  #value!: Label;
  #styles!: LabelValueStyles;

  constructor(scene: Phaser.Scene, styles: LabelValueStyles) {
    super(scene, styles.x, styles.y);
    this.#scene = scene;
    this.#styles = styles;

    this.#draw();
    scene.add.existing(this);
  }

  #draw() {
    const width = this.#styles.width ?? (this.#styles.widthLabel ?? 0) + (this.#styles.widthValue ?? 0);
    const height = this.#styles.height;
    const widthLabel = (this.#styles.width ? this.#styles.width / 2 : this.#styles.widthLabel)!;
    const widthValue = (this.#styles.width ? this.#styles.width / 2 : this.#styles.widthValue)!;

    this.#text = new Label(this.#scene, {
      x: -widthValue / 2,
      y: 0,
      width: widthLabel,
      height,
      text: this.#styles.text,
      align: 'right',
      fontFamily: this.#styles.fontFamily,
      fontSize: this.#styles.fontSize,
      color: this.#styles.color,
    });

    this.#value = new Label(this.#scene, {
      x: widthLabel / 2,
      y: 0,
      width: widthValue,
      height,
      text: this.#styles.value,
      align: 'left',
      fontFamily: this.#styles.fontFamily,
      fontSize: this.#styles.fontSize,
      color: this.#styles.color,
    });

    this.setSize(width, height);
    this.add([this.#text, this.#value]);
  }

  setText(text: string) {
    this.#text.setText(text);
  }

  setValue(value: string) {
    this.#value.setText(value);
  }

  setOrigin(ox: number, oy: number) {
    this.x += this.#styles.width! / 2 - (this.#styles.width! * ox);
    this.y += this.#styles.height! / 2 - (this.#styles.height! * oy);

    return this;
  }
}
