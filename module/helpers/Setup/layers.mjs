import { ROLUtilities } from "../Utilities/utilities.mjs";

class ROLLayer extends PlaceablesLayer {

  constructor () {
    super()
    this.objects = {}
  }

  static get layerOptions () {
    return foundry.utils.mergeObject(super.layerOptions, {
      name: 'rolmenu',
      zIndex: 60
    })
  }

  static get documentName () {
    return 'Token'
  }

  get placeables () {
    return []
  }
  
}

  export class ROLMenu {
    static getButtons (controls) {
      canvas.rolGMtool = new ROLLayer()
      const isGM = game.user.isGM
      controls.push({
        icon: "fas fa-tools",
        layer: "rolGMtool",
        name: "rolGMmenu",
        title: game.i18n.localize('ROL.GMTools'),
        visible: isGM,
        tools: [
          {
            name: "Session",
            icon: "fas fa-moon",
            title:  game.i18n.localize('ROL.sessionEnd'),
            toggle: true,
            active: game.settings.get('rol','sessionendEnabled'),
            onClick: async toggle => await ROLUtilities.toggleSession(toggle)
          },
          {
            name: "Development",
            icon: "fas fa-key",
            title: game.i18n.localize('ROL.developPhase'),
            toggle: true,
            active: game.settings.get('rol','developmentEnabled'),
            onClick: async toggle => await  ROLUtilities.toggleDevelopment(toggle)   
          },
          {
            name: "Creation",
            icon: "fas fa-child",
            title: game.i18n.localize('ROL.createPhase'),
            toggle: true,
            active: game.settings.get('rol','characterCreation'),
            onClick: async toggle => await ROLUtilities.toggleCreation(toggle)         
          },
          {
            name: "Initiative",
            icon: "fas fa-swords",
            title: game.i18n.localize('ROL.initiative'),
            button: true,
            active: game.settings.get('rol','characterCreation'),
            onClick: async toggle => await ROLUtilities.setPartyOrder(toggle)  
          },
          {
            name: "Migrate",
            icon: "fas fa-earth-europe",
            title: game.i18n.localize('Item Migration'),
            button: true,
            onClick: async toggle => await ROLUtilities.itemMigration()  
          }
        ]
      })
    }
  
    static renderControls (app, html, data) {
      const isGM = game.user.isGM
      const gmMenu = html.find('.fas-fa-tools').parent()
      gmMenu.addClass('outgunned-menu')
    }
  }    


 