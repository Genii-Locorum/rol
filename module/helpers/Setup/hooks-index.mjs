
import * as DiceSoNiceReady from '../Dice/dice-so-nice-ready.mjs'
import * as DiceSoNiceRollStart from '../Dice/dice-so-nice-roll-start.mjs'
import * as RenderChatMessage from '../Setup/chat-messages.mjs'

export const ROLHooks = {
  listen () {
    DiceSoNiceReady.listen()
    DiceSoNiceRollStart.listen()
    RenderChatMessage.listen()
  }
}