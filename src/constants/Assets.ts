/**
 * ASSETS
 *
 * The registry of all game assets. Covers sprites, tilemaps, audio, and anything
 * else that needs to be loaded. Defining assets here keeps the preloader generic;
 * it can spin through this file automatically rather than needing manual updates.
 */
export const ASSETS = Object.freeze({
  PIXEL: {
    KEY: 'pixel',
    LAYER: 11,
    WIDTH: 1,
    HEIGHT: 1,
  },
  UNIT: {
    KEY: 'unit',
    LAYER: 10,
    SCALE: 0.6,
    WIDTH: 100,
    HEIGHT: 100,
    MAP: {
      ARCHER: 0,
    },
  },
  TERRAIN: {
    KEY: 'terrain',
    LAYER: 0,
    SCALE: 1,
    WIDTH: 100,
    HEIGHT: 100,
    MAP: {
      HIGHLIGHT: 0,
      GRASS: 1,
    },
  },
});

export type AssetUnitKey = keyof typeof ASSETS.UNIT.MAP;
export type AssetTerrainKey = keyof typeof ASSETS.TERRAIN.MAP;
