
import * as DiceSoNiceReady from '../apps/Dice/dice-so-nice-ready.mjs'
import * as DiceSoNiceRollStart from '../apps/Dice/dice-so-nice-roll-start.mjs'
import * as RenderChatMessage from './chat-messages.mjs'
export const ROLHooks = {
  listen () {
    DiceSoNiceReady.listen()
    DiceSoNiceRollStart.listen()
    RenderChatMessage.listen()
  }
}