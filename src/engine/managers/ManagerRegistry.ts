import { GameState } from '@engine';
import { EntityManager, MapManager, SessionManager } from '@engine/managers';

export interface IManagerRegistry {
  entity: EntityManager;
  map: MapManager;
  session: SessionManager;
}

/**
 * Injectable container that owns and exposes all managers. Passed into systems
 * and initializers so state is always accessed through the appropriate manager
 * rather than directly. Add new managers here as the engine grows.
 */
export class ManagerRegistry implements IManagerRegistry {
  readonly entity: EntityManager;
  readonly map: MapManager;
  readonly session: SessionManager;

  constructor(gameState: GameState) {
    this.entity = new EntityManager(gameState);
    this.map = new MapManager(gameState);
    this.session = new SessionManager(gameState);
  }

  /**
   * Initialises caches on all registered managers. Called once after GameState
   * is populated at the start of a session.
   */
  initCaches() {
    this.entity.initCaches();
    this.map.initCaches();
  }
}
