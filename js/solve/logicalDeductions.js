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
  const singleQuadLocation = getSingleQuadLocation(branch, grid16);
  const singleGrid16Value = grid16[singleQuadItemGrid16Index];

  const correspondingQuadGrid16Value = getCorrespondingItemGridItemValue(branch, singleQuadItemGrid16Index, singleGrid16Value);
  const correspondingItemGrid16Index = getCorrespondingQuadLocation(branch, singleQuadItemGrid16Index, correspondingQuadGrid16Value, grid16);

  if (correspondingItemGrid16Index === NOT_FOUND) {
    return BROKEN_BRANCH;
  }

  setStatusesInCorrespondingItem(branch, correspondingItemGrid16Index);
  rejectOtherLinkedQuads(branch, correspondingItemGrid16Index, correspondingQuadGrid16Value, grid16);
  rejectOtherLinkedQuads(branch, singleQuadItemGrid16Index, singleGrid16Value, grid16);

  return branch;
}

function deduceFromGridItemsWithASingleQuad(branch, grid16) {
  const singleQuadLocation = getSingleQuadLocation(branch, grid16);
  
  if (singleQuadLocation === NOT_FOUND) {
    return { branch: branch, furtherDeductions: false };
  }

  const singleQuad = branch[singleQuadLocation.grid][singleQuadLocation.quad];
  singleQuad.status = SELECTED;

  const correspondingQuadLocation = getCorrespondingQuadLocation(branch, singleQuadLocation, singleQuad, grid16);

  if (correspondingQuadLocation === NOT_FOUND) {
    return { branch: BROKEN_BRANCH, furtherDeductions: false };
  }

  const correspondingQuad = branch[correspondingQuadLocation.grid][correspondingQuadLocation.quad];
  
  setStatusesInCorrespondingItem(branch, singleQuad, correspondingQuadLocation);
  if (isLastIncompleteOccurrenceOfGridValue(branch, singleQuadLocation.grid, singleQuad.primaryGridValue)) {
    rejectOtherLinkedQuads(branch, singleQuadLocation, correspondingQuadLocation, singleQuad, grid16);
  }

  return { branch: branch, furtherDeductions: true };
}

function getSingleQuadLocation(branch, grid16) {
  for (let gridIndex = 0; gridIndex < grid16.length; gridIndex++) {
    const quads = branch[gridIndex];

    const unused = quads.filter(quad => quad.status === UNUSED);
    const hasSelected = quads.some(quad => quad.status === SELECTED);

    if (unused.length === 1 && !hasSelected) {
      const quadIndex = quads.findIndex(quad => quad.status === UNUSED);
      return { grid: gridIndex, quad: quadIndex };
    }
  }

  return NOT_FOUND;
}

function getCorrespondingQuadLocation(branch, singleQuadLocation, singleQuad, grid16) {
  for (let gridIndex = 0; gridIndex < grid16.length; gridIndex++) {
    let quads = branch[gridIndex];
    let quadIndex;
    if (grid16[gridIndex] === singleQuad.pairedGridValue
        && singleQuadLocation.gridIndex !== gridIndex
        && quads.length > 0 
        && quads.some(quad => quad.status === UNUSED  
          && singleQuad.primaryGridValue === quad.pairedGridValue
          && singleQuad.operationType !== quad.operationType) 
        ) {
        quadIndex = quads.findIndex(quad => quad.status === UNUSED 
          && quad.pairedGridValue === singleQuad.primaryGridValue 
          && quad.operationType !==  singleQuad.operationType
        );
      return { grid: gridIndex, quad: quadIndex };
    }
  }
  return NOT_FOUND;
}

function setStatusesInCorrespondingItem(branch, correspondingQuadLocation) {
  for (let quad = 0; quad < branch[correspondingQuadLocation.grid].length; quad++) {
    if (quad !== correspondingQuadLocation.quad) {
      branch[correspondingQuadLocation.grid][quad].status = REJECTED;
    } else {
      branch[correspondingQuadLocation.grid][quad].status = SELECTED;
    }
  }
}

function rejectOtherLinkedQuads(branch, singleQuadLocation, correspondingQuadLocation, singleQuad, grid16) {
  for (let gridIndex = 0; gridIndex < grid16.length; gridIndex++) {
    if (gridIndex !== singleQuadLocation.grid || gridIndex !== correspondingQuadLocation.grid) {
      for (let quad of branch[gridIndex]) {
        if (quad.pairedGridValue === singleQuad.primaryGridValue) {
          quad.status = REJECTED;
        }
      }
    }
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
