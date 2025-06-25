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
    let state = await game.settings.get('rol', 'sessionendEnabled')
    if(!state) {
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
   
   
    await game.settings.set('rol', 'sessionendEnabled', !state)
    game.socket.emit('system.rol', {
      type: 'updatechar',
      value: 'sessionPhase',
      state: toggle
    })
    ROLUtilities.updateCharSheets('sessionPhase', toggle)
  }

  //Toggle Character Development On and Off----------------------------------------------------------------------------------
  static async toggleDevelopment(toggle){
    let state = await game.settings.get('rol', 'developmentEnabled')
    await game.settings.set('rol', 'developmentEnabled', !state)
    ui.notifications.info(
      state
        ? game.i18n.localize('ROL.developPhaseDisabled')
        : game.i18n.localize('ROL.developPhaseEnabled')
    )
    game.socket.emit('system.rol', {
      type: 'updatechar',
      value: 'developPhase',
      state: state
    })
    ROLUtilities.updateCharSheets('developPhase',state)  
  }
  
  //Toggle Character Creation On and Off---------------------------------------------------------------------------------------
  static async toggleCreation(toggle){
    let state = await game.settings.get('rol', 'characterCreation')
    await game.settings.set('rol', 'characterCreation', !state)
    ui.notifications.info(
      state
        ? game.i18n.localize('ROL.createPhaseDisabled')
        : game.i18n.localize('ROL.createPhaseEnabled')
    )
    game.socket.emit('system.rol', {
      type: 'updatechar',
      value: 'createPhase',
      state: state
    })
    ROLUtilities.updateCharSheets('createPhase', state)  
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
  const html = await foundry.applications.handlebars.renderTemplate('systems/rol/templates/apps/mortalWound.html',data);

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

  /* -------------------------------------------- */
  /*  Hotbar Macros                               */
  /* -------------------------------------------- */
  /**
   * Create a Macro from an Item drop.
   * Get an existing item macro if one exists, otherwise create a new one.
   * @param {Object} data     The dropped data
   * @param {number} slot     The hotbar slot to use
   * @returns {Promise}
   */

  static async createItemMacro(data, slot) {
    // First, determine if this is a valid owned item.
    if (data.type !== "Item") return;
    if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
      return ui.notifications.warn("You can only create macro buttons for owned Items");
    };

    // If it is, retrieve it based on the uuid.
    const item = await Item.fromDropData(data);
    // Create the macro command using the uuid.
    const command = `game.rol.rollItemMacro("${data.uuid}");`;
    let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
    if (!macro) {
      macro = await Macro.create({
        name: item.name,
        type: "script",
        img: item.img,
        command: command,
        flags: { "rol.itemMacro": true }
      });
    }
    game.user.assignHotbarMacro(macro, slot);
    return false;
  }

  /**
   * Run a called Macro created from an Item drop.
   * Get an existing item macro if one exists, otherwise create a new one.
   * @param {string} itemUuid
   */
  static rollItemMacro(itemUuid) {
    // Reconstruct the drop data so that we can load the item.
    const dropData = {
      type: 'Item',
      uuid: itemUuid
    };
    // Load the item from the uuid.
    Item.fromDropData(dropData).then(item => {
      // Determine if the item loaded and if it's an owned item.
      if (!item || !item.parent) {
        const itemName = item?.name ?? itemUuid;
        return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
      }
      // Trigger the item roll
      item.roll();
    });
  }



}
