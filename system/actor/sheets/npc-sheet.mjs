import { ROLActorSheet } from "./base-actor-sheet.mjs"
import { ROLChecks } from "../../apps/checks.mjs"

export class ROLNPCSheet extends ROLActorSheet {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['npc','themed', 'theme-light'],
    position: {
      width: 620,
      height: 860
    },
  }

  static PARTS = {
    header: { 
      template: 'systems/rol/templates/actor/npc.header.hbs',
      scrollable: ['']
     }
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    //Common parts to the character - this is the order they are show on the sheet
    options.parts = ['header'];
  }

  _getTabs(parts) {
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    context.tabs = this._getTabs(options.parts);
    context.enrichedDescriptionValue = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.description,
      {
        async: true,
        secrets: this.document.isOwner,
        rollData: this.actor.getRollData(),
        relativeTo: this.actor,
      }
    ) 
    context.enrichedNotesValue = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        this.actor.system.notes,
        {
          async: true,
          secrets: this.document.isOwner,
          rollData: this.actor.getRollData(),
          relativeTo: this.actor,
        }
      ) 
    await this._prepareItems(context);
    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
    }  
    return context;
  }

  //Handle Actor's Items
  async _prepareItems(context) {
    // Initialize containers.
    const equipment = [];
    const categories = [];
    const skills = [];
    const spells = [];
    const advantages = [];
    const contacts = [];
    const weapons = [];
    const armour = [];



    // Iterate through items, allocating to containers
    for (let i of this.document.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'equipment') {
        equipment.push(i);
      } else if (i.type === 'spell') {
        spells.push(i);
      } else if (i.type === 'skill'){
        skills.push(i);
      } else if (i.type === 'advantages'){
        advantages.push(i);
      } else if (i.type === 'contacts'){
        contacts.push(i);
      } else if (i.type === 'weapons'){
        weapons.push(i);
      } else if (i.type === 'armour'){
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
      if (this.actor.type === 'character') {
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
    context.spells = spells;
    context.skills = skills;
    context.advantages = advantages;
    context.contacts = contacts;
    context.weapons = weapons;
    context.armour = armour;
  }



  //Activate event listeners using the prepared sheet HTML
  _onRender(context, _options) {
    this._dragDrop.forEach((d) => d.bind(this.element));
    this.element.querySelectorAll('.inline-edit').forEach(n => n.addEventListener("change", this.#onNPCSkillEdit.bind(this)))
    this.element.querySelectorAll('.view-item').forEach(n => n.addEventListener("click", this.#viewFromUuid.bind(this)))    
    this.element.querySelectorAll('.delete-item').forEach(n => n.addEventListener("dblclick", this.#deleteFromUuid.bind(this)))        
    this.element.querySelectorAll('.attribute-name.rollable').forEach(n => n.addEventListener("click", ROLChecks._onRollAttributeTest.bind(this)))
    this.element.querySelectorAll('.skill-name.rollable').forEach(n => n.addEventListener("click", ROLChecks._onRollSkillTest.bind(this)))    
    this.element.querySelectorAll('.luck-name.rollable').forEach(n => n.addEventListener("click", ROLChecks._onRollLuckTest.bind(this)))
    this.element.querySelectorAll('.htd-name.rollable').forEach(n => n.addEventListener("click", ROLChecks._onRollHTDTest.bind(this)))
    this.element.querySelectorAll('.luckrecovery-rollable').forEach(n => n.addEventListener("click", ROLChecks._onLuckRecovery.bind(this)))
    this.element.querySelectorAll('.damage-name.rollable').forEach(n => n.addEventListener("click", ROLChecks._onRollDamageTest.bind(this)))
    this.element.querySelectorAll('.spell-name.rollable').forEach(n => n.addEventListener("click", ROLChecks._onRollSpellTest.bind(this)))    
    this.element.querySelectorAll('.weapon-name.rollable').forEach(n => n.addEventListener("click", ROLChecks._onRollWeaponTest.bind(this)))    


  }



  //--------------ACTIONS-------------------



  //--------------LISTENERS------------------

  //View from Uuid
  async #viewFromUuid(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    const itemId = event.currentTarget.dataset.itemId;
    let viewDoc = await fromUuid(itemId)
    if (viewDoc) viewDoc.sheet.render(true)
  }

  // Delete Inventory Item
  async #deleteFromUuid(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    const itemId = event.currentTarget.dataset.itemId;
    const item = await fromUuid(itemId)
    item.delete();
  };

  // Update NPC skills etc without opening the item sheet
  async #onNPCSkillEdit(event){
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    let newVal = event.target.value
    const item = this.actor.items.get(itemId);
    let field = ""
    if (event.target.dataset.field === 'name') {
      field = 'name'
    } else {
      field = "system."+ event.target.dataset.field
    }
    await item.update ({ [field]: newVal});
  }


}
