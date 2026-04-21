import { ASSETS, EVENTS, UI, UI_SIZES, UI_VARIANTS } from '@constants';
import { EntityModel } from '@engine/models';
import { GameEngineInitData, GameEngineEntityHealthCause, GameEngineEntityStatus } from '@engine';
import { TileData } from '@engine/maps';
import { Panel } from '@ui/components';
import { EntityObject, TerrainObject } from '@ui/objects';
import { BoardHighlightSystem, BoardHighlightType, BoardGhost, BoardGhostSystem, BoardPathSystem, BoardVfxSystem } from '@ui/systems';

/**
 * Owns all visual representation of the game board. Manages terrain and entity
 * rendering, ghost overlay, tile highlights, pathfinding display, and pointer
 * event translation. Drives BoardGhostSystem, BoardHighlightSystem, and
 * BoardVfxSystem in response to scene events and engine effects.
 */
export class GameBoardView {
  #scene!: Phaser.Scene;
  #ghost!: BoardGhostSystem;
  #highlight!: BoardHighlightSystem;
  #path!: BoardPathSystem;
  #rexBoard!: RexPlugins.Board.Board;
  #vfx!: BoardVfxSystem;

  // Used for ghost toggles when switching between various ghosts and other menu states
  // in the UI to ensure the ghost only reappears if the pointer has not left the board.
  #isPointerOnBoard: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.#scene = scene;
    this.#ghost = new BoardGhostSystem(scene);
    this.#highlight = new BoardHighlightSystem();
    this.#path = new BoardPathSystem(this.#scene, this.#highlight, this.#ghost);
    this.#vfx = new BoardVfxSystem(scene);

