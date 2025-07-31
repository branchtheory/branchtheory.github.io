import {
  NUMBER_OF_GRID_ITEMS,
  BLANK_LINE_ITEM,
  SELECTED,
  UNUSED,
  SUM_SIGNIFIER,
} from './sharedValuesAndTools.js';

export function isPotentialSolution(branch) {
  for (let gridItem of branch) {
    if (gridItem.length === 0 || gridItem.some(quad => quad.status === UNUSED) {
      return false;
    }
  }
  return true;
}

export function isValidSolution(branch, line16) {
  const line16FromSolution = getSolutionsLine16(branch);
  return isLine16Valid(line16FromSolution, line16);
}

function isLine16Valid(line16FromSolution, line16) {
  for (let lineItemIndex = 0; lineItemIndex < NUMBER_OF_GRID_ITEMS; lineItemIndex++) {
    if (line16[lineItemIndex] !== BLANK_LINE_ITEM &&
        line16[lineItemIndex] !== line16FromSolution[lineItemIndex]) {
      return false;
    }
  }
  return true;
}

function getSolutionsLine16(branch) {
  const line16FromSolution = [];
  
  for (let gridItem of branch) {
    for (let quad of gridItem) {
      if (quad.operationType === SUM_SIGNIFIER && quad.status === SELECTED) {
        line16FromSolution.push(quad.operand1);
        line16FromSolution.push(quad.operand2);
      }
    }
  }
  
  line16FromSolution.sort((a, b) => a - b);
  return line16FromSolution;
}
