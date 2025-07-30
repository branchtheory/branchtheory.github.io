// move splitter to be the last port of call, and to be a part of logical deductions? -- it's bifurcation, and it's often a valid (and sometimes the only) way of moving forward
// 

import {
  PRODUCT_SIGNIFIER,
  SUM_SIGNIFIER,
  UNUSED,
  SELECTED,
  REJECTED,
  NOT_FOUND,
  BROKEN_BRANCH
} from './sharedValuesAndTools.js';

export function deduceFromSingles(branch, grid16) {
  let thereMayBeFurtherLogicalDeductionsToMake;
  let workingBranch = [...branch];
  
  do {
    const result = deduceFromGridItemsWithASingleQuad(workingBranch, grid16);
    workingBranch = result.branch;
    thereMayBeFurtherLogicalDeductionsToMake = result.furtherDeductions;
  } while (thereMayBeFurtherLogicalDeductionsToMake);

  return workingBranch;
}

export function deduceAfterASplit(branch, grid16) {
  const singleLocation = getTheLocationOfTheSingleQuad(branch, grid16);
  const singleGrid16Value = grid16[singleQuadItemGrid16Index];

  const correspondingItemGrid16Value = getCorrespondingItemGridItemValue(branch, singleQuadItemGrid16Index, singleGrid16Value);
  const correspondingItemGrid16Index = getCorrespondingItemLocation(branch, singleQuadItemGrid16Index, correspondingItemGrid16Value, grid16);

  if (correspondingItemGrid16Index === NOT_FOUND) {
    return BROKEN_BRANCH;
  }

  setStatusesInCorrespondingItem(branch, correspondingItemGrid16Index);
  rejectOtherLinkedQuads(branch, correspondingItemGrid16Index, correspondingItemGrid16Value, grid16);
  rejectOtherLinkedQuads(branch, singleQuadItemGrid16Index, singleGrid16Value, grid16);

  return branch;
}

function deduceFromGridItemsWithASingleQuad(branch, grid16) {
  const singleLocation = getTheLocationOfTheSingleQuad(branch, grid16);
  
  if (singleLocation === NOT_FOUND) {
    return { branch: branch, furtherDeductions: false };
  }

  branch[singleLocation.grid][singleLocation.quad].status = SELECTED;
  const singleGrid16Value = grid16[singleLocation.grid];

  const correspondingItemGrid16Value = branch[singleLocation.grid][singleLocation.quad].pairedGridValue;
  const correspondingItemLocation = getCorrespondingItemLocation(branch, singleLocation, singleGrid16Value, correspondingItemGrid16Value, grid16);

  if (correspondingItemLocation === NOT_FOUND) {
    return { branch: BROKEN_BRANCH, furtherDeductions: false };
  }

  setStatusesInCorrespondingItem(branch, branch[singleLocation.grid][singleLocation.quad], correspondingItemLocation);
  if (isLastIncompleteOccurrenceOfGridValue(branch, singleLocation.grid, singleGrid16Value)) {
    rejectOtherLinkedQuads(branch, correspondingItemGrid16Index, correspondingItemGrid16Value, grid16);
  }

  return { branch: branch, furtherDeductions: true };
}

function getTheLocationOfTheSingleQuad(branch, grid16) {
  for (let gridIndex = 0; gridIndex < grid16.length; gridIndex++) {
    const items = branch[gridIndex];

    const unused = items.filter(item => item.status === UNUSED);
    const hasSelected = items.some(item => item.status === SELECTED);

    if (unused.length === 1 && !hasSelected) {
      const quadIndex = items.findIndex(item => item.status === UNUSED);
      return { grid: gridIndex, quad: quadIndex };
    }
  }

  return NOT_FOUND;
}

function getCorrespondingItemLocation(branch, singleLocation, singleGrid16Value, correspondingItemGrid16Value, grid16) {
  for (let gridIndex = 0; gridIndex < grid16.length; gridIndex++) {
    if (grid16[gridIndex] === correspondingItemGrid16Value &&
        branch[gridIndex].length > 0 &&
        items.some(item => item.status === UNUSED && item.pairedGridValue === singleGrid16Value && 
            item.operationType !== branch[singleLocation.gridIndex][singleLocation.quadIndex].operationType) &&
        singleLocation.gridIndex !== gridIndex) {
      const quadIndex = items.findIndex(item => item.status === UNUSED && item.pairedGridValue === singleGrid16Value && 
            item.operationType !==  branch[singleLocation.gridIndex][singleLocation.quadIndex].operationType);
      return { grid: gridIndex, quad: quadIndex };
    }
  }
  return NOT_FOUND;
}

function setStatusesInCorrespondingItem(branch, correspondingItemLocation) {
  for (let quad = 0; quad < branch[correspondingItemLocation.grid].length; quad++) {
    if (quad !== correspondingItemLocation.quad) {
      branch[correspondingItemLocation.grid][quad].status = REJECTED;
    } else {
      branch[correspondingItemLocation.grid][quad].status = SELECTED;
    }
  }
}

function rejectOtherLinkedQuads(branch, itemIndex, grid16Value, grid16) {
  for (let gridItemIndex = 0; gridItemIndex < grid16.length; gridItemIndex++) {
    // Filter out quads that link to this grid item value
    branch[gridItemIndex] = branch[gridItemIndex].filter(quad => {
      if (quad.status === UNUSED) {
        const shouldKeep = !(quad.primaryGridValue === grid16Value || quad.pairedGridValue === grid16Value);
        return shouldKeep;
      }
      return true;
    });
  }
}

function isLastIncompleteOccurrenceOfGridValue(branch, singleIndex, singleGrid16Value) {
  for (let index = 0; index < branch.length; index++) {
    if (index !== singleIndex && 
        branch[index].length > 0 && //Error handling
        branch[index][0].primaryGridValue === singleGrid16Value && 
        branch[index].some(quad => quad.status === UNUSED) {
      return false;
    }
  }
  return true;
}

function linePairsCanFitInTheLine16(linePair1, linePair2, line16original) {
  let line16 = [...line16original];
  let linePair1OK = false;
  let linePair2OK = false;
  let gapAttempt1;

  if (line16.includes(linePair1)) {
    linePair1OK = true;
  } else {
    gapAttempt1 = fitInAGap(linePair1, line16);
    line16 = gapAttempt1.line16;
    linePair1OK = gapAttempt1.ok;
  }

  if (line16.includes(linePair2)) {
    linePair2OK = true;
  } else {
    linePair2OK = fitInAGap(linePair2, line16).ok;
  }

  return linePair1OK && linePair2OK;
}

function fitInAGap(linePair, line16) {
  // Check if it's smaller than the first item
  if (line16[0] > linePair) {
    return { "line16": line16, ok: false }
  }

  // Check if there's a gap before values that equal the linePair, or before the first one that's greater than it
  for (let index = 1; index < line16.length; index++) {
    if (linePair <= line16[index]) {
      if (line16[index - 1] === BLANK_LINE_ITEM) {
        line16.splice(index - 1, 1);
        return { "line16": line16, ok: true }
      }
      if (linePair < line16[index]) {
        break;
      }
    }
  }

  // Check if there's a gap at the end of the array
  if (line16[line16.length - 1] === BLANK_LINE_ITEM) {
    line16.splice(line16.length - 1, 1);
    return { "line16": line16, ok: true }
  }

  return { "line16": line16, ok: false }
}
