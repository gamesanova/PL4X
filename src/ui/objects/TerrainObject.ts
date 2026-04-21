import { ASSETS, UI } from '@constants';
import { Text } from '@ui/components';

type TerrainStyles = {
  frame: number;
  x: number;
  y: number;
};

type HighlightStyles = {
  bgColor: number;
  opacity: number;
  duration: number;
};

/**
 * Container for a single board tile. Renders the terrain sprite and manages
 * an optional highlight overlay with fade in/out tweens.
 *
 * The highlight sprite is lazy-initialised on first call to setHighlight.
 * Tween state is tracked via #highlightTween so rapid set/unset calls
 * cancel the previous tween cleanly.
 */
export class TerrainObject extends Phaser.GameObjects.Container {
  #scene: Phaser.Scene;
  #id: string;
  #styles: TerrainStyles;
  #highlight: Phaser.GameObjects.Sprite | null = null;
  #highlightTween: Phaser.Tweens.Tween | null = null;
  #isHighlightOn: boolean = false;
  #stepLabel: Text | null = null;

  constructor(scene: Phaser.Scene, styles: TerrainStyles) {
    super(scene, 0, 0);
    this.#scene = scene;
    this.#styles = styles;
    this.#id = `${styles.x},${styles.y}`;

    this.#draw();
  }

  get id() { return this.#id; }
  get tileX() { return this.#styles.x; }
  get tileY() { return this.#styles.y; }

  /**
   * Renders the terrain sprite. The label below is for local debugging only.
   */
  #draw() {
    const sprite = new Phaser.GameObjects.Sprite(this.#scene, 0, 0, ASSETS.TERRAIN.KEY, this.#styles.frame).setScale(ASSETS.TERRAIN.SCALE);
    this.add(sprite);

    // const label = new Text(this.#scene, {
    //   y: -20,
    //   text: `${this.#styles.x} / ${this.#styles.y}`,
    //   ...UI_SIZES.TEXT.XS,
    //   ...UI_VARIANTS.TEXT.PRIMARY,
    // }).setOrigin(0.5, 0.5);
    // this.add(label);

    this.setDepth(ASSETS.TERRAIN.LAYER);
    this.#scene.add.existing(this);
  }

  /**
   * Sets the highlight overlay. If the highlight is off, fades in from alpha 0.
   * If already on, tweens the tint from the current color to the new one without
   * touching alpha.
   */
  setHighlight(styles: HighlightStyles): void {
    if (!this.#highlight) {
      this.#highlight = new Phaser.GameObjects.Sprite(this.scene, 0, 0, ASSETS.TERRAIN.KEY, ASSETS.TERRAIN.MAP.HIGHLIGHT).setVisible(false).setScale(ASSETS.TERRAIN.SCALE);
      this.add(this.#highlight);
    }

    this.#highlightTween?.stop();

    if (this.#isHighlightOn) {
      this.#switchHighlight(styles);
    } else {
      this.#isHighlightOn = true;
      this.#highlight.setTint(styles.bgColor);
      this.#highlight.setVisible(true);
      this.#highlight.setAlpha(0);

      this.#highlightTween = this.#scene.tweens.add({
        targets: this.#highlight,
        alpha: styles.opacity,
        duration: styles.duration,
        ease: 'Linear',
      });
    }
  }

  /**
   * Tweens the tint from the current color to the new style's color.
   * Alpha is left untouched. Only called when the highlight is already on.
   */
  #switchHighlight(styles: HighlightStyles): void {
    const from = Phaser.Display.Color.IntegerToColor(this.#highlight!.tintTopLeft);
    const to   = Phaser.Display.Color.IntegerToColor(styles.bgColor);
    const lerp = { t: 0 };

    this.#highlightTween = this.#scene.tweens.add({
      targets:  [lerp, this.#highlight],
      t:        1,
      alpha:    styles.opacity,
      duration: styles.duration,
      ease:     'Linear',
      onUpdate: () => {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(from, to, 1, lerp.t);
        this.#highlight?.setTint(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
      },
    });
  }

  /**
   * Shows a step number on the tile. Creates the label on first call.
   */
  setStepLabel(n: number): void {
    if (!this.#stepLabel) {
      this.#stepLabel = new Text(this.#scene, {
        text: '',
        fontSize: UI.FONT.SIZE.XS,
        fontFamily: UI.FONT.FAMILY.PRIMARY,
        color: UI.PALETTE.WHITE,
      }).setOrigin(0.5, 0.5);
      this.add(this.#stepLabel);
    }

    this.#stepLabel.setText(String(n)).setVisible(true);
  }

  /**
   * Hides the step label if one exists.
   */
  clearStepLabel(): void {
    this.#stepLabel?.setVisible(false);
  }

  /**
   * Fades out the highlight overlay and hides it on complete.
   * Stops any in-progress set tween before starting the fade out.
   */
  unsetHighlight(styles: {duration: number}): void {
    this.#isHighlightOn = false;
    this.#highlightTween?.stop();

    this.#highlightTween = this.#scene.tweens.add({
      targets: this.#highlight,
      alpha: 0,
      duration: styles.duration,
      ease: 'Linear',
      onComplete: () => { this.#highlight?.setVisible(false); },
    });
  }
}
