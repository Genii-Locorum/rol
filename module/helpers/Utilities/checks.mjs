import { ROLDiceRoll } from "../Dice/diceroll.mjs";

export class ROLChecks {

//Badly named but Target refers to actor/token triggering the action (should probably have called it subject).  Therefore will use victim to refer to the selected adversary etc

//
// Start A Check - get token/actor ID and type
//
static async _getTargetId(token,actor){
  let targetId = "";
  let targetType ="";
    if (token && !token.actorLink){
      targetId = token._id;
      targetType = "token"; 
    } else {
      targetId = actor._id;
      targetType = "actor";
    }
  let target = ({targetId, targetType})
  return target;
}

//
//Get actor from ID & type
//
static async _getTarget(targetId, targetType) {
  let actor="";
  if (targetType === "token") {
    actor = game.actors.tokens[targetId];
  } else {
    actor = game.actors.get(targetId) 
  }
  return actor
}

//
//Get Id of victim of attack etc
//
static async _getVictimId() {
  let victimId = "";
  let victimType = "none";
  let victimName = "Dummy";
  if (game.user.targets.size > 0) {  
    let victim = Array.from(game.user.targets)
    victimName = victim[0].document.name
    if (victim[0].document.actorLink) {
      victimId = victim[0].document.actorId;
      victimType = "actor";
    } else {
      victimId = victim[0].id;
      victimType = "token";
    }
  }
  let result =({victimId, victimType, victimName});
  return result;
}

//
// Start from Macro
//
static async _onRollMacro(itemId, actorId, shiftKey) {
  let target = ({targetId : actorId, targetType: "actor"})
  let actor = await ROLChecks._getTarget(target.targetId, target.targetType);
  let victim = await ROLChecks._getVictimId();
  let item = actor.items.get(itemId);
  let targetScore = item.system.score;
  let damageTarget = 0;
  let damageBoost = false;
  let bonusDamage = 0;
  let subType="";
  let damType = "";
  let damage = -1;
  let mastered = false;
  let bonusDice = 0;
  let type = item.type;
  let allowResolve = false;
  let spendMP=0;
  let automatic = false;
  let semiauto = false;

  if (type === 'spell') {
    targetScore = actor.system.magicScore
    mastered = item.system.mastered;
    if (mastered) {bonusDice = 1}
    damageTarget = actor.system.abilities.dex.value;
    damType = item.system.damType;    
    damage = item.system.damage;
    damageBoost = item.system.damageBoost;
    allowResolve = true;
    spendMP = item.system.spellOrder
  }

  if (type === 'weapons') {
    damageTarget = actor.system.abilities.dex.value;
    damType = item.system.damType;    
    damage = item.system.damage;
    allowResolve = true;
    subType = item.system.type;
    if (subType === 'Melee'){
      damageTarget = actor.system.abilities.str.value;
      targetScore = actor.system.meleeScore;
    }else if (subType === 'Firearms') {
            targetScore = actor.system.firearmsScore;
      automatic= item.system.automatic,
      semiauto = item.system.semiauto
      let signature = item.system.signature;
      if (signature) {bonusDamage = 1}
    } else {
      targetScore = actor.system.throwScore;
    }
  }

  ROLChecks.startCheck ({
    shiftKey,
    target,
    victim,
    damageTarget,
    damType,
    damage,
    damageBoost,
    spendMP,
    itemId,
    type,
    subType,
    mastered,
    bonusDice,
    bonusDamage,
    allowResolve,
    automatic,
    semiauto,
    targetScore
  })
  return
}

//
// Start Skill Check
//
static async _onRollSkillTest(event){
  let target =await ROLChecks._getTargetId(this.token,this.actor); 
  let actor = await ROLChecks._getTarget(target.targetId, target.targetType);
  let itemId = actor.items.get($(event.currentTarget).closest(".item").data("itemId")).id
  let item = actor.items.get(itemId);

  ROLChecks.startCheck ({
    shiftKey: event.shiftKey,
    target,
    itemId,
    type: 'skill',
    targetScore: item.system.score
  })
  return
}

//
// Start Attribute Check 
//
static async _onRollAttributeTest(event){
  let target =await ROLChecks._getTargetId(this.token,this.actor); 
  const dataset = event.currentTarget.dataset;
  ROLChecks.startCheck ({
    shiftKey: event.shiftKey,
    target,
    type: 'attribute',
    name: dataset.label,
    targetScore: dataset.target
  })
  return
}

//
// Start Luck Check 
//
static async _onRollLuckTest(event){
  let target =await ROLChecks._getTargetId(this.token,this.actor); 
  let actor = await ROLChecks._getTarget(target.targetId, target.targetType);
  ROLChecks.startCheck ({
    shiftKey: event.shiftKey,
    target,
    type: 'luck',
    name: game.i18n.localize("ROL.luckShort"),
    targetScore: actor.system.luck.value,
    allowPush: false,
    allowLuck: false
  })
  return
}

//
// Start HTD Check 
//
static async _onRollHTDTest(event){
  let target =await ROLChecks._getTargetId(this.token,this.actor); 
  let actor = await ROLChecks._getTarget(target.targetId, target.targetType);
  if(!actor.system.properties.htd){
    ui.notifications.error(game.i18n.localize("ROL.noHTD"));
    return
  }
  let bonusDice = 0;
  if (actor.system.properties.htdFumble) {
    bonusDice = -1;
  }
  ROLChecks.startCheck ({
    shiftKey: event.shiftKey,
    target,
    type: "HTD",
    name: game.i18n.localize("ROL.htd"),
    targetScore: actor.system.abilities.pow.value,
    allowPush: false,
    allowResolve: true,
    bonusDice: bonusDice
  })
  return
}

//
// Start Luck Recovery
//
static async _onLuckRecovery(event){
  let target =await ROLChecks._getTargetId(this.token,this.actor); 
  let actor = await ROLChecks._getTarget(target.targetId, target.targetType);
  if (!actor.system.flags.luckImprov) {
    ui.notifications.error(game.i18n.localize("ROL.luckRollMade"));
    return;
  }  
  ROLChecks.startCheck ({
    shiftKey: event.shiftKey,
    target,
    type: "LuckRecovery",
    name: game.i18n.localize("ROL.luckRecovery"),
    targetScore: actor.system.luck.value,
    improvRoll: "1d10",
    dialog: false,
    allowPush: false,
    allowLuck: false,
    reverse: true,
    alwaysRoll:true
  })
  return
}

//
// Start Luck Reset
//
static async _onLuckReset(event){
  let target =await ROLChecks._getTargetId(this.token,this.actor); 
  let actor = await ROLChecks._getTarget(target.targetId, target.targetType);
  let chatType = "ROLL";
  if (!actor.system.flags.luckReset && actor.system.luck.value >=1) {
    ui.notifications.error(game.i18n.localize("ROL.luckRollMade"));
    return;
  } 
  let targetScore = actor.system.luck.value;
  let formula = '2d10';
  let flatAdj = 50;
  if(actor.system.charType === "DemiMonde"){
    chatType = "OTHER";
    targetScore = actor.system.abilities.pow.value;
    formula = '1d0';
    flatAdj = actor.system.abilities.pow.value;
  }  
  ROLChecks.startCheck ({
    shiftKey: event.shiftKey,
    target,
    type:"LuckReset",
    name: game.i18n.localize("ROL.luckReset"),
    targetScore,
    formula,
    flatAdj,
    dialog: false,
    allowPush: false,
    allowLuck: false,
    reverse: true,
    alwaysRoll: true,
    chatType: chatType
  })
  return
}

//
// Start Spell Check
//
static async _onRollSpellTest(event){
  let target =await ROLChecks._getTargetId(this.token,this.actor); 
  let actor = await ROLChecks._getTarget(target.targetId, target.targetType);
  let victim = await ROLChecks._getVictimId();
  let mastered = actor.items.get($(event.currentTarget).closest(".item").data("itemId")).system.mastered;
  let bonusDice = 0
    if (mastered) {bonusDice = 1}
 
  let options = {
    shiftKey: event.shiftKey,
    target,
    victim,
    type: 'spell',
    subtype: "Magic",
    targetScore: actor.system.magicScore,
    damageTarget: actor.system.abilities.dex.value,
    damType: actor.items.get($(event.currentTarget).closest(".item").data("itemId")).system.damType,
    damage: actor.items.get($(event.currentTarget).closest(".item").data("itemId")).system.damage,
    name: actor.items.get($(event.currentTarget).closest(".item").data("itemId")).name,
    mastered,
    bonusDice,
    damageBoost: actor.items.get($(event.currentTarget).closest(".item").data("itemId")).system.damageBoost,
    allowResolve: true,
    spendMP: actor.items.get($(event.currentTarget).closest(".item").data("itemId")).system.spellOrder
  }
  ROLChecks.startCheck (options);
  return
}

//
// Start Damage Check
//
static async _onRollDamageTest(event){
  let target =await ROLChecks._getTargetId(this.token,this.actor); 
  let actor = await ROLChecks._getTarget(target.targetId, target.targetType);
  let victim = await ROLChecks._getVictimId();
  let itemId = actor.items.get($(event.currentTarget).closest(".item").data("itemId")).id
  let subType = "Thrown";
  let item = actor.items.get(itemId);
  let targetScore = actor.system.abilities.dex.value;
  if (item.type === 'weapons' && item.system.type === 'Melee') {
    targetScore = actor.system.abilities.str.value
  }
  if (item.type === 'spell') {
    subType = 'Magic'
  } else{
    if (item.system.type === 'Firearms') {subType = 'Missile'} 
    if (item.system.type === 'Melee') {subType = 'Melee'}
  }
  let signature = item.system.signature;
  let bonusDice = 0
    if (signature) {bonusDice = 1}
  ROLChecks.startCheck ({
    shiftKey: event.shiftKey,
    target,
    itemId,
    type: 'Damage',
    subType,
    targetScore,
    victim,
    damType: item.system.damType,
    damage: item.system.damage,
    name: game.i18n.localize("ROL.damage") + ": " + item.name,
    bonusDice,
    damageBoost: item.system.damageBoost,
    allowPush: false,
    allowResolve: true
  })
  return
}

//
// Start Weapon Check
//
static async _onRollWeaponTest(event){
  let target =await ROLChecks._getTargetId(this.token,this.actor);
  let actor = await ROLChecks._getTarget(target.targetId, target.targetType);
  let victim = await ROLChecks._getVictimId();
  let itemId = actor.items.get($(event.currentTarget).closest(".item").data("itemId")).id
  let subType = "Thrown";
  let targetScore = actor.system.throwScore;
  let damageTarget = actor.system.abilities.dex.value;
  let item = actor.items.get(itemId);
  if (item.system.type === 'Firearms') {
    subType = 'Missile';
    targetScore = actor.system.firearmsScore;
  } 
  if (item.system.type === 'Melee') {
    subType = 'Melee';
    targetScore = actor.system.meleeScore;
    damageTarget = actor.system.abilities.str.value;
  }
  let signature = item.system.signature;
  let bonusDamage = 0
  if (signature) {bonusDamage = 1}
  let options = {
    shiftKey: event.shiftKey,
    target,
    targetScore,
    damageTarget,
    type: 'weapons',
    subType,
    victim,
    itemId,
    damType: item.system.damType,
    damage: item.system.damage,
    allowResolve: true,
    bonusDamage: bonusDamage,
    automatic: item.system.automatic,
    semiauto: item.system.semiauto
  }
  await ROLChecks.startCheck (options);
  return
}

//
// Set Roll and Dialog options for the check
//
static async initiateConfig(options){
  let actor = await ROLChecks._getTarget(options.target.targetId, options.target.targetType);
  let item = actor.items.get(options.itemId);

  const config = {
    origin: game.user.id,
    originGM: game.user.isGM,
    shiftKey: options.shiftKey,
    target: options.target,
    victim: options.victim,
    damType: options.damType ? options.damType : '',
    targetScore: options.targetScore ? options.targetScore : 0,
    type: options.type ? options.type : '',               
    subType: options.subType ? options.subType : '',  
    damage: options.damage ? options.damage : -1,
    multiShot: "",
    boostMP: 0,
    totalMP: 0,
    rollFormula: options.formula ? options.formula : "1d100",
    diff: "Regular",
    resultLevel: 0,
    luckSpent: 0,
    flatAdj: options.flatAdj ? options.flatAdj : 0,
    wasPushed: false,
    isPushed: false,
    resolved: false,
    newRollVal: 0,
    damageTarget: options.damageTarget ? options.damageTarget : 0,
    damageFormula: "1d100",
    damageDealt: 0,
    critChance: 1,
    winTitle: options.winTitle,
    chatTemplate: 'systems/rol/templates/apps/roll-result.html',
    dialogTemplate: 'systems/rol/templates/apps/difficulty.html',
    winTitle: game.i18n.localize("ROL.diffWindow")
  }

  if ((config.subType && config.damage < 0)) {
    config.damage = 0
  }
  
  //If this is a damage causing roll then check that target is selected
    if (config.damage > 0 || config.type === 'Damage' || (config.type === "weapons" && config.damage === 0)) {
      let check  = await ROLChecks.dummyVictim(config.victim, config.target)
      if (!check) {
        return false}
    }
 


    config.automatic = options.automatic??false;
    config.semiauto = options.semiauto??false;
    config.spendMP = options.spendMP??0;
    config.damageBoost = options.damageBoost??false;
    config.allowResolve = options.allowResolve??false;
    config.mastered = options.mastered??false;
    config.alwaysRoll = options.alwaysRoll??false;
    config.reverse = options.reverse??false;
    config.allowPush = options.allowPush??true;
    config.allowLuck = options.allowLuck??true; 
    config.dialog = options.dialog??true;
    config.cover = 0; 
    config.label = options.name??item.name; 
    config.bonusDice = options.bonusDice??0;
    config.bonusDamage = options.bonusDamage??0;
    config.improvRoll = options.improvRoll??0;  
    config.defaultBonusDice = config.bonusDice;
    config.chatType = options.chatType??"ROLL";
  return config
}

//
// Start the Check Routine - calls Initiate Config
//
static async startCheck (options = {}) {
  const config = await ROLChecks.initiateConfig(options)
  if (config === false) {
    return
  }
  let msgId = await ROLChecks.runCheck (config)
  return msgId}

//
// Run Check Routines - go here if you want to pass over a pre-defined Damage roll and not rest the Config
//
static async runCheck (config) {

  //Stop all rolls except HTD if actor is suffering from HTD
  const HTDCheck = await ROLChecks.checkHTD(config)
  if (HTDCheck === false) {
    return
  }

  //Stop roll if zero score unless alwaysRoll is true
  if (!config.alwaysRoll) {
    const ZeroCheck = await ROLChecks.checkZeroScore(config)
    if (ZeroCheck === false) {
      return
    }
  }


  //If Shift key has been held then accept the defaults above otherwise call a Dialog box for Difficulty, Modifier etc
  if (config.shiftKey || !config.dialog ){
  } else{
    let usage = await ROLChecks.RollDialog(config);
      if (usage) {
        if (config.type != "HTD") {
          config.diff = usage.get('difficulty');
          if (config.type != "Damage") {
            config.multiShot =  usage.get('multiShot');
          }    
        }
        config.bonusDice = Number(usage.get('bonusDice'));
        config.boostMP = Math.max(Number(usage.get('boostMP')),0);
        config.cover = Math.max(Number(usage.get('cover')),0);
      }
    }

  if (config.damageBoost) {
    config.damage = config.damage + config.boostMP;
  }  

  if (config.multiShot === 'attack'){
    config.bonusDice++
  } 

  if (config.bonusDice !== 0) {  
    config.rollFormula = await ROLChecks.bonusPenalty(config);
  }  

  //Update Damage bonus dice for multiple bonus/penalty dice
  if (config.bonusDice >= 2) {
    config.bonusDamage++
  } else if (config.bonusDice <= -2) {
    config.bonusDamage--
  }

  let msgId = await ROLChecks.makeRoll(config) ;  
  return msgId
}

static async makeRoll(config) {
  //Call Dice Roll, calculate Result and store original results in rollVal
  config.roll = await ROLDiceRoll.RollDice(config.rollFormula);
  config.rollResult = await ROLDiceRoll.RollResult(config.roll,config.bonusDice);
  config.rollResult = Number(config.rollResult) + Number(config.flatAdj)
  config.rollVal = Number(config.rollResult);

  //Get the level of Success
  config.resultLevel = await ROLChecks.successLevel(config)

  //Change Success Level if Luck Reset and DemiMonde
  if (config.type === 'LuckReset' && config.chatType === "OTHER") {
    config.resultLevel = 1;
  }

  //If Crit Success increase Damage Bonus Dice
  if (config.resultLevel === 3) {
    config.bonusDamage++
  }

  //Check to Allow Pushed roll in follow up
  if (config.resultLevel != 0 || config.wasPushed || config.type === "weapons" || config.subType === "Firearms" || config.subType === "Fighting") {
    config.allowPush = false;
  }

  //Check to Allow Luck spend in follow up  
  if (config.resultLevel === 3 || config.resultLevel === -1 || config.wasPushed) {
    config.allowLuck = false;
  }

  //Check to Allow Resolve in follow up
  if (config.type === "HTD") {
    config.allowResolve = true;
  } 

  //Calculate initial damage
  if (config.type === 'Damage'){
    let actor = await ROLChecks._getTarget(config.target.targetId,config.target.targetType)
    config.damageDealt = await ROLChecks.calcDamage(config.damage,config.resultLevel,config.multiShot, config.subType, actor.system.damageBonus)
  }  


  //Set Luck costs to improve roll
  config.luckCrit = config.rollVal - config.critChance;
  config.luckHard = config.rollVal - Math.ceil(config.targetScore/2);
  config.luckSuccess = config.rollVal - config.targetScore;

  // If Luck Recovery determine recovery
    if (config.type === 'LuckRecovery') {
      await ROLChecks.testLuckRecovery (config)
     }
  
  // If Luck Reset determine recovery
  if (config.type === 'LuckReset') {
    await ROLChecks.testLuckReset(config)
  }   

  //Create the ChatMessage and Roll Dice
  const html = await ROLChecks.startChat(config);
  let msgId =  await ROLChecks.showChat(html,config);

  return msgId
}

//
// Confirm user doesnt want to set a target-victim
//
static async dummyVictim(victim, target){
  let msg = "";
  let subject = await ROLChecks._getTarget(victim.victimId, victim.victimType)
  let actor = await ROLChecks._getTarget(target.targetId, target.targetType)
  if (victim.victimType === "none"){
    msg = game.i18n.localize('ROL.noTarget');
  } else if (victim.victimId === target.targetId) {
    msg = game.i18n.localize('ROL.targetSelf');
  } else if (actor.type === 'character' && subject.type === 'character') {
    msg = game.i18n.localize('ROL.targetChar');
  }else {
    return true;
  }
  let confirmation = await Dialog.confirm({
    title: game.i18n.localize('ROL.target'),
    content: "<br><p><b>" + msg + "</b></p><br><p>" + game.i18n.localize('ROL.confirmation') + "</p><br>",
  });
  return confirmation;
}


//
// If character suffering HTD and this isnt HTD or Damage roll then stop the check
//
static async checkHTD(config) {
  let actor = await ROLChecks._getTarget(config.target.targetId,config.target.targetType)
  if (actor.system.properties.htd && config.type !="HTD" && config.type !="Damage") {
   ui.notifications.error(game.i18n.localize('ROL.htdResolve'));
     return false;  
 }
     return;
 }


//
 //If zero chance of success then return can't roll message
//
static async checkZeroScore(config) {
 if (config.type != 'HTD' && config.targetScore <1) {
  ui.notifications.error(game.i18n.localize('ROL.noSkill') +" [" + config.label + "]");
  return false;
}
  return;
}

//
// If Bonus or Penalty Dice update formula, with maximum of +/- 1 bonus dice
//
static async bonusPenalty(options){
  let newFormula = "";
    if(options.rollFormula === "1d100" && options.bonusDice >= 1) {
      newFormula = "1dt + 1dt[" + game.settings.get('rol', 'tenDieBonus') + "]+1d10"
    }else if (options.rollFormula === "1d100" && options.bonusDice <= -1){
      newFormula = "1dt + 1dt[" + game.settings.get('rol', 'tenDiePenalty') + "]+1d10"
    }else{
      newFormula = options.rollFormula;
    }
    return newFormula;
}

//
// Calculate Success Level
//
static async successLevel (config){
//Set the critical and fumble chances adjusted for impaired  
  let critChance = config.critChance;
  let fumbleChance = 100;
  let actor = await ROLChecks._getTarget(config.target.targetId,config.target.targetType)
  
  if (actor.system.properties.impaired || actor.system.properties.trauma) {
    fumbleChance = 90
  } else if (actor.system.Damaged){
    fumbleChance = 95
  } 

  //Get the level of success
  let resultLevel = await ROLChecks.testSuccess(config.rollResult, critChance, config.targetScore, fumbleChance, config.reverse, config.diff)

  return resultLevel
}

//
// Check the level of Success
//
static async testSuccess(rollResult, critChance, successScore, fumbleChance,reverse, diff){
  let resultLevel = 0;
  
  if (reverse ){
    if (rollResult > successScore){
      resultLevel = 1;
    }
  } else {
    if (rollResult <= critChance){
      resultLevel = 3;
    }else if (rollResult <= Math.ceil(successScore/2)){
      resultLevel = 2;
    }else if(rollResult <= successScore){
      resultLevel = 1;
    }else if(rollResult >= fumbleChance){
      resultLevel = -1;
    }else {
      resultLevel = 0;
    }  
  }

  if (diff === "Hard" && resultLevel === 1) {
  resultLevel = 0
}



  return resultLevel
}

//
// Luck Recovery
//
static async testLuckRecovery (config) {
  let actor = await ROLChecks._getTarget(config.target.targetId,config.target.targetType)
  let newLuck = actor.system.luck.value;
  let newMax = actor.system.luck.max;

  if(config.resultLevel >0) {
    config.newRoll = await ROLDiceRoll.RollDice(config.improvRoll);
    config.newRollVal = Number(config.newRoll.result);
    newLuck = newLuck + config.newRollVal;
    newMax = newMax + config.newRollVal;
  }  
  await actor.update({'system.luck.value' : newLuck,'system.luck.max' : newMax, 'system.flags.luckImprov' : false});
}

//
// Luck Reset
//
static async testLuckReset (config) {
// If Luck Reset and success determine recovery
  let actor = await ROLChecks._getTarget(config.target.targetId,config.target.targetType)
  let newLuck = actor.system.luck.value;
  let newMax = actor.system.luck.max;
  let resetFlag = false;

  if(config.resultLevel >0) {
    newLuck = config.rollVal;
    newMax = config.rollVal;
    config.luckReset = newLuck
  }  


  if(actor.system.charType === "DemiMonde") {
    resetFlag = true;
  }

  await actor.update({'system.luck.value' : newLuck,'system.luck.max' : newMax, 'system.flags.luckReset' : resetFlag});
}


//
// Prep the chat card
//
static async startChat(config) {
  let actor = await ROLChecks._getTarget(config.target.targetId,config.target.targetType)
  let messageData = {
    event: config.event,
    origin: config.origin,
    originGM: config.originGM,
    speaker: ChatMessage.getSpeaker({ actor: actor.name }),
    rollType: config.type,
    label: config.label,
    pushed: config.wasPushed,
    resolved: config.resolved,
    newPushed: config.isPushed,
    actorId: actor._id,
    totalMP: config.totalMP,
    damage: config.damage,
    damageDealt: config.damageDealt,
    diff: config.diff,
    target: config.target,
    victim: config.victim,
    resultLevel : config.resultLevel,
    luckGain : config.newRollVal,
    luckReset: config.luckReset,
    bonusDice: config.bonusDice,
    result: config.rollVal,
    allowPush: config.allowPush,
    allowLuck: config.allowLuck,
    allowResolve: config.allowResolve,
    targetScore: config.targetScore,
    luckCrit: config.luckCrit,
    luckHard: config.luckHard,
    luckSuccess: config.luckSuccess,
    luckSpent: config.luckSpent,
  }

  const messageTemplate = config.chatTemplate
  let html = await renderTemplate (messageTemplate, messageData);

  return html;
}  

//
// Display the chat card and roll the dice
//
static async showChat(html,config) {

let actor = await ROLChecks._getTarget(config.target.targetId,config.target.targetType)
let chatData={};
if (config.chatType === "ROLL") {
  chatData = {
    user: game.user.id,
    rolls: [config.roll],
    content: html,
    flags: {config: config},
    speaker: {
      actor: actor._id,
      alias: actor.name,
    },
  };

} else {
  chatData = {
    user: game.user.id,
    type: CONST.CHAT_MESSAGE_STYLES.OTHER,
    rolls: [config.roll],
    content: html,
    flags: {config: config},
    speaker: {
      actor: actor._id,
      alias: actor.name,
    },
  };
}
  let msg = await ChatMessage.create(chatData);
  return msg._id
}


//Function to call the Difficulty & Modifier Dialog box for Skill Rolls---------------------------------------------------------------------------------------------------
static async RollDialog (options) {
    const data = {
      type : options.type,
      subType: options.subType,
      mastered : options.mastered,
      automatic: options.automatic,
      semiauto: options.semiauto,
      label: options.label,
      diff: options.diff,
      damType: options.damType,
      bonusDice: options.defaultBonusDice
    }

    const html = await renderTemplate(options.dialogTemplate,data);
  
    return new Promise(resolve => {
      let formData = null
      const dlg = new Dialog({
        title: options.winTitle,
        content: html,
        buttons: {
          roll: {
            label: game.i18n.localize("ROL.rollDice"),
            callback: html => {
            formData = new FormData(html[0].querySelector('#difficulty-roll-form'))
            return resolve(formData)
            }
          }
        },
      default: 'roll',
      close: () => {}
      })
      dlg.render(true);
    })
  }


//Function when Chat Message buttons activated to call socket---------------------------------------------------------------------------------------------------
static async triggerChatButton(event){
  const targetElement = event.currentTarget;
  const presetType = targetElement.dataset?.preset;
  const targetChat = $(targetElement).closest('.message');
  let targetChatId = targetChat[0].dataset.messageId;

  

  const luckCost = Number(targetElement.dataset?.cost);
  const luckLevel = Number(targetElement.dataset?.level);

  let origin = game.user.id;
  let originGM = game.user.isGM;


  if (game.user.isGM){
    ROLChecks.handleChatButton ({presetType, targetChatId, luckCost, luckLevel,origin, originGM})
  } else {
    const availableGM = game.users.find(d => d.active && d.isGM)?.id
    if (availableGM) {
    game.socket.emit('system.rol', {
      type: 'chatUpdate',
      to:availableGM,
      value: {presetType, targetChatId, luckCost, luckLevel, origin, originGM}
    })
  } else {
    ui.notifications.warn(game.i18n.localize('ROL.noAvailableGM'))        
  }
  }
}
  



//Use Buttons on Message Luck/Push/Resolve
static async handleChatButton(data) {
  const presetType = data.presetType;
  const luckCost = Number(data.luckCost);
  const luckLevel = Number(data.luckLevel);
  let targetMsg = game.messages.get(data.targetChatId);
  let actor = await ROLChecks._getTarget(targetMsg.flags.config.target.targetId,targetMsg.flags.config.target.targetType);
  await targetMsg.update({'flags.config.origin' :data.origin, 'flags.config.originGM' : data.originGM})

  switch(presetType){
    case "luck":
      if (luckCost > actor.system.luck.value){
        ui.notifications.error("Not enough Luck Points")
        return
      }
    
      actor.update({'system.luck.value': actor.system.luck.value - luckCost});
    
      let newBonus = targetMsg.flags.config.bonusDamage;
      if (luckLevel === 3) {
        newBonus++;
      }

      let newDam = targetMsg.flags.config.damageDealt;      
      if (targetMsg.flags.config.type === "Damage") {
        newDam = await ROLChecks.calcDamage(targetMsg.flags.config.damage,luckLevel,targetMsg.flags.config.multiShot, targetMsg.flags.config.subType, actor.system.damageBonus)
      }  
     
      await targetMsg.update({
        'flags.config.luckCrit' : targetMsg.flags.config.luckCrit - luckCost,
        'flags.config.luckHard' : targetMsg.flags.config.luckHard - luckCost,
        'flags.config.rollVal' : targetMsg.flags.config.rollVal - luckCost,
        'flags.config.resultLevel' : luckLevel,
        'flags.config.damageDealt': newDam,
        'flags.config.bonusDamage' : newBonus,
        'flags.config.luckSpent': targetMsg.flags.config.luckSpent + luckCost,
        'flags.config.allowPush': false
      });
      const html = await ROLChecks.startChat(targetMsg.flags.config);
      await targetMsg.update({content: html});
    break;

    case "push":
      let newResolve = targetMsg.flags.config.allowResolve
      await targetMsg.update({
        'flags.config.wasPushed' : true,
        'flags.config.allowPush' : false,
        'flags.config.allowLuck' : false,
        'flags.config.allowResolve' : false,
      });
      const pushhtml = await ROLChecks.startChat(targetMsg.flags.config);
      await targetMsg.update({content: pushhtml});
      await targetMsg.update({
        'flags.config.isPushed' : true,
        'flags.config.allowResolve' : newResolve,
      });
      await ROLChecks.makeRoll(targetMsg.flags.config);
    break;  

    case "resolve":
      let totalMP = 0;
      let damageDealt = 0;

      //Update Damage Taken  & MP for HTD 
        if (targetMsg.flags.config.type === "HTD") {
        actor.update({'system.mp.value' :0})  
        let newDamage = actor.system.damage.value;
        if (targetMsg.flags.config.resultLevel === 3){
        }else if (targetMsg.flags.config.resultLevel === 2){
          newDamage = Math.min(newDamage+1,3);
        }else if(targetMsg.flags.config.resultLevel === 1){
          newDamage = Math.min(newDamage+2,3);
        }else if(targetMsg.flags.config.resultLevel === -1){
          newDamage = 5;
        }else {
          newDamage = 4;
        }  
        actor.update({'system.damage.value' :newDamage, 'system.properties.htd' : false, 'system.properties.htdFumble' : false })  
      }

      //Update MP & HTD for spellcasting 
      if (targetMsg.flags.config.type === "spell") {
     
        totalMP = targetMsg.flags.config.spendMP + targetMsg.flags.config.boostMP;
        if(actor.system.Exhausting){totalMP++;}
        let newMP = actor.system.mp.value - totalMP;
        let HTDstate = actor.system.properties.htd;
        let HTDFumblestate = actor.system.properties.htdFumble;
        if ((targetMsg.flags.config.resultLevel === -1 && !targetMsg.flags.config.isPushed) || (targetMsg.flags.config.resultLevel === 0 && targetMsg.flags.config.isPushed) || newMP < 0) {
          newMP=0;
          HTDstate=true;
          ui.notifications.error(game.i18n.localize("ROL.htd"));
        } else if (targetMsg.flags.config.resultLevel === -1 && targetMsg.flags.config.isPushed) {
          newMP=0;
          HTDstate=true;  
          HTDFumblestate = true;
          ui.notifications.error(game.i18n.localize("ROL.htdPenalty"));
        }
        if (newMP <=0) {newMP = 0};
        actor.update({'system.mp.value' :newMP, 'system.properties.htd' : HTDstate, 'system.properties.htdFumble' : HTDFumblestate });
      }  

      //Update Damage Dealt
      if (targetMsg.flags.config.type === "Damage") {
        damageDealt = await ROLChecks.calcDamage(targetMsg.flags.config.damage,targetMsg.flags.config.resultLevel,targetMsg.flags.config.multiShot, targetMsg.flags.config.subType, actor.system.damageBonus)
     
        //If there is a victim then apply damage to them.
        if(game.user.isGM) {}
          if (targetMsg.flags.config.victim.victimType != "none"){ 
            let victim = await ROLChecks._getTarget(targetMsg.flags.config.victim.victimId,targetMsg.flags.config.victim.victimType);
            let dmgResults = await ROLChecks.useArmour(victim, targetMsg.flags.config.damType,damageDealt,targetMsg.flags.config.cover)
            let victimDamage = victim.system.damage.value;
            if (victimDamage === 5){
            } else if(dmgResults.damTaken > 3) {
              victimDamage = Math.min(dmgResults.damTaken,5)
            } else (
              victimDamage = Math.min(victimDamage + dmgResults.damTaken ,3)
            )
              victim.update({'system.damage.value' : victimDamage,
                             'system.armour.shieldHP': dmgResults.shieldHP })
          }
      }

      //Update the Chat Message
      await targetMsg.update({
        'flags.config.allowPush' : false,
        'flags.config.allowLuck' : false,
        'flags.config.allowResolve' : false,
        'flags.config.resolved' : true,
        'flags.config.totalMP' : totalMP,
        'flags.config.damageDealt' : damageDealt,
        });
        const resolvehtml = await ROLChecks.startChat(targetMsg.flags.config);
        await targetMsg.update({content: resolvehtml});

      if (((targetMsg.flags.config.type === "spell"  && targetMsg.flags.config.damage > 0) || targetMsg.flags.config.type === "weapons") && targetMsg.flags.config.resolved && targetMsg.flags.config.resultLevel > 0) {
        await targetMsg.update({
          'flags.config.type' : "Damage",
          'flags.config.allowPush' : false,
          'flags.config.shiftKey': false,
          'flags.config.wasPushed' : false,
          'flags.config.isPushed' : false,
          'flags.config.allowLuck' : true,
          'flags.config.allowResolve' : true,
          'flags.config.resolved' : false,
          'flags.config.mastered' : false,
          'flags.config.luckSpent': 0,
          'flags.config.diff' : "Regular",
          'flags.config.totalMP' : 0,
          'flags.config.resultLevel' : 0,
          'flags.config.defaultBonusDice' : targetMsg.flags.config.bonusDamage,
          'flags.config.rollFormula' : targetMsg.flags.config.damageFormula,
          'flags.config.targetScore' : targetMsg.flags.config.damageTarget,
          'flags.config.bonusDice' : targetMsg.flags.config.bonusDamage,
          'flags.config.label' : game.i18n.localize("ROL.damage") + ": " + targetMsg.flags.config.label,
          });
   
      //If GM then just do your Damage Roll - otherwise trigger player to do Damage roll        
      if (targetMsg.flags.config.originGM) {    
        await ROLChecks.runCheck (targetMsg.flags.config)
      } else {
        const availableGM = game.users.find(d => d.active && d.isGM)?.id
        if (availableGM) {
        game.socket.emit('system.rol', {
          type: 'chatDamage',
          to: availableGM,
          value: {targetMsg}
        })
      } else {
        ui.notifications.warn(game.i18n.localize('ROL.noAvailableGM'))     
      }
      }}
      break;
    }
  return 
}

static async calcDamage(damage,resultLevel,multiShot, subType,damageBonus) {
  let damageDealt = damage;
  if (resultLevel <= 0){
    damageDealt = 1;  
  }else{ 
    damageDealt = damageDealt + resultLevel;
    if (multiShot === "damage"){
      damageDealt = damageDealt + resultLevel;
    }
  } 
  if(subType === "Melee") {
    damageDealt = damageDealt + damageBonus;      
  }
  return damageDealt;
}

static async useArmour(victim, damType, damageDealt,cover) {
  let damTaken = 0;
  let damBlocked = 0;
  let natural = victim.system.armour.natural;
  let regular = victim.system.armour.regular;
  let ballistic = victim.system.armour.ballistic;
  let shieldBlock = victim.system.armour.shieldBlock;
  let shieldHP = victim.system.armour.shieldHP;

  switch(damType){
    case "vorpal":
      damTaken = Math.max(damageDealt - damBlocked,0);
    break;  

    case "magic":
      damBlocked = Math.min(shieldBlock,shieldHP, damageDealt);
      shieldHP = shieldHP - damBlocked;
      damTaken = Math.max(damageDealt - damBlocked,0);
    break;
    
    case "ballistic":
      damBlocked = Math.min(shieldBlock,shieldHP, damageDealt);
      shieldHP = shieldHP - damBlocked;
      damTaken = Math.max(damageDealt - damBlocked - ballistic - cover,0);
      break;

    case "bladed":
      damBlocked = Math.min(shieldBlock,shieldHP, damageDealt);
      shieldHP = shieldHP - damBlocked;
      damTaken = Math.max(damageDealt - damBlocked - Math.max(ballistic,regular)-cover,0);
    break;
  
    case "blunt":
      damBlocked = Math.min(shieldBlock,shieldHP, damageDealt);
      shieldHP = shieldHP - damBlocked;
      damTaken = Math.max(damageDealt - damBlocked - Math.max(ballistic,regular) - natural - cover,0);
    break;
  }

    return {
      damBlocked,
      shieldHP, 
      damTaken: damTaken
    }


}

}