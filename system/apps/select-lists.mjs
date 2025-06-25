export class ROLSelectLists {


  //Advantages List
  static async advantagesOptions() {
    let options = {
      "--Advantage--" : game.i18n.localize("ROL.advantage"),     
      "Connected" : game.i18n.localize("Connected"),    
      "DamageBonus" : game.i18n.localize("DamageBonus"),
      "FastReactions" : game.i18n.localize("FastReactions"),
      "Knowledge" : game.i18n.localize("Knowledge"),
      "Magic" : game.i18n.localize("Magic"),    
      "Toughness" : game.i18n.localize("Toughness"),
      "Rich" : game.i18n.localize("Rich"),
      "Scary" : game.i18n.localize("Scary"),    
      "SignatureFirearm" : game.i18n.localize("SignatureFirearm"),    
      "SignatureWeapon" : game.i18n.localize("SignatureWeapon"),    
      "SilverTongue" : game.i18n.localize("SilverTongue"),
      "Speedy" : game.i18n.localize("Speedy"),
      "Steadfast" : game.i18n.localize("Steadfast"),
      "Wealthy" : game.i18n.localize("Wealthy"),
      "--Disadvantage--" : game.i18n.localize("ROL.disadvantage"),
      "Blunt" : game.i18n.localize("Blunt"),
      "CrossedWrongPeople" : game.i18n.localize("CrossedWrongPeople"),
      "Damaged" : game.i18n.localize("Damaged"),
      "Disorganised" : game.i18n.localize("Disorganised"),
      "EasilyDistracted" : game.i18n.localize("EasilyDistracted"),
      "Exhausting" : game.i18n.localize("Exhausting"),
      "Frail" : game.i18n.localize("Frail"),                                                
      "HotHeaded" : game.i18n.localize("HotHeaded"),
      "IronBlooded" : game.i18n.localize("IronBlooded"),
      "NoMagic" : game.i18n.localize("NoMagic"),
      "SlowHeal" : game.i18n.localize("SlowHeal"),
      "Slow" : game.i18n.localize("Slow"),
      "Thumbs" : game.i18n.localize("Thumbs"),
      "Weak" : game.i18n.localize("Weak"),    
      "--Demi Monde--" : game.i18n.localize("ROL.demiMonde"),
      "Boon" : game.i18n.localize("Boon"),
      "ColdIron" : game.i18n.localize("ColdIron"),
      "Glamour" : game.i18n.localize("Glamour"),
      "Invisible" : game.i18n.localize("Invisible"),
      "LuckofDemiMonde" : game.i18n.localize("LuckofDemiMonde"),
      "ThematicPower" : game.i18n.localize("ThematicPower"),
    };
    return options;
  }

  //Logic List
  static async logicOptions() {
    let options = {
      "" : game.i18n.localize("ROL.none"),
      "A" : game.i18n.localize("ROL.A"),
      "A and B" : game.i18n.localize("ROL.AandB"),
      "A or B" : game.i18n.localize("ROL.AorB"),           
      "A and B and C" : game.i18n.localize("ROL.AandBandC"),
      "A and (B or C)" : game.i18n.localize("ROL.AandBorC"),      
    };
    return options;
  }

  //Logic Prerequisite List
  static async prereqOptions () {
    let options = {
      "Char-Min" : game.i18n.localize("ROL.CharMinAbbr"),
      "Char-Max" : game.i18n.localize("ROL.CharMaxAbbr"),
      "Skill-Min" : game.i18n.localize("ROL.SkillMinAbbr"),           
      "Spell" : game.i18n.localize("ROL.spell"),
      "Spell-Mastered" : game.i18n.localize("ROL.SpellMastered"),      
      "Demi Monde Only" : game.i18n.localize("ROL.DemiMondeOnlyAbbr"),      
      "Not Demi Monder" : game.i18n.localize("ROL.NotDemiMondeAbbr"),      
      "Not Advantage" : game.i18n.localize("ROL.NotAdvantageAbbr"),                        
    };
    return options;
  }

  //Logic Attribute List
  static async preOptList () {
    let options = {
      "str": game.i18n.localize('ROL.AbilityStr'),
      "con": game.i18n.localize('ROL.AbilityCon'),
      "dex": game.i18n.localize('ROL.AbilityDex'),
      "int": game.i18n.localize('ROL.AbilityInt'),
      "pow": game.i18n.localize('ROL.AbilityPow'),                        
    };
    return options;
  }


  //Spell Level List
  static async spellLevelList () {
    let maxLvl = game.settings.get('rol','maxSpell')
    let options = {}
    for (let lvl = 1; lvl <= maxLvl; lvl++) {

      options = Object.assign(options, {[lvl]: lvl})
    }
    return options
  }




}  