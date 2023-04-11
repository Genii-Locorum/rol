import { ROLUtilities } from '../Utilities/utilities.mjs';
import { ROLActorSheet } from '../../sheets/actor-sheet.mjs';


export const traitMenuOptions = (actor, token) => [
    {
      name: game.i18n.localize("ROL.edit"),
      icon: '<i class="fas fa-edit"></i>',
      callback: (el) => {
        const itemId = ROLUtilities.getDataset(el, "itemId");
        const item = actor.items.get(itemId);
        if (!item || !item.sheet) {
          const msg = `Couldn't find itemId [${itemId}] on actor ${actor.name} to edit the skill item from the skill context menu`;
          ui.notifications?.error(msg);
          throw new Error(msg, el);
        }
        item.sheet.render(true);
      }
    },
    {
      name: game.i18n.localize("ROL.delete"),
      icon: '<i class="fas fa-trash"></i>',
      callback: (el) => {
        const itemId = ROLUtilities.getDataset(el, "itemId");
        ROLActorSheet.confirmItemDelete(actor, itemId);
      }
    }
  ];

 