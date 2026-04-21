import { EVENTS } from '@constants';
import { GameEngine, GameEngineAction, GameEngineEffect, GameEngineInitAction } from '@engine';
import { GameEngineInitData } from '@engine';
import { BgView, GameBoardView, GameCommandView, GameControlView, GameEndView, GameMenuView } from '@ui/views';
import { BaseScene } from '@scenes';

/**
 * The main game scene. Owns all in-game views, drives the game engine via
 * dispatch, and translates engine effects into visual updates. Acts as the
 * bridge between engine state and the UI — no view reads engine state directly.
 */
export class PlayScene extends BaseScene {
  #gameEngine!: GameEngine;
  #gameBoardView!: GameBoardView;
  #gameCommandView!: GameCommandView;
  #gameControlView!: GameControlView;
  #gameMenuView!: GameMenuView;
  #gameEndView!: GameEndView;

  constructor() {
    super({ key: 'PlayScene' });
  }

  /**
   * Initialises all views, boots the game engine, and kicks off the first turn.
   * The engine init is async so board setup and the initial dispatch wait for it
   * to resolve. TURN_END starts the full turn cycle from player index 0 because
   * SessionManager sets currentPlayerId to the last player on init, causing
   * incrementPlayer to wrap around to index 0 on the first TURN_NEXT_PLAYER.
   */
  create(action: GameEngineInitAction) {
    new BgView(this);
    this.#gameBoardView = new GameBoardView(this);
    this.#gameCommandView = new GameCommandView(this);
    this.#gameControlView = new GameControlView(this);
    this.#gameMenuView = new GameMenuView(this);
    this.#gameEndView = new GameEndView(this);

    this.#gameEngine = new GameEngine;

    this.#gameEngine.init(action).then((gameEngineInitData: GameEngineInitData) => {
      this.#gameBoardView.init(gameEngineInitData);

      this.#dispatch({ type: 'TURN_END' });
    });

    this.#setupListeners();

    // this.#gameEndView.show(false);
  }

  /**
   * Wires up all scene-level event listeners. Translates UI events emitted by
   * views into engine actions dispatched through #dispatch.
   */
  #setupListeners() {
    this.on(EVENTS.GAME_COMMAND.TURN_END, () => this.#dispatch({ type: 'TURN_END' }));
    this.on(EVENTS.GAME_CONTROL.MENU, () => this.#gameMenuView.show());
    this.on(EVENTS.GAME_MENU.QUIT, () => this.scene.start('MenuScene'));
    this.on(EVENTS.GAME_MENU.RESTART, () => this.scene.restart());

    this.on(EVENTS.GAME_MENU.RESUME, () => {
      this.#gameMenuView.hide();
      this.#gameBoardView.toggleGhost();
    });

    this.on(EVENTS.GAME_COMMAND.SELECTION_CANCEL, () => this.#dispatch({ type: 'SELECTION_CANCEL' }));

    this.on(EVENTS.GAME_BOARD.POINTER_LEFT_DOWN, (tile: { x: number, y: number }) => this.#dispatch({ type: 'POINTER_LEFT_DOWN', x: tile.x, y: tile.y }));
    this.on(EVENTS.GAME_BOARD.POINTER_RIGHT_DOWN, (tile: { x: number, y: number }) => this.#dispatch({ type: 'POINTER_RIGHT_DOWN', x: tile.x, y: tile.y }));

    this.input.keyboard!.on('keydown-ENTER', () => this.#dispatch({ type: 'TURN_END' }));
  }

  /**
   * Dispatches an action to the engine and processes returned effects in a
   * controlled sequence. Effects are first bucketed by type into bundles, then
   * fired in explicit order below. Sync effects fire and forget. Async effects
   * (moves, combat) are awaited via Promise.all so all instances of a type run
   * in parallel before the next group starts.
   */
  async #dispatch(action: GameEngineAction) {
    const effects = this.#gameEngine.dispatch(action);

    for (const fx of effects) {
      if (fx.type === 'GAME_OVER' || fx.type === 'GAME_WIN') {
        this.#gameEndView.show(fx.type === 'GAME_WIN');
        return;
      }

      await this.#handleEffect(fx);
    }
  }

  /**
   * Routes a single engine effect to the appropriate view method. Returns a
   * promise for async effects (animations) or void for sync ones.
   */
  #handleEffect(fx: GameEngineEffect): Promise<void> | void {
    switch (fx.type) {
      case 'DISPATCH':
        return this.#dispatch(fx.action);
      case 'SELECTION_CANCELED':
        this.#gameBoardView.setGhost({ type: 'HOVER' });
        this.#gameBoardView.removeHighlights('ACTIVE_ENTITY');
        this.#gameBoardView.removeHighlights('TARGET_ENTITY');
        this.#gameBoardView.deactivatePathfinder();
        this.#gameCommandView.cancelSelection();
        break;

      case 'TURN_UPDATED':
        this.#gameControlView.renderLabels({ turn: fx.turn.toString() });
        break;

      case 'ENTITY_ATTACKED':
        return this.#gameBoardView.attackEntity(fx.attacker, fx.target, fx.from);
      case 'ENTITY_CREATED':
        return this.#gameBoardView.renderEntity(fx.entity);
      case 'ENTITY_DIED':
        return this.#gameBoardView.removeEntity(fx.entity);
      case 'ENTITY_HEALTH_UPDATED':
        return this.#gameBoardView.updateEntityHealth(fx.entity, fx.amount, fx.cause);
      case 'ENTITY_MOVED':
        return this.#gameBoardView.moveEntity(fx.entity, fx.from);
      case 'ENTITY_PATHFINDER_ACTIVATE':
        this.#gameBoardView.activatePathfinder(fx.entity, fx.distance);
        break;
      case 'ENTITY_PATHFINDER_DEACTIVATE':
        this.#gameBoardView.deactivatePathfinder();
        break;
      case 'ENTITY_SELECTED':
        this.#gameCommandView.renderLabelsEntity(fx.entity);
        break;
      case 'ENTITY_STATUS_ADDED':
        return this.#gameBoardView.addEntityStatus(fx.entity, fx.status);
      case 'ENTITY_STATUS_REMOVED':
        return this.#gameBoardView.removeEntityStatus(fx.entity, fx.status);

      case 'GHOST_HOVER':
        this.#gameBoardView.setGhost({ type: 'HOVER' });
        break;
      case 'GHOST_TARGET_ATTACK':
        this.#gameBoardView.setGhost({ type: 'TARGET_ATTACK', viableTiles: fx.attackTiles, aoe: fx.aoe });
        break;
      case 'HIGHLIGHT_TILES':
        this.#gameBoardView.addHighlights({ type: fx.highlight, tiles: fx.tiles });
        break;

      case 'TURN_COMPLETED':
        this.#gameCommandView.setEndTurnProcessing(false);
        break;
      case 'TURN_PROCESSING':
        this.#gameBoardView.removeHighlights('COMMAND_AVAILABLE');
        this.#gameCommandView.setEndTurnProcessing(true);
        break;
    }
  }
}
