import { ROLCharacterSheet } from "../actor/sheets/character-sheet.mjs";
import { ROLNPCSheet } from "../actor/sheets/npc-sheet.mjs";
import { ROLSkillSheet } from '../item/sheets/skill-sheet.mjs';
import { ROLEquipSheet } from "../item/sheets/equipment-sheet.mjs";
import { ROLAdvantagesSheet } from "../item/sheets/advantages-sheet.mjs";
import { ROLArmourSheet } from "../item/sheets/armour-sheet.mjs";
import { ROLContactSheet } from "../item/sheets/contacts-sheet.mjs.mjs";
import { ROLWeaponSheet } from "../item/sheets/weapons-sheet.mjs";
import { ROLSpellSheet } from "../item/sheets/spell-sheet.mjs";

export function registerSheets() {

  const { sheets } = foundry.applications;
  let { collections } = foundry.documents;

  collections.Actors.unregisterSheet("core", sheets.ActorSheetV2);
  collections.Actors.registerSheet('rol', ROLCharacterSheet, {
    types: ['character'],
    makeDefault: true
  });
  collections.Actors.registerSheet('rol', ROLNPCSheet, {
    types: ['npc'],
    makeDefault: true
  });

  collections.Items.unregisterSheet("core", sheets.ItemSheetV2);
  collections.Items.registerSheet('rol', ROLSkillSheet, {
    types: ['skill'],
    makeDefault: true
  });
  collections.Items.registerSheet('rol', ROLEquipSheet, {
    types: ['equipment'],
    makeDefault: true
  }); 
  collections.Items.registerSheet('rol', ROLAdvantagesSheet, {
    types: ['advantages'],
    makeDefault: true
  });    
  collections.Items.registerSheet('rol', ROLArmourSheet, {
    types: ['armour'],
    makeDefault: true
  });
  collections.Items.registerSheet('rol', ROLContactSheet, {
    types: ['contacts'],
    makeDefault: true
  });  
  collections.Items.registerSheet('rol', ROLWeaponSheet, {
    types: ['weapons'],
    makeDefault: true
  });            
  collections.Items.registerSheet('rol', ROLSpellSheet, {
    types: ['spell'],
    makeDefault: true
  });              
}