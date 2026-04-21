import { BotSystem, CombatSystem, EntityCommandSystem, HumanSystem, MovementSystem, RegenSystem, SessionSystem } from '@engine/systems';

/**
 * Interface for the system registry, used for type-safe injection into phases
 * and other systems that need access to the full set of engine systems.
 */
export interface ISystemRegistry {
  bot: BotSystem;
  combat: CombatSystem;
  human: HumanSystem;
  movement: MovementSystem;
  regen: RegenSystem;
  entityCommand: EntityCommandSystem;
  session: SessionSystem;
}

/**
 * Injectable container that owns and wires up all engine systems. Instantiated
 * once per session and passed into phases as their single point of access to
 * all stateless business logic. Systems that depend on other systems receive
 * them via constructor injection here rather than creating their own instances.
 *
 * Systems only return ENTITY_* effects, plus DISPATCH carrying an ENTITY_*
 * action. All other effects (highlights, ghost, game outcome, etc.) are the
 * responsibility of the calling phase.
 */
export class SystemRegistry implements ISystemRegistry {
  readonly bot: BotSystem;
  readonly combat: CombatSystem;
  readonly human: HumanSystem;
  readonly movement: MovementSystem;
  readonly regen: RegenSystem;
  readonly entityCommand: EntityCommandSystem;
  readonly session: SessionSystem;

  constructor() {
    this.combat = new CombatSystem();
    this.movement = new MovementSystem();
    this.regen = new RegenSystem();
    this.entityCommand = new EntityCommandSystem();
    this.bot = new BotSystem(this.combat, this.movement);
    this.human = new HumanSystem(this.regen);
    this.session = new SessionSystem();
  }

  initCaches() {

  }
}
