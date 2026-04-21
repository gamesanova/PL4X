import { ASSETS, EntityDamageType, EntityWeaponType, UI_SIZES, UI_VARIANTS } from '@constants';
import { GameEngineEntityHealthCause } from '@engine';
import { EntityObject } from '@ui/objects';
import { FloatingText } from '@ui/components';

type VfxNotifyInfo = {
  label: string;
  notifyType: GameEngineEntityHealthCause;
}

type VfxAttackInfo = {
  aoe: number | null;
  damageType: EntityDamageType;
  weaponType: EntityWeaponType;
}

/**
 * Discriminated union of all board-level visual effects. One-shot effects
 * resolve as promises when their animation completes. Persistent effects
 * (DAZED, BURNING) run until explicitly removed via remove().
 */
export type BoardVfx =
  | { type: 'SPAWN'; target: EntityObject }
  | { type: 'MOVE'; entity: EntityObject; x: number; y: number; duration?: number }
  | { type: 'ATTACK'; attacker: EntityObject; target: EntityObject; attackInfo: VfxAttackInfo }
  | { type: 'NOTIFY'; entity: EntityObject; notifyInfo: VfxNotifyInfo }
  | { type: 'DEATH'; entity: EntityObject }
  | { type: 'DAZED'; entity: EntityObject }
  | { type: 'BURNING'; entity: EntityObject };


/**
 * Per-emitter positions and settings for the dazed star particle effect.
 * Three emitters arranged in an arc above the entity's head.
 */
const DAZED_CONFIGS = [
  { x: -18, y: -36, size: 6, frequency: 300 },  // left star
  { x:   0, y: -44, size: 8, frequency: 250 },  // center star, slightly higher
  { x:  18, y: -36, size: 6, frequency: 300 },  // right star
];

/**
 * Per-emitter positions and settings for the burning particle effect.
 * Five emitters arranged across the entity to simulate a spreading fire.
 */
const BURNING_CONFIGS = [
  { x:   0, y:   5, scaleStart: 10, scaleEnd: 2, quantity: 4, frequency: 50  },  // center, large
  { x: -20, y:  12, scaleStart:  6, scaleEnd: 1, quantity: 3, frequency: 70  },  // left, medium
  { x:  22, y:   8, scaleStart:  7, scaleEnd: 1, quantity: 3, frequency: 65  },  // right, medium
  { x:  -8, y: -12, scaleStart:  4, scaleEnd: 1, quantity: 2, frequency: 90  },  // top-left, small
  { x:  14, y: -10, scaleStart:  5, scaleEnd: 1, quantity: 2, frequency: 80  },  // top-right, small
];

/**
 * UI system that plays board-level visual effects. Receives BoardVfx events
 * dispatched by the scene and routes them to the appropriate animation.
 *
 * One-shot effects (SPAWN, MOVE, ATTACK, DAMAGE, DEATH, REGEN) resolve as
 * promises when their animation finishes. Persistent effects (DAZED, BURNING)
 * attach particle emitters to an entity and run until remove() is called.
 * All persistent emitters are cleaned up automatically on scene shutdown.
 */
export class BoardVfxSystem {
  #scene: Phaser.Scene;
  #burning: Map<Phaser.GameObjects.GameObject, Phaser.GameObjects.Particles.ParticleEmitter[]> = new Map();
  #dazed: Map<Phaser.GameObjects.GameObject, Phaser.GameObjects.Particles.ParticleEmitter[]> = new Map();
  #notifyQueue: Map<EntityObject, VfxNotifyInfo[]> = new Map();

  constructor(scene: Phaser.Scene) {
    this.#scene = scene;
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.#destroy());
  }

  /**
   * Plays a one-shot effect or attaches a persistent effect for the given
   * BoardVfx event. One-shot effects return a promise that resolves on
   * completion. Persistent effects (DAZED, BURNING) return immediately.
   */
  async add(effect: BoardVfx): Promise<void> {
    switch (effect.type) {
      case 'ATTACK': return this.#onceAttack(effect.attacker, effect.target, effect.attackInfo);
      case 'NOTIFY': return this.#notify(effect.entity, effect.notifyInfo);
      case 'DEATH': return this.#onceDeath(effect.entity);
      case 'MOVE': return this.#onceMove(effect.entity, effect.x, effect.y, effect.duration);
      case 'SPAWN': return this.#onceSpawn(effect.target);
      case 'DAZED': return this.#addDazed(effect.entity);
      case 'BURNING': return this.#addBurning(effect.entity);
    }
  }

  /**
   * Stops and destroys a persistent effect on the given entity.
   * No-ops if the effect is not currently active on that entity.
   */
  async remove(effect: BoardVfx): Promise<void> {
    switch (effect.type) {
      case 'DAZED': return this.#removeDazed(effect.entity);
      case 'BURNING': return this.#removeBurning(effect.entity);
    }
  }

