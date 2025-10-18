import { ROL } from '../setup/config.mjs';
import { ROLActor } from '../actor/actor.mjs';
import { ROLItem } from '../item/item.mjs';
import { handlebarsHelper } from '../setup/handlebar-helpers.mjs';
import { registerSettings } from '../settings/register-settings.mjs';
import { registerSheets } from '../setup/register-sheets.mjs';
import { ROLCombat } from "../apps/Combat/combat.mjs";
import { ROLCombatTracker } from "../apps/Combat/combatTracker.mjs";
import ChaosiumCanvasInterfaceInit from '../apps/CCI/init.mjs'

export default function Init() {
  //Add classes to global game object
  game.rol = {
    ROLActor,
    ROLItem,
    ClickRegionLeftUuid: ChaosiumCanvasInterfaceInit.ClickRegionLeftUuid,
    ClickRegionRightUuid: ChaosiumCanvasInterfaceInit.ClickRegionRightUuid,
    //rollItemMacro
  }
  //Add Custom Configuration
  CONFIG.ROL = ROL;
  CONFIG.Combat.initiative = {
    formula: "1d100",
    decimals: 2
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = ROLActor;
  CONFIG.Item.documentClass = ROLItem;
  CONFIG.Combat.documentClass = ROLCombat;
  CONFIG.ui.combat = ROLCombatTracker;

  //Register Settings and Handlebar Helpers
  registerSettings();
  handlebarsHelper();

  // Define custom Document classes
  CONFIG.Item.documentClass = ROLItem;
  CONFIG.Actor.documentClass = ROLActor;
  ChaosiumCanvasInterfaceInit.initSelf()
  registerSheets()
}
