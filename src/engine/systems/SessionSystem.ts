import { ManagerRegistry } from '@engine/managers';

/**
 * Stateless system for session-level outcome checks. Queries player and entity
 * state to determine win and loss conditions.
 */
export class SessionSystem {

  /**
   * Returns true if all human players have no remaining living units.
   * @param managers - The manager registry.
   * @returns True if the game is over.
   */
  isGameOver(managers: ManagerRegistry): boolean {
    return managers.session.getPlayers()
      .filter(p => p.type === 'HUMAN')
      .every(p => managers.entity.getUnits(p.id).length === 0);
  }

  /**
   * Returns true if all bot players have no remaining living units.
   * @param managers - The manager registry.
   * @returns True if the player has won.
   */
  isGameWin(managers: ManagerRegistry): boolean {
    return managers.session.getPlayers()
      .filter(p => p.type === 'BOT')
      .every(p => managers.entity.getUnits(p.id).length === 0);
  }
}
