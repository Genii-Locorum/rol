export class ROLCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/ROL/templates/apps/combat-tracker.html" 
        });
    }
}