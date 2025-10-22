import ChaosiumCanvasInterfaceAmbientLightToggle from "./ambient-light-toggle.mjs";
import ChaosiumCanvasInterfaceDrawingToggle from "./drawing-toggle.mjs";
import ChaosiumCanvasInterfaceMapPinToggle from "./map-pin-toggle.mjs";
import ChaosiumCanvasInterfaceOpenDocument from "./open-document.mjs";
import ChaosiumCanvasInterfacePlaySound from "./play-sound.mjs";
import ChaosiumCanvasInterfaceToScene from "./to-scene.mjs";
import ChaosiumCanvasInterfaceTileToggle from "./tile-toggle.mjs";
import ChaosiumCanvasInterface from "./chaosium-canvas-interface.mjs";

export default class ChaosiumCanvasInterfaceInit extends ChaosiumCanvasInterface {
  static initSelf () {
    const known = [
      ChaosiumCanvasInterfaceAmbientLightToggle,
      ChaosiumCanvasInterfaceDrawingToggle,
      ChaosiumCanvasInterfaceMapPinToggle,
      ChaosiumCanvasInterfaceOpenDocument,
      ChaosiumCanvasInterfacePlaySound,
      ChaosiumCanvasInterfaceToScene,
      ChaosiumCanvasInterfaceTileToggle
    ]

    super.initSelf()
    const dataModels = {}
    const typeIcons = {}
    const types = []
    for (const cci of known) {
      const name = (new cci).constructor.name
      dataModels[name] = cci
      typeIcons[name] = cci.icon
      types.push(name)
    }

    Object.assign(CONFIG.RegionBehavior.dataModels, dataModels)

    Object.assign(CONFIG.RegionBehavior.typeIcons, typeIcons)

    foundry.applications.apps.DocumentSheetConfig.registerSheet(
      RegionBehavior,
      'rol',
      foundry.applications.sheets.RegionBehaviorConfig,
      {
        types: types,
        makeDefault: true
      }
    )
  }
}
