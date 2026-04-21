## Output
- Answer is always line 1. Reasoning comes after, never before.
- No preamble. No "Great question!", "Sure!", "Of course!", "Certainly!", "Absolutely!".
- No hollow closings. No "I hope this helps!", "Let me know if you need anything!".
- No restating the prompt.
- No explaining what you are about to do. Just do it.
- No unsolicited suggestions. Do exactly what was asked, nothing more.
- Structured output only: bullets, tables, code blocks. Prose only when explicitly requested.
- When specifying an error on a line number, always include the filename.

## Token Efficiency
- Compress responses. Every sentence must earn its place.
- No redundant context. Do not repeat information already established in the session.
- No long intros or transitions between sections.
- Short responses are correct unless depth is explicitly requested.

## Typography - ASCII Only
- No em dashes (-) - use hyphens (-)
- No smart/curly quotes - use straight quotes (" ')
- No ellipsis character - use three dots (...)
- No Unicode bullets - use hyphens (-) or asterisks (*)
- No non-breaking spaces

## Sycophancy - Zero Tolerance
- Never open with any form of agreement, acknowledgment, or affirmation.
- Never affirm that the user is correct. No "you're right", "correct", "exactly", "fair point", "good point", "that makes sense", "absolutely", "indeed", or any variant. If the user is factually correct, just proceed as if it were always true.
- Disagree when wrong. State the correction directly.
- Do not change a correct answer because the user pushes back.

### Design and Proposals
- Give real analysis on design proposals: trade-offs, problems, reasons to push back.
- If a better solution exists, present it - don't default to the approach the user suggested.
- Never open with "fair point", "good idea", "that makes sense", or similar.

## Accuracy and Speculation Control
- Never speculate about code, files, or APIs you have not read.
- If referencing a file or function: read it first, then answer.
- Never ask the user for information that can be found by reading the codebase. Read the file instead.
- If unsure: say "I don't know." Never guess confidently.
- Never invent file paths, function names, or API signatures.
- If a user corrects a factual claim: accept it as ground truth for the entire session. Never re-assert the original claim.

## Code Output
- Write human-readable code. No clever one-liners or condensed expressions that sacrifice clarity.
- Return the simplest working solution. No over-engineering.
- No abstractions or helpers for single-use operations.
- No speculative features or future-proofing.
- No docstrings or comments on code that was not changed.
- Inline comments only where logic is non-obvious.
- Read the file before modifying it. Never edit blind.
- Always use 2 spaces for indenting, not 4.
- Do not delete comments.
- Doc blocks must always use multi-line `/** */` format — never single-line above any function, variable, or type.
- Doc block prose must read as plain sentences. No dashes of any kind (em, en, or double hyphen) as punctuation.
- Never reformat, reindent, or rearrange existing code that is not directly related to the change being made.
- Never align variable assignments or object properties with extra spaces. One space on each side of `=` and `:`.

## Warnings and Disclaimers
- No safety disclaimers unless there is a genuine life-safety or legal risk.
- No "Note that...", "Keep in mind that...", "It's worth mentioning..." soft warnings.
- No "As an AI, I..." framing.

## Session Memory
- Learn user corrections and preferences within the session.
- Apply them silently. Do not re-announce learned behavior.
- If the user corrects a mistake: fix it, remember it, move on.

## Scope Control
- Do not add features beyond what was asked.
- Do not refactor surrounding code when fixing a bug.
- Do not create new files unless strictly necessary.

## Override Rule
- User instructions always override this file.

## Project
- Stack: Phaser 3 (phaser3-rex-plugins: rexUI, rexBoard), TypeScript, Vite
- Always use path aliases, never relative paths. Aliases: `@constants`, `@engine`, `@engine/models`, `@engine/initializers`, `@engine/managers`, `@engine/maps`, `@engine/phases`, `@engine/systems`, `@scenes`, `@ui/components`, `@ui/ghosts`, `@ui/objects`, `@ui/systems`, `@ui/views`, `@utils`
- NEVER touch the git repo. No commits, no branches, no merges, no rebases, no resets, no pushes, no pulls, no staging, no `git` commands of any kind. Ever.
- NEVER edit any file unless the user has said one of these exact go-ahead phrases in their most recent message: "add it", "implement", "implement it", "go ahead", "go", "go for it", "do it", "write it", "make it", "ok do it", "ok, do it". No other phrasing counts. Not "ok good", not "lol", not "ok", not questions, not problem descriptions, not bug reports, not anything else. If in doubt, do NOT implement — just describe the fix and stop. Do not ask for a go-ahead. Wait silently.

## Architecture
- The architecture is fundamentally split into "state" and "views", which are bridged by "scenes".

## Architecture: Constants
- Static configuration layer in `src/constants/` covering assets, balancing, UI, entities, and i18n. Nothing runtime or stateful belongs here.
- `Assets`: Specifies all the assets in the game along with their associated `key`, `layer`, `width`, `height` and `map`. The `key` value will be the name used in the preload on the BootScene which will automatically spin through every constant and load up it's associated file located inside of the `public/assets` folder.
- `Balance`: This is meant as the master config file to control game balancing. Even multiplier values for things like difficulty settings should flow out from here.
- `Colors`: Central area for specifying different color variants which should only ever be used in the `Styles` constants.
- `Entities`: Defines every entity and their properties like health, attack, name, etc. In some cases it may also specify additional properties like `size` or special abilities.
- `Events`: This gives an overview of all events in the system at a glance. Otherwise all it does is map keys which is not particularly useful.
- `I18n`: Internationalization for all text in the game.
- `Settings`: The various game settings needed to create a game. This can include avatar selection, difficulty, board/map size, etc.
- `Ui`: Master ui file which contains all global style settings.
- `UiSizes`: A branch of the ui file that specifies sizes only. Some values here may be hard coded if they are unique otherwise it should derive from ui.
- `UiVariants`: A branch of the ui file that specifices variants only. Majority of the values here like colors should come for ui, but more specific settings like opacity and duration can be hard coded locally for specific situations.

## Architecture: Engine
- Core game logic layer. Owns all state, processes all actions, returns effects. Scene communicates exclusively through `GameEngine.dispatch()` and `GameEngine.init()`.
- `GameEngine`: Main entry point. Owns `GameState`, `ManagerRegistry`, `SystemRegistry`, and the phase map. The scene communicates with the engine exclusively through `dispatch()` and `init()`.
- `GameState`: Raw state container. Holds entities, tiles, phase, settings, and turn. Accessed only through managers — nothing outside the engine touches this directly.
- `GameSettings`: Type definitions and factory for game session settings including board size, difficulty, hero, and player configuration.
- `types`: All shared engine types — see Architecture: Engine Types.

## Architecture: Engine Types
- `GameEngineAction`: types are domain-first, verb/modifier last: `TOWER_PLACEMENT_SELECT`, `TOWER_PLACEMENT_CANCEL`. Raw pointer input follows `POINTER_{BUTTON}_{EVENT}`: `POINTER_LEFT_DOWN`. Fields sit top-level on the action — no payload wrapper.
- `GameEngineEffect`: state-change types use past tense, domain-first: `GOLD_UPDATED`, `ENTITY_CREATED`, `SELECTION_CANCELED`. Visual/phase effects use modifier-first with consolidated payloads: `GHOST_TOWER_PLACEMENT`, `HIGHLIGHT_TILES`. Field names must be consistent across related effects. Effects that drive animations are async from the scene's perspective; data-only effects (e.g. `GOLD_UPDATED`) are sync.
- `GameEnginePhase`: Union of all valid phase strings — `IDLE`, `TOWER_PLACEMENT`, `TURN_PROCESSING`, `UNIT_COMMAND`, `UNIT_SELECT`. Determines which actions are handled and what effects are returned.
- `GameEngineInitAction`: Passed to `GameEngine.init()` to bootstrap a session — either `NEW` with settings or `LOAD` with a load key.
- `GameEngineInitData`: Returned by `GameEngine.init()`. Contains everything the scene needs to build initial views — entities, tile grid, and board dimensions.
- `GameStateSnapshot`: Serialized game state for save/load. Holds settings and tiles (neighbor references stripped since they are derived on load).

## Architecture: Engine Initializers
- Live in `src/engine/initializers/`. Responsible for session lifecycle — starting, loading, and saving. All state mutations flow through managers. Each is a static class with a single `run()` method.
- `NewGame`: Bootstraps a fresh game from settings — generates the map, places the home building, and spawns the hero.
- `LoadGame`: Fetches a saved snapshot and restores it into state via managers. Supports async loading and version migration.
- `SaveGame`: Collects a snapshot from all managers and persists it. Supports async targets such as local storage or an external API.

## Architecture: Engine Managers
- Live in `src/engine/managers/`. Access layer between `GameState` and the rest of the engine. Nothing outside a manager reads that domain's data from state directly — all queries and mutations flow through the manager.
- `ManagerRegistry`: Injectable container that owns all managers. Passed into systems and initializers as the single point of access to all domain managers.
- `EntityManager`: Owns all entity spawning and removal. Maintains lookup caches by tile and by player. All entity creation flows through here.
- `MapManager`: Owns all tile-related access. Handles tile queries, neighbor lookups, edge tile access, spatial operations, and map generation.
- `SessionManager`: Owns session-level state — phase transitions, game settings, current player, and player resources. Phases and systems access all session data through here rather than touching GameState directly.

## Architecture: Engine Maps
- Live in `src/engine/maps/`. Responsible for map generation and tile data structures. The sole source of the tile grid — nothing else constructs tile data directly.
- `MapGenerator`: Generates the initial 2D tile grid from width/height settings. Produces `TileData` objects with position, terrain, and neighbor slots. Neighbor data is populated separately by `MapManager` after generation.

## Architecture: Engine Models
- Live in `src/engine/models/`. Core data model classes for the engine.
- `Entity`: Base class for all in-game objects. Holds shared stat and identity data (health, attack, position, type flags). Boolean flags such as `isHero`, `isBuilding`, and `isBaddy` are derived at construction to avoid repeated type comparisons in systems.
- `Player`: Runtime state for a single player — resources, AP, score. Constructed by `NewGame` and accessed exclusively through `SessionManager`.

## Architecture: Engine Phases
- Live in `src/engine/phases/`. Handle dispatched actions for a given game state. Only one active at a time. Each receives an action, a `ManagerRegistry`, and a `SystemRegistry`, and returns a list of effects.
- `BasePhase`: Shared base for phases that support cancel and interrupt. `handleCancel` returns to `IDLE` with `SELECTION_CANCELED`. `handleInterrupt` cancels and re-dispatches the interrupting action to `IDLE`.
- `IdlePhase`: Default active phase during the human turn. `POINTER_LEFT_DOWN` selects an entity and transitions to `UNIT_COMMAND` or `UNIT_SELECT` based on ownership and available actions. `TURN_END` transitions to `TURN_PROCESSING`. `TOWER_PLACEMENT_SELECT` validates affordability and transitions to `TOWER_PLACEMENT`.
- `TowerPlacementPhase`: Active while the human is placing a tower. `POINTER_LEFT_DOWN` purchases on a viable tile. `TOWER_PLACEMENT_SELECT` re-selects a different tower. Right click and `SELECTION_CANCEL` cancel. `TURN_END` interrupts and forwards to `IDLE`.
- `TurnProcessingPhase`: Active during automated turn cycling. `TURN_NEXT_PLAYER` advances the player sequence — bot turns run combat, movement, and wave spawns then chain back via `DISPATCH`; human turns run `HumanSystem`, increment the turn, and emit `TURN_COMPLETED`.
- `EntityCommandPhase`: Active when a commandable entity is selected (own entity with actions available). Left click resolves as move or attack depending on the target tile. Right click and `SELECTION_CANCEL` cancel. `TOWER_PLACEMENT_SELECT` and `TURN_END` interrupt and forward to `IDLE`.
- `EntitySelectPhase`: Active when a non-commandable entity is selected (enemy or own entity with no actions available). Right click and `SELECTION_CANCEL` cancel. `POINTER_LEFT_DOWN`, `TOWER_PLACEMENT_SELECT`, and `TURN_END` interrupt and forward to `IDLE`.

## Architecture: Engine Systems
- Live in `src/engine/systems/`. Stateless business logic called by phases. Receive a `ManagerRegistry` as their primary data access point, followed by any additional arguments they need.
- Systems only return `ENTITY_*` effects. The sole exception is `DISPATCH` carrying an `ENTITY_*` action. All other effects (highlights, phase transitions, game-over, etc.) are the responsibility of the calling phase.
- `BotSystem`: Orchestrates the bot turn. Iterates all baddies running attack then move-and-attack then random movement for each. Entities are removed from state immediately on death. `isGameOver` is a public query used by `TurnProcessingPhase` to emit `GAME_OVER` after the bot turn completes.
- `CombatSystem`: Target selection and damage calculation shared across bot and human turns. `getAttackTargetTiles` returns valid target tiles from the entity's current position. `getAttackAoeTargets` returns all targets for an attack including splash. `hasAttackAvailable` checks if an entity can act. `calculateDamage` uses a Civ6-style exponential formula split on damage type, randomised 15%. `findMoveToAttackTile` uses BFS to find the cheapest reachable position with a target in range, collecting all ties before picking randomly.
- `HumanSystem`: Orchestrates the human turn. Processes status effects (e.g. daze) and entity attribute recovery (e.g. health regen) for each unit. Returns only `ENTITY_*` effects.
- `MovementSystem`: Pathfinding and move target selection for baddies moving toward the home building.
- `RegenSystem`: Calculates regen amount for an entity. Multiplies by AP remaining; applies a 1.5x bonus if all AP was unspent (rewarding a held turn).
- `TowerPlacementSystem`: Tower placement business logic. `canAfford(player, towerKey)` checks affordability. `getViableTiles(player, managers)` returns a `Set<TileData>` of valid tiles based on proximity to the player's buildings and occupancy. `TileData` references flow directly into effects and views — no coordinate serialization at the engine boundary.
- `UnitCommandSystem`: Determines which tiles have actionable units this turn. `getActionableTiles` returns tiles occupied by buildings with an available attack or the hero if AP remains. Used by `TurnProcessingPhase` on human turn start and by unit phases on cancel to restore the highlight.
- `WaveSystem`: Wave generation — selects baddy types and places them on randomly chosen unoccupied edge tiles each bot turn.

## Architecture: Scenes
- Live in `src/scenes/`. Bridge between engine state and UI. Scenes own views, wire up events, and drive the engine — no view reads engine state directly.
- `BaseScene`: Extends `Phaser.Scene`. Provides a `on()` helper that registers event listeners and tracks them for automatic removal on scene shutdown via the SHUTDOWN event.
- `BootScene`: Initial scene. Preloads all game assets by iterating the ASSETS constants, disables the right-click context menu, attaches a ResizeObserver for responsive canvas scaling, then transitions to MenuScene.
- `MenuScene`: Main menu scene. Owns `GameSettings` state and wires UI events from `MainMenuView` to settings mutations and the PlayScene transition.
- `PlayScene`: Main game scene. Owns all in-game views, drives `GameEngine` via `dispatch()`, and routes engine effects to view methods. Effects are bucketed by type and fired in an explicit sequence — move animations first, then combat, then state updates, then `DISPATCH` last (always awaited to complete recursive chains).

## Architecture: UI
- Split into five sub-layers: components (reusable primitives), ghosts (cursor overlays on the board), objects (board-placed game objects managed by rexBoard), systems (stateful visual logic driven by the scene), and views (full scene-level panels that own their layout).
- Views communicate upward via `scene.events.emit`. They never call engine methods directly.
- Objects are positioned by rexBoard and referenced by `BoardView`.
- All sub-layers import from path aliases only — never relative paths.

## Architecture: UI Components
- Live in `src/ui/components/`. Reusable Phaser display primitives. All extend `Phaser.GameObjects.Container` or `Phaser.GameObjects.Text` and register themselves with `scene.add.existing`.
- `Bg`: Full-coverage rectangle overlay with configurable color and opacity. Used to darken the screen behind menus.
- `Button`: Interactive container with a `Panel` background, optional text label or image, and pointer events for press animation. Supports disabled and unavailable states. Exposes `setStyles()` to re-skin without rebuilding.
- `ButtonGroup`: Manages a collection of `Button` instances as a mutually exclusive selection group. Handles value selection, disabled and unavailable states, and optional column layout via rexUI sizer labels.
- `FloatingText`: One-shot animated text that floats upward and fades out. Returns a promise that resolves on completion.
- `Healthbar`: Rectangular fill bar for rendering health. Supports horizontal and vertical orientation. Hidden by default; shown by `EntityObject` when health drops below max.
- `Label`: Single text element inside a sized container with left, center, or right alignment.
- `LabelValue`: Paired label and value rendered side by side. Used for stat display rows in control and command panels.
- `Panel`: Beveled rectangle drawn with `Graphics`. Four trapezoids (top/left lighter, bottom/right darker) produce a 3D inset or outset appearance. Used as the background for most UI panels and buttons.
- `Text`: Thin wrapper around `Phaser.GameObjects.Text` that accepts `color` as a hex number and converts it to a CSS string.

## Architecture: UI Ghosts
- Live in `src/ui/ghosts/`. Board cursor overlays that follow the pointer across tiles. All extend `BaseGhost` and are managed exclusively by `BoardGhostSystem` — never created directly by the scene.
- `BaseGhost`: Abstract base Container. Provides `snapTo(x, y)` to position and show, and a no-op `setValid()` for ghosts with no validity state.
- `HoverGhost`: Default cursor ghost — terrain highlight sprite that follows the cursor. Always valid. Renders at depth 1.
- `TargetGhost`: Animated reticle with four beads pulsing inward from cardinal directions. Switches between attack mode (red beads) and move mode (blue beads) via `setMoving()`. Shows an invalid background tint when the tile is not a valid target. Accepts an optional AoE radius rendered as a circle. Kills all bead tweens on destroy to prevent callbacks firing on destroyed objects. Renders at depth 20.
- `TowerGhost`: Tower placement ghost with a terrain highlight behind a semi-transparent tower sprite. Background tint shifts from valid to invalid color based on tile viability. Renders at depth 20.

## Architecture: UI Objects
- Live in `src/ui/objects/`. Game objects placed on the rexBoard grid. Created and managed by `BoardView`.
- `EntityObject`: Container for a single entity on the board. Renders the entity sprite and an optional `Healthbar`. Health bar is only visible when current health is below max and above zero. Exposes `sprite` for VFX emitter attachment.
- `TerrainObject`: Container for a single board tile. Renders the terrain sprite and manages an optional highlight overlay with fade in/out tweens. Highlight is lazy-initialized on first use. Tween state is tracked to cancel cleanly on rapid set/unset. Also renders a numeric step label for pathfinding display, cleared and rewritten from scratch on each path update.

## Architecture: UI Systems
- Live in `src/ui/systems/`. Visual presentation logic too stateful or complex for a component. Driven by the scene, consume effect events rather than reading engine state directly.
- `BoardGhostSystem`: Manages the active board ghost overlay. Accepts `BoardGhost` union events dispatched by the scene and switches between hover, tower placement, and target attack modes. Only one ghost is active at a time — switching modes destroys the previous ghost and creates the new one. Validity against a viableTiles set is checked on each show() call. Receives `Set<TileData>` from engine effects and converts to a string key set once at setup for O(1) per-event lookup — since show() receives a `TerrainObject` (not `TileData`), this boundary conversion is unavoidable.
- `BoardHighlightSystem`: Manages tile highlight overlays on the board. Accepts `BoardHighlights` events containing a type and a `Set<TileData>`, and maps each tile to its corresponding `TerrainObject` via `BoardView`. Highlights are grouped by type and cleared as a unit.
- `BoardPathSystem`: Manages the rexBoard pathfinder and path display for a moveable entity. `activate()` creates a pathfinder anchored to an entity's board object; if the same entity is already active, only updates the distance. `update()` runs on tile hover to compute the path and update the ghost and step labels. `deactivate()` destroys the pathfinder and clears all highlights and labels. Step labels are cleared and rewritten from scratch on every path update.
- `BoardVfxSystem`: Plays board-level visual effects. Accepts `BoardVfx` union events dispatched by the scene. One-shot effects (SPAWN, MOVE, ATTACK, NOTIFY, DEATH) resolve as promises when their animation completes. Persistent effects (DAZED, BURNING) attach particle emitters to an entity and run until explicitly removed via `remove()`. All emitters are cleaned up on scene shutdown. NOTIFY events are queued per entity and drained sequentially with a configurable delay between items.

## Architecture: UI Views
- Live in `src/ui/views/`. Full scene-level panels that own their layout and child components. Created by the scene in `create()` and updated by the scene in response to engine effects.
- `BgView`: Renders the full-screen background Panel behind all other UI. Created first in both `PlayScene` and `MenuScene`.
- `BoardView`: Owns all visual representation of the game board. Manages terrain and entity rendering, ghost overlay, tile highlights, pathfinding display, and pointer event translation. Drives `BoardGhostSystem`, `BoardHighlightSystem`, `BoardPathSystem`, and `BoardVfxSystem`.
- `GameCommandView`: Bottom-right command panel. Renders tower purchase buttons, the end-turn button, and entity or tower info labels. Emits `TOWER_SELECT` and `SELECTION_CANCEL` events via the scene event bus.
- `GameControlView`: Top-left control panel. Renders score, gold, AP, and turn labels, plus help and menu buttons.
- `GameMenuView`: In-game pause menu overlay. Fades in and out over a dark backdrop. Contains Resume, Restart, and Quit buttons. Shown and hidden by `PlayScene` in response to MENU and RESUME events.
- `GameOverView`: Game over overlay. Fades in over a dark backdrop with a "GAME OVER" header and Restart/Quit buttons. Shown by `PlayScene` when a `GAME_OVER` effect is received.
- `MainMenuView`: Main menu layout. Hero and difficulty selection via `ButtonGroup`, hero stat display via `LabelValue` rows, and a Start button. Uses rexUI `Sizer` for vertical layout.

## Architecture: Utils
- Live in `src/utils/`. Stateless helper functions and a debug logger. No game-domain knowledge belongs here.
- `funcs`: General utility functions — `sample` (random array element), `dist` (Euclidean distance between two points), `toHex` (hex number to CSS color string), `adjustColor` / `lighten` / `darken` (channel-wise color arithmetic), `sleep` (Promise-based delay), `toColumns` (flat array to column-chunked nested array for rexUI grid layout).
- `Logger`: Debug logging utility. Reads `VITE_LOG` from the environment at startup as a comma-separated list of levels and categories. A message is shown if its level or category appears in `VITE_LOG`, or if `all` is set. Configure in `.env.local`.