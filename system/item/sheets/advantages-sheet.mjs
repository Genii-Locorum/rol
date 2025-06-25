import { ROLItemSheet } from "./base-item-sheet.mjs"
import { ROLSelectLists } from "../../apps/select-lists.mjs"

export class ROLAdvantagesSheet extends ROLItemSheet {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['advantages'],
    position: {
      width: 550,
      height: 750,
    },
  }

  static PARTS = {
    header: { template: 'systems/rol/templates/item/advantages.header.hbs' },
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    context.tabs = this._getTabs(options.parts);
    context.advantagesList = await ROLSelectLists.advantagesOptions();
    context.advantageName = game.i18n.localize(this.item.system.advEffect)
    context.logicList = await ROLSelectLists.logicOptions();
    context.logicName = game.i18n.localize(this.item.system.preReq.logic)    
    context.preReqList = await ROLSelectLists.prereqOptions();
    context.preOptList = await ROLSelectLists.preOptList();

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
