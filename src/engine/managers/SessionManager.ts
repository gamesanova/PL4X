import { GameEnginePhase, GameSettings, GameState } from '@engine';
import { EntityModel, PlayerModel } from '@engine/models';

/**
 * Manages session-level state as the single access point for phase transitions,
 * game settings, and player resources. Phases and systems must use this manager
 * rather than reading or writing session state on GameState directly.
 */
export class SessionManager {
  #state: GameState;
  #activeEntity: EntityModel | null = null;

  constructor(state: GameState) {
    this.#state = state;
  }

  /**
   * Initialises session state from settings and resets phase to IDLE. Called
   * by initializers at the start of a new or loaded game. currentPlayerId is
   * set to the last player so that the first incrementPlayer call in
   * TURN_NEXT_PLAYER wraps to index 0, starting the turn cycle from the
   * beginning of the player array regardless of player type order.
   * @param settings - The game settings for this session.
   * @param players - The ordered list of players for this session.
   */
  init(settings: GameSettings, players: PlayerModel[]) {
    this.#state.settings = settings;
    this.#state.players = players;
    this.#state.phase = 'IDLE';
    this.#state.currentPlayerId = players[players.length - 1]?.id ?? null;
  }

  /**
   * Returns the current game phase.
   * @returns The active phase name.
   */
  getPhase(): GameEnginePhase {
    return this.#state.phase;
  }

  /**
   * Transitions the game to a new phase.
   * @param phase - The phase to transition to.
   */
  setPhase(phase: GameEnginePhase) {
    this.#state.phase = phase;
  }

  /**
   * Stores the entity selected for a unit command. Called by IdlePhase when
   * transitioning into ENTITY_COMMAND so EntityCommandPhase can read it on follow-up actions.
   * @param entity - The entity to set as active, or null to clear.
   */
  setActiveEntity(entity: EntityModel | null) {
    this.#activeEntity = entity;
  }

  /**
   * Returns the currently active entity, or null if none is set.
   * @returns The active entity, or null.
   */
  getActiveEntity(): EntityModel | null {
    return this.#activeEntity;
  }

  /**
   * Returns the current turn number.
   * @returns The current turn count.
   */
  getTurn(): number {
    return this.#state.turn;
  }

  /**
   * Advances to the next player in the players array, wrapping back to the
   * start at the end.
   * @returns The new current player id.
   */
  incrementPlayer(): string {
    const players = this.getPlayers();
    const index = players.findIndex(p => p.id === this.#state.currentPlayerId);
    const next = players[(index + 1) % players.length];

    this.#state.currentPlayerId = next.id;

    return next.id;
  }

  /**
   * Increments the turn counter by one.
   * @returns The new turn count.
   */
  incrementTurn(): number {
    this.#state.turn = this.#state.turn + 1;
    return this.#state.turn;
  }

  // TODO: Needs to change to more turn based setup with currentPlayerId...
  /**
   * Returns all players for the current session.
   * @returns The ordered list of players.
   */
  getPlayers(): PlayerModel[] {
    return this.#state.players;
  }

  /**
   * Returns the current player, or undefined if not found.
   * @returns The current player, or undefined.
   */
  getCurrentPlayer(): PlayerModel | undefined {
    return this.#state.players.find(p => p.id === this.#state.currentPlayerId);
  }

  /**
   * Returns a snapshot of session state. Called by SaveGame to persist the
   * current session. Eventually each manager will contribute its own slice.
   * @returns A partial snapshot of session state.
   */
  serialize() {
    // TODO: Return a full session snapshot (phase, turn, players, resources).
    return {
      settings: this.#state.settings,
      phase:    this.#state.phase,
    };
  }

  /**
   * Restores session state from a saved snapshot. Called by LoadGame after
   * the snapshot is fetched and validated.
   * @param data - The snapshot to restore from.
   * @param data.settings - The game settings to restore.
   */
  deserialize(data: { settings: GameSettings }) {
    // TODO: Restore phase, turn, players, resources from snapshot.
    const players = data.settings.players.map(p => new PlayerModel({ id: p.id, type: p.type, color: data.settings.color, score: 0 }));

    this.init(data.settings, players);
  }
}
