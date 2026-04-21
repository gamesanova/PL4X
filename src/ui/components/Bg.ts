import Phaser from 'phaser';

type BgStyles = {
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: number;
  opacity: number;
};

export class Bg extends Phaser.GameObjects.Container {
  #styles: BgStyles;
  #bg!: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, styles: BgStyles) {
    super(scene, styles.x, styles.y);
    this.#styles = styles;

    scene.add.existing(this);
    this.#draw();
  }

  #draw() {
    const halfWidth = this.#styles.width / 2;
    const halfHeight = this.#styles.height / 2;
    this.#bg = this.scene.add.rectangle(-halfWidth, -halfHeight, this.#styles.width, this.#styles.height, this.#styles.bgColor, this.#styles.opacity);

    this.#bg.setInteractive();

    this.add(this.#bg);
  }

  setOrigin(ox: number, oy: number) {
    this.#bg.x = this.#styles.width / 2 - (this.#styles.width * ox);
    this.#bg.y = this.#styles.height / 2 - (this.#styles.height * oy);

    return this;
  }
}
