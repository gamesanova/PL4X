import { GameStateSnapshot } from '@engine';
import { ManagerRegistry } from '@engine/managers';

export class LoadGame {

  /**
   * Fetches a saved snapshot from local storage or an external API and deserializes
   * it into state via managers. Handles version migration or data mutation before
   * restoring. Can be made async if the data source requires it.
   */
  static run(managers: ManagerRegistry) {
    // TODO: Fetch data (local storage or API).
    // TODO: "data" param type here will be from GameState itself (shape should be defined there strictyly).
    // TODO: Could do some validation / mutate of data here for dealing with different versions, etc.

    const data: GameStateSnapshot = {
      // entities: {},
      settings: { color: 'RED', difficulty: 'NORMAL', width: 0, height: 0, players: [] },
      tiles: [],
    };

    managers.session.deserialize(data);
  }
}
