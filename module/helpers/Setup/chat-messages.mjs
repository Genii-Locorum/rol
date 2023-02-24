import { ROLChat } from '../chat.mjs'

export function listen(){
  Hooks.on('renderChatMessage', (app, html, data) => {
    ROLChat.renderMessageHook(app, html, data)
  })
}