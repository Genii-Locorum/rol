/* global DiceTerm */

export class ROLDecaderDie extends foundry.dice.terms.DiceTerm {
  constructor (termData) {
    super(termData)
    this.faces = 10
  }

  get total () {
    const total = super.total
    return total === 10 ? 0 : total * 10
  }

  /* -------------------------------------------- */
  /** @override */
  static get DENOMINATION () {
    return 't'
  }
}