import { ROLUtilities } from "../apps/utilities.mjs";

class ROLMenuLayer extends (foundry.canvas?.layers?.PlaceablesLayer ?? PlaceablesLayer) {
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
    canvas.rolGMtool = new ROLMenuLayer()
    const isGM = game.user.isGM
    const menu = {
      name: 'rolGMmenu',
      title: 'ROL.GMTools',
      layer: 'rolGMtool',
      icon: 'fas fa-tools',
      activeTool: 'roldummy',
      visible: isGM,
      onChange: (event, active) => {
      },
      onToolChange: (event, tool) => {
      },
      tools: {
        roldummy: {
          icon: '',
          name: 'roldummy',
          active: false,
          title: '',
          onChange: () => {
          }
        },
        Session: {
          toggle: true,
          icon: 'fas fa-moon',
          name: 'Session',
          active: game.settings.get('rol', 'sessionendEnabled'),
          title: 'ROL.sessionEnd',
          onChange: async toggle => await ROLUtilities.toggleSession(toggle)
        },
        Development: {
          toggle: true,
          icon: 'fas fa-key',
          name: 'Development',
          active: game.settings.get('rol', 'developmentEnabled'),
          title: 'ROL.developPhase',
          onChange: async toggle => await ROLUtilities.toggleDevelopment(toggle)
        },
        Creation: {
          toggle: true,
          icon: 'fas fa-child',
          name: 'Creation',
          active: game.settings.get('rol', 'characterCreation'),
          title: 'ROL.createPhase',
          onChange: async toggle => await ROLUtilities.toggleCreation(toggle)
        },
        Initiative: {
          button: true,
          icon: 'fas fa-swords',
          name: 'Initiative',
          title: 'ROL.initiative',
          onChange: async toggle => await ROLUtilities.setPartyOrder(toggle)
        },
      }
    }
    if (Array.isArray(controls)) {
      /* // FoundryVTT v12 */
      menu.tools = Object.keys(menu.tools).reduce((c, i) => {
        if (i === 'roldummy') {
          return c
        }
        c.push(menu.tools[i])
        return c
      }, [])
      controls.push(menu)
    } else {
      controls.rolGMmenu = menu
    }
  }

  static renderControls (app, html, data) {
    const isGM = game.user.isGM
    const gmMenu = html.querySelector('.fas fa-tools')?.parentNode
    if (gmMenu && !gmMenu.classList.contains('rolGMmenu')) {
      gmMenu.classList.add('rolGMmenu')
      if (isGM) {
        const menuLi = document.createElement('li')
        const menuButton = document.createElement('button')
        menuButton.classList.add('control', 'ui-control', 'tool', 'icon', 'rolGMmenu')
        menuButton.type = 'button'
      }
    }
  }
}
