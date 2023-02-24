import { ROLUtilities } from '../Utilities/utilities.mjs'
import { ROLChecks } from '../Utilities/checks.mjs';


export class ROLSystemSocket {
    /**
   * @param {object} data                       Data to send to socket.
   * @param {string} [data.type]                Action to run
   * @param {string|undefined} [data.listener]  only this specfic user should run the action
   * @return {void}
   */
  
  static async callSocket (data) {
    switch (data.type){
      case 'chatUpdate':
        if (game.user.isGM) {
          ROLChecks.handleChatButton(data.value);
        }  
      break; 

      case 'chatDamage':
        if (data.value.targetMsg.flags.config.origin === game.user.id) {
        await ROLChecks.runCheck (data.value.targetMsg.flags.config)  
      }
      break;

      case 'updateChar':
        ROLUtilities.updateCharSheets(data.value);
      break;
    }
  }
}
