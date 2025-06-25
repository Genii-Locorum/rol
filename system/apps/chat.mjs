import { ROLChecks } from '../apps/checks.mjs';

export class ROLChat{

static async renderMessageHook (message, html) {
  ui.chat.scrollBottom();
  html.querySelectorAll(".cardbutton").forEach(b => b.addEventListener('click', ROLChecks.triggerChatButton));
  if (!game.user.isGM) {
    const ownerOnly = html.querySelectorAll('.owner-only')
    for (const zone of ownerOnly) {
      const actor = await ROLChecks._getTarget(zone.dataset.particId, zone.dataset.particType)
      if ((actor && !actor.isOwner) || (!actor && !game.user.isGM)) {
        zone.style.display = 'none'
      } 
    }
  }
  return
}

}