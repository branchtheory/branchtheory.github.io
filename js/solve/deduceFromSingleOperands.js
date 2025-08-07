import {
  UNUSED,
  SELECTED,
  BROKEN_BRANCH,
  isBrokenBranch
} from './sharedValuesAndTools.js';
import { pairSelectAndReject } from './selectAndReject.js';

export function deduceFromSingleOperands(branch, line16, ns) {

/*

If the minimum number of times an operand that appears in the strip COULD appear in the strip equals the maximum
number of times that the grid items could use it, then go for it.

So:
1. Only do each line16 value once. If there are multiple items with that value, take into account how many there are.
2. 

could be more effective.
Doesn't currently account for how the line16 can gett filled in as the puzzle progresses.
Also doesn't account for duplicates in the line. If there are three 3s, this looks at it and says 'oh no, too many'.
but actually it should see that the number of 3 operands in SUM_IDENTIFIER quads is the same as the number of
threes in the line. And so should go "aha, we can immediately match stuff up."

That's where filling in the line16 would help. It gives you way more data to use.

*/


  let deductionMade = false;
  for (let operand of line16.filter(op => op !== 0)) {
    const locations = findValidOperandLocations(branch, operand);

    if (locations.length < 2) {
      return { branch: BROKEN_BRANCH, furtherDeductions: false };
    } else if (locations.length === 2 && areUnused(branch, locations)) {
      const pair1Location = locations[0];
      const pair2Location = locations[1];
      const pair1 = branch[pair1Location.grid][pair1Location.quad];
      const pair2 = branch[pair2Location.grid][pair2Location.quad];

      pairSelectAndReject(branch, pair1Location, pair1, pair2Location, pair2);

      if (isBrokenBranch(branch)) {
        return { branch: BROKEN_BRANCH, furtherDeductions: false };
      }

      deductionMade = true;
    }
  }

  return { branch, furtherDeductions: deductionMade };
}

function findValidOperandLocations(branch, operand) {
  const locations = [];

  for (let gridIndex = 0; gridIndex < branch.length; gridIndex++) {
    for (let quadIndex = 0; quadIndex < branch[gridIndex].length; quadIndex++) {
      const quad = branch[gridIndex][quadIndex];
      const isRelevantStatus = quad.status === UNUSED || quad.status === SELECTED;
      const matchesOperand = quad.operands.includes(operand);

      if (isRelevantStatus && matchesOperand) {
        locations.push({ grid: gridIndex, quad: quadIndex, value: quad.value });
      }
    }
  }

  return locations;
}

function areUnused(branch, locations) {
  const pair1 = branch[locations[0].grid][locations[0].quad];
  const pair2 = branch[locations[1].grid][locations[1].quad];

  return pair1.status === UNUSED && pair2.status === UNUSED;
}

function prepLine16 (branch, line16) {
  for (let index = line16.length - 1; index >= 0; index--) {
    if (line16[index] === 0) {
      line16.splice(index, 1);
    }
  }
  for (const gridItem of branch) {
    for (const quad of gridItem) {
      if (true) {}
    }
  }
}
