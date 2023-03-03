
import { ROLDecaderDie } from '../Dice/decader-die.mjs'
import { ROLDecaderDieOther } from '../Dice/decader-die-other.mjs'

export function registerSettings () {


  //GM Tools Settings
  game.settings.register('rol', 'sessionendEnabled', {
    name: 'End of session allowed',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  });

  game.settings.register('rol', 'developmentEnabled', {
    name: 'Dev phased allowed',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  });

  game.settings.register('rol', 'characterCreation', {
    name: 'Character creation allowed',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  });

  game.settings.register('rol', 'characterEditable', {
    name: 'Character edit allowed',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  });

  game.settings.register('rol', 'opposedCardId', {
    name: 'Open Opposed Card ID',
    scope: 'world',
    config: false,
    default: "",
    type: Text
  });

  //Game Settings
  game.settings.register('rol', 'pcPreReq', {
    name: 'ROL.Settings.pcPreReq',
    hint: 'ROL.Settings.pcPreReqHint',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  })

   game.settings.register('rol', 'npcPreReq', {
    name: 'ROL.Settings.npcPreReq',
    hint: 'ROL.Settings.npcPreReqHint',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  })

  game.settings.register('rol', 'luckExtend', {
    name: 'ROL.Settings.LuckExtend',
    hint: 'ROL.Settings.LuckExtendHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  })

  //Advance Rule Settings
  game.settings.register('rol', 'age', {
    name: 'ROL.Settings.Age',
    hint: 'ROL.Settings.AgeHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  })

  game.settings.register('rol', 'demiMonde', {
    name: 'ROL.Settings.DemiMonde',
    hint: 'ROL.Settings.DemiMondeHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  })

  game.settings.register('rol', 'statsOnes', {
    name: 'ROL.Settings.StatsOnes',
    hint: 'ROL.Settings.StatsOnesHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  })

  game.settings.register('rol', 'statsExtend', {
    name: 'ROL.Settings.StatsExtend',
    hint: 'ROL.Settings.StatsExtendHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  })

  game.settings.register('rol', 'maxStats', {
    name: 'ROL.Settings.MaxStats',
    hint: 'ROL.Settings.MaxStatsHint',
    scope: 'world',
    config: true,
    default: 280,
    type: Number
  })

  game.settings.register('rol', 'maxSpell', {
    name: 'ROL.Settings.MaxSpell',
    hint: 'ROL.Settings.MaxSpellHint',
    scope: 'world',
    config: true,
    default: 6,
    type: Number
  })

  //Dice So Nice Settings 
    game.settings.register('rol', 'tenDieBonus', {
      name: 'ROL.Settings.TenDieBonus',
      hint: 'ROL.Settings.TenDieBonusHint',
      scope: 'client',
      config: true,
      default: 'bronze',
      type: String
    })
    game.settings.register('rol', 'tenDiePenalty', {
      name: 'ROL.Settings.TenDiePenalty',
      hint: 'ROL.Settings.TenDiePenaltyHint',
      scope: 'client',
      config: true,
      default: 'bloodmoon',
      type: String
    })


  CONFIG.Dice.terms.t = ROLDecaderDie
  CONFIG.Dice.terms.o = ROLDecaderDieOther


}
