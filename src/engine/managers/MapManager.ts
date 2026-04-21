import { GameSettings, GameState } from '@engine';
import { MapGenerator, TileData } from '@engine/maps';
import { Logger } from '@utils';

/**
 * Manages map data as the single access point between GameState and the rest
 * of the engine. All tile queries, neighbor lookups, edge tile access, and
 * spatial operations should flow through here rather than touching state directly.
 */
export class MapManager {
  #state: GameState;
  #edgeTiles: Set<TileData> = new Set();

  constructor(state: GameState) {
    this.#state = state;
  }

  /**
   * Generates and stores the tile grid from settings. Called by initializers
   * at the start of a new session in place of setting tiles directly on state.
   */
  generate(settings: GameSettings) {
    this.#state.tiles = MapGenerator.generate({ width: settings.width, height: settings.height });
  }

  initCaches() {
    Logger.log ('init', 'Map Manager Caches');

    this.#cacheEdgeTiles();
    this.#cahceTileNeighbors();
  }

  /**
   * Returns the tile at (x, y), or null if out of bounds or on a null cell.
   */
  getTileAt(x: number, y: number) {
    return this.#state.tiles[y]?.[x] ?? null;
  }

  /**
   * Returns tiles in one or more rings around (x, y).
   *
   * getTileRing(x, y, 3)    — ring 3 only
   * getTileRing(x, y, 3, 2) — rings 2 and 3
   * getTileRing(x, y, 3, 1) — rings 1, 2, and 3
   * getTileRing(x, y, 3, 0) — center tile + rings 1, 2, and 3
   *
   * `start` is clamped to [0, ring]. Omitting it returns only the outer ring.
   */
  getTileRing(x: number, y: number, ring: number, start?: number): TileData[] {
    if (start === undefined) start = ring;
    if (start > ring) start = ring;
    if (start < 0) start = 0;

    const results: TileData[] = [];

    if (start === 0) {
      const center = this.getTileAt(x, y);
      if (center) results.push(center);
      start = 1;
    }

    for (let r = start; r <= ring; r++) {
      results.push(...this.#getRing(x, y, r));
    }

    return results;
  }

  /**
   * Returns all tiles at exactly `ring` distance from (x, y) using cube coordinate math.
   * Starts at the TL position and walks clockwise. Called by getTileRing.
   */
  #getRing(x: number, y: number, ring: number): TileData[] {
    const toCube = (x: number, y: number) => {
      const q = x - (y - (y & 1)) / 2;
      return { q, r: y, s: -q - y };
    };

    const toOffset = (q: number, r: number) => ({
      x: q + (r - (r & 1)) / 2,
      y: r,
    });

    const dirs = [
      { q: 1, r: -1 }, { q: 1, r: 0 }, { q: 0, r: 1 },
      { q: -1, r: 1 }, { q: -1, r: 0 }, { q: 0, r: -1 },
    ];

    const center = toCube(x, y);
    let cur = { q: center.q + dirs[5].q * ring, r: center.r + dirs[5].r * ring };

    const results: TileData[] = [];

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < ring; j++) {
        const { x, y } = toOffset(cur.q, cur.r);
        const t = this.getTileAt(x, y);
        if (t) results.push(t);
        cur = { q: cur.q + dirs[(i + 1) % 6].q, r: cur.r + dirs[(i + 1) % 6].r };
      }
    }

    return results;
  }

  /**
   * Returns the set of tiles on the outer perimeter of the map.
   */
  get edgeTiles(): Set<TileData> {
    return this.#edgeTiles;
  }

  /**
   * Caches all tiles on the outer perimeter of the map. Used for bot spawn placement.
   */
  #cacheEdgeTiles() {
    const height = this.#state.tiles.length;

    if (height === 0) { return; }

    const width = this.#state.tiles[0].length;
    const yBottom = height - 1;
    const xRight = width - 1;
    const tiles: Set<TileData> = new Set();

    for (let x = 0; x < width; x++) {
      const tileTop = this.#state.tiles[0][x];
      const tileBottom = this.#state.tiles[yBottom][x];

      if (tileTop) { tiles.add(tileTop); }
      if (tileBottom) { tiles.add(tileBottom); }
    }

    for (let y = 1; y < yBottom; y++) {
      const tileLeft = this.#state.tiles[y][0];
      const tileRight = this.#state.tiles[y][xRight];

      if (tileLeft) { tiles.add(tileLeft); }
      if (tileRight) { tiles.add(tileRight); }
    }

    this.#edgeTiles = tiles;
  }

  /**
   * Order here matters and is explicit as it maps to the UI.TILE.NEIGHBORS mapping.
   */
  #cahceTileNeighbors() {
    for (let y = 0, yy = this.#state.tiles.length; y < yy; y++) {
      const xOffset = y % 2 ? 0 : -1;

      for (let x = 0, xx = this.#state.tiles[y].length; x < xx; x++) {
        const tile = this.#state.tiles[y][x];

        if (!tile) { continue; }

        tile.neighbors = [
          this.#state.tiles[y - 1]?.[x + xOffset    ] ?? null, // TL
          this.#state.tiles[y - 1]?.[x + 1 + xOffset] ?? null, // TR
          this.#state.tiles[y    ]?.[x + 1          ] ?? null, // R
          this.#state.tiles[y + 1]?.[x + 1 + xOffset] ?? null, // BR
          this.#state.tiles[y + 1]?.[x + xOffset    ] ?? null, // BL
          this.#state.tiles[y    ]?.[x - 1          ] ?? null, // L
        ];
      }
    }
  }
}
