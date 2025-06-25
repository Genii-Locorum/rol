import { ROLItemSheet } from "./base-item-sheet.mjs"

export class ROLSkillSheet extends ROLItemSheet {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['skill'],
  }

  static PARTS = {
    header: { template: 'systems/rol/templates/item/skill.header.hbs' },
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    context.tabs = this._getTabs(options.parts);
//    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
//      context.system.description,
//      {
//        async: true,
//        secrets: context.editable
//      }
//    )
    this._prepareSkillItemData(context);
    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    return context;
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ['header'];
  }

  _getTabs(parts) {
    const tabGroup = 'primary';
    //Default tab
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'details';
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        id: '',
        icon: '',
        label: 'ROL.',
      };
      switch (partId) {
        case 'header':
          return tabs;
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }


  //Activate event listeners using the prepared sheet HTML
  _onRender(context, _options) {
  }


  //-----------------------ACTIONS-----------------------------------



  _prepareSkillItemData(context) {
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
    this.document.update(checkProp);
      
  }
}