  /**
   * Enqueues a floating text notification above the entity. If no queue exists
   * for the entity the item is added and the drain starts immediately. Otherwise
   * it is appended and the active drain picks it up in turn.
   */
  #notify(entity: EntityObject, notifyInfo: VfxNotifyInfo): void {
    const queue = this.#notifyQueue.get(entity);

    if (queue) {
      queue.push(notifyInfo);
    } else {
      this.#notifyQueue.set(entity, [notifyInfo]);
      this.#notifyQueueDrain(entity);
    }
  }

  /**
   * Shifts the next item off the entity's queue and renders it as a floating
   * text. Schedules itself again after 350ms if more items remain, otherwise
   * removes the queue entry.
   */
  #notifyQueueDrain(entity: EntityObject): void {
    const queue = this.#notifyQueue.get(entity);
    const item  = queue?.shift();

    if (!item) {
      this.#notifyQueue.delete(entity);
      return;
    }

    new FloatingText(this.#scene, {
      x: entity.x,
      y: entity.y,
      label: item.label,
      duration: UI_VARIANTS.VFX.NOTIFY.duration,
      ...UI_SIZES.TEXT.SM,
      ...UI_VARIANTS.TEXT.SECONDARY,
      color: UI_VARIANTS.VFX_COLORS[item.notifyType],
    }).animate();

    this.#scene.time.delayedCall(UI_VARIANTS.VFX.NOTIFY.delay, () => this.#notifyQueueDrain(entity));
  }

  /**
   * Drops all pending notifications for the entity. Called on death to prevent
   * floating text firing after the entity has been removed.
   */
  #notifyQueueClear(entity: EntityObject): void {
    this.#notifyQueue.delete(entity);
  }

  /**
   * Routes to the appropriate attack animation based on damage type and range.
   * Falls back to a no-op promise for unimplemented combinations.
   */
  #onceAttack(attacker: EntityObject, target: EntityObject, attackInfo: VfxAttackInfo): Promise<void> {
    switch (attackInfo.weaponType) {
      case 'BOW': return this.#onceAttackBow(attacker, target, attackInfo);
      case 'MELEE': return this.#onceAttackMelee(attacker, target);
    }

    return Promise.resolve();
  }

  #onceAttackBow(attacker: EntityObject, target: EntityObject, attackInfo: VfxAttackInfo): Promise<void> {
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const angle = Math.atan2(dy, dx);

    const bolt = this.#scene.add.graphics();
    bolt.fillStyle(UI_VARIANTS.VFX_COLORS[attackInfo.damageType], 1);
    bolt.fillRect(-14, -3, 24, 6);
    bolt.fillTriangle(10, -6, 10, 6, 20, 0);
    bolt.setPosition(attacker.x, attacker.y);
    bolt.setRotation(angle);
    bolt.setDepth(15);

    return new Promise(resolve => {
      this.#scene.tweens.add({
        targets: bolt,
        x: target.x,
        y: target.y,
        duration: UI_VARIANTS.VFX_ATTACK.BOW.duration,
        ease: 'Linear',
        onComplete: () => {
          bolt.destroy(); resolve();
        },
      });
    });
  }

  #onceAttackMelee(attacker: EntityObject, target: EntityObject): Promise<void> {
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const normX = dx / dist;
    const normY = dy / dist;
    const nudge = 20;
    const cfg = UI_VARIANTS.VFX_ATTACK.MELEE;

    return new Promise(resolve => {
      this.#scene.tweens.chain({
        targets: attacker.sprite,
        tweens: [
          { x: normX * nudge, y: normY * nudge, duration: cfg.duration, ease: 'Sine.easeOut' },
          { x: 0, y: 0, duration: cfg.duration, ease: 'Sine.easeIn' },
        ],
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * Plays a non-blocking expanding ring at the target position to indicate AoE
   * splash radius. The ring starts at scale 0 and expands to aoe * tile width,
   * fading out simultaneously over the configured duration.
   */
  #onceAttackAoe(target: EntityObject, attackInfo: VfxAttackInfo): void {
    const radius = (attackInfo.aoe ?? 1) * ASSETS.TERRAIN.WIDTH;
    const cfg = UI_VARIANTS.VFX_ATTACK.AOE;

    const ring = this.#scene.add.graphics();
    ring.lineStyle(3, UI_VARIANTS.VFX_COLORS[attackInfo.damageType], 1);
    ring.strokeCircle(0, 0, radius);
    ring.setPosition(target.x, target.y);
    ring.setScale(0);
    ring.setDepth(15);

    this.#scene.tweens.add({
      targets: ring,
      scale: 1,
      alpha: 0.5,
      duration: cfg.duration,
      ease: 'Sine.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  /**
   * Plays the death animation — emits a pixel particle burst at the target's
   * position then fades the target to alpha 0 over the configured duration.
   * Destroys the particle emitter on completion.
   */
  #onceDeath(target: EntityObject): Promise<void> {
    this.#notifyQueueClear(target);

    const particles = this.#scene.add.particles(target.x, target.y, ASSETS.PIXEL.KEY, {
      tint: UI_VARIANTS.VFX.DEATH.tint,
      lifespan: UI_VARIANTS.VFX.DEATH.durationParticles,
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 6, end: 0 },
      quantity: 20,
      emitting: false,
    });

    particles.explode(20);
    this.#scene.time.delayedCall(UI_VARIANTS.VFX.DEATH.durationParticles, () => particles.destroy());

    return new Promise(resolve => {
      this.#scene.tweens.add({
        targets: target,
        alpha: 0,
        duration: UI_VARIANTS.VFX.DEATH.duration,
        ease: 'Linear',
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * Tweens the target to the given world position. Uses the default move duration
   * but accepts an override for cases where a unit travels across multiple tiles
   * and each step needs a proportionally shorter duration. Resolves when the tween completes.
   */
  #onceMove(target: EntityObject, x: number, y: number, duration?: number): Promise<void> {
    return new Promise(resolve => {
      this.#scene.tweens.add({
        targets: target,
        x,
        y,
        duration: duration ?? UI_VARIANTS.VFX.MOVE.duration,
        ease: 'Linear',
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * Fades the target in from alpha 0 to 1 over the configured spawn duration.
   * Resolves when the tween completes.
   */
  #onceSpawn(target: EntityObject): Promise<void> {
    target.setAlpha(0);
    return new Promise(resolve => {
      this.#scene.tweens.add({
        targets: target,
        alpha: 1,
        duration: UI_VARIANTS.VFX.SPAWN.duration,
        ease: 'Linear',
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * Attaches three star particle emitters above the entity to indicate a dazed
   * state. No-ops if the entity already has an active dazed effect.
   */
  #addDazed(entity: EntityObject): void {
    if (this.#dazed.has(entity)) return;

    const emitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

    for (const cfg of DAZED_CONFIGS) {
      const emitter = this.#scene.add.particles(entity.x + cfg.x, entity.y + cfg.y, ASSETS.PIXEL.KEY, {
        lifespan: UI_VARIANTS.VFX_STATUS.DAZED.durationParticles,
        speed: { min: 5, max: 20 },
        angle: { min: 0, max: 360 },
        scale: { start: cfg.size, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: UI_VARIANTS.VFX_STATUS.DAZED.tint,
        quantity: 1,
        frequency: cfg.frequency,
      });

      emitter.setDepth(20);
      emitters.push(emitter);
    }

    this.#dazed.set(entity, emitters);
  }

  /**
   * Attaches five burning particle emitters across the entity to simulate a
   * spreading fire. No-ops if the entity already has an active burning effect.
   */
  #addBurning(entity: EntityObject): void {
    if (this.#burning.has(entity)) return;

    const emitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

    for (const cfg of BURNING_CONFIGS) {
      const emitter = this.#scene.add.particles(entity.x + cfg.x, entity.y + cfg.y, ASSETS.PIXEL.KEY, {
        lifespan: UI_VARIANTS.VFX_STATUS.BURNING.durationParticles,
        speed: { min: 20, max: 60 },
        angle: { min: 250, max: 290 },
        scale: { start: cfg.scaleStart, end: cfg.scaleEnd },
        alpha: { start: 1, end: 0 },
        tint: UI_VARIANTS.VFX_STATUS.BURNING.tint,
        quantity: cfg.quantity,
        frequency: cfg.frequency,
      });

      emitter.setDepth(20);
      emitters.push(emitter);
    }

    this.#burning.set(entity, emitters);
  }

  /**
   * Destroys all dazed emitters on the given entity and removes it from
   * the dazed tracking map.
   */
  #removeDazed(entity: EntityObject): void {
    const emitters = this.#dazed.get(entity);
    if (emitters) {
      emitters.forEach(e => e.destroy());
      this.#dazed.delete(entity);
    }
  }

  /**
   * Destroys all burning emitters on the given entity and removes it from
   * the burning tracking map.
   */
  #removeBurning(entity: EntityObject): void {
    const emitters = this.#burning.get(entity);
    if (emitters) {
      emitters.forEach(e => e.destroy());
      this.#burning.delete(entity);
    }
  }

  /**
   * Destroys all active persistent emitters (burning and dazed) and clears
   * their tracking maps. Called automatically on scene shutdown.
   */
  #destroy(): void {
    this.#burning.forEach(emitters => emitters.forEach(e => e.destroy()));
    this.#burning.clear();
    this.#dazed.forEach(emitters => emitters.forEach(e => e.destroy()));
    this.#dazed.clear();
  }
}
