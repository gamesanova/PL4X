type PanelStyles = {
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: number;
  bevelTopColor: number;
  bevelBottomColor: number;
  bevel: number;
};

export class Panel extends Phaser.GameObjects.Container {
  #styles!: PanelStyles;
  #graphics!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, styles: PanelStyles) {
    super(scene, styles.x, styles.y);
    this.#styles = styles;

    scene.add.existing(this);
    this.#draw();
  }

  #draw() {
    const { width, height, bgColor, bevelTopColor, bevelBottomColor, bevel } = this.#styles;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    this.#graphics = this.scene.add.graphics();

    // Bg
    this.#graphics.fillStyle(bgColor, 1);
    this.#graphics.fillRect(-halfWidth, -halfHeight, width, height);

    // Top
    this.#graphics.fillStyle(bevelTopColor);
    this.#graphics.beginPath();
    this.#graphics.moveTo(-halfWidth, -halfHeight); // top-left
    this.#graphics.lineTo(halfWidth, -halfHeight); // top-right
    this.#graphics.lineTo(halfWidth - bevel, -halfHeight + bevel); // inner top-right
    this.#graphics.lineTo(-halfWidth + bevel, -halfHeight + bevel); // inner top-left
    this.#graphics.closePath();
    this.#graphics.fillPath();

    // Bottom
    this.#graphics.fillStyle(bevelBottomColor);
    this.#graphics.beginPath();
    this.#graphics.moveTo(-halfWidth, halfHeight); // bottom-left
    this.#graphics.lineTo(halfWidth, halfHeight); // bottom-right
    this.#graphics.lineTo(halfWidth - bevel, halfHeight - bevel); // inner bottom-right
    this.#graphics.lineTo(-halfWidth + bevel, halfHeight - bevel); // inner bottom-left
    this.#graphics.closePath();
    this.#graphics.fillPath();

    // Left
    this.#graphics.fillStyle(bevelTopColor);
    this.#graphics.beginPath();
    this.#graphics.moveTo(-halfWidth, -halfHeight); // top-left
    this.#graphics.lineTo(-halfWidth, halfHeight); // bottom-left
    this.#graphics.lineTo(-halfWidth + bevel, halfHeight - bevel); // inner bottom-left
    this.#graphics.lineTo(-halfWidth + bevel, -halfHeight + bevel); // inner top-left
    this.#graphics.closePath();
    this.#graphics.fillPath();

    // Right
    this.#graphics.fillStyle(bevelBottomColor);
    this.#graphics.beginPath();
    this.#graphics.moveTo(halfWidth, -halfHeight); // top-right
    this.#graphics.lineTo(halfWidth, halfHeight); // bottom-right
    this.#graphics.lineTo(halfWidth - bevel, halfHeight - bevel); // inner bottom-right
    this.#graphics.lineTo(halfWidth - bevel, -halfHeight + bevel); // inner top-right
    this.#graphics.closePath();
    this.#graphics.fillPath();

    this.setSize(width, height);
    this.add(this.#graphics);
  }

  setOrigin(ox: number, oy: number) {
    this.#graphics.x = this.#styles.width / 2 - (this.#styles.width * ox);
    this.#graphics.y = this.#styles.height / 2 - (this.#styles.height * oy);

    return this;
  }
}
