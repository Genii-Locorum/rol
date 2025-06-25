import { ROLMenu } from '../setup/menu.mjs'

export default function (app, html, data) {
  if (typeof html.querySelector === 'function') {
    html.querySelector('button[data-tool="roldummy"]')?.closest('li').remove()
  }
  ROLMenu.renderControls(app, html, data)
}