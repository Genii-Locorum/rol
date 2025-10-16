const { api, sheets } = foundry.applications;

export class ROLItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ['rol', 'sheet', 'item'],
    position: {
      width: 600,
      height: 600
    },
    window: {
      resizable: true,
    },
    tag: "form",
    form: {
      submitOnChange: true,
    },
    actions: {
      onEditImage: this._onEditImage,
      itemToggle: this._onItemToggle,
      skillType: this._onSkillType,
      skillSubType: this._onSkillSubType,
      armourType: this._onArmourType,
      damageType: this._onDamageType,
      weaponType: this._onWeaponType,
      rateOfFire: this._onRateofFire,
      mastered: this._onSpellMastery,
    }
  }

  async _prepareContext(options) {
    let canEdit = false
    if (this.document.isOwner || game.user.isGM) {
      canEdit = true
    }
    let enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      {
        async: true,
        secrets: this.item.editable
      }
    )
    let isCreation = game.settings.get('rol','characterCreation');
    let isDevelopment = game.settings.get('rol','developmentEnabled');


    return {
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      item: this.item,
      enrichedDescription: enrichedDescription,
      system: this.item.system,
      hasOwner: this.item.isEmbedded === true,
      isGM: game.user.isGM,
      isCreation: isCreation,
      isDevelopment: isDevelopment,  
      config: CONFIG.ROL,
      canEdit: canEdit
    };
  }

  // Handle changing a Document's image.
  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
      {};
    const fp = new foundry.applications.apps.FilePicker({
      current,
      type: 'image',
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 39,
      left: this.position.left + 9,
    });
    return fp.browse();
  }


  //------------ACTIONS-------------------

  // Change Image
  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
      {};
    const fp = new foundry.applications.apps.FilePicker({
      current,
      type: 'image',
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 39,
      left: this.position.left + 9,
    });
    return fp.browse();
  }

  static async _onSkillType(event, target) {
   event.preventDefault();
   if (!game.user.isGM) {return}
    const prop=target.dataset.property;
    let checkProp={};
    if (['Common','Expert','Weapons'].includes(prop)) {
      checkProp={'system.type' : prop};
    } else {return}    
    await this.item.update(checkProp);
  }

   static async _onSkillSubType(event, target) {
   event.preventDefault();
   if (!game.user.isGM) {return}
    const prop=target.dataset.property;
    let checkProp={};
    if (prop==='Athletics') {
      checkProp={'system.subType' : "Athletics",
                 'system.type' : "Common",
                 'system.special' : false };                
    } else if (prop==='Language') {
      checkProp={'system.subType' : "Language",
                 'system.type' : "Expert",
                 'system.special' : true };              
    } else if (prop==='Magic') {
      checkProp={'system.subType' : "Magic",
                 'system.type' : "Expert",
                 'system.special' : false };   
    }  else if (prop==='Firearms') {
      checkProp={'system.subType' : "Firearms",
                 'system.type' : "Weapons",
                 'system.special' : false };                
    } else if (prop==='Fighting') {
      checkProp={'system.subType' : "Fighting",
                 'system.type' : "Weapons",
                 'system.special' : false };                
    } else if (prop==='None') {
      checkProp={'system.subType' : "None"};                
    } else {return}    
    await this.item.update(checkProp);
  }

  static async _onArmourType(event, target) {
    event.preventDefault();
    if (!game.user.isGM) {return}
    const prop=target.dataset.property;
    let checkProp={};
    if (['Natural','Regular','Ballistic'].includes(prop)) {
      checkProp={'system.type' : prop};
    } else {return}    
    await this.item.update(checkProp);
  }

  static async _onDamageType(event, target) {
    event.preventDefault();
    if (!game.user.isGM) {return}
    const prop=target.dataset.property;
    let checkProp={};
    if (['blunt','bladed','ballistic', 'magic', 'vorpal'].includes(prop)) {
      checkProp={'system.damType' : prop};
    } else {return}    
    await this.item.update(checkProp);    
  }

  static async _onWeaponType(event, target) {
    event.preventDefault();
    if (!game.user.isGM) {return}
    const prop=target.dataset.property;
    let checkProp={};
    if (['Melee','Thrown','Firearms'].includes(prop)) {
      checkProp={'system.type' : prop};
    } else {return}    
    await this.item.update(checkProp);
  }

  static async _onRateofFire(event, target) {
    event.preventDefault();
    if (!game.user.isGM) {return}
    const prop=target.dataset.property;
    let state = this.item.system[prop]    
    let checkProp={};
    if (prop==='semiauto') {
      checkProp={'system.semiauto' : !state,
                 'system.automatic' : false,}
    } else if (prop==='automatic') {
      checkProp={'system.semiauto' : false,
                 'system.automatic' : !state,}
    } else {return}    
    await this.item.update(checkProp);
  }

  static async _onSpellMastery(event, target) {
    if (!this.item.isOwner) {return}
    let state = this.item.system.mastered
    let checkProp={};
    let spellOrder=Number(this.item.system.spellOrder)
    if (state) {
      checkProp = {'system.mastered': false}
    } else if (spellOrder === 1) {
      checkProp = {'system.mastered': true}
    } else {
      let mastered = await this.actor.items.filter(itm => itm.type ==='spell').filter(itm => Number(itm.system.spellOrder) === spellOrder-1 && itm.system.mastered)
      if (mastered.length >1) {
        checkProp={'system.mastered' : true};
      } else {
        ui.notifications.error(game.i18n.localize("ROL.spellMastery"));
        return
      }
    }       
    await this.item.update(checkProp)
  }

  // Toggle something on the item
  static _onItemToggle(event, target) {
    event.preventDefault();
    let checkProp = {};
    const prop = target.dataset.property
    if (['special','advType','secure','sour','signature','damageBoost'].includes(prop)) {
      checkProp = { [`system.${prop}`]: !this.item.system[prop] }
    } else { return }
    this.item.update(checkProp)
  }

//--------Implement Font Size and other changes--------------//
  static renderSheet(sheet, html) {
    if (game.settings.get('rol', 'largeFont')) {
      document.body.style.setProperty('--rol-prim-font-size', '18px');
      document.body.style.setProperty('--rol-sec-font-size', '18px');    
      document.body.style.setProperty('--rol-ter-font-size', '18px');            
    }

  }  



}
