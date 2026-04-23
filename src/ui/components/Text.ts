import { toHex } from '@utils';

export type TextStyles = Omit<Phaser.Types.GameObjects.Text.TextStyle, 'color'> & {
  x?: number;
  y?: number;
  text: string;
  color?: number;
};

/**
 * Thin wrapper around Phaser.GameObjects.Text that accepts color as a hex
 * number and converts it to a CSS string.
 */
export class Text extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, styles: TextStyles) {
    const { x = 0, y = 0, text, color, ...rest } = styles;
    super(scene, x, y, text, {
      ...rest,
      color: color !== undefined ? toHex(color) : undefined,
    });
    scene.add.existing(this);
  }
}
