/**
 * A global registry of all event string keys used across the game. Keeping them
 * here prevents naming collisions and gives a single place to see every event
 * the system emits at a glance.
 */
export const EVENTS = Object.freeze({
  GAME_BOARD: {
    POINTER_LEFT_DOWN:  'game_board_pointer_left_down',
    POINTER_RIGHT_DOWN: 'game_board_pointer_right_down',
    POINTER_HOVER: 'game_board_pointer_hover',
    POINTER_OUT:   'game_board_pointer_out',
  },
  GAME_COMMAND: {
    TURN_END: 'game_command_turn_end',
    SELECTION_CANCEL: 'game_command_selection_cancel',
  },
  GAME_CONTROL: {
    HELP: 'game_control_help',
    MENU: 'game_control_menu',
  },
  GAME_MENU: {
    QUIT: 'game_menu_quit',
    RESTART: 'game_menu_restart',
    RESUME: 'game_menu_resume',
  },
  MAIN_MENU: {
    COLOR: 'main_menu_color',
    DIFFICULTY: 'main_menu_difficulty',
    START: 'main_menu_start',
  },
});
