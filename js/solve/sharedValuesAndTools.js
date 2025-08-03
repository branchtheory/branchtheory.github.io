export const PRODUCT_SIGNIFIER = "×";
export const SUM_SIGNIFIER = "+";
export const UNUSED = "unused";
export const DONE = "done";


export const BLANK_LINE_ITEM = 0;

export const NUMBER_OF_GRID_ITEMS = 16;

export const BROKEN_BRANCH = "BROKEN BRANCH";

export const NOT_FOUND = -1;

export function isBrokenBranch(branch, ns) {
  if (Array.isArray(branch)) {
    return aGridItemIsWhollyRejected(branch) || aGridItemIsEmpty(branch) || aDoubleSelection(branch) || !(branch.length === NUMBER_OF_GRID_ITEMS);
  } else {
    return branch === "invalid" || branch === BROKEN_BRANCH;
  }
}

function aGridItemIsWhollyRejected(branch) {
  for (const gridItem of branch) {
    if (!gridItem.some(quad => quad.status === SELECTED) && !gridItem.some(quad => quad.status === UNUSED)) {
      return true;
    }
  }
  return false;
}

function aGridItemIsEmpty(branch) {
  for (const gridItem of branch) {
    if (gridItem.length === 0) {
      return true;
    }
  }
  return false;
}

function aDoubleSelection(branch) {
  for (const gridItem of branch) {
    if (gridItem.filter(quad => quad.status === SELECTED).length >= 2) {
      return true;
    }
  }
  return false;
}

export function getLine16FromFinishedBranch(branch) {
  const line16FromSolution = [];

  for (let gridItem of branch) {
    for (let quad of gridItem) {
      if (quad.operation === SUM_SIGNIFIER && quad.status === SELECTED) {
        line16FromSolution.push(...quad.operands);
      }
    }
  }

  return line16FromSolution.sort((a, b) => a - b);
}
