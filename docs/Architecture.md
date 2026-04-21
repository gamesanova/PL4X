# Architecture

```
+---------------------+                 +-------------------+               +---------------------+
|        VIEWS        |                 |       SCENE       |               |     GAME ENGINE     |
+---------------------+                 +-------------------+               +---------------------+
| SYSTEMS             |                 |                   |               | MANAGERS            |
| ------------------  |   scene events  | BootScene         |  dispatch()   | ------------------  |
| BoardGhost          | --------------> | MenuScene         | ------------> | Entity              |
| BoardHighlight      |                 | PlayScene         |               | Map                 |
| BoardPath           | <-------------- |                   | <-----------  | Session             |
| BoardVfx            |   view updates  | routes effects    |   effects[]   |                     |
|                     |                 | to views          |               | MAP                 |
| VIEWS               |                 +-------------------+               | ------------------  |
| ------------------  |                                                     | Generator           |
| GameBoard           |                                                     |                     |
| GameCommand         |                                                     | STATE               |
| GameControl         |                                                     | ------------------  |
| GameEnd             |                                                     | Active Phase        |
| GameMenu            |                                                     | Game State          |
| MainMenu            |                                                     |                     |
|                     |                                                     | SYSTEMS             |
|                     |                                                     | ------------------  |
|                     |                                                     | Bot / Human         |
|                     |                                                     | CombatSystem        |
|                     |                                                     | EntityCommandSystem |
|                     |                                                     | MovementSystem      |
|                     |                                                     | RegenSystem         |
|                     |                                                     | SessionSystem       |
|                     |                                                     |                     |
+---------------------+                                                     +---------------------+
```