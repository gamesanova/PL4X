import { Text } from '@ui/components';

type LabelStyles = {
  x?: number;
  y?: number;
  width: number;
  height: number;
  text: number | string;
  fontSize: string;
  align?: 'left' | 'right' | 'center';
  fontFamily?: string;
  color: number;
};

export class Label extends Phaser.GameObjects.Container {
  #text!: Phaser.GameObjects.Text;
  #styles!: LabelStyles;

  constructor(scene: Phaser.Scene, styles: LabelStyles) {
    super(scene, styles.x, styles.y);
    this.#styles = styles;

    this.#drawContent();

    scene.add.existing(this);
  }

  #drawContent() {
    let xOrigin = 0.5;
    let xOffset = 0;

    if (this.#styles.align === 'left') {
      xOrigin = 0;
      xOffset = -1;
    }
    else if (this.#styles.align === 'right') {
      xOrigin = 1;
      xOffset = 1;
    }

    this.#text = new Text(this.scene, {
      x: xOffset * this.#styles.width / 2,
      text: this.#styles.text.toString(),
      fontFamily: 'Verdana',
      fontSize: this.#styles.fontSize,
      color: this.#styles.color,
    })
    .setOrigin(xOrigin, 0.5);

    this.setSize(this.#styles.width, this.#styles.height);
    this.add([this.#text]);
  }

  setText(text: string) {
    this.#text.setText(text);
  }

  setOrigin(ox: number, oy: number) {
    const { width, height } = this.#styles;

    this.x += width / 2 - (width * ox);
    this.y += height / 2 - (height * oy);

    return this;
  }
}
