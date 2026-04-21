import { EntityModel, PlayerModel } from '@engine/models';
import { GameEnginePhase, GameSettings, GameStateSnapshot } from '@engine';
import { TileData } from '@engine/maps';

export class GameState {
  #currentPlayerId: string | null = null;
  #entities: Map<string, EntityModel> = new Map();
  #entityIdCounter: number = 0;
  #players: PlayerModel[] = [];
  #settings: GameSettings | null = null;
  #phase: GameEnginePhase = 'IDLE';
  #tiles: (TileData | null)[][] = [];
  #turn: number = 0;

  constructor() {
    //
  }

  get currentPlayerId() { return this.#currentPlayerId; }
  get entities() { return this.#entities; }
  get phase() { return this.#phase; }
  get players() { return this.#players; }
  get settings() { return this.#settings; }
  get tiles() { return this.#tiles; }
  get turn() { return this.#turn; }

  set currentPlayerId(id) { this.#currentPlayerId = id; }
  set phase(phase) { this.#phase = phase; }
  set players(players) { this.#players = players; }
  set settings(settings) { this.#settings = settings; }
  set tiles(tiles) { this.#tiles = tiles; }
  set turn(turn) { this.#turn = turn; }

  generateEntityId() {
    return `ent_${this.#entityIdCounter++}`;
  }

  addEntity(entity: EntityModel) {
    this.#entities.set(entity.id, entity);
  }

  removeEntity(entity: EntityModel) {
    this.#entities.delete(entity.id);
  }

  deserialize(_data: GameStateSnapshot) {
    // TOOD: Load up the raw data back into it's necessary local format, Maps, etc.
    // TODO: Make sure init caches also run to set things like neighbor and edge tiles.
  }

  serialize() {
    // TODO: Deserliaze all data into plain object, strings, etc, don't need neighbors or other cached data here.

    return {};
  }
}
