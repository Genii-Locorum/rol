import { ROLItemSheet } from "./base-item-sheet.mjs"

export class ROLWeaponSheet extends ROLItemSheet {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['weapons'],
    position: {
      width: 550,
      height: 640,
    },
  }

  static PARTS = {
    header: { template: 'systems/rol/templates/item/weapons.header.hbs' },
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
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
