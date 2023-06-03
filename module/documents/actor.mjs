/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class ROLActor extends Actor {

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
  }

  /** @override */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.rol || {};

    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /** Prepare Character type specific data */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;
    const systemData = actorData.system;

    // Capture if DemiMonde
    if (actorData.system.charType === "DemiMonde") {
      actorData.system.isFae = true;
    }

    // Loop through ability scores, and restrict scores plus calcualte half scores.
    systemData.abilityTotal=0;
    for (let [key, ability] of Object.entries(systemData.abilities)) {
      // Restrict scores to blocks of 10 if statsones config rule not set.
      if (game.settings.get('rol','statsOnes') === false ){  
        ability.value = 10 * Math.floor(ability.value/10);
      }
      // Restrict score ranges to 30/80 if statsextend config rule not set
      if (game.settings.get('rol','statsExtend') === false ){  
        ability.value = Math.min(ability.value, 80);
        ability.value = Math.max(ability.value, 30);
      } else{
        ability.value = Math.min(ability.value, 90);
        ability.value = Math.max(ability.value, 20);
      }
      //Calcualte Half Score, round down
      ability.half = Math.floor(ability.value/ 2);

      //Calculate Total of Ability Values
      systemData.abilityTotal = systemData.abilityTotal + ability.value
    }


    //Available Dev Points  
    systemData.devPoints.available = systemData.devPoints.earned - systemData.devPoints.spent;

    //Calcualte scores and indicators where skills, spells and advantages have an impact        
    let magic_id =this._prepareCommonData(actorData)

    //Check Weapons for Signature
    for (let i of actorData.items) {
      if (i.type === "weapons" && i.system.signature === true && i.system.type === "Firearms" && systemData.SignatureFirearm != true) {
        i.update({'system.signature': false});
      }else if (i.type === "weapons" && i.system.signature === true && i.system.type === "Melee" && systemData.SignatureWeapon != true) {
        i.update({'system.signature': false});
      }else if (i.type === "weapons" && i.system.signature === true && i.system.type === "Thrown") {
        i.update({'system.signature': false});
      }  
    }     

    //Check for Magic or NoMagic status and set skill score to zero if appropriate
    if (magic_id != "" && (systemData.Magic != true || systemData.NoMagic === true)){
      systemData.magicScore=0;
      const item = actorData.items.get(magic_id);
      item.system.score = 0;
    }
    //Keep Luck at zero or above, and damage in range 0-5
    systemData.luck.value = Math.max(systemData.luck.value,0)
    let minDam=0;
    if (systemData.properties.hurt) {
      minDam = 1;
    };
    if (systemData.properties.bloodied) {
      minDam = 2;
    };
    let newDam = Number(Math.max(Math.min(systemData.damage.value,5),minDam));
    if (systemData.damage.value != newDam) {
      this.update({'system.damage.value' : newDam});
    }  

    //Set Natural Armour
    systemData.armour.natural = 0;
    if (systemData.Toughness){
      systemData.armour.natural = 1;
    } 

    // Produce Damage Status
    let dmgVal = Number(systemData.damage.value);
    if (systemData.Frail && dmgVal > 0 && dmgVal < 3 ){
      dmgVal = dmgVal+1;
    } 
    

    switch (dmgVal) {
      case 0:
        systemData.damageStatus=game.i18n.localize("ROL.healthy");
        break;
      case 1:
        systemData.damageStatus=game.i18n.localize("ROL.hurt");
        break;
      case 2:
        systemData.damageStatus=game.i18n.localize("ROL.bloodied");
        break;
      case 3:
        systemData.damageStatus=game.i18n.localize("ROL.down");
        systemData.properties.down = true;
        break;          
      case 4:
        systemData.damageStatus=game.i18n.localize("ROL.mortal");
        systemData.properties.down = true;
        systemData.properties.mortal = true;
        break;
      case 5:
        systemData.damageStatus=game.i18n.localize("ROL.fatal");
        systemData.properties.down = true;
        systemData.properties.mortal = true;
        systemData.properties.fatal = true;
        break;  
      default:
        systemData.damageStatus=game.i18n.localize("ROL.unknown");
    }

    if (systemData.damage.value >= 2) {
      this.update({'system.properties.impaired' : true});
    } 

    // Set Movement Rate----------------------------------------------------
    let mov=systemData.mov;
    if (systemData.Slow){
      mov = 5
    } else if (systemData.Speedy) {
      mov=mov+1
    } 
    
    if (game.settings.get('rol','age')){
      if (systemData.age <=39 || systemData.Magic) {
      } else if(systemData.age >= 40 && systemData.age <= 49) {
        mov=mov-1
      } else if(systemData.age >= 50 && systemData.age <= 59) {
        mov=mov-2
      } else if(systemData.age >= 60 && systemData.age <= 69) {
        mov=mov-3
      } else if(systemData.age >= 70 && systemData.age <= 79) {
        mov=mov-4
      } else if(systemData.age >= 80) {
        mov=mov-5
      }
      if (mov<0){mov=0}
      systemData.mov = mov
    }

    // Set Affluence Level----------------------------------------------------
    if (systemData.Rich) {
      systemData.affluence = game.i18n.localize("ROL.rich");
    }else if(systemData.Wealthy){
      systemData.affluence = game.i18n.localize("ROL.wealthy");
    }  
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    //Calcualte scores and indicators where skills, spells and advantages have an impact        
    let magic_id =this._prepareCommonData(actorData)
  
    //Set Damage Bonus (ignore the Trait requirement)
    systemData.damageBonus = systemData.dmgbonus;

  }

    
/**
   * Prepare common Actor data.
   */
_prepareCommonData(actorData) {
const systemData = actorData.system;

//Calcualte scores and indicators where skills, spells and advantages have an impact   
if (systemData.charType === "DemiMonde") {
  systemData.LuckofDemiMonde = true;
}
systemData.magicScore=0;
let magic_id = "";
systemData.firearmsScore=0;
systemData.meleeScore=0;
systemData.throwScore=0;
systemData.mp.max=Math.floor(systemData.abilities.pow.value/5);
systemData.damageBonus=0;
for (let i of actorData.items) {
  if (i.type === "skill") {
    if(i.system.subType === "Magic"){
      systemData.magicScore = i.system.score;
      magic_id = i._id;
    }else if (i.system.subType === "Firearms"){
      systemData.firearmsScore = i.system.score;
    }else if (i.system.subType === "Fighting"){
      systemData.meleeScore = i.system.score;
    }else if (i.system.subType === "Athletics"){
      systemData.throwScore = i.system.score;
    }    
  } else if (i.type === "advantages") {
    if (i.system.advEffect === "DamageBonus" && actorData.type === 'character'){
      systemData.damageBonus = 1;
    } else if (i.system.advEffect === "--None--" || i.system.advEffect === ""){
    } else {
      systemData[i.system.advEffect] = true;  
    }     
  } else if (i.type === "spell"){
    if (i.system.mastered){
      systemData.mp.max = systemData.mp.max + 1
    }
  }  
}

//Calculate hp for display bar
  if (game.user.isGM) {
    actorData.system.hp.value = Math.max(3 - systemData.damage.value,0);
    //actorData.update({'system.hp.value' : hp});
  }  

return magic_id;

}

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }


  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

  //** Toggle Flags */
  async toggleActorFlag (flagName) {
    const flagValue = !this.system.flags[flagName]
    const name = `data.flags.${flagName}`
    await this.update({ [name]: flagValue })
  } 
 
}