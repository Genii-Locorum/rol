export class ROLCombatTracker extends CombatTracker {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/ROL/templates/apps/combat-tracker.html" 
        });
    }
}