import { ManagerRegistry } from '@engine/managers';

/**
 * Collects a snapshot from all managers and persists it. Supports async
 * targets such as local storage or an external API.
 */
export class SaveGame {

  /**
   * Collects a snapshot of all session state via managers and persists it.
   * Each manager will eventually own its own serialize() for their domain.
   * Can be made async if the data target requires it.
   * @param managers - The manager registry to collect state snapshots from.
   */
  static run(managers: ManagerRegistry) {
    // TODO: Collect snapshots from all managers once each has serialize().
    // TODO: Persist to local storage or API.
    const snapshot = managers.session.serialize();
    console.log(snapshot);
  }
}
