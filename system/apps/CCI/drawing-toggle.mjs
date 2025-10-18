import ChaosiumCanvasInterface from "./chaosium-canvas-interface.mjs";

export default class ChaosiumCanvasInterfaceDrawingToggle extends ChaosiumCanvasInterface {
  static get PERMISSIONS() {
    return {
      [CONST.DOCUMENT_OWNERSHIP_LEVELS.INHERIT]: 'OWNERSHIP.INHERIT',
      [CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE]: 'OWNERSHIP.NONE',
      [CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED]: 'OWNERSHIP.LIMITED',
      [CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER]: 'OWNERSHIP.OBSERVER',
      [CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER]: 'OWNERSHIP.OWNER'
    }
  }

  static get icon() {
    return 'fa-solid fa-pencil'
  }

  static get triggerButtons () {
    const buttons = super.triggerButtons
    buttons[ChaosiumCanvasInterfaceDrawingToggle.triggerButton.Both] = 'ROL.ChaosiumCanvasInterface.Buttons.Both'
    return buttons
  }

  static get triggerButton () {
    const button = super.triggerButton
    button.Both = 20
    return button
  }

  static defineSchema() {
    const fields = foundry.data.fields
    return {
      triggerButton: new fields.NumberField({
        choices: ChaosiumCanvasInterfaceDrawingToggle.triggerButtons,
        initial: ChaosiumCanvasInterfaceDrawingToggle.triggerButton.Left,
        label: 'ROL.ChaosiumCanvasInterface.DrawingToggle.Button.Title',
        hint: 'ROL.ChaosiumCanvasInterface.DrawingToggle.Button.Hint'
      }),
      toggle: new fields.BooleanField({
        initial: false,
        label: 'ROL.ChaosiumCanvasInterface.DrawingToggle.Toggle.Title',
        hint: 'ROL.ChaosiumCanvasInterface.DrawingToggle.Toggle.Hint'
      }),
      drawingUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'Drawing'
        }),
        {
          label: 'ROL.ChaosiumCanvasInterface.DrawingToggle.Drawing.Title',
          hint: 'ROL.ChaosiumCanvasInterface.DrawingToggle.Drawing.Hint'
        }
      ),
      journalEntryUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'JournalEntry'
        }),
        {
          label: 'ROL.ChaosiumCanvasInterface.DrawingToggle.JournalEntry.Title',
          hint: 'ROL.ChaosiumCanvasInterface.DrawingToggle.JournalEntry.Hint'
        }
      ),
      permissionDocument: new fields.NumberField({
        choices: Object.keys(ChaosiumCanvasInterfaceDrawingToggle.PERMISSIONS).reduce((c, k) => { c[k] = game.i18n.localize(ChaosiumCanvasInterfaceDrawingToggle.PERMISSIONS[k]); return c }, {}),
        initial: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
        label: 'ROL.ChaosiumCanvasInterface.DrawingToggle.PermissionDocument.Title',
        hint: 'ROL.ChaosiumCanvasInterface.DrawingToggle.PermissionDocument.Hint',
        required: true
      }),
      journalEntryPageUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'JournalEntryPage'
        }),
        {
          label: 'ROL.ChaosiumCanvasInterface.DrawingToggle.JournalEntryPage.Title',
          hint: 'ROL.ChaosiumCanvasInterface.DrawingToggle.JournalEntryPage.Hint'
        }
      ),
      permissionPage: new fields.NumberField({
        choices: Object.keys(ChaosiumCanvasInterfaceDrawingToggle.PERMISSIONS).reduce((c, k) => { c[k] = game.i18n.localize(ChaosiumCanvasInterfaceDrawingToggle.PERMISSIONS[k]); return c }, {}),
        initial: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
        label: 'ROL.ChaosiumCanvasInterface.DrawingToggle.PermissionPage.Title',
        hint: 'ROL.ChaosiumCanvasInterface.DrawingToggle.PermissionPage.Hint',
        required: true
      }),
      regionBehaviorUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'RegionBehavior'
        }),
        {
          label: 'ROL.ChaosiumCanvasInterface.DrawingToggle.RegionBehavior.Title',
          hint: 'ROL.ChaosiumCanvasInterface.DrawingToggle.RegionBehavior.Hint'
        }
      ),
      regionUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'Region'
        }),
        {
          label: 'ROL.ChaosiumCanvasInterface.DrawingToggle.RegionUuids.Title',
          hint: 'ROL.ChaosiumCanvasInterface.DrawingToggle.RegionUuids.Hint'
        }
      ),
    }
  }

  static migrateData (source) {
    if (typeof source.triggerButton === 'undefined' && source.regionUuids.length) {
      source.triggerButton = ChaosiumCanvasInterfaceTileToggle.triggerButton.Both
    }
    return source
  }

  async _handleMouseOverEvent() {
    return game.user.isGM
  }

  async #handleClickEvent(button) {
    for (const uuid of this.drawingUuids) {
      const doc = await fromUuid(uuid)
      if (doc) {
        await doc.update({ hidden: !this.toggle })
      } else {
        console.error('Drawing ' + uuid + ' not loaded')
      }
    }
    const permissionDocument = (!this.toggle ? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE : this.permissionDocument)
    const permissionPage = (!this.toggle ? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE : this.permissionPage)
    for (const uuid of this.journalEntryUuids) {
      const doc = await fromUuid(uuid)
      if (doc) {
        await doc.update({ 'ownership.default': permissionDocument })
      } else {
        console.error('Journal Entry ' + uuid + ' not loaded')
      }
    }
    for (const uuid of this.journalEntryPageUuids) {
      const doc = await fromUuid(uuid)
      if (doc) {
        await doc.update({ 'ownership.default': permissionPage })
      } else {
        console.error('Journal Entry Page ' + uuid + ' not loaded')
      }
    }
    for (const uuid of this.regionBehaviorUuids) {
      const doc = await fromUuid(uuid)
      if (doc) {
        await doc.update({ disabled: !this.toggle })
      } else {
        console.error('Region Behavior ' + uuid + ' not loaded')
      }
    }
    if (this.triggerButton === ChaosiumCanvasInterfaceTileToggle.triggerButton.Both) {
      for (const uuid of this.regionUuids) {
        setTimeout(() => {
          if (button === ChaosiumCanvasInterface.triggerButton.Right) {
            game.rol.ClickRegionLeftUuid(uuid)
          } else if (button === ChaosiumCanvasInterface.triggerButton.Left) {
            game.rol.ClickRegionRightUuid(uuid)
          }
        }, 100)
      }
    }
  }

  async _handleLeftClickEvent() {
    if ([ChaosiumCanvasInterfaceDrawingToggle.triggerButton.Both, ChaosiumCanvasInterface.triggerButton.Left].includes(this.triggerButton)) {
      this.#handleClickEvent(ChaosiumCanvasInterface.triggerButton.Left)
    }
  }

  async _handleRightClickEvent() {
    if ([ChaosiumCanvasInterfaceDrawingToggle.triggerButton.Both, ChaosiumCanvasInterface.triggerButton.Right].includes(this.triggerButton)) {
      this.#handleClickEvent(ChaosiumCanvasInterface.triggerButton.Right)
    }
  }
}
