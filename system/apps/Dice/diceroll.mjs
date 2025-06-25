export class ROLDiceRoll {

//Function to Roll Dice
static async RollDice (rollFormula){
    let roll = new Roll(rollFormula);
    await roll.evaluate();
    return roll;  
  }
  
//Function to Produce Result from DiceRoll
static async RollResult(roll,bonusDice){
  let rollResult=0;
    if (bonusDice === 0){
      rollResult = roll.result;
    }else {
      const result = {
        unit: {
          total: 0,
          results: []
        },
        tens: {
          total: 0,
          results: []
        },
        total: 0,
        roll
      }
  
      for (const d of roll.dice) {
        if (d instanceof CONFIG.Dice.terms.t) {
          result.tens.results.push(d.total);
        } else {
          result.unit.total = d.total === 10 ? 0 : d.total;
          result.unit.results.push(result.unit.total);
        }
      }
      if (bonusDice < 0) {
        result.tens.total =
          result.unit.total === 0 && result.tens.results.includes(0)
            ? 100
            : Math.max(...result.tens.results)
      } else if (result.unit.total === 0) {
        const dice = result.tens.results.filter(t => t > 0);
        result.tens.total = dice.length === 0 ? 100 : Math.min(...dice);
      } else {
        result.tens.total = Math.min(...result.tens.results);
      }
    
      result.total = result.unit.total + result.tens.total;
      rollResult=result.total;
    }
  
    return rollResult;
  }
  
}