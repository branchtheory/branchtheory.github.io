import {
  UNUSED,
  REJECTED,
  BROKEN_BRANCH,
  SUM_SIGNIFIER,
  NOT_FOUND,
  BLANK_LINE_ITEM,
  isBrokenBranch
} from './sharedValuesAndTools.js';
import { pairSelectAndReject } from './selectAndReject.js';

export function deduceFromLineOperandCountMatchingGrid(branch, originalLine16, ns) {
  const line16 = groupByValue([...originalLine16]);

  let deductionMade = false;

  for (const line16Value of line16) {
    let operandAppearances = getOperandAppearances(branch, line16Value.value, ns);

    let maxPossiblePairs = getMaxPossiblePairs(operandAppearances);

    if (maxPossiblePairs < line16Value.appearanceCount) {
      return { branch: BROKEN_BRANCH, furtherDeductions: false };

    } else if (maxPossiblePairs > line16Value.appearanceCount) {
      continue;

    } else if (maxPossiblePairs === line16Value.appearanceCount) {
      for (const appearance of operandAppearances) {
        while (thereIsStillAtLeastOneUnusedPair(appearance)) {
          pairUp(appearance, branch);

          if (isBrokenBranch(branch)) {
            return { branch: BROKEN_BRANCH, furtherDeductions: false };
          }

          deductionMade = true;
        }
      }
    }
  }

  return { branch, furtherDeductions: deductionMade };
}

function operandsMatch(op1, op2) {
  return op1.every(x => op2.includes(x)) && op2.every(x => op1.includes(x));
}

function groupByValue(line16) {
  const counts = new Map();
  line16.filter(op => op !== BLANK_LINE_ITEM).forEach(num => {
    counts.set(num, (counts.get(num) || 0) + 1);
  });

  return Array.from(counts, ([value, appearanceCount]) => ({ value, appearanceCount }));
}

function getOperandAppearances(branch, operand, ns) {
  let appearances = [];
  for (let gridIndex = 0; gridIndex < branch.length; gridIndex++) {
    for (let quadIndex = 0; quadIndex < branch[gridIndex].length; quadIndex++) {
      const quad = branch[gridIndex][quadIndex];
      if (quad.gridPairIndex === REJECTED || !quad.operands.includes(operand)) {
        continue;
      }

      let matchIndex = appearances.findIndex(appearance => operandsMatch(quad.operands, appearance.operands));

      if (matchIndex === NOT_FOUND) {
        matchIndex = appearances.length;
        appearances.push(
          {
            operands: quad.operands,
            sum: [],
            sumLocations: [],
            product: [],
            productLocations: [],
          }
        )
      }

      const location = { grid: gridIndex, quad: quadIndex };

      if (quad.operation === SUM_SIGNIFIER) {
        appearances[matchIndex].sum.push(quad);
        appearances[matchIndex].sumLocations.push(location);
      } else {
        appearances[matchIndex].product.push(quad);
        appearances[matchIndex].productLocations.push(location);
      }

    }
  }
  return appearances;
}

function getMaxPossiblePairs(operandAppearances) {
  let maxPossiblePairs = 0;
  for (const appearance of operandAppearances) {
    maxPossiblePairs += Math.min(appearance.sum.length, appearance.product.length);
  }
  return maxPossiblePairs;
}

function thereIsStillAtLeastOneUnusedPair(appearance) {
  return appearance.sum.some(q => q.gridPairIndex === UNUSED) &&
    appearance.product.some(q => q.gridPairIndex === UNUSED)
}

function pairUp(appearance, branch) {
  const sumIndex = appearance.sum.findIndex(quad => quad.gridPairIndex === UNUSED);
  const sumLocation = appearance.sumLocations[sumIndex];
  const sumQuad = appearance.sum[sumIndex];

  const productIndex = appearance.product.findIndex(quad => quad.gridPairIndex === UNUSED
    && appearance.productLocations[appearance.product.indexOf(quad)].grid !== sumLocation.grid);
  const productLocation = appearance.productLocations[productIndex];
  const productQuad = appearance.product[productIndex];

  pairSelectAndReject(branch, sumLocation, sumQuad, productLocation, productQuad);
}
