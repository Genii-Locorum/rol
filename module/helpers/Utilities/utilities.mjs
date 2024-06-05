export class ROLUtilities {

  //Update character sheet for all actors---------------------------------------------------------------------------
  static updateCharSheets (value, state) {
    if (game.user.isGM) {
      for (const a of game.actors.contents) {
        if(a.type === 'character' && value === 'sessionPhase' && state === true) {
          a.update({'system.flags.luckImprov' : true});
        }else if (a.type === 'character' && value === 'developPhase' && state === true) {
          let newEarned = a.system.devPoints.earned + a.system.devPoints.holding;
          a.update({'system.flags.luckReset' : true, 'system.devPoints.earned': newEarned, 'system.devPoints.holding' : 0});        
        }else if (a.type === 'character' && value === 'createPhase' && state === true) {
          a.update({'system.flags.luckReset' : true});        
        }    

        if (a?.type === 'character' && a?.sheet && a?.sheet?.rendered) {
          a.update({ 'system.flags.locked': true })
          a.render(false)
        }
      }
    } else {
      for (const a of game.actors.contents) {
        if (a.isOwner) {
          a.update({ 'system.flags.locked': true })
          a.render(false)
        }
      }
    }
  }    

  //Toggle End of Session Phase On and Off---------------------------------------------------------------------------
  static async toggleSession(toggle) {
    if(toggle === true) {
    await Dialog.confirm({
      title: game.i18n.localize('ROL.awardDevPoints'),
      content: `<template><div style="display: flex; gap: 1em; align-items: center;"><input type="number" style="width: 3em;" value="0" min="0"></input><p style="margin: .5em 0; gap: .5em;"><slot name="name" style="padding-right: 2em;"></slot> [<slot name="id"></slot>]</p></div></template><section></section>`,
      render: html => {
          const section = html[0].querySelector("section");
          const template = html[0].querySelector("template");
          
          for (const actor of game.actors) {
            if(actor.type === 'character'){
              const item = document.createElement("div");
              item.style.margin = ".5em 0";
              
              const name = document.createElement("span");
              name.slot = "name";
              name.textContent = actor.name;
              item.append(name);
  
              const id = document.createElement("code");
              id.slot = "id";
              id.textContent = actor.id;
              item.append(id);
  
              const shadowRoot = item.attachShadow({ mode: "open" });
              shadowRoot.appendChild(template.content.cloneNode(true));
              
              section.append(item);
            }  
          }
      },
      yes: html => {
        const updates = [];
        html[0].querySelectorAll("template ~ section > div").forEach(el => {
            const id = el.querySelector("code").textContent;
            let actor = game.actors.get(id)
            let quantity = el.shadowRoot.querySelector("input").value;
            if (quantity > 0) {
              let newHold = actor.system.devPoints.holding = actor.system.devPoints.holding + Number(quantity)
              actor.update({'system.devPoints.holding': newHold});
            }
        });
      },
    });
  }; 
   
   
    await game.settings.set('rol', 'sessionendEnabled', toggle)
    game.socket.emit('system.rol', {
      type: 'updateChar',
      value: 'sessionPhase',
      state: toggle
    })
    ROLUtilities.updateCharSheets('sessionPhase', toggle)
  }

  //Toggle Character Development On and Off----------------------------------------------------------------------------------
  static async toggleDevelopment(toggle){
    await game.settings.set('rol', 'developmentEnabled', toggle)
    game.socket.emit('system.rol', {
      type: 'updateChar',
      value: 'developPhase',
      state: toggle
    })
    ROLUtilities.updateCharSheets('developPhase',toggle)  
  }
  
  //Toggle Character Creation On and Off---------------------------------------------------------------------------------------
  static async toggleCreation(toggle){
    await game.settings.set('rol', 'characterCreation', toggle)
    game.socket.emit('system.rol', {
      type: 'updateChar',
      value: 'createPhase',
      state: toggle
    })
    ROLUtilities.updateCharSheets('createPhase', toggle)  
  } 


 //Set Party Order-------------------------------------------------------------------------------------------------------------
static async setPartyOrder(toggle){

  Dialog.confirm({
    title: game.i18n.localize('ROL.partyOrder'),
    content: `<template><div style="display: flex; gap: 1em; align-items: center;"><input type="number" style="width: 3em;" value="0" min="0"></input><p style="margin: .5em 0;"><slot name="name"></slot> [<slot name="id"></slot>]</p></div></template><section></section>`,
    render: html => {
        const section = html[0].querySelector("section");
        const template = html[0].querySelector("template");
      
        for (const actor of game.actors) {
          if (actor.type === 'character'){
            const item = document.createElement("div");
            item.style.margin = ".5em 0";
          
            const name = document.createElement("span");
            name.slot = "name";
            name.textContent = actor.name;
            item.append(name);

            const id = document.createElement("code");
            id.slot = "id";
            id.textContent = actor.id;
            item.append(id);

            const shadowRoot = item.attachShadow({ mode: "open" });
            shadowRoot.appendChild(template.content.cloneNode(true));
          
            section.append(item);
          }
        }  
    },
    yes: html => {
      const updates = [];
      html[0].querySelectorAll("template ~ section > div").forEach(el => {
          const id = el.querySelector("code").textContent;
          let position = el.shadowRoot.querySelector("input").value;
          if (position === 0) {
            position = 99
          }
          let actor = game.actors.get(id)  
          actor.system.position = position
      });
    },
  });
} 


//Recovery Phase------------------------------------------------------------------------------------
static async _toggleRecovery(){
  let currDam = Number(this.actor.system.damage.value);
  if (this.actor.system.Frail && currDam > 0 && currDam < 3 ){
    currDam=currDam+1;
  }
  
  switch (currDam) {
    case 0:
      break;
    case 1:
    case 2:
      this.actor.update({'system.damage.value': Number(0) });
      if (this.actor.system.properties.hurt === false) {
        this.actor.update({'system.properties.impaired': false});
      }
      break;
    case 3:
      this.actor.update({'system.damage.value': Number(1), 'system.properties.hurt': true});
      break;          
    case 4:

      await ROLUtilities.resolveMortalWound(this.actor)

    break; 
    case 5:  
      if(this.actor.system.luck.value<30) {
        ui.notifications.error(game.i18n.localize("ROL.fatalHeal"))
      } else {
        this.actor.update({'system.luck.value' : this.actor.system.luck.value -30,  'system.damage.value': Number(4)})
      }  

      break;
  }  
}


static async resolveMortalWound (actor){

  let injured = false;
  let luck = false;
  let develop = false;
  let disfigure = false;
  let isDisfigured = actor.system.properties.disfigured;
  let count = 0;
  let newLuck = actor.system.luck.value;
  let newDevelop = actor.system.devPoints.holding;
  let impaired = false;
  let bloodied = actor.system.properties.bloodied;
  let newDamage = Number(0);
  let limited = false;

  if (newLuck < 20 && isDisfigured) {
    limited = true;
  } 
    let usage = await ROLUtilities.mortalDialog(actor, limited);
    if (usage.get('injured') === 'on') {injured = true, count++};
    if (usage.get('luck') === 'on') {luck = true,count++};
    if (usage.get('develop') === 'on') {develop = true, count++};
    if (usage.get('disfigured') === 'on') {disfigure = true, count++};

  if (count !=2) {
    ui.notifications.error("You must select two options");
    return false;
  }  

  if (injured) {impaired = true, bloodied = true, newDamage = Number(2)};
  if (luck) {newLuck = newLuck - 20};
  if (develop) {newDevelop--};
  if (disfigure) {isDisfigured = true};

  actor.update({'system.damage.value': newDamage,'system.properties.impaired' : impaired,'system.properties.bloodied' : bloodied, 'system.luck.value' : newLuck, 'system.properties.disfigured' : isDisfigured, 'system.devPoints.holding': newDevelop});

}


static async mortalDialog (actor, limited) {
  const data = {
    disfigured: actor.system.properties.disfigured,
    luck: actor.system.luck.value,
    limited: limited,
  }
  const html = await renderTemplate('systems/rol/templates/apps/mortalWound.html',data);

  return new Promise(resolve => {
    let formData = null
    const dlg = new Dialog({
      title: game.i18n.localize("ROL.mortal"),
      content: html,
      buttons: {
        roll: {
          label: game.i18n.localize("ROL.healMe"),
          callback: html => {
          formData = new FormData(html[0].querySelector('#mortalWound-form'))
          return resolve(formData)
          }
        }
      },
    default: 'roll',
    close: () => {}
    })
    dlg.render(true);
  })
}


//Get Dataset--------------------------------------------------------------------------------
static getDataset(el, dataset) {
  const elem = el.target ? el.target : el[0];
  const element = elem?.closest(".item");
  return element?.dataset[dataset];
}      

//MP Regen------------------------------------------------------------------------------------
static async _toggleMPRegen(){
  let newMP = this.actor.system.mp.max;
  this.actor.update({'system.mp.value': newMP});
} 


//Item Migration - temp fix
static async itemMigration () {

  let confirmation = await Dialog.confirm({
    title: game.i18n.localize('Migrate Item Data'),
    content: "<br><p><b>" + game.i18n.localize('ROL.confirmation') + "</p><br>",
  });

  if (!confirmation) {return}

  for (let itm of game.items) {
      if (itm.system[itm.type] !== undefined) {
        if (itm.system.description != null){
          await itm.update({'system.description':itm.system[itm.type].description})
        }
      } 
    }
  for (let act of game.actors){
    for (let itm of act.items){
      if (itm.system[itm.type] !== undefined) {
        if (itm.system.description != null){
          await itm.update({'system.description':itm.system[itm.type].description})
        }
      } 
    }
  }
  ui.notifications.warn("Migration Completed")
  }
}
