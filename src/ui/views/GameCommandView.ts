import { EVENTS, I18N, UI, UI_SIZES, UI_VARIANTS } from '@constants';
import { Button, Label, LabelValue, Panel } from '@ui/components';
import { EntityModel } from '@engine/models';

/**
 * Bottom-right command panel. Renders tower purchase buttons, the end-turn
 * button, and entity or tower info labels. Emits TOWER_SELECT and
 * SELECTION_CANCEL events via the scene event bus.
 */
export class GameCommandView {
  #scene!: Phaser.Scene;
  #btnEndTurn!: Button;
  #labels: Record<string, Label | LabelValue | Button> = {};
  #sizerLabels!: RexPlugins.UI.Sizer;

  constructor(scene: Phaser.Scene) {
    this.#scene = scene;

    this.#drawBg();
    this.#drawButtonEndTurn();
    this.#drawLabels();
  }

  #drawBg() {
    new Panel(this.#scene, {
      x: UI_SIZES.PANEL.BG.width - UI_SIZES.PANEL.COMMAND.bevel - UI.SPACING.MARGIN.MD,
      y: UI_SIZES.PANEL.BG.height - UI_SIZES.PANEL.COMMAND.bevel - UI.SPACING.MARGIN.MD,
      ...UI_SIZES.PANEL.COMMAND,
      ...UI_VARIANTS.PANEL.INSET,
    })
    .setOrigin(1, 1);
  }

  #drawButtonEndTurn() {
    this.#btnEndTurn = new Button(this.#scene, {
      x: UI_SIZES.PANEL.BG.width - (UI_SIZES.PANEL.COMMAND.bevel + UI.SPACING.MARGIN.MD) * 2,
      y: UI_SIZES.PANEL.BG.height - (UI_SIZES.PANEL.COMMAND.bevel + UI.SPACING.MARGIN.MD) * 2,
      label: I18N.EN.LBL.endturn,
      ...UI_SIZES.BUTTON.WIDE.LG,
      ...UI_VARIANTS.BUTTON.SECONDARY,
    })
    .setOrigin(1, 1)
    .on('pointerdown', () => {
      // this.setEndTurnProcessing(true);
      this.#scene.events.emit(EVENTS.GAME_COMMAND.TURN_END);
    });
  }

  #drawLabels() {
    const width = UI_SIZES.BUTTON.WIDE.MD.width * 2 + UI.SPACING.GAP.MD;
    const styles = {
      width,
      height: 30,
      ...UI_SIZES.TEXT.SM,
      ...UI_VARIANTS.TEXT.PRIMARY,
    };

    this.#sizerLabels = this.#scene.rexUI.add.sizer({
      x: UI_SIZES.PANEL.BG.width - (UI_SIZES.PANEL.COMMAND.bevel + UI.SPACING.MARGIN.MD) * 2,
      y: UI_SIZES.PANEL.BG.height - UI_SIZES.PANEL.COMMAND.height + UI.SPACING.GAP.MD,
      orientation: 'y',
      space: { item: UI.SPACING.GAP.MD },
    })
    .setOrigin(1, 0)
    .setVisible(false);

    this.#labels['name'] = new Label(this.#scene, {
      width,
      height: UI_SIZES.BUTTON.WIDE.MD.height,
      text: '',
      ...UI_SIZES.TEXT.MD,
      ...UI_VARIANTS.TEXT.PRIMARY,
    });

    this.#labels['damageType'] = new LabelValue(this.#scene, { text: I18N.EN.LBL.damageType + ': ', value: '', ...styles });
    this.#labels['range'] = new LabelValue(this.#scene, { text: I18N.EN.LBL.range + ': ', value: '', ...styles });
    this.#labels['aoe'] = new LabelValue(this.#scene, { text: I18N.EN.LBL.aoe + ': ', value: '', ...styles });
    this.#labels['health'] = new LabelValue(this.#scene, { text: I18N.EN.LBL.health + ': ', value: '', ...styles });
    this.#labels['attack'] = new LabelValue(this.#scene, { text: I18N.EN.LBL.attack + ': ', value: '', ...styles });
    this.#labels['armor'] = new LabelValue(this.#scene, { text: I18N.EN.LBL.armor + ': ', value: '', ...styles });

    // We'll sneak this in here into the sizer for a nice layout.
    this.#labels['cancel'] = new Button(this.#scene, {
      label: I18N.EN.LBL.cancel,
      ...UI_SIZES.BUTTON.WIDE.LG,
      ...UI_VARIANTS.BUTTON.SECONDARY,
    })
    .on('pointerdown', () => {
      this.cancelSelection();
      this.#scene.events.emit(EVENTS.GAME_COMMAND.SELECTION_CANCEL);
    });

    this.#sizerLabels.add(this.#labels['name']);
    this.#sizerLabels.add(this.#labels['damageType']);
    this.#sizerLabels.add(this.#labels['range']);
    this.#sizerLabels.add(this.#labels['aoe']);
    this.#sizerLabels.add(this.#labels['health']);
    this.#sizerLabels.add(this.#labels['attack']);
    this.#sizerLabels.add(this.#labels['armor']);
    this.#sizerLabels.add(this.#labels['cancel'], { padding: { top: UI.SPACING.MARGIN.MD + UI.SPACING.GAP.MD } });
    this.#sizerLabels.layout();
  }

  setEndTurnProcessing(value: boolean) {
    if (value) {
      this.#btnEndTurn.disableInteractive();
      this.#btnEndTurn.setStyles(UI_VARIANTS.BUTTON.DISABLED);
      this.#btnEndTurn.setLabel('...');
    } else {
      this.#btnEndTurn.setInteractive({ cursor: 'pointer' });
      this.#btnEndTurn.setStyles(UI_VARIANTS.BUTTON.SECONDARY);
      this.#btnEndTurn.setLabel('End Turn');
    }
  }

  cancelSelection() {
    this.#sizerLabels.setVisible(false);
  }

  #renderLabels(labels: Record<string, string>) {
    (this.#labels.name as Label).setText(labels.name);

    Object.entries(this.#labels).forEach(([key]) => {
      if (key !== 'name') {
        if (labels[key]) {
          (this.#labels[key] as LabelValue).setValue(' ' + labels[key]);
          this.#sizerLabels.show(this.#labels[key]);
        }
        else {
          this.#sizerLabels.hide(this.#labels[key]);
        }
      }
    });
  }

  renderLabelsEntity(entity: EntityModel) {
    this.#renderLabels({
      name: entity.name,
      damageType: I18N.EN.LBL[entity.damageType.toLowerCase() as keyof typeof I18N.EN.LBL],
      range: entity.range?.toString() ?? '',
      aoe: entity.aoe?.toString() ?? '',
      attack: entity.attack?.toString() ?? '',
      armor: entity.armor?.toString() ?? '',
      health: (entity.healthCurrent && entity.healthMax) ? entity.healthCurrent + '/' + entity.healthMax : '',
    });

    this.#sizerLabels.show(this.#labels['cancel']);
    this.#sizerLabels.layout().setVisible(true);
  }

}
