/**
 * UI
 *
 * Master UI constants. All style tokens originate here and flow into UiSizes
 * and UiVariants. Very specific one-off values may live closer to where they
 * are used, but anything shared or reusable should be defined here first.
 */
export const UI = Object.freeze({
  ELEMENT: {
    HEIGHT: { MD: 80 },
  },
  ELEVATION: {
    BEVEL: { SM: 5, MD: 7 },
  },
  FONT: {
    FAMILY: {
      PRIMARY: 'Verdana',
      SECONDARY: 'Rajdhani, Arial Narrow, Arial, sans-serif',
    },
    SIZE: {
      XS: '20px',
      SM: '24px',
      MD: '30px',
      X2: '60px',
    },
  },
  PALETTE: {
    BLACK: 0x000000,
    BLUE_50: 0x2c5d87,
    BLUE_90: 0x0000ff,
    BROWN_90: 0x8B4513,
    GRAY_10: 0x2a2a2a,
    GRAY_20: 0x363b40,
    GRAY_30: 0x464e56,
    GREEN_90: 0x00ff00,
    PURPLE_90: 0x8769ac,
    RED_90: 0xff0000,
    WHITE: 0xffffff,
    YELLOW_90: 0xffeb3b,
  },
  SPACING: {
    GAP:     { MD: 10 },
    MARGIN:  { MD: 20 },
    PADDING: { MD: 7  },
  },
  TILE: {
    NEIGHBORS: { TL: 0, TR: 1, R: 2, BR: 3, BL: 4, L: 5 },
  },
});
