import { EntityDamageType } from '@constants';
import { EntityModel } from '@engine/models';
import { GameSettings } from '@engine';
import { TileData } from '@engine/maps';

/**
 * All valid engine phases. The active phase determines which actions are
 * handled and what effects are returned by the engine.
 */
export type GameEnginePhase = 'ENTITY_COMMAND' | 'ENTITY_SELECT' | 'IDLE' | 'TURN_PROCESSING';

/**
 * Actions dispatched from the scene into the engine. Represent things the user
 * did or UI events that require engine processing.
 *
 * Naming conventions:
 * - Domain-first, verb/modifier last: SELECTION_CANCEL
 * - Raw pointer input follows POINTER_{BUTTON}_{EVENT} - noun first, verb last: POINTER_LEFT_DOWN
 * - Fields are top-level on the action object, no payload wrapper
 */
export type GameEngineAction =
  | { type: 'GAME_START' }
  | { type: 'POINTER_LEFT_DOWN'; x: number, y: number }
  | { type: 'POINTER_RIGHT_DOWN'; x: number, y: number }
  | { type: 'TURN_END' }
  | { type: 'TURN_NEXT_PLAYER' }
  | { type: 'SELECTION_CANCEL' }
  | { type: 'ENTITY_AUTO_SELECT' }

/**
 * All valid causes of an entity health change. Determines VFX flavor and floating text style.
 */
export type GameEngineEntityHealthCause = EntityDamageType | 'REGEN';

/**
 * All valid entity status keys. Used by ENTITY_STATUS_ADDED and ENTITY_STATUS_REMOVED
 * effects to identify which persistent visual state is being applied or cleared.
 */
export type GameEngineEntityStatus = 'BURNING' | 'DAZED';

/**
 * All valid highlight types. Used by HIGHLIGHT_TILES to identify which visual
 * highlight style and priority slot a tile set occupies.
 */
export type GameEngineHighlight = 'ACTIVE_ENTITY' | 'TARGET_ENTITY' | 'COMMAND_AVAILABLE' | 'SPAWN';

/**
 * Effects returned by the engine to the scene after processing an action.
 * The scene is responsible for translating each effect into the appropriate
 * visual or UI update — the engine has no knowledge of rendering.
 *
 * Naming conventions:
 * - State-change effects use past tense, domain-first: SCORE_UPDATED, ENTITY_CREATED, SELECTION_CANCELED
 * - Visual/phase effects use modifier-first with consolidated payloads: HIGHLIGHT_TILES, GHOST_TARGET_ATTACK
 * - Effects that drive animations are async from the scene's perspective; simple data effects (e.g. SCORE_UPDATED) are sync
 * - Field names should be consistent across related effects (e.g. viableTiles not tiles)
 * - ENTITY_* effects are the only ones systems may return. GHOST_*, HIGHLIGHT_*, and game-outcome effects belong to phases.
 */
export type GameEngineEffect =
  | { type: 'DISPATCH', action: GameEngineAction }
  | { type: 'SELECTION_CANCELED' }

  | { type: 'SCORE_UPDATED', score: number }
  | { type: 'TURN_UPDATED', turn: number }

  | { type: 'ENTITY_ATTACKED'; attacker: EntityModel; target: EntityModel; from: { x: number; y: number } }
  | { type: 'ENTITY_CREATED', entity: EntityModel }
  | { type: 'ENTITY_DIED'; entity: EntityModel }
  | { type: 'ENTITY_HEALTH_UPDATED'; entity: EntityModel; amount: number; cause: GameEngineEntityHealthCause }
  | { type: 'ENTITY_MOVED'; entity: EntityModel; from: { x: number; y: number } }
  | { type: 'ENTITY_PATHFINDER_ACTIVATE'; entity: EntityModel; distance: number }
  | { type: 'ENTITY_PATHFINDER_DEACTIVATE' }
  | { type: 'ENTITY_SELECTED'; entity: EntityModel }
  | { type: 'ENTITY_STATUS_ADDED';   entity: EntityModel; status: GameEngineEntityStatus }
  | { type: 'ENTITY_STATUS_REMOVED'; entity: EntityModel; status: GameEngineEntityStatus }

  | { type: 'GHOST_HOVER' }
  | { type: 'GHOST_TARGET_ATTACK'; attackTiles: Set<TileData>; aoe?: number }

  | { type: 'HIGHLIGHT_TILES'; highlight: GameEngineHighlight; tiles: Set<TileData> }

  | { type: 'GAME_OVER' }
  | { type: 'GAME_WIN' }

  | { type: 'TURN_COMPLETED' }
  | { type: 'TURN_PROCESSING' }

/**
 * Action passed to GameEngine.init() to bootstrap a session. Either starts a
 * fresh game from settings or restores a saved one by load key.
 */
export type GameEngineInitAction =
  | { type: 'NEW';  settings: GameSettings }
  | { type: 'LOAD'; loadKey: string }

/**
 * Data returned by GameEngine.init(). Contains everything the scene needs to
 * build its initial views — entities, tile grid, and board dimensions.
 */
export type GameEngineInitData = {
  entities: EntityModel[];
  tiles: (TileData | null)[][];
  width: number;
  height: number;
}

/**
 * Serialized snapshot of game state used for save and load. Tiles should strip
 * neighbor references since those are derived on load.
 */
export interface GameStateSnapshot {
  settings: GameSettings;
  tiles: (TileData | null)[][];
}
