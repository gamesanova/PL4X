# PL4X

"Phaser Light 4x" is a lightweight 4x game framework for simple hex based arena style games.

## Demo

A live demo of the framework with a simple 4 player turn based game can be viewed on [Gamesanova](https://gamesanova.com/games/pl4x).

## Features

* Static hex based grid with configurable sizes and layout.
* Turn-based play loop supporting multiple human and bot players.
* Integrated UI with basic components (Button, Label, Panel, etc).
* Full game menu, in-game pause menu, and game over/win overlays.
* Entity system with per-unit stats (health, attack, armor, AP, regen).
* Combat system with support for multiple damage types, ranged attacks and AoE splash.
* Movement system with path highlight and support for impassable tiles.
* Spawn system for adding new entities.
* Status effect support on entities (dazed, burning, etc).
* Board VFX system for handling animations and particle effects (move, attack, etc).
* Clean separation between game engine and views orchestrated via scenes.
* Well organized constants for assets, entities, ui, settings, balancing, etc.

## Notes

* This is still in a very early stage and though it works fine, it still has a bit of clean up and features to add.
* The 4X convention has been kept to reflect the overall direction of the framework which is geared towards games with fog of war and buildings, etc. The idea is to have the functionality ready to go out of the box and then just wire up what's needed.
* For now this has been kept as a "light" version with plans for a more traditional full-screen style 4X framework to come separately later on. But we'll see how that goes.

## Docs

* [Architecture](docs/Architecture.md)
* [Development](docs/Development.md)
* [Build](docs/Build.md)
* [Todo](docs/Todo.md)
