import { ASSETS, SETTINGS, UI } from '@constants';

/**
 * UI_SIZES
 *
 * Concrete size values for UI components, derived from the base tokens in UI.
 * Hard-coding unique one-off values here is fine. Keys are named to match
 * component props directly so they can be passed through without translation.
 */
const buttonHeight = UI.ELEMENT.HEIGHT.MD;
const buttonWidth = UI.ELEMENT.HEIGHT.MD * 2 + UI.SPACING.GAP.MD;

const boardWidth =
  SETTINGS.BOARD.WIDTH * ASSETS.TERRAIN.WIDTH + // Width of tiles
  UI.SPACING.MARGIN.MD * 2 + // Add margins
  UI.ELEVATION.BEVEL.MD * 2; // Add bevels

const boardHeight =
  SETTINGS.BOARD.HEIGHT * ASSETS.TERRAIN.HEIGHT * 0.75 + // Height of all tiles * 0.75 for staggering
  ASSETS.TERRAIN.HEIGHT * 0.25 + // Last tile will be full, so add the 0.25.
  UI.SPACING.MARGIN.MD * 2 + // Add margins
  UI.ELEVATION.BEVEL.MD * 2; // Add bevels

const commandWidth =
  buttonWidth * 2 + // 4 small buttons (towers).
  UI.SPACING.GAP.MD + // Extra space between 2 buttons.
  UI.SPACING.MARGIN.MD * 2 + // Add margins
  UI.ELEVATION.BEVEL.MD * 2; // Add bevels

const commandHeight = boardHeight;

const controlWidth =
  boardWidth + // Width of board
  UI.SPACING.MARGIN.MD + // Add space between panels
  commandWidth; // Width of command

const controlHeight =
  buttonHeight +
  UI.SPACING.MARGIN.MD * 2 + // Add margins
  UI.ELEVATION.BEVEL.MD * 2; // Add bevels

const screenWidth =
  controlWidth + // Control width
  UI.SPACING.MARGIN.MD * 2 + // Add margins
  UI.ELEVATION.BEVEL.MD * 2; // Add bevels

const screenHeight =
  controlHeight + // Board width
  UI.SPACING.MARGIN.MD + // Extra space between controle and board.
  boardHeight + // Board width
  UI.SPACING.MARGIN.MD * 2 + // Add margins
  UI.ELEVATION.BEVEL.MD * 2; // Add bevels

export const UI_SIZES = Object.freeze({
  BAR: {
    HORIZONTAL: {
      MD: {
        width: 40,
        height: 4,
        borderWidth: 1,
      },
    },
    VERTICAL: {
      MD: {
        width: 4,
        height: 40,
        borderWidth: 1,
      },
    },
  },
  BUTTON: {
    SQ: {
      MD: {
        width: UI.ELEMENT.HEIGHT.MD,
        height: UI.ELEMENT.HEIGHT.MD,
        bevel: UI.ELEVATION.BEVEL.SM,
        padding: UI.SPACING.PADDING.MD,
        fontFamily: UI.FONT.FAMILY.PRIMARY,
        fontSize: UI.FONT.SIZE.MD,
      },
      LG: {
        width: UI.ELEMENT.HEIGHT.MD * 2 + UI.SPACING.GAP.MD,
        height: UI.ELEMENT.HEIGHT.MD * 2 + UI.SPACING.GAP.MD,
        bevel: UI.ELEVATION.BEVEL.SM,
        padding: UI.SPACING.PADDING.MD,
        fontFamily: UI.FONT.FAMILY.PRIMARY,
        fontSize: UI.FONT.SIZE.MD,
      },
    },
    WIDE: {
      MD: {
        width: UI.ELEMENT.HEIGHT.MD * 2 + UI.SPACING.GAP.MD,
        height: UI.ELEMENT.HEIGHT.MD,
        bevel: UI.ELEVATION.BEVEL.SM,
        padding: UI.SPACING.PADDING.MD,
        fontFamily: UI.FONT.FAMILY.PRIMARY,
        fontSize: UI.FONT.SIZE.MD,
      },
      LG: {
        width: UI.ELEMENT.HEIGHT.MD * 4 + UI.SPACING.GAP.MD * 3,
        height: UI.ELEMENT.HEIGHT.MD,
        bevel: UI.ELEVATION.BEVEL.SM,
        padding: UI.SPACING.PADDING.MD,
        fontFamily: UI.FONT.FAMILY.PRIMARY,
        fontSize: UI.FONT.SIZE.MD,
      },
    },
  },
  OVERLAY: {
    BG: {
      width: screenWidth,
      height: screenHeight,
    },
  },
  PANEL: {
    BG: {
      width: screenWidth,
      height: screenHeight,
      bevel: UI.ELEVATION.BEVEL.MD,
    },
    BOARD: {
      width: boardWidth,
      height: boardHeight,
      bevel: UI.ELEVATION.BEVEL.MD,
    },
    COMMAND: {
      width: commandWidth,
      height: commandHeight,
      bevel: UI.ELEVATION.BEVEL.MD,
    },
    CONTROL: {
      width: controlWidth,
      height: controlHeight,
      bevel: UI.ELEVATION.BEVEL.MD,
    },
  },
  TEXT: {
    XS: {
      fontSize: UI.FONT.SIZE.XS,
    },
    SM: {
      fontSize: UI.FONT.SIZE.SM,
    },
    MD: {
      fontSize: UI.FONT.SIZE.MD,
    },
    X2: {
      fontSize: UI.FONT.SIZE.X2,
    },
  },
});
