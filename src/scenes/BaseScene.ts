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
   * The scene will destroy/shutdown but Phaser reuses the instance hence there is no
   * event clean up. This helper will be used to keep event register and clean up easier.
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
