import { ROLUtilities } from "../utilities.mjs";
import ROLDialog from "../../setup/rol-dialog.mjs"

export class ROLCombat extends foundry.documents.Combat {

    //Override Combatabnt Sort Routine
    _sortCombatants(a,b){
    const initA = a.initiative ? a.initiative : -9999;
    const initB = b.initiative ? b.initiative : -9999;

    let initDifference = initA - initB;

    return initDifference;
  }

  //Over-ride rollAll Initiative
  async rollAll(options) {

    let combatList = this.combatants;  
    const data = {
      type : combatList
    }
  
    let destination = 'systems/rol/templates/apps/partyOrder.html';
    let winTitle = game.i18n.localize("ROL.actsFirst");
    
    const html = await foundry.applications.handlebars.renderTemplate(destination,data);
  
      let formData = null
      const usage = await ROLDialog.input({
        window: { title: winTitle },
        content: html,
        ok:{
            label: game.i18n.localize("ROL.confirm"),
          },
      })

    let firstCombatId = ""
    if (usage) {
      firstCombatId = usage.orderList;
    }
    
    //Loop through combatants to get the first one and set initiative to zero 
    
    let first = 0;
    let count = 0;
    let firstOrder = 0;
    let firstType = "";
    let firstActorName = "";
    for (const c of this.combatants){
      let thisActor = game.actors.get(c.actorId)
      let thisOrder = thisActor.system.position ? thisActor.system.position : 900 + count;
      if (first === 0 && firstCombatId === c.id) {
        firstOrder = thisOrder;
        thisOrder = 0;
        firstType = thisActor.type;
        firstActorName = thisActor.name;
        first = 1;
      }
      await this.setInitiative (c.id, thisOrder)
      count++;
    }

    //Roll 1D2 to get whether descending (1) or ascending (2) order and convert to +/- 1
    let orderRoll = await new Roll("1d2");
    let orderMsg = game.i18n.localize("ROL.descending");
    await orderRoll.evaluate();
    let orderResult = Number(orderRoll.result)
    let adjust = 1
    if (orderResult === 2){
      orderMsg = game.i18n.localize("ROL.ascending");
      adjust = -1
    }
    orderMsg = game.i18n.localize("ROL.combatOrder") + firstActorName + orderMsg
    await orderRoll.toMessage({
      flavor: orderMsg
    }); 

  
    for (const c of this.combatants){
      let thisActor = game.actors.get(c.actorId)
      let thisOrder = c.initiative
    if(adjust === 1){  
      if(thisOrder === 0){
      } else if(thisOrder <= firstOrder) {
        thisOrder = thisOrder + 1000;
      } else if (firstType != 'character' && thisActor.type != 'character') {
        thisOrder = thisOrder + 1000;
      }
    }else {
      if(thisOrder === 0){
      } else if (thisOrder <= firstOrder) {
        thisOrder = 100-thisOrder;
      } else {
        thisOrder = 1500 - thisOrder
      }
      if (firstType != 'character' && thisActor.type != 'character' && thisOrder != 0) {
        thisOrder = thisOrder + 10000;
      }  
    }  
      await this.setInitiative (c.id, thisOrder)
    }

    return
  }

  async setInitiative(id, value) {
    const combatant = await this.combatants.get(id, {strict: true});
    await combatant.update({initiative: value});
  }

}