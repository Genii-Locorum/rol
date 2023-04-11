import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import { ROLChecks } from "../helpers/Utilities/checks.mjs";
import { ROLUtilities } from "../helpers/Utilities/utilities.mjs";
import {spellMenuOptions} from "../helpers/Menus/spell-menu.mjs";
import {skillMenuOptions} from "../helpers/Menus/skill-menu.mjs";
import {weaponMenuOptions} from "../helpers/Menus/weapon-menu.mjs";
import {traitMenuOptions} from "../helpers/Menus/trait-menu.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ROLActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["rol", "sheet", "actor"],
      template: "systems/rol/templates/actor/actor-sheet.html",
      width: 705,
      height: 800,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  /** @override */
  get template() {
    return `systems/rol/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  static confirmItemDelete(actor, itemId) {
    let item = actor.items.get(itemId);
    item.delete();
  }



  /** @override */
  getData() {
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);
   
    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.isGM = game.user.isGM;
    context.isOwner = this.actor.isOwner;
    context.isLocked = this.actor.system.flags.locked;
    context.isCreation = game.settings.get('rol','characterCreation');
    context.isDevelopment = game.settings.get('rol','developmentEnabled');
    context.isSession = game.settings.get('rol','sessionendEnabled');
    context.isDemiMonde = game.settings.get('rol','demiMonde');
    context.isLuckDetail = game.settings.get('rol','luckExtend');
    context.maxStats = game.settings.get('rol','maxStats');

    // Prepare character data and items.
    if (actorData.type === 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
      this._prepareCharacterData(context)
      this._prepareNPCData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareNPCData(context) {
    // Handle ability labels.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.ROL.abilityAbbreviations[k]) ?? k;
    }
  }

  _prepareCharacterData(context) {
    // Handle ability labels.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.ROL.abilities[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {


    // Initialize containers.
    const equipment = [];
    const categories = [];
    const features = [];
    const skills = [];
    const spells = [];
    const advantages = [];
    const contacts = [];
    const weapons = [];
    const armour = [];


    // Iterate through items, allocating to containers

    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to equipment.
      if (i.type === 'equipment') {
        equipment.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        spells.push(i);
      }
      // Append to skills.
      else if (i.type === 'skill'){
        skills.push(i);
      }
      // Append to advantages 
      else if (i.type === 'advantages'){
        advantages.push(i);
      }
      // Append to contacts.
      else if (i.type === 'contacts'){
        contacts.push(i);
      }
      // Append to weapons.
      else if (i.type === 'weapons'){
        weapons.push(i);
      }
      // Append to armour.
      else if (i.type === 'armour'){
        armour.push(i);
      }
    }

    //Add Spell Order Titles and sort by level and alphabetically  -  deduct 0.5 from spellOrder so it lists first
    let maxSpell = game.settings.get('rol','maxSpell');
    for (let i=1; i<=maxSpell; i++){
      spells.push(
        {name: game.i18n.localize("ROL.spell"+i), isType: true, system: {spellOrder: i-0.5}});  
    }
    spells.sort(function(a, b){
      let x = a.name.toLowerCase();
      let y = b.name.toLowerCase();
      let p = a.system.spellOrder;
      let q = b.system.spellOrder;
      if (p < q) {return -1};
      if (p > q) {return 1};
      if (x < y) {return -1};
      if (x > y) {return 1};
      return 0;
   });

    // Sort skills in to alphabetical order
    skills.sort(function(a, b){
      let x = a.name.toLowerCase();
      let y = b.name.toLowerCase();
      if (x < y) {return -1};
      if (x > y) {return 1};
      return 0;
    });

    //If this is an actor add specialiased categories and types and resort
    console.log(this.actor.type)
    if (this.actor.type === 'character') {
      console.log(this.actor.type)
    //Get unique list of specialized categories in Skills
   
    let previousSpec = "";
    for (let i of skills) {
      if(i.system.specialisation && previousSpec !== i.system.specialisation) {  
        previousSpec = i.system.specialisation;  
                categories.push({
          name: i.system.specialisation,
          isSpecialisation: true,
          system: {type: i.system.type}
        });
      }
    }

     //Add the Skill Type Headings  
    categories.push(
      {name: '0', isType: true, system: {type: "Common", skillName : game.i18n.localize("ROL.common")}},
      {name: '0', isType: true, system: {type: "Expert", skillName : game.i18n.localize("ROL.expert")}},
      {name: '0', isType: true, system: {type: "Weapons", skillName : game.i18n.localize("ROL.weapons")}}
    );
    
  
   //Push this  list to Skills resort based on Skill Type and then Name 
    for (let i of categories) {
        skills.push(i);
      }
    
    skills.sort(function(a, b){
      let x = a.name.toLowerCase();
      let y = b.name.toLowerCase();
      let p = a.system.type;
      let q = b.system.type;
      if (p < q) {return -1};
      if (p > q) {return 1};
      if (x < y) {return -1};
      if (x > y) {return 1};
      return 0;
   });

  }

   //Sort Advantages by type and name
   advantages.sort(function(a, b){
    let x = a.name.toLowerCase();
    let y = b.name.toLowerCase();
    let p = a.system.advType;
    let q = b.system.advType;
    if (p < q) {return 1};
    if (p > q) {return -1};
    if (x < y) {return -1};
    if (x > y) {return 1};
    return 0;
 });

   //Sort Contacts by  name
   contacts.sort(function(a, b){
    let x = a.name.toLowerCase();
    let y = b.name.toLowerCase();
    if (x < y) {return -1};
    if (x > y) {return 1};
    return 0;
 });

    //Sort Weapons by type and name
    weapons.sort(function(a, b){
      let x = a.name.toLowerCase();
      let y = b.name.toLowerCase();
      let p = a.system.type;
      let q = b.system.type;
      if (p < q) {return -1};
      if (p > q) {return 1};
      if (x < y) {return -1};
      if (x > y) {return 1};
      return 0;
   });

  //Calculate and update armour values
    let regArm=0;
    let balArm=0;
    for (let i of armour) {
     if (i.system.type === 'Regular' && i.system.ap > regArm){
        regArm =  i.system.ap
      }else if (i.system.type === 'Ballistic' && i.system.ap > balArm) {
        balArm = i.system.ap
      }  
    }
    if (this.actor.type === 'character') {
      this.actor.update ({'system.armour.regular': regArm, 'system.armour.ballistic' : balArm })
    }  


   // Assign and return
    context.equipment = equipment;
    context.features = features;
    context.spells = spells;
    context.skills = skills;
    context.advantages = advantages;
    context.contacts = contacts;
    context.weapons = weapons;
    context.armour = armour;

  }


  
  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

 
    new ContextMenu(html, '.skill-name.rollable', skillMenuOptions(this.actor, this.token));
    new ContextMenu(html, '.spell-name.rollable', spellMenuOptions(this.actor, this.token));
    new ContextMenu(html, '.weapon-name.rollable', weaponMenuOptions(this.actor, this.token));
    new ContextMenu(html, '.trait-name-context', traitMenuOptions(this.actor, this.token));
    new ContextMenu(html, '.equip-name-context', traitMenuOptions(this.actor, this.token));

    // Lock/Unlock the sheet
    html.find(".unlock-character-sheet").click((event) => this._onLockToggle(event));

    // Edit NPC Skill
    html.find(".inline-edit").change(this._onNPCSkillEdit.bind(this));

    // Other Toggles
    html.find(".tough-toggle").click((event) => this._onOtherToggle(event));

    // Rollable Skills
    html.find('.skill-name.rollable').click(ROLChecks._onRollSkillTest.bind(this));

    // Rollable Attributes
    html.find('.attribute-name.rollable').click(ROLChecks._onRollAttributeTest.bind(this));

    // Rollable Luck
    html.find('.luck-name.rollable').click(ROLChecks._onRollLuckTest.bind(this));

    // Rollable HTD
    html.find('.htd-name.rollable').click(ROLChecks._onRollHTDTest.bind(this));

    // Rollable Spell
    html.find('.spell-name.rollable').click(ROLChecks._onRollSpellTest.bind(this));

    // Rollable Damage
    html.find('.damage-name.rollable').click(ROLChecks._onRollDamageTest.bind(this));

    // Rollable Weapon
    html.find('.weapon-name.rollable').click(ROLChecks._onRollWeaponTest.bind(this));

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Luck Recovery
    html.find('.luckrecovery-rollable').click(ROLChecks._onLuckRecovery.bind(this));

    // Luck Reset
    html.find('.luckreset-rollable').click(ROLChecks._onLuckReset.bind(this));

    //Healing Phase
    html.find('.healing-phase').dblclick(ROLUtilities._toggleRecovery.bind(this));

    //magic Point Recovery
    html.find('.next-scene').dblclick(ROLUtilities._toggleMPRegen.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  //Handle lockable toggle
  async _onLockToggle(event) {
    this.actor.toggleActorFlag("locked");
  }

  //Handle other toggle
  async _onOtherToggle(event) {
    event.preventDefault();
    const prop=event.currentTarget.closest('.tough-toggle').dataset.property;
    const state=this.object.system.properties[prop];
    let checkProp={};
    if (prop==='impaired' && state === true) {
      checkProp={'system.properties.impaired' : false};
    } else if (prop==='impaired' && state === false) {
      checkProp={'system.properties.impaired' : true};
    } else if (prop==='htd' && state === true) {
      checkProp={'system.properties.htd' : false};
    } else if (prop==='htd' && state === false) {
      checkProp={'system.properties.htd' : true};
    } else if (prop==='hurt' && state === true) {
      checkProp={'system.properties.hurt' : false, 'system.damage.value': 0};
    } else if (prop==='hurt' && state === false) {
      checkProp={'system.properties.hurt' : true,'system.properties.bloodied' : false, 'system.damage.value': 1};
    } else if (prop==='bloodied' && state === true) {
      checkProp={'system.properties.bloodied' : false,'system.properties.hurt' : true, 'system.damage.value': 1};
    } else if (prop==='bloodied' && state === false) {
      checkProp={'system.properties.bloodied' : true, 'system.properties.hurt' : false, 'system.damage.value': 2};
    } else if (prop==='trauma' && state === true) {
      checkProp={'system.properties.trauma' : false};
    } else if (prop==='trauma' && state === false) {
      checkProp={'system.properties.trauma' : true};
    } else if (prop==='disfigured' && state === true) {
    checkProp={'system.properties.disfigured' : false};
    } else if (prop==='disfigured' && state === false) {
      checkProp={'system.properties.disfigured' : true};
    } else if (prop==='typeNPC') {
      checkProp={'system.charType' : "Npc"};
    } else if (prop==='typeDemi') {
      checkProp={'system.charType' : "DemiMonde"};
    } else if (prop==='typeCreature') {
      checkProp={'system.charType' : "Creature"};
    } else if (prop==='typeInv') {
      checkProp={'system.charType' : "Investigator"};
    }  
    const actor = await this.object.update(checkProp);
    return actor;
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    if (type === "skill") {
      data.skillName = name
    }
    console.log(name,type,data)
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  // Change default on Drop Item Create routine for requirements (single items and folder drop)-----------------------------------------------------------------
  async _onDropItemCreate(itemData) {
 
    const newItemData = [];
    itemData = itemData instanceof Array ? itemData : [itemData];

    //If enforce PreReq disabled for the actor type then add items 
    if ((this.actor.type === 'character' && game.settings.get('rol','pcPreReq') != true) || this.actor.type === 'npc' && game.settings.get('rol','npcPreReq') != true) {
      return this.actor.createEmbeddedDocuments("Item", itemData);
    }

    //Otherwise check pre-reqs item by item
    for (let k of itemData) {
      let reqCheck = [];
      let reqResult = 0;
      if (k.type === "weapons" || k.type === "equipment" || k.type === "armour" || k.type === "contacts") {
        reqResult = 1;
      } else if (k.type === "skill"){
        if (k.system.subtype != "Magic" || this.actor.system.Magic === true){
          reqResult = 1;  
        }
      } else if (k.type === "advantages" || (k.type === "spell" && this.actor.system.Magic === true)) {
        for (let i=1; i<4; i++){
          reqCheck[i]=0;
          if (k.system.preReq[i].preType === "") {         //If no pre-req then set result = 1
            reqCheck[i] = 1;
          } else if (k.system.preReq[i].preType === "Char-Min" ){  //Test for minimum Characteristic
            if (this.actor.system.abilities[k.system.preReq[i].preOpt].value >= k.system.preReq[i].preVal){
              reqCheck[i] = 1;
            }
          } else if (k.system.preReq[i].preType === "Char-Max" ){  //Test for maximum Characteristic
            if (this.actor.system.abilities[k.system.preReq[i].preOpt].value <= k.system.preReq[i].preVal){
              reqCheck[i] = 1;
            }
          } else if (k.system.preReq[i].preType === "Not Advantage" ){  //Test for not specific Advantage
            if (this.actor.system[k.system.preReq[i].preOpt] != true){
              reqCheck[i] = 1;  
            }
          } else if (k.system.preReq[i].preType === "Not Demi Monde" ){  //Test for Not Demi Monde
            if (this.actor.system.charType != "DemiMonde"){
              reqCheck[i] = 1;  
            }
          } else if (k.system.preReq[i].preType === "Demi Monde Only" ){  //Test for Demi Monde
            if (this.actor.system.charType === "DemiMonde"){
              reqCheck[i] = 1;
            }
            //Test for Skill-Min, Spell and Spell-Mastered by reviewing items owned by actor
          } else if (k.system.preReq[i].preType === "Skill-Min" || k.system.preReq[i].preType === "Spell" || k.system.preReq[i].preType === "Spell-Mastered" ){  //Test for Spell
            for (let j of this.actor.items) {
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
    //Check to see if we can drop the Item
      if (reqResult !=1) {
        ui.notifications.error(game.i18n.localize("ROL.preRequisites") + game.i18n.localize('ROL.' + k.type) +" : " + k.name);
      } else if(k.type === "spell" && k.system.spellOrder > 1){
          let thisSpellCount = 0;
          let previousSpellCount = 0;
          for (let j of this.actor.items) {
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
    return this.actor.createEmbeddedDocuments("Item", newItemData);
  }
  
// Update NPC skills etc without opening the item sheet
async _onNPCSkillEdit(event){
  event.preventDefault();
    const element = event.currentTarget;
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    const field = element.dataset.field;
  return item.update ({ [field]: element.value});
}



}