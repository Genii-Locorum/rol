import { ROLItemSheet } from "./base-item-sheet.mjs"
import { ROLSelectLists } from "../../apps/select-lists.mjs"

export class ROLSpellSheet extends ROLItemSheet {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['spell'],
    position: {
      width: 550,
      height: 570,
    },
  }

  static PARTS = {
    header: { template: 'systems/rol/templates/item/spell.header.hbs' },
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    context.spellOrderList = await ROLSelectLists.spellLevelList();    
    context.canEdit = false
    if (context.isCreation || context.isDevelepment || context.isGM) {
      context.canEdit = true
    }
    context.logicList = await ROLSelectLists.logicOptions();
    context.logicName = game.i18n.localize(this.item.system.preReq.logic)    
    context.preReqList = await ROLSelectLists.prereqOptions();
    context.preOptList = await ROLSelectLists.preOptList();
    context.tabs = this._getTabs(options.parts);
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

}
