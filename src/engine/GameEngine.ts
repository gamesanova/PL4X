import { GameEngineAction, GameEngineEffect, GameEngineInitAction, GameEngineInitData, GameEnginePhase, GameState } from '@engine';
import { LoadGame, NewGame, SaveGame } from '@engine/initializers';
import { ManagerRegistry } from '@engine/managers';
import { EntityCommandPhase, EntitySelectPhase, IdlePhase, TurnProcessingPhase } from '@engine/phases';
import { SystemRegistry } from '@engine/systems';

/**
 * A phase handler exposes a single handle() entry point for action dispatch.
 */
type PhaseHandler = { handle: (managers: ManagerRegistry, systems: SystemRegistry, action: GameEngineAction) => GameEngineEffect[] };

/**
 * The main engine entry point. Owns the game state, manager registry, system
 * registry, and phase map. The scene communicates with the engine exclusively
 * through dispatch() and init() — nothing outside this class reads engine
 * state directly.
 */
export class GameEngine {
  #gameState: GameState;
  #managers: ManagerRegistry;
  #systems: SystemRegistry;

  /**
   * All registered phase handlers keyed by phase name. Only phases listed here
   * can receive dispatched actions or be targeted by a REDIRECT effect.
   */
  #phases: Partial<Record<GameEnginePhase, PhaseHandler>> = {
    ENTITY_COMMAND: new EntityCommandPhase,
    ENTITY_SELECT: new EntitySelectPhase,
    IDLE: new IdlePhase,
    TURN_PROCESSING: new TurnProcessingPhase,
  };

  /**
   * Instantiates GameState, ManagerRegistry, and SystemRegistry. Does not
   * start a game session — call init() to bootstrap state.
   */
  constructor() {
    this.#gameState = new GameState;
    this.#managers = new ManagerRegistry(this.#gameState);
    this.#systems = new SystemRegistry();
  }

  /**
   * Routes an action to the currently active phase and returns the resulting
   * effects. If the first effect is a REDIRECT, the action is forwarded to the
   * target phase instead — this lets a phase hand off handling without
   * triggering a cancel or any intermediate state changes. A redirect must
   * always be the only effect returned by a phase.
   */
  dispatch(action: GameEngineAction): GameEngineEffect[] {
    const phase = this.#phases[this.#managers.session.getPhase()];

    if (!phase) { return []; }

    return phase.handle(this.#managers, this.#systems, action);
  }

  /**
   * Bootstraps a game session. Runs either NewGame or LoadGame depending on
   * the action type, then initialises all manager and system caches. Returns
   * the initial entity and tile data the scene needs to build its views.
   */
  async init(action: GameEngineInitAction): Promise<GameEngineInitData> {
    switch (action.type) {
      case 'NEW': await NewGame.run(action.settings, this.#managers); break;
      case 'LOAD': await LoadGame.run(this.#managers); break;
    }

    this.#managers.initCaches();
    this.#systems.initCaches();

    return {
      entities: [...this.#gameState.entities.values()],
      tiles: this.#gameState.tiles,
      width: this.#gameState.settings!.width,
      height: this.#gameState.settings!.height,
    };
  }

  /**
   * Persists the current game session via SaveGame.
   */
  async save() {
    await SaveGame.run(this.#managers);
  }
}
