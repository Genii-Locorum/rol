import ChaosiumCanvasInterface from "./chaosium-canvas-interface.mjs";

export default class ChaosiumCanvasInterfaceToScene extends ChaosiumCanvasInterface {
  static get PERMISSIONS () {
    return {
      ALWAYS: 'ROL.ChaosiumCanvasInterface.Permission.Always',
      GM: 'ROL.ChaosiumCanvasInterface.Permission.GM',
      SEE_TILE: 'ROL.ChaosiumCanvasInterface.Permission.SeeTile'
    }
  }

  static get icon () {
    return 'fa-solid fa-map'
  }

  static defineSchema () {
    const fields = foundry.data.fields
    return {
      triggerButton: new fields.NumberField({
        choices: ChaosiumCanvasInterface.triggerButtons,
        initial: ChaosiumCanvasInterface.triggerButton.Left,
        label: 'ROL.ChaosiumCanvasInterface.ToScene.Button.Title',
        hint: 'ROL.ChaosiumCanvasInterface.ToScene.Button.Hint'
      }),
      permission: new fields.StringField({
        blank: false,
        choices: Object.keys(ChaosiumCanvasInterfaceToScene.PERMISSIONS).reduce((c, k) => { c[k] = game.i18n.localize(ChaosiumCanvasInterfaceToScene.PERMISSIONS[k]); return c }, {}),
        initial: 'GM',
        label: 'ROL.ChaosiumCanvasInterface.ToScene.Permission.Title',
        hint: 'ROL.ChaosiumCanvasInterface.ToScene.Permission.Hint',
        required: true
      }),
      sceneUuid: new fields.DocumentUUIDField({
        label: 'ROL.ChaosiumCanvasInterface.ToScene.Scene.Title',
        hint: 'ROL.ChaosiumCanvasInterface.ToScene.Scene.Hint',
        type: 'Scene'
      }),
      tileUuid: new fields.DocumentUUIDField({
        label: 'ROL.ChaosiumCanvasInterface.ToScene.Tile.Title',
        hint: 'ROL.ChaosiumCanvasInterface.ToScene.Tile.Hint',
        type: 'Tile'
      })
    }
  }

  async _handleMouseOverEvent () {
    switch (this.permission) {
      case 'ALWAYS':
        return true
      case 'GM':
        return game.user.isGM
      case 'SEE_TILE':
        if (game.user.isGM) {
          return true
        }
        if (this.tileUuid) {
          return !(await fromUuid(this.tileUuid)).hidden
        }
    }
    return false
  }

  async _handleLeftClickEvent () {
    if (this.sceneUuid) {
      const doc = await fromUuid(this.sceneUuid)
      if (doc) {
        setTimeout(() => {
          doc.view()
        }, 100)
      } else {
        console.error('Scene ' + this.sceneUuid + ' not loaded')
      }
    }
  }
}
