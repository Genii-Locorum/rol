export default function (application) {
  if (application.document.getFlag('rol', 'hide-background') ?? false) {
    application.controlIcon.bg.clear()
  }
}
