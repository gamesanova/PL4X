import Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #listeners: Array<[string, (...args: any[]) => void]> = [];

  /**
   * Init makes sure listeners always get removed first.
   */
  init() {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.removeAllListeners());
  }

  /**
   * Registers a scene event listener and tracks it for automatic cleanup on shutdown.
   * Phaser reuses scene instances, so listeners must be manually removed to avoid
   * duplicates across scene restarts.
   * @param event - The event name to listen for.
   * @param fn - The listener function.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected on(event: string, fn: (...args: any[]) => void) {
    this.events.on(event, fn);
    this.#listeners.push([event, fn]);
  }

  /**
   * Clean up all the registered events.
   */
  protected removeAllListeners() {
    this.#listeners.forEach(([event, fn]) => this.events.off(event, fn));
    this.#listeners = [];
  }
}
