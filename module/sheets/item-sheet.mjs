/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ROLItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["rol", "sheet", "item"],
      width: 550,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/rol/templates/item";
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Set isGM to identify if user is GM and isLocked for actor sheet being locked
    context.isGM=game.user.isGM;
    context.isLocked = this.object.parent? this.object.parent.system.flags.locked : false;
    context.isCreation = game.settings.get('rol','characterCreation');
    context.isDevelopment = game.settings.get('rol','developmentEnabled');
    
    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;
    context.maxSpell = game.settings.get('rol','maxSpell');

    // Prepare character data and items.
    if (itemData.type === 'skill') {
      this._prepareSkillItemData(context);
    } 

    return context;
  }

  /* -------------------------------------------- */  
  /* Organize and classify Items for Item sheets.
  *
  * @param {Object} itemData The actor to prepare.
  *
  * @return {undefined}
  */
  
  _prepareSkillItemData(context) {
    // Handle ability labels.
  
    //  Update name of skill for Categorisation  
    let checkProp =""; 
    let checkName = "";  

    if( this.item.system.skillName ==="" ) {
        checkName = this.item.name;
        checkProp = {'system.skillName' : checkName}; 
    }else{    
      if (this.item.system.special) {
        checkName = this.item.system.specialisation + ' (' + this.item.system.skillName +')';
      } else {
        checkName = this.item.system.skillName
      }
      checkProp={'name' : checkName};
    }  
    this.object.update(checkProp);
      
  }





  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Turn toggle switches on and off
    html.find('.toggle-switch').click(this._onClickToggle.bind(this));

    // Roll handlers, click handlers, etc. would go here.
  }


   //Handle toggle states 
   async _onClickToggle(event) {

    event.preventDefault();
    
    const prop=event.currentTarget.closest('.toggle-switch').dataset.property;
    const state=this.object.system[prop];
    let checkProp={};
   
    if (prop==='common') {
      checkProp={'system.type' : "Common"};
    } else if (prop==='expert') {
      checkProp={'system.type' : "Expert"};
    } else if (prop==='weapons') {
      checkProp={'system.type' : "Weapons"}; 
    } else if (prop==='athletics') {
      checkProp={'system.subType' : "Athletics",
                 'system.type' : "Common",
                 'system.special' : false };                
    } else if (prop==='language') {
      checkProp={'system.subType' : "Language",
                 'system.type' : "Expert",
                 'system.special' : true };              
    } else if (prop==='magic') {
      checkProp={'system.subType' : "Magic",
                 'system.type' : "Expert",
                 'system.special' : false };   
    }  else if (prop==='firearms') {
      checkProp={'system.subType' : "Firearms",
                 'system.type' : "Weapons",
                 'system.special' : false };                
    } else if (prop==='fighting') {
      checkProp={'system.subType' : "Fighting",
                 'system.type' : "Weapons",
                 'system.special' : false };                
    } else if (prop==='none') {
      checkProp={'system.subType' : "None"};                
    } else if (prop==='melee') {
      checkProp={'system.type' : "Melee"};                
    } else if (prop==='thrown') {
      checkProp={'system.type' : "Thrown"};                
    } else if (prop==='guns') {
      checkProp={'system.type' : "Firearms"};                
    } else if (prop==='natural') {
      checkProp={'system.type' : "Natural"};                
    } else if (prop==='regular') {
      checkProp={'system.type' : "Regular"};                
    } else if (prop==='ballistic') {
      checkProp={'system.type' : "Ballistic"};                
    } else if (prop==='special' && state === true) {
      checkProp={'system.special' : false};
    } else if (prop==='special' && state === false) {
      checkProp={'system.special' : true};
    } else if (prop==='mastered' && state === false) {
      if(this.item.system.spellOrder === 1) {
        checkProp={'system.mastered' : true};
      }else {
        let spellmastery = 0
        for (let j of this.actor.items) {
          if (j.type === "spell" && j.system.spellOrder === this.item.system.spellOrder-1 && j.system.mastered === true) {
            spellmastery ++
          }  
        }  
        if (spellmastery >1) {
          checkProp={'system.mastered' : true};
        } else {
          ui.notifications.error(game.i18n.localize("ROL.spellMastery"));
        }
      }
    } else if (prop==='mastered' && state === true) {
      checkProp={'system.mastered' : false};
    } else if (prop==='damageBoost' && state === true) {
      checkProp={'system.damageBoost' : false};
    } else if (prop==='damageBoost' && state === false) {
      checkProp={'system.damageBoost' : true};
    } else if (prop==='advType' && state === false) {
      checkProp={'system.advType' : true};
    } else if (prop==='advType' && state === true) {
      checkProp={'system.advType' : false};
    } else if (prop==='secure' && state === false) {
      checkProp={'system.secure' : true,'system.sour' :false};
    } else if (prop==='secure' && state === true) {
      checkProp={'system.secure' : false};
    } else if (prop==='sour' && state === false) {
      checkProp={'system.sour' : true, 'system.secure' :false};
    } else if (prop==='sour' && state === true) {
      checkProp={'system.sour' : false};
    } else if (prop==='signature' && state === false) {
      checkProp={'system.signature' : true};
    } else if (prop==='signature' && state === true) {
      checkProp={'system.signature' : false};
    } else if (prop==='automatic' && state === false) {
      checkProp={'system.automatic' : true, 'system.semiauto' : false};
    } else if (prop==='automatic' && state === true) {
      checkProp={'system.automatic' : false};
    } else if (prop==='semiauto' && state === false) {
      checkProp={'system.semiauto' : true, 'system.automatic' : false};
    } else if (prop==='semiauto' && state === true) {
      checkProp={'system.semiauto' : false};
    } else if (prop==='blunt') {
      checkProp={'system.damType' : "blunt"};
    } else if (prop==='bladed') {
      checkProp={'system.damType' : "bladed"};
    } else if (prop==='projectile') {
      checkProp={'system.damType' : "ballistic"};
    } else if (prop==='magical') {
      checkProp={'system.damType' : "magic"};
    }  else if (prop==='vorpal') {
      checkProp={'system.damType' : "vorpal"};
    }

    const item = await this.object.update(checkProp);
    return item;
    }


}
