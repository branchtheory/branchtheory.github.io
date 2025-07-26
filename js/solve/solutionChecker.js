import {
  NUMBER_OF_GRID_ITEMS,
  BLANK_LINE_ITEM,
  UNUSED,
  SUM_SIGNIFIER,
} from './sharedValuesAndTools.js';

export function isPotentialSolution(branch) {
  for (let gridItemQuads of branch) {
    if (gridItemQuads.length === 0 || gridItemQuads[0].status === UNUSED) {
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
  
  for (let gridItemIndex = 0; gridItemIndex < NUMBER_OF_GRID_ITEMS; gridItemIndex++) {
    const quad = branch[gridItemIndex][0];
    if (quad.operationType === SUM_SIGNIFIER) {
      line16FromSolution.push(quad.operand1);
      line16FromSolution.push(quad.operand2);
    }
  }
  
  line16FromSolution.sort((a, b) => a - b);
  return line16FromSolution;
}
