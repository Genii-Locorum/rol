import { ROLChecks } from '../helpers//Utilities/checks.mjs';

export function addChatListeners(html) {
  html.on('click', '.cardbutton', ROLChecks.triggerChatButton)
  return
}


export class ROLChat{

static async renderMessageHook (message, html) {
  ui.chat.scrollBottom()
  if (!game.user.isGM) {
    const ownerOnly = html.find('.owner-only')
    const actor = await ROLChecks._getTarget(message.flags.config.target.targetId,message.flags.config.target.targetType)
    for (const zone of ownerOnly) {
      if ((actor && !actor.isOwner) || (!actor && !game.user.isGM)) {
        zone.style.display = 'none'
      } 
    }
  }
  return
}

}