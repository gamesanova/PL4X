import { ASSETS, ENTITIES, EntityUnitKey, GameSettingsColorKey, SETTINGS } from '@constants';
import { GameState } from '@engine';
import { EntityModel } from '@engine/models';

type BaseConfig = {
  playerId: string;
  tileX: number;
  tileY: number;
}

type UnitConfig = BaseConfig & { variant: EntityUnitKey };

/**
 * Manages entity creation and spatial/player indexing. Acts as the single
 * access point for spawning and removing entities from GameState, while
 * maintaining lookup caches by tile and by player. All entity spawning
 * and removal flows through here rather than touching state directly.
 */
export class EntityManager {
  #state: GameState;
  #entitiesByPlayer: Map<string, Set<EntityModel>> = new Map();
  #entitiesByTile: Map<number, EntityModel> = new Map();

  constructor(state: GameState) {
    this.#state = state;
  }

  /**
   * Initialises lookup caches from existing state. Called once after GameState
   * is populated, primarily needed when loading a saved game.
   */
  initCaches() {
    // TODO: Setup maps for entitiesByPlayer and entitiesByTile => this is needed for loading a game.
  }

  /**
   * Creates and registers a unit entity from the given config, merging asset
   * and constant data. Returns null if the target tile is occupied.
   * @param config - Unit configuration including player, tile, and variant.
   * @returns The created entity, or null if the tile was occupied.
   */
  addUnit(config: UnitConfig): EntityModel | null {
    if (this.isTileOccupied(config.tileX, config.tileY)) {
      return null;
    }

    const entity = new EntityModel({
      id: this.#state.generateEntityId(),
      color: this.#getPlayerColor(config.playerId),
      frame: ASSETS.UNIT.MAP[config.variant],
      layer: ASSETS.UNIT.LAYER,
      scale: ASSETS.UNIT.SCALE,
      texture: ASSETS.UNIT.KEY,
      ...config,
      ...ENTITIES.UNIT.OPTIONS[config.variant],
    });

    this.#addEntity(entity);

    return entity;
  }

  /**
   * Returns the color key assigned to the given player, falling back to the
   * settings default if the player is not yet registered.
   * @param playerId - The player ID to look up.
   * @returns The player's color key.
   */
  #getPlayerColor(playerId: string): GameSettingsColorKey {
    return this.#state.players.find(p => p.id === playerId)?.color ?? SETTINGS.COLOR.DEFAULT;
  }

  /**
   * Returns all unit entities owned by the given player.
   * @param playerId - The player ID to look up.
   * @returns All entities owned by that player.
   */
  getUnits(playerId: string): EntityModel[] {
    const playerSet = this.#entitiesByPlayer.get(playerId);

    if (!playerSet) { return []; }

    return [...playerSet];
  }

  /**
   * Returns the entity at the given tile coordinates, or null if unoccupied.
   * @param x - Tile x coordinate.
   * @param y - Tile y coordinate.
   * @returns The entity at that tile, or null.
   */
  getEntityAt(x: number, y: number): EntityModel | null {
    return this.#entitiesByTile.get(this.#tileKey(x, y)) ?? null;
  }

  /**
   * Returns true if a tile is occupied by any entity.
   * @param x - Tile x coordinate.
   * @param y - Tile y coordinate.
   * @returns True if the tile is occupied.
   */
  isTileOccupied(x: number, y: number): boolean {
    return this.#entitiesByTile.has(this.#tileKey(x, y));
  }

  /**
   * Encodes (x, y) tile coordinates into a single integer key for the tile cache.
   * @param x - Tile x coordinate.
   * @param y - Tile y coordinate.
   * @returns The encoded integer key.
   */
  #tileKey(x: number, y: number): number {
    return (x << 16) | y;
  }

  /**
   * Registers an entity in GameState and both lookup caches (by tile and by player).
   * @param entity - The entity to register.
   */
  #addEntity(entity: EntityModel) {
    const tileKey = this.#tileKey(entity.tileX, entity.tileY);
    let playerSet = this.#entitiesByPlayer.get(entity.playerId);

    if (!playerSet) {
      playerSet = new Set();
      this.#entitiesByPlayer.set(entity.playerId, playerSet);
    }

    this.#state.addEntity(entity);
    playerSet.add(entity);
    this.#entitiesByTile.set(tileKey, entity);
  }

  /**
   * Moves an entity to a new tile, updating its coordinates and re-keying the
   * tile cache. Does not validate occupancy - caller must ensure the target tile
   * is free before calling.
   * @param entity - The entity to move.
   * @param toX - Destination tile x coordinate.
   * @param toY - Destination tile y coordinate.
   */
  moveEntity(entity: EntityModel, toX: number, toY: number): void {
    this.#entitiesByTile.delete(this.#tileKey(entity.tileX, entity.tileY));
    entity.tileX = toX;
    entity.tileY = toY;
    this.#entitiesByTile.set(this.#tileKey(toX, toY), entity);
  }

  /**
   * Removes an entity from GameState and both lookup caches (by tile and by player).
   * @param entity - The entity to remove.
   */
  removeEntity(entity: EntityModel) {
    const tileKey = this.#tileKey(entity.tileX, entity.tileY);

    this.#state.removeEntity(entity);
    this.#entitiesByPlayer.get(entity.playerId)?.delete(entity);
    this.#entitiesByTile.delete(tileKey);
  }
}
