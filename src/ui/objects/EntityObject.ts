import { SETTINGS, UI_SIZES, UI_VARIANTS } from '@constants';
import type { EntityModel } from '@engine/models';
import { Healthbar } from '@ui/components';

/**
 * Container for a single entity on the board. Renders the entity sprite and
 * an optional Healthbar shown when current health drops below max.
 */
export class EntityObject extends Phaser.GameObjects.Container {
  #sprite: Phaser.GameObjects.Sprite;
  #healthbar: Healthbar | null = null;

  constructor(scene: Phaser.Scene, entity: EntityModel) {
    super(scene, 0, 0);

    this.#sprite = new Phaser.GameObjects.Sprite(scene, 0, 0, entity.texture, entity.frame).setScale(entity.scale);
    this.#sprite.setTint(SETTINGS.COLOR.OPTIONS[entity.color].color);

    this.add(this.#sprite);
    this.setDepth(entity.layer);

    if (entity.healthMax) {
      this.#healthbar = new Healthbar(scene, {
        ...UI_SIZES.BAR.HORIZONTAL.MD,
        ...UI_VARIANTS.BAR.HEALTH,
        // vertical: true,
      });

      this.#healthbar.setPosition(0, 30); // Horizontal
      // this.#healthbar.setPosition(-42, 0); // Vertical
      this.add(this.#healthbar);
    }

    scene.add.existing(this);
  }

  get sprite(): Phaser.GameObjects.Sprite {
    return this.#sprite;
  }

  setHealth(current: number, max: number) {
    this.#healthbar?.setValue(current, max);
    this.#healthbar?.setVisible(current < max && current > 0);
  }
}
