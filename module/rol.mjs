// Import document classes.
import { ROLActor } from "./documents/actor.mjs";
import * as Chat from "./helpers/chat.mjs";
import { ROLItem } from "./documents/item.mjs";
// Import sheet classes.
import { ROLActorSheet } from "./sheets/actor-sheet.mjs";
import { ROLItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/Setup/templates.mjs";
import { ROL } from "./helpers/Setup/config.mjs";
import { ROLMenu } from "./helpers/Setup/layers.mjs"
import { registerSettings } from './helpers/Setup/register-settings.mjs'
import { ROLHooks } from './helpers/Setup/hooks-index.mjs'
import { handlebarsHelper } from './helpers/Setup/handlebar-helper.mjs'
//import { ROLSocket } from './helpers/Sockets/socket.mjs'
import { ROLSystemSocket } from './helpers/Sockets/rol-system-socket.mjs'
import { ROLCombat } from "./helpers/Combat/combat.mjs";
import { ROLCombatTracker } from "./helpers/Combat/combatTracker.mjs";


/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.rol = {
    ROLActor,
    ROLItem,
    rollItemMacro
  };

  // Register Settings & Handlebar Helpers
  registerSettings();
  handlebarsHelper();

  // Add custom constants for configuration.
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



  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("rol", ROLActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("rol", ROLItemSheet, { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});


Hooks.on('ready', async () => {
  game.socket.on('system.rol', async data => {
    ROLSystemSocket.callSocket(data)
  });
});

//Add sub-titles in Config Settings for ROL- Advanced Rules
Hooks.on('renderSettingsConfig', (app, html, options) => {
  const systemTab = $(app.form).find('.tab[data-tab=system]')
  systemTab
    .find('input[name=rol\\.age]')
    .closest('div.form-group')
    .before(
      '<h2 class="setting-header">' +
        game.i18n.localize('ROL.Settings.advancedRules') +
        '</h2>'
    )});

//Add sub-titles in Config Settings for ROL- Dice So Nice
Hooks.on('renderSettingsConfig', (app, html, options) => {
  const systemTab = $(app.form).find('.tab[data-tab=system]')
  systemTab
    .find('input[name=rol\\.tenDieBonus]')
    .closest('div.form-group')
    .before(
      '<br><h2 class="setting-header">' +
        game.i18n.localize('ROL.Settings.Dice3D') +
        '</h2>'
    )});

//Add GM Tool Layer
Hooks.on('getSceneControlButtons', ROLMenu.getButtons)
Hooks.on('renderSceneControls', ROLMenu.renderControls)

ROLHooks.listen();

//Add Chat Log Hooks
Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));




/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
  // Always reset GM Tool toggles to False
  if (game.user.isGM) {
    if (game.settings.get('rol' , 'developmentEnabled')) {game.settings.set('rol','developmentEnabled', false)};
    if (game.settings.get('rol' , 'characterCreation')) {game.settings.set('rol','characterCreation', false)};
    if (game.settings.get('rol' , 'sessionendEnabled')) {game.settings.set('rol','sessionendEnabled', false)};
    game.settings.set('rol','opposedCardId', null);
  }

  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (game.user) {
      createItemMacro(data, slot);
      return false;
    }
  });  
});



/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  };

  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);
  // Create the macro command using the uuid.
  const command = `game.rol.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "rol.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Run a called Macro created from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }
    // Trigger the item roll
    item.roll();
  });
}


