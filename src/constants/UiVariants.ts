import { UI } from '@constants';
import { lighten, darken } from '@utils';

/**
 * UI_VARIANTS
 *
 * Style variants for UI components, derived from the tokens in UI.
 * Keys are named for their role rather than forced into generic PRIMARY/SECONDARY
 * labels. Values map directly to component props with no further translation needed.
 */
export const UI_VARIANTS = Object.freeze({
  BAR: {
    HEALTH: {
      bgColor: UI.PALETTE.RED_90,
      borderColor: UI.PALETTE.BLACK,
      fgColor: UI.PALETTE.WHITE,
    },
  },
  BUTTON: {
    DISABLED: {
      bevelBottomColor: darken(UI.PALETTE.GRAY_20, 40),
      bevelTopColor: lighten(UI.PALETTE.GRAY_20, 30),
      bgColor: UI.PALETTE.GRAY_20,
      color: UI.PALETTE.WHITE,
    },
    PRIMARY: {
      bevelBottomColor: darken(UI.PALETTE.BLUE_50, 50),
      bevelTopColor: lighten(UI.PALETTE.BLUE_50, 40),
      bgColor: UI.PALETTE.BLUE_50,
      color: UI.PALETTE.WHITE,
    },
    SECONDARY: {
      bevelBottomColor: darken(UI.PALETTE.GRAY_30, 50),
      bevelTopColor: lighten(UI.PALETTE.GRAY_30, 40),
      bgColor: UI.PALETTE.GRAY_30,
      color: UI.PALETTE.WHITE,
    },
  },
  GHOST: {
    HOVER: {
      bgColor: UI.PALETTE.WHITE,
      bgOpacity: 0.12,
    },
    TARGET: {
      aoeColor: UI.PALETTE.RED_90,
      aoeOpacity: 0.2,
      beadAttackColor: UI.PALETTE.RED_90,
      beadDuration: 650,
      beadMoveColor: UI.PALETTE.BLUE_90,
      bgInvalidColor: UI.PALETTE.RED_90,
      bgOpacity: 0.5,
    },
  },
  HIGHLIGHT: {
    ACTIVE_ENTITY: {
      bgColor: UI.PALETTE.BLUE_90,
      duration: 300,
      opacity: 0.5,
    },
    MOVE_ENTITY: {
      bgColor: UI.PALETTE.BLUE_90,
      duration: 0,
      opacity: 0.3,
    },
    SPAWN: {
      bgColor: UI.PALETTE.YELLOW_90,
      duration: 300,
      opacity: 0.5,
    },
    TARGET_ENTITY: {
      bgColor: UI.PALETTE.RED_90,
      duration: 300,
      opacity: 0.5,
    },
    COMMAND_AVAILABLE: {
      bgColor: UI.PALETTE.PURPLE_90,
      duration: 300,
      opacity: 0.3,
    },
  },
  OVERLAY: {
    DARK: {
      bgColor: UI.PALETTE.BLACK,
      duration: 200,
      opacity: 0.5,
    },
  },
  PANEL: {
    INSET: {
      bevelBottomColor: lighten(UI.PALETTE.GRAY_10, 50),
      bevelTopColor: darken(UI.PALETTE.GRAY_10, 40),
      bgColor: UI.PALETTE.GRAY_10,
    },
    OUTSET: {
      bevelBottomColor: darken(UI.PALETTE.GRAY_30, 50),
      bevelTopColor: lighten(UI.PALETTE.GRAY_30, 40),
      bgColor: UI.PALETTE.GRAY_30,
    },
  },
  TEXT: {
    PRIMARY: {
      color: UI.PALETTE.WHITE,
      fontFamily: UI.FONT.FAMILY.PRIMARY,
    },
    SECONDARY: {
      color: UI.PALETTE.WHITE,
      fontFamily: UI.FONT.FAMILY.SECONDARY,
    },
  },
  VFX: {
    DEATH: {
      duration: 450,
      durationParticles: 1500,
      tint: [0xcc0000, 0xff2200, 0xff6600],
    },
    MOVE: {
      duration: 350,
    },
    NOTIFY: {
      delay: 250,
      duration: 550,
    },
    SPAWN: {
      duration: 300,
    },
  },
  VFX_ATTACK: {
    AOE: {
      duration: 600,
    },
    BOW: {
      duration: 350,
    },
    MELEE: {
      duration: 150,
    },
  },
  VFX_COLORS: {
    PHYSICAL: UI.PALETTE.RED_90,
    REGEN: UI.PALETTE.GREEN_90,
  },
  VFX_STATUS: {
    BURNING: {
      durationParticles: 800,
      tint: [0xff2200, 0xff6600, 0xffaa00],
    },
    DAZED: {
      durationParticles: 600,
      tint: [0xaaddff, 0x4499ff, 0x0055ff],
    },
  },
});
