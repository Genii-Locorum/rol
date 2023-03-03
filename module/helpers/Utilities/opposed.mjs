//Start building out oppossed skill rolls

import { ROLDiceRoll } from "../Dice/diceroll.mjs";
import { ROLChecks } from "./checks.mjs";

export class ROLOpposed {

static async _onOpposedRoll(event) {
  let target =await ROLChecks._getTargetId(this.token,this.actor); 
  let actor = await ROLChecks._getTarget(target.targetId, target.targetType);
  let msgId = await ROLChecks.startCheck ({
    event,
    target,
    actor: actor,
    label: actor.items.get($(event.currentTarget).closest(".item").data("itemId")).name
  })

let x = game.settings.get('rol' , 'opposedCardId')

if (!x){
    console.log("Card is closed")
    await game.settings.set('rol','opposedCardId', msgId)
} else {
    console.log("Card is open", x)
}    
  
  return
}


}