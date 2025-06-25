import { ROLChat } from '../apps/chat.mjs'

export function listen(){
  Hooks.on('renderChatMessageHTML', (app, html, data) => {
    ROLChat.renderMessageHook(app, html, data)
  })
}