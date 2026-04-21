import { ASSETS } from '@constants';

type MapGeneratorSettings = {
    width: number;
    height: number;
}

export type TileData = {
  x: number;
  y: number;
  terrain: number;
  neighbors: (TileData | null)[];
}

/**
 * Generates the initial 2D tile grid from map settings. Produces a row-major
 * array of `TileData` objects with position and terrain assigned. Even rows are
 * offset by one column to form a hex grid, with the first cell set to null.
 * Neighbor data is left empty and populated separately by `MapManager`.
 */
export class MapGenerator {
  static generate(settings: MapGeneratorSettings): (TileData | null)[][] {
    const tiles = [];

    for (let y = 0; y < settings.height; y++) {
      const row = [];

      for (let x = 0; x < settings.width; x++) {
        if (y % 2 === 0 && x === 0) {
          row.push(null);
          continue;
        }

        row.push({ x, y, terrain: ASSETS.TERRAIN.MAP.GRASS, neighbors: [] });
      }

      tiles.push(row);
    }

    return tiles;
  }
}
