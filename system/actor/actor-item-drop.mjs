export class ROLActorItemDrop {

  // Change default on Drop Item Create routine for requirements (single items and folder drop)-----------------------------------------------------------------
    static async _ROLonDropItemCreate(itemData, actor) {
 
    const newItemData = [];
    itemData = itemData instanceof Array ? itemData : [itemData];

    //If enforce PreReq disabled for the actor type then add items 
    if ((actor.type === 'character' && game.settings.get('rol','pcPreReq') != true) || actor.type === 'npc' && game.settings.get('rol','npcPreReq') != true) {
      return (itemData);
    }

    //Otherwise check pre-reqs item by item
    for (let k of itemData) {
      let reqCheck = [];
      let reqResult = 0;
      if (k.type === "weapons" || k.type === "equipment" || k.type === "armour" || k.type === "contacts") {
        reqResult = 1;
      } else if (k.type === "skill"){
        if (k.system.subtype != "Magic" || actor.system.Magic === true){
          reqResult = 1;  
        }
      } else if (k.type === "advantages" || (k.type === "spell" && actor.system.Magic === true)) {
        for (let i=1; i<4; i++){
          reqCheck[i]=0;
          if (k.system.preReq[i].preType === "") {         //If no pre-req then set result = 1
            reqCheck[i] = 1;
          } else if (k.system.preReq[i].preType === "Char-Min" ){  //Test for minimum Characteristic
            if (actor.system.abilities[k.system.preReq[i].preOpt].value >= k.system.preReq[i].preVal){
              reqCheck[i] = 1;
            }
          } else if (k.system.preReq[i].preType === "Char-Max" ){  //Test for maximum Characteristic
            if (actor.system.abilities[k.system.preReq[i].preOpt].value <= k.system.preReq[i].preVal){
              reqCheck[i] = 1;
            }
          } else if (k.system.preReq[i].preType === "Not Advantage" ){  //Test for not specific Advantage
            if (actor.system[k.system.preReq[i].preOpt] != true){
              reqCheck[i] = 1;  
            }
          } else if (k.system.preReq[i].preType === "Not Demi Monde" ){  //Test for Not Demi Monde
            if (actor.system.charType != "DemiMonde"){
              reqCheck[i] = 1;  
            }
          } else if (k.system.preReq[i].preType === "Demi Monde Only" ){  //Test for Demi Monde
            if (actor.system.charType === "DemiMonde"){
              reqCheck[i] = 1;
            }
            //Test for Skill-Min, Spell and Spell-Mastered by reviewing items owned by actor
          } else if (k.system.preReq[i].preType === "Skill-Min" || k.system.preReq[i].preType === "Spell" || k.system.preReq[i].preType === "Spell-Mastered" ){  //Test for Spell
            for (let j of actor.items) {
              if (j.name === k.system.preReq[i].preOpt){
                if(k.system.preReq[i].preType === "Spell"){
                  reqCheck[i] = 1;
                } else if (k.system.preReq[i].preType === "Spell-Mastered" && j.system.mastered === true){
                  reqCheck[i] = 1;
                } else if (k.system.preReq[i].preType === "Skill-Min" && j.system.score >= k.system.preReq[i].preVal){
                  reqCheck[i] = 1;
                }
              }
            }  
          }
        }    
      //Calculate reqresult for the different options
        switch (k.system.preReq.logic){
          case "":
            reqResult=1;
            break;      
          case "A":
            if (reqCheck[1] === 1){
              reqResult=1;
            }  
            break;
          case "A and B":
            if (reqCheck[1] === 1 && reqCheck[2] === 1){
              reqResult=1;
            }  
            break;
          case "A or B":
            if (reqCheck[1] === 1 || reqCheck[2] === 1){
              reqResult=1;
            }  
            break;
          case "A and B and C":
            if (reqCheck[1] === 1 && reqCheck[2] === 1 && reqCheck[3] === 1){
              reqResult=1;
            }  
            break;
          case "A and (B or C)":
            if (reqCheck[1] === 1 && (reqCheck[2] === 1 || reqCheck[3] ===1)){
              reqResult=1;
            }  
            break;
          default:
        }  
      }

      //Check that for skills, spells and traits the item doesn't already exist in the list
        if (reqResult === 1 && (k.type === 'advantages' || k.type === 'spell' || k.type === 'skill')){
          for (let j of actor.items) {
             if (j.name === k.name && j.type === k.type) {
               reqResult = -2 
             }
          }
        }


      //Check to see if we can drop the Item
      if (reqResult === -2) {
        ui.notifications.error(game.i18n.localize("ROL.duplicate") + game.i18n.localize('ROL.' + k.type) +" : " + k.name);
      } else if (reqResult !=1) {
        ui.notifications.error(game.i18n.localize("ROL.preRequisites") + game.i18n.localize('ROL.' + k.type) +" : " + k.name);
      } else if(k.type === "spell" && k.system.spellOrder > 1){
          let thisSpellCount = 0;
          let previousSpellCount = 0;
          for (let j of actor.items) {
            if (j.type === 'spell' && j.system.spellOrder === k.system.spellOrder) {thisSpellCount++};
            if (j.type === 'spell' && j.system.spellOrder === k.system.spellOrder-1) {previousSpellCount++};
          }
        if (thisSpellCount < previousSpellCount && previousSpellCount > 1) {
          newItemData.push(k);          
        } else {
          ui.notifications.error(game.i18n.localize("ROL.spellCount") + k.name);          
        }
      } else {  
        newItemData.push(k);
      } 
    }
    return (newItemData);
  }
}