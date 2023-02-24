import { ROLUtilities } from "../Utilities/utilities.mjs";

export class ROLCombat extends Combat {

    //Override Combatabnt Sort Routine
    _sortCombatants(a,b){
    const initA = a.initiative ? a.initiative : -9999;
    const initB = b.initiative ? b.initiative : -9999;

    let initDifference = initA - initB;

    return initDifference;
  }

  // Override Turn Order Routine
  setupTurns() {
    // Determine the turn order and the current turn

    const turns = this.combatants.contents.sort(this._sortCombatants);
    if ( this.turn !== null) this.turn = Math.clamped(this.turn, 0, turns.length-1);

    // Update state tracking
    let c = turns[this.turn];
    this.current = {
      round: this.round,
      turn: this.turn,
      combatantId: c ? c.id : null,
      tokenId: c ? c.tokenId : null
    };

    // Return the array of prepared turns
    return this.turns = turns;
  }


  //Over-ride rollAll Initiative
  async rollAll(options) {

    console.log(game.combat.turns[0])

    let combatList = this.combatants;  
    const data = {
      type : combatList
    }
  
    let destination = 'systems/rol/templates/apps/partyOrder.html';
    let winTitle = game.i18n.localize("ROL.actsFirst");
    
    const html = await renderTemplate(destination,data);
  
    let usage = await new Promise(resolve => {
      let formData = null
      const dlg = new Dialog({
        title: winTitle,
        content: html,
        buttons: {
          roll: {
            label: game.i18n.localize("ROL.confirm"),
            callback: html => {
            formData = new FormData(html[0].querySelector('#firstStrike'))
            return resolve(formData)
            }
          }
        },
      default: 'roll',
      close: () => {}
      })
      dlg.render(true);
    })
 
    let firstCombatId = ""
    if (usage) {
      firstCombatId = usage.get('orderList');
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
      await game.combat.setInitiative (c.id, thisOrder)
      count++;
    }

    //Roll 1D2 to get whether descending (1) or ascending (2) order and convert to +/- 1
    let orderRoll = await new Roll("1d2");
    let orderMsg = game.i18n.localize("ROL.descending");
    await orderRoll.roll({ async: true});
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
      console.log(c)
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
      await game.combat.setInitiative (c.id, thisOrder)
    }

    return
  }

  async nextTurn() {
    let turn = this.turn ?? -1;
    let skip = this.settings.skipDefeated;

    for (const c of this.combatants){
      if (Number(c.resource)>= 3) {
        await c.update({'defeated': true, 'isDefeated': true})
      } else {
        await c.update({'defeated': false, 'isDefeated': false})
      }
    }  

    // Determine the next turn number
    let next = null;
    if ( skip ) {
      for ( let [i, t] of this.turns.entries() ) {
        if ( i <= turn ) continue;
        if ( t.isDefeated ) continue;
        next = i;
        break;
      }
    }
    else next = turn + 1;

    // Maybe advance to the next round
    let round = this.round;
    if ( (this.round === 0) || (next === null) || (next >= this.turns.length) ) {
      return this.nextRound();
    }

    // Update the document, passing data through a hook first
    const updateData = {round, turn: next};
    const updateOptions = {advanceTime: CONFIG.time.turnTime, direction: 1};
    Hooks.callAll("combatTurn", this, updateData, updateOptions);
    return this.update(updateData, updateOptions);
  }

  async previousTurn() {
    for (const c of this.combatants){
      if (Number(c.resource)>= 3) {
        await c.update({'defeated': true, 'isDefeated': true})
      } else {
        await c.update({'defeated': false, 'isDefeated': false})
      }
    }  
    if ( (this.turn === 0) && (this.round === 0) ) return this;
    else if ( (this.turn <= 0) && (this.turn !== null) ) return this.previousRound();
    let advanceTime = -1 * CONFIG.time.turnTime;
    let previousTurn = (this.turn ?? this.turns.length) - 1;

    // Update the document, passing data through a hook first
    const updateData = {round: this.round, turn: previousTurn};
    const updateOptions = {advanceTime, direction: -1};
    Hooks.callAll("combatTurn", this, updateData, updateOptions);
    return this.update(updateData, updateOptions);
  }

}