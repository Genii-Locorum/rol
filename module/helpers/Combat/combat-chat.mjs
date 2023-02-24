import { ROLDiceRoll } from "../Dice/diceroll.mjs";

export class ROLCombatChat {

static async _startCombatChat (event) {
    let signature = this.actor.items.get($(event.currentTarget).closest(".item").data("itemId")).system.signature;
    let automatic = this.actor.items.get($(event.currentTarget).closest(".item").data("itemId")).system.automatic;
    let semiauto = this.actor.items.get($(event.currentTarget).closest(".item").data("itemId")).system.semiauto;
    let bonusDamage = 0
    if (signature) {bonusDamage = 1}
    let options = {
      event,
      actorId: this.actor._id,
      allowResolve: true,
      bonusDamage: bonusDamage,
      automatic: automatic,
      semiauto: semiauto,
      label: this.actor.items.get($(event.currentTarget).closest(".item").data("itemId")).name
    }


    console.log("Initiate Combat Chat",this.actor, this.token)

return
}



}