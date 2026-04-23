import { Text } from '@ui/components';

interface FloatingTextStyles {
  x: number;
  y: number;
  label: string;
  color: number;
  fontSize: string;
  fontFamily: string;
  duration: number;
}

/**
 * One-shot animated text that floats upward and fades out. Returns a promise
 * that resolves on completion.
 */
export class FloatingText {
  #scene: Phaser.Scene;
  #styles: FloatingTextStyles;
  #text!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, styles: FloatingTextStyles) {
    this.#scene  = scene;
    this.#styles = styles;

    this.#draw();
  }

  #draw() {
    this.#text = new Text(this.#scene, {
      x: this.#styles.x,
      y: this.#styles.y,
      text: this.#styles.label,
      fontSize: this.#styles.fontSize,
      fontFamily: this.#styles.fontFamily,
      color: this.#styles.color,
    })
    .setOrigin(0.5, 1)
    .setDepth(20);
  }

  animate(): Promise<void> {
    const duration  = this.#styles.duration;
    const fadeDuration = this.#styles.duration / 2;

    this.#scene.tweens.add({
      targets: this.#text,
      y: this.#text.y - 40,
      duration,
      ease: 'Cubic.easeOut',
    });

    return new Promise(resolve => {
      this.#scene.tweens.add({
        targets: this.#text,
        alpha: 0,
        duration: fadeDuration,
        delay: duration - fadeDuration,
        ease: 'Linear',
        onComplete: () => {
          this.#text.destroy();
          resolve();
        },
      });
    });
  }
}
