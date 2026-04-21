/**
 * I18N
 *
 * All user-facing text in the game. Anything displayed to the player should be
 * sourced from here rather than hard-coded inline. Split into per-locale subkeys
 * if the project grows to support multiple languages.
 */
export const I18N = Object.freeze({
  EN: {
    LBL: {
      aoe: 'AOE',
      ap: 'AP',
      armor: 'Armor',
      attack: 'Attack',
      cancel: 'Cancel',
      damageType: 'Damage',
      easy: 'Easy',
      endturn: 'End Turn',
      gameOver: 'Game Over',
      gameWin: 'Victory!',
      hard: 'Hard',
      health: 'Health',
      help: 'Help',
      menu: 'Menu',
      name: 'Name',
      no: 'No',
      normal: 'Normal',
      physical: 'Physical',
      quit: 'Quit',
      range: 'Range',
      regen: 'Regen',
      restart: 'Restart',
      resume: 'Resume',
      score: 'Score',
      start: 'Start',
      turn: 'Turn',
      yes: 'Yes',
    },
    UNIT: {
      ARCHER: { name: 'Archer' },
    },
  },
});