    this.#drawBg();
  }

  /**
   * Draws the board, populates initial entities, and wires up pointer listeners.
   */
  init(gameEngineInitData: GameEngineInitData) {
    this.#drawBoard(gameEngineInitData.tiles, gameEngineInitData.width, gameEngineInitData.height);
    this.#drawEntities(gameEngineInitData.entities);
    this.#setupListeners();
  }

  /**
   * Draws the inset panel background behind the board.
   */
  #drawBg() {
    new Panel(this.#scene, {
      x: UI_SIZES.PANEL.BOARD.bevel + UI.SPACING.MARGIN.MD,
      y: UI_SIZES.PANEL.BG.height - UI_SIZES.PANEL.BOARD.bevel - UI.SPACING.MARGIN.MD,
      ...UI_SIZES.PANEL.BOARD,
      ...UI_VARIANTS.PANEL.INSET,
    }).setOrigin(0, 1);
  }

  /**
   * Creates the rexBoard hex grid and populates it with TerrainObject tiles.
   */
  #drawBoard(tiles: (TileData | null)[][], width: number, height: number) {
    this.#rexBoard = this.#scene.rexBoard.add.board({
      grid: this.#scene.rexBoard.add.hexagonGrid({
        x: (UI_SIZES.PANEL.BOARD.bevel + UI.SPACING.MARGIN.MD) * 2,
        y: (this.#scene.scale.height - UI_SIZES.PANEL.BOARD.height) + ASSETS.TERRAIN.HEIGHT / 2,
        cellWidth: ASSETS.TERRAIN.WIDTH,
        cellHeight: ASSETS.TERRAIN.HEIGHT,
        hexSideLength: ASSETS.TERRAIN.WIDTH / 2,
        staggeraxis: 'x',
        staggerindex: 'odd',
      }),
      width,
      height,
    });

    this.#rexBoard.forEachTileXY((tile: { x: number; y: number }) => {
      const tileData = tiles[tile.y][tile.x];

      if (tileData) {
        const view = new TerrainObject(this.#scene, { frame: tileData.terrain, x: tile.x, y: tile.y });
        this.#rexBoard.addChess(view, tile.x, tile.y, ASSETS.TERRAIN.LAYER);
      }
    });
  }

  /**
   * Renders all entities present at game start.
   */
  #drawEntities(entities: EntityModel[]) {
    for (const entity of entities) {
      this.renderEntity(entity);
    }
  }

  /**
   * Wires up rexBoard pointer events and maps them to internal handlers.
   *
   * rexBoard event quirks to be aware of:
   * - tiledown always propagates into tileover then tileout in that order.
   * - Mouse move fires tileover on first entry, then tileout/tileover on each subsequent move.
   * - Some tile positions are null depending on the board shape.
   * - tileout fires continuously anywhere on the scene, even when the pointer is not over the board.
   *   This makes it unreliable as a board-exit signal on its own.
   *
   * Implementation notes:
   * - tileDown counter blocks tileover/tileout handling for the duration of a click and resets on the following tileout.
   * - Always guard on valid terrain before handling any event.
   * - boardOutTimer is cleared before each new tileout to prevent multiple callbacks queuing up.
   * - The boardOutTimer callback validates the pointer's actual world position before calling onBoardOut,
   *   discarding spurious tileout firings where the pointer is still over a valid tile.
   */
  #setupListeners() {
    let tileDown = 0;
    // let tileOver = 0;
    let boardOutTimer: ReturnType<typeof setTimeout> | null = null;

    this.#rexBoard.setInteractive();

    this.#rexBoard.on('tiledown', (pointer: Phaser.Input.Pointer, tile: { x: number; y: number }) => {
      tileDown++;

      const terrain = this.#getTerrainAt(tile.x, tile.y);

      if (!terrain) { return; }

      if (pointer.leftButtonDown()) { this.#onTileLeftDown(terrain); }
      if (pointer.rightButtonDown()) { this.#onTileRightDown(terrain); }
    });

    this.#rexBoard.on('tileover', (_pointer: Phaser.Input.Pointer, tile: { x: number; y: number }) => {
      if (tileDown > 0) { return false; }

      const terrain = this.#getTerrainAt(tile.x, tile.y);

      if (!terrain) { return; }
      if (!this.#isPointerOnBoard) { this.#onBoardOver(terrain); }

      this.#onTileOver(terrain);
    });

    this.#rexBoard.on('tileout', (_pointer: Phaser.Input.Pointer, tile: { x: number; y: number }) => {
      if (tileDown > 0) {
        tileDown--;
        return;
      }

      const terrain = this.#getTerrainAt(tile.x, tile.y);

      if (!terrain) { return; }
      if (boardOutTimer) { clearTimeout(boardOutTimer); }

      boardOutTimer = setTimeout(() => {
        boardOutTimer = null;

        const pointer = this.#scene.input.activePointer;
        const tileXY = this.#rexBoard.worldXYToTileXY(pointer.worldX, pointer.worldY);

        if (this.#getTerrainAt(tileXY.x, tileXY.y)) { return; }

        this.#onBoardOut(terrain);
      }, 50);

      this.#onTileOut(terrain);
    });
  }

  /**
   * Emits a POINTER_LEFT_DOWN event with the tile coordinates.
   */
  #onTileLeftDown(terrain: TerrainObject) {
    if (this.#path.isMoving) return;
    this.#scene.events.emit(EVENTS.GAME_BOARD.POINTER_LEFT_DOWN,  { x: terrain.tileX, y: terrain.tileY });
  }

  /**
   * Emits a POINTER_RIGHT_DOWN event with the tile coordinates.
   */
  #onTileRightDown(terrain: TerrainObject) {
    if (this.#path.isMoving) return;
    this.#scene.events.emit(EVENTS.GAME_BOARD.POINTER_RIGHT_DOWN, { x: terrain.tileX, y: terrain.tileY });
  }

  /**
   * Moves the ghost to the hovered tile and updates the path display if a
   * pathfinder is active.
   */
  #onTileOver(terrain: TerrainObject) {
    this.#ghost.move(terrain);
    this.#path.update(terrain, this.#getObjectAt(terrain.tileX, terrain.tileY), this.#getTerrainAt.bind(this));
  }

  /**
   * Fires on tile exit. Reserved for future per-tile hover-out logic.
   */
  #onTileOut(_terrain: TerrainObject) {
    //
  }

  /**
   * Marks the pointer as on the board and shows the ghost if no pathfinder is active.
   */
  #onBoardOver(_terrain: TerrainObject) {
    this.#isPointerOnBoard = true;
    this.#ghost.show();
  }

  /**
   * Marks the pointer as off the board, hides the ghost, and clears any active path.
   */
  #onBoardOut(_terrain: TerrainObject) {
    this.#isPointerOnBoard = false;
    this.#ghost.hide();
    this.#path.clear();
  }

  /**
   * Returns the EntityObject chess piece at the given tile position, or null if
   * nothing is there. All entities share the unit layer for chess lookups.
   */
  #getObjectAt(x: number, y: number): EntityObject | null {
    return this.#rexBoard.tileXYZToChess(x, y, ASSETS.UNIT.LAYER) ?? null;
  }

  /**
   * Returns the TerrainObject at the given tile coordinates, or null for
   * off-board positions. Used as the primary existence check before handling
   * any tile event, since some positions on the hex grid are intentionally empty.
   */
  #getTerrainAt(x: number, y: number): TerrainObject {
    return this.#rexBoard.tileXYZToChess(x, y, ASSETS.TERRAIN.LAYER);
  }

  /**
   * Render the given entity on to the board as a "chess" piece.
   */
  renderEntity(entity: EntityModel): Promise<void> {
    const obj = new EntityObject(this.#scene, entity);
    const fadeTargets: Promise<void>[] = [this.#vfx.add({ type: 'SPAWN', target: obj })];

    this.#rexBoard.addChess(obj, entity.tileX, entity.tileY, entity.layer);

    return Promise.all(fadeTargets).then(() => {});
  }

  /**
   * Tweens the entity's visual from its current board position to the new tile.
   * Updates rexBoard tracking to the destination before animating so subsequent
   * lookups use the correct position immediately.
   */
  async moveEntity(entity: EntityModel, from: { x: number; y: number }): Promise<void> {
    const obj = this.#getObjectAt(from.x, from.y);

    if (!obj) return;

    const to = { x: entity.tileX, y: entity.tileY };
    const steps = this.#path.currentPath.length > 0 ? this.#path.currentPath : [from, to];
    const duration = UI_VARIANTS.VFX.MOVE.duration / steps.length;

    this.#path.setMoving(true);

    for (const step of steps) {
      const world = this.#rexBoard.tileXYToWorldXY(step.x, step.y);
      await this.#vfx.add({ type: 'MOVE', entity: obj, x: world.x, y: world.y, duration });
    }

    this.#path.setMoving(false);

    this.#rexBoard.addChess(obj, to.x, to.y, entity.layer);
  }

  /**
   * Plays the attack animation between two entities.
   */
  attackEntity(attacker: EntityModel, target: EntityModel, from: { x: number; y: number }): Promise<void> {
    const attackerObj = this.#getObjectAt(from.x, from.y);
    const targetObj   = this.#getObjectAt(target.tileX, target.tileY);

    if (!attackerObj || !targetObj) return Promise.resolve();

    const attackInfo = { weaponType: attacker.weaponType, damageType: attacker.damageType, aoe: attacker.aoe };

    return this.#vfx.add({ type: 'ATTACK', attacker: attackerObj, target: targetObj, attackInfo });
  }

  /**
   * Updates the entity's health bar and queues a floating text notification.
   * Negative amount shows a damage label, positive shows a regen label.
   */
  updateEntityHealth(entity: EntityModel, amount: number, cause: GameEngineEntityHealthCause): Promise<void> {
    const obj = this.#getObjectAt(entity.tileX, entity.tileY);

    if (!obj) return Promise.resolve();

    obj.setHealth(entity.healthCurrent ?? 0, entity.healthMax ?? 0);

    const notifyInfo = {
      label: (amount > 0 ? '+' : '-') + Math.round(amount),
      notifyType: cause,
    };

    this.#vfx.add({ type: 'NOTIFY', entity: obj, notifyInfo });

    return Promise.resolve();
  }

  /**
   * Plays the death animation then removes the entity from the board and
   * destroys its game object.
   */
  removeEntity(entity: EntityModel): Promise<void> {
    const obj = this.#getObjectAt(entity.tileX, entity.tileY);

    if (!obj) return Promise.resolve();

    return this.#vfx.add({ type: 'DEATH', entity: obj }).then(() => {
      this.#rexBoard.removeChess(obj, true);
    });
  }

  /**
   * Attaches the particle effect for the given status to the entity's game object.
   */
  addEntityStatus(entity: EntityModel, status: GameEngineEntityStatus): Promise<void> {
    const obj = this.#getObjectAt(entity.tileX, entity.tileY);

    if (!obj) return Promise.resolve();

    return this.#vfx.add({ type: status, entity: obj });
  }

  /**
   * Removes the particle effect for the given status from the entity's game object.
   */
  removeEntityStatus(entity: EntityModel, status: GameEngineEntityStatus): Promise<void> {
    const obj = this.#getObjectAt(entity.tileX, entity.tileY);

    if (!obj) return Promise.resolve();

    return this.#vfx.remove({ type: status, entity: obj });
  }

  /**
   * Switches the active ghost mode and immediately triggers a toggle to
   * re-snap it into position at the current pointer location.
   */
  setGhost(ghost: BoardGhost) {
    this.#ghost.set(ghost);
    this.toggleGhost();
  }

  /**
   * Shows the ghost if the pointer is on the board, then re-emits tileover
   * at the current pointer position over a short interval. This ensures the
   * ghost snaps into place without requiring a manual hover out/over, and
   * the interval smooths the transition when toggling during the right-click
   * cancel race condition.
   *
   * Public so PlayScene can call it directly to re-establish the ghost after
   * a menu overlay or other UI state that may have hidden or replaced it.
   */
  toggleGhost() {
    if (this.#isPointerOnBoard) { this.#ghost.show(); }

    let timer = 0;

    const interval = setInterval(() => {
      const pointer = this.#scene.input.activePointer;
      const tileXY = this.#rexBoard.worldXYToTileXY(pointer.worldX, pointer.worldY);

      this.#rexBoard.emit('tileover', pointer, tileXY);

      timer += 25;

      if (timer >= 300) { clearInterval(interval); }
    }, 10);
  }

  /**
   * Converts TileData to TerrainObjects and applies the highlight set.
   */
  addHighlights(highlights: { type: BoardHighlightType; tiles: Set<TileData> }) {
    this.#highlight.diffHighlights({
      type: highlights.type,
      tiles: new Set(Array.from(highlights.tiles).map(tile => this.#getTerrainAt(tile.x, tile.y))),
    });
  }

  /**
   * Clears all highlights of the given type.
   */
  removeHighlights(type: BoardHighlightType) {
    this.#highlight.removeHighlights(type);
  }

  /**
   * Activates the pathfinder for the given entity with the available move points.
   */
  activatePathfinder(entity: EntityModel, distance: number) {
    this.#path.activate(entity, this.#getObjectAt(entity.tileX, entity.tileY), distance, this.#getObjectAt.bind(this));
  }

  /**
   * Deactivates and destroys the current pathfinder, clearing any displayed path.
   */
  deactivatePathfinder() {
    this.#path.deactivate();
  }
}
