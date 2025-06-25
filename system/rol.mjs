// Import document classes.
import { ROLMenu } from "./setup/menu.mjs"
import renderSceneControls from "./hooks/render-scene-controls.mjs";
import Init from './hooks/init.mjs'
import Ready from './hooks/ready.mjs';
import * as DiceSoNiceReady from './apps/Dice/dice-so-nice-ready.mjs'
import * as DiceSoNiceRollStart from './apps/Dice/dice-so-nice-roll-start.mjs'
import * as RenderChatMessage from './setup/chat-messages.mjs'
import HotbarDrop from './hooks/hotbar-drop.mjs'
//import * as Chat from "./apps/chat.mjs";
import { ROLHooks } from './setup/hooks-index.mjs'


  Hooks.once('init',Init);
  Hooks.once('ready', Ready);
  Hooks.on('hotbarDrop', HotbarDrop)    
  Hooks.on('getSceneControlButtons', ROLMenu.getButtons)
  Hooks.on('renderSceneControls', renderSceneControls);
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (game.user) {
      createItemMacro(data, slot);
      return false;
    }
  });  


ROLHooks.listen();