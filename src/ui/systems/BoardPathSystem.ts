import { EntityModel } from '@engine/models';
import { BoardGhostSystem } from './BoardGhostSystem';
import { BoardHighlightSystem } from './BoardHighlightSystem';
import { EntityObject, TerrainObject } from '@ui/objects';

/**
 * Manages the rexBoard pathfinder and path display for a moveable entity.
 * Owns step label rendering directly on TerrainObjects — no diff, labels
 * are cleared and rewritten from scratch on every path update.
 */
export class BoardPathSystem {
  #scene: Phaser.Scene;
  #ghost: BoardGhostSystem;
  #highlight: BoardHighlightSystem;
  #pathFinder: RexPlugins.Board.PathFinder | null = null;
  #pathFinderCurrentPath: { x: number; y: number }[] = [];
  #pathFinderDistance: number = 0;
  #pathFinderEntity: EntityModel | null = null;
  #pathFinderIsMoving: boolean = false;
  #pahtFinderNumberLabels: Set<TerrainObject> = new Set();

  constructor(
    scene: Phaser.Scene,
    highlight: BoardHighlightSystem,
    ghost: BoardGhostSystem,
  ) {
    this.#scene = scene;
    this.#highlight = highlight;
    this.#ghost = ghost;
  }

  get isMoving() { return this.#pathFinderIsMoving; }
  get currentPath() { return this.#pathFinderCurrentPath; }

  /**
   * Activates the pathfinder for the given entity with the available move points.
   * If the same entity is already active, only updates the distance. Otherwise
   * destroys any existing pathfinder and creates a new one anchored to the
   * entity's board object.
   */
  activate(entity: EntityModel, chess: EntityObject | null, distance: number, objectAt: (x: number, y: number) => EntityObject | null): void {
    this.#pathFinderDistance = distance;

    if (this.#pathFinderEntity?.id === entity.id && this.#pathFinder) { return; }

    this.#pathFinder?.destroy();

    if (!chess) { return; }

    this.#pathFinderEntity = entity;
    this.#pathFinder = this.#scene.rexBoard.add.pathFinder(chess, {
      occupiedTest: (tileXY: { x: number; y: number }) => {
        if (tileXY.x === entity.tileX && tileXY.y === entity.tileY) { return false; }
        return !!objectAt(tileXY.x, tileXY.y);
      },
    });
  }

  /**
   * Deactivates and destroys the current pathfinder, clearing any displayed path.
   */
  deactivate(): void {
    this.#pathFinder?.destroy();
    this.#pathFinder = null;
    this.#pathFinderEntity = null;
    this.#pathFinderCurrentPath = [];
    this.clear();
  }

  /**
   * Returns true if a pathfinder is currently active.
   */
  isActive(): boolean {
    return this.#pathFinder !== null;
  }

  /**
   * Called on tile hover. Updates the ghost and path display based on whether
   * the hovered tile is occupied or reachable. No-ops if no pathfinder is active.
   */
  update(terrain: TerrainObject, chess: EntityObject | null, terrainAt: (x: number, y: number) => TerrainObject | null): void {
    if (!this.isActive()) { return; }

    const isOccupied = !!chess;

    this.#ghost.targetGhost()?.setMoving(!isOccupied);

    if (isOccupied) {
      this.clear();
    } else {
      const path = this.#pathFinder!.findPath({ x: terrain.tileX, y: terrain.tileY }, this.#pathFinderDistance) ?? [];
      this.#pathFinderCurrentPath = path;
      this.#showPath(path, terrainAt);

      const pathMax = path[path.length - 1];
      this.#ghost.setValid(path.length > 0 && pathMax.x === terrain.tileX && pathMax.y === terrain.tileY);
    }
  }

  /**
   * Marks the path as in motion so pointer events are suppressed during move animation.
   */
  setMoving(value: boolean): void {
    this.#pathFinderIsMoving = value;
  }

  /**
   * Highlights each tile in the path and sets step number labels. Clears all
   * previous labels before rewriting from scratch so step numbers are always correct.
   */
  #showPath(path: { x: number; y: number }[], terrainAt: (x: number, y: number) => TerrainObject | null): void {
    this.#clearLabels();

    const tiles = new Set<TerrainObject>();

    for (const [i, p] of path.entries()) {
      const terrain = terrainAt(p.x, p.y);

      if (terrain) {
        tiles.add(terrain);
        terrain.setStepLabel(i + 1);
        this.#pahtFinderNumberLabels.add(terrain);
      }
    }

    this.#highlight.diffHighlights({ type: 'MOVE_ENTITY', tiles });
  }

  /**
   * Clears all MOVE_ENTITY highlights and step labels if a pathfinder is active.
   */
  clear(): void {
    this.#clearLabels();
    this.#highlight.removeHighlights('MOVE_ENTITY');
  }

  /**
   * Clears step labels from all currently labeled tiles.
   */
  #clearLabels(): void {
    for (const tile of this.#pahtFinderNumberLabels) {
      tile.clearStepLabel();
    }

    this.#pahtFinderNumberLabels.clear();
  }
}
