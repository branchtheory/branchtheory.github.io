import {
  NUMBER_OF_GRID_ITEMS,
  BLANK_LINE_ITEM,
  SELECTED,
  UNUSED,
  getLine16FromFinishedBranch
} from './sharedValuesAndTools.js';

export function isPotentialSolution(branch) {
  for (let gridItem of branch) {
    if (gridItem.length === 0 || gridItem.some(quad => quad.status === UNUSED)) {
      return false;
    }
  }
  return true;
}

export function isValidSolution(branch, line16) {
  const line16FromSolution = getLine16FromFinishedBranch(branch);
  return isValidLine16(line16FromSolution, line16) && oneSelectionPerGridItem(branch);
}

function isValidLine16(line16FromSolution, line16) {
  for (let lineItemIndex = 0; lineItemIndex < NUMBER_OF_GRID_ITEMS; lineItemIndex++) {
    if (line16[lineItemIndex] !== BLANK_LINE_ITEM &&
      line16[lineItemIndex] !== line16FromSolution[lineItemIndex]) {
      return false;
    }
  }
  return true;
}

function oneSelectionPerGridItem(branch) {
  for (let item of branch) {
    if (item.filter(quad => quad.status === SELECTED).length !== 1) {
      return false;
    }
  }
  return true;
}
