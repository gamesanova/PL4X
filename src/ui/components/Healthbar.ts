type HealthbarStyles = {
  width: number;
  height: number;
  bgColor: number;
  fgColor: number;
  borderColor: number;
  borderWidth: number;
  vertical?: boolean;
};

/**
 * Rectangular fill bar for rendering health. Supports horizontal and vertical
 * orientation. Hidden by default and shown when health drops below max.
 */
export class Healthbar extends Phaser.GameObjects.Container {
  #styles!: HealthbarStyles;
  #fill!: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, styles: HealthbarStyles) {
    super(scene, 0, 0);
    this.#styles = styles;

    this.#draw();
  }

  #draw() {
    const bg = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, this.#styles.width, this.#styles.height, this.#styles.bgColor); //.setStrokeStyle(this.#styles.borderWidth, this.#styles.borderColor);
    this.#fill = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, this.#styles.width, this.#styles.height, this.#styles.fgColor);
    this.setVisible(false);

    this.add([bg, this.#fill]);
  }

  setValue(current: number, max: number) {
    const ratio = Math.max(0, Math.min(1, current / max));

    if (this.#styles.vertical) {
      const fillHeight = this.#styles.height * ratio;
      this.#fill.setSize(this.#styles.width, fillHeight);
      this.#fill.setY((this.#styles.height - fillHeight) / 2);
    } else {
      const fillWidth = this.#styles.width * ratio;
      this.#fill.setSize(fillWidth, this.#styles.height);
      this.#fill.setX(-this.#styles.width / 2 + fillWidth / 2);
    }
  }
}
