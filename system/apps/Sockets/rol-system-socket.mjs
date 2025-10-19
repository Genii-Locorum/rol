import { ROLUtilities } from '../utilities.mjs'
import { ROLChecks } from '../checks.mjs';

export class ROLSystemSocket {
  /**
 * @param {object} data                       Data to send to socket.
 * @param {string} [data.type]                Action to run
 * @param {string|undefined} [data.listener]  only this specfic user should run the action
 * @return {void}
 */

  static async callSocket(data) {

    //If a target (to) is specified then only carry this out if its this user
    if (!!data.to && game.userId !== data.to) { return }

    switch (data.type) {
      case 'chatupdate':
        if (game.user.isGM) {
          ROLChecks.handleChatButton(data.value);
        }
        break;

      case 'damagechat':
        if (data.value.targetMsg.flags.config.origin === game.user.id) {
          await ROLChecks.runCheck(data.value.targetMsg.flags.config)
        }
        break;

      case 'toggleMapNotes':
        game.settings.set('core', foundry.canvas.layers.NotesLayer.TOGGLE_SETTING, data.toggle === true);
        break;

      case 'updatechar':
        ROLUtilities.updateCharSheets(data.value);
        break;
    }
  }
}
