import { EVENTS, GameSettingsColorKey, GameSettingsDifficultyKey } from '@constants';
import { createSettings, GameSettings } from '@engine';
import { BgView, MainMenuView } from '@ui/views';
import { BaseScene } from '@scenes';

/**
 * The main menu scene. Manages game settings state and wires up UI events from
 * the menu views to settings mutations and scene transitions.
 */
export class MenuScene extends BaseScene {
  #settings!: GameSettings;

  constructor() {
    super({ key: 'MenuScene' });
  }

  /**
   * Initialises default settings, builds the menu views, and sets up listeners
   * for settings changes and scene transitions.
   */
  create() {
    this.#settings = createSettings();

    new BgView(this);
    new MainMenuView(this, this.#settings);

    this.#setupListeners();

    // TEST: Auto fire into boot during testing to avoid having to
    //       constantly click through the main menu, remove later.
    // this.events.emit(EVENTS.MAIN_MENU.START);
  }

  /**
   * Wires up all scene-level event listeners for settings mutations and
   * scene transitions.
   */
  #setupListeners() {
    // Handlers for all settings.
    this.on(EVENTS.MAIN_MENU.COLOR, (c) => this.#settings.color = c as GameSettingsColorKey);
    this.on(EVENTS.MAIN_MENU.DIFFICULTY, (d) => this.#settings.difficulty = d as GameSettingsDifficultyKey);

    // EXAMPLE: Saving for later.
    // this.scene.on(EVENTS.PLAYER.ADD, (p) => this.#settings.players.push(p));
    // this.scene.on(EVENTS.PLAYER.REMOVE, (i) => this.#settings.players.splice(i, 1));
    // this.scene.on(EVENTS.PLAYER.UPDATE, ({ index, ...changes }) => Object.assign(this.#settings.players[index], changes));

    // Start play and pass the settings in.
    this.on(EVENTS.MAIN_MENU.START, () => this.scene.start('PlayScene', { type: 'NEW', settings: this.#settings }));
  }
}
