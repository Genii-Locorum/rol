import ChaosiumCanvasInterface from "./chaosium-canvas-interface.mjs";

export default class ChaosiumCanvasInterfaceTileToggle extends ChaosiumCanvasInterface {
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
    return 'fa-solid fa-cubes'
  }

  static get triggerButtons () {
    const buttons = super.triggerButtons
    buttons[ChaosiumCanvasInterfaceTileToggle.triggerButton.Both] = 'ROL.ChaosiumCanvasInterface.Buttons.Both'
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
        choices: ChaosiumCanvasInterfaceTileToggle.triggerButtons,
        initial: ChaosiumCanvasInterfaceTileToggle.triggerButton.Left,
        label: 'ROL.ChaosiumCanvasInterface.TileToggle.Button.Title',
        hint: 'ROL.ChaosiumCanvasInterface.TileToggle.Button.Hint'
      }),
      toggle: new fields.BooleanField({
        initial: false,
        label: 'ROL.ChaosiumCanvasInterface.TileToggle.Toggle.Title',
        hint: 'ROL.ChaosiumCanvasInterface.TileToggle.Toggle.Hint'
      }),
      tileUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'Tile'
        }),
        {
          label: 'ROL.ChaosiumCanvasInterface.TileToggle.Tile.Title',
          hint: 'ROL.ChaosiumCanvasInterface.TileToggle.Tile.Hint'
        }
      ),
      journalEntryUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'JournalEntry'
        }),
        {
          label: 'ROL.ChaosiumCanvasInterface.TileToggle.JournalEntry.Title',
          hint: 'ROL.ChaosiumCanvasInterface.TileToggle.JournalEntry.Hint'
        }
      ),
      permissionDocument: new fields.NumberField({
        choices: Object.keys(ChaosiumCanvasInterfaceTileToggle.PERMISSIONS).reduce((c, k) => { c[k] = game.i18n.localize(ChaosiumCanvasInterfaceTileToggle.PERMISSIONS[k]); return c }, {}),
        initial: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
        label: 'ROL.ChaosiumCanvasInterface.TileToggle.PermissionDocument.Title',
        hint: 'ROL.ChaosiumCanvasInterface.TileToggle.PermissionDocument.Hint',
        required: true
      }),
      journalEntryPageUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'JournalEntryPage'
        }),
        {
          label: 'ROL.ChaosiumCanvasInterface.TileToggle.JournalEntryPage.Title',
          hint: 'ROL.ChaosiumCanvasInterface.TileToggle.JournalEntryPage.Hint'
        }
      ),
      permissionPage: new fields.NumberField({
        choices: Object.keys(ChaosiumCanvasInterfaceTileToggle.PERMISSIONS).reduce((c, k) => { c[k] = game.i18n.localize(ChaosiumCanvasInterfaceTileToggle.PERMISSIONS[k]); return c }, {}),
        initial: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
        label: 'ROL.ChaosiumCanvasInterface.TileToggle.PermissionPage.Title',
        hint: 'ROL.ChaosiumCanvasInterface.TileToggle.PermissionPage.Hint',
        required: true
      }),
      regionBehaviorUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'RegionBehavior'
        }),
        {
          label: 'ROL.ChaosiumCanvasInterface.TileToggle.RegionBehavior.Title',
          hint: 'ROL.ChaosiumCanvasInterface.TileToggle.RegionBehavior.Hint'
        }
      ),
      regionUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'Region'
        }),
        {
          label: 'ROL.ChaosiumCanvasInterface.TileToggle.RegionUuids.Title',
          hint: 'ROL.ChaosiumCanvasInterface.TileToggle.RegionUuids.Hint'
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
    for (const uuid of this.tileUuids) {
      const doc = await fromUuid(uuid)
      if (doc) {
        await doc.update({ hidden: !this.toggle })
      } else {
        console.error('Tile ' + uuid + ' not loaded')
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
    if ([ChaosiumCanvasInterfaceTileToggle.triggerButton.Both, ChaosiumCanvasInterface.triggerButton.Left].includes(this.triggerButton)) {
      this.#handleClickEvent(ChaosiumCanvasInterface.triggerButton.Left)
    }
  }

  async _handleRightClickEvent() {
    if ([ChaosiumCanvasInterfaceTileToggle.triggerButton.Both, ChaosiumCanvasInterface.triggerButton.Right].includes(this.triggerButton)) {
      this.#handleClickEvent(ChaosiumCanvasInterface.triggerButton.Right)
    }
  }
}
