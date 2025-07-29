// rather than removing bad quads, mark their status as "rejected"
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
  const singleQuadLoc = getTheLocationOfTheSingleQuad(branch, grid16);
  const singleQuadItemGrid16Value = grid16[singleQuadItemGrid16Index];

  const correspondingItemGrid16Value = getCorrespondingItemGridItemValue(branch, singleQuadItemGrid16Index, singleQuadItemGrid16Value);
  const correspondingItemGrid16Index = getCorrespondingGridItemIndex(branch, singleQuadItemGrid16Index, correspondingItemGrid16Value, grid16);

  if (correspondingItemGrid16Index === NOT_FOUND) {
    return BROKEN_BRANCH;
  }

  removeQuadsInTheCorrespondingGridItemExceptTheOneThatLinksWithTheSingle(branch, singleQuadItemGrid16Index, correspondingItemGrid16Index);
  removeOtherQuadsThatLinkToAGridItem(branch, correspondingItemGrid16Index, correspondingItemGrid16Value, grid16);
  removeOtherQuadsThatLinkToAGridItem(branch, singleQuadItemGrid16Index, singleQuadItemGrid16Value, grid16);

  return branch;
}

function deduceFromGridItemsWithASingleQuad(branch, grid16) {
  const singleQuadLoc = getTheLocationOfTheSingleQuad(branch, grid16);
  
  if (singleQuadLoc === NOT_FOUND) {
    return { branch: branch, furtherDeductions: false };
  }

  branch[singleQuadLoc.gridIndex][singleQuadLoc.quadIndex].status = SELECTED;
  const singleQuadItemGrid16Value = grid16[singleQuadLoc.gridIndex];

  const correspondingItemGrid16Value = branch[singleQuadLoc.gridIndex][singleQuadLoc.quadIndex].pairedGridValue;
  const correspondingItemGrid16Loc = getCorrespondingGridItemIndex(branch, singleQuadLoc, singleQuadItemGrid16Value, correspondingItemGrid16Value, grid16);

  if (correspondingItemGrid16Loc === NOT_FOUND) {
    return { branch: BROKEN_BRANCH, furtherDeductions: false };
  }

  removeQuadsInTheCorrespondingGridItemExceptTheOneThatLinksWithTheSingle(branch, singleQuadItemGrid16Index, correspondingItemGrid16Index);
  removeOtherQuadsThatLinkToAGridItem(branch, correspondingItemGrid16Index, correspondingItemGrid16Value, grid16);

  return { branch: branch, furtherDeductions: true };
}

function getTheLocationOfTheSingleQuad(branch, grid16) {
  for (let gridIndex = 0; gridIndex < grid16.length; gridIndex++) {
    const items = branch[gridIndex];

    const unused = items.filter(item => item.status === UNUSED);
    const hasSelected = items.some(item => item.status === SELECTED);

    if (unused.length === 1 && !hasSelected) {
      const quadIndex = items.findIndex(item => item.status === UNUSED);
      return { gridIndex, quadIndex };
    }
  }

  return NOT_FOUND;
}

function getCorrespondingGridItemIndex(branch, singleQuadLoc, singleQuadItemGrid16Value, correspondingItemGrid16Value, grid16) {
  for (let gridIndex = 0; gridIndex < grid16.length; gridIndex++) {
    if (grid16[gridIndex] === correspondingItemGrid16Value &&
        branch[gridIndex].length > 0 &&
        items.some(item => item.status === UNUSED && item.pairedGridValue === singleQuadItemGrid16Value && 
            item.operationType !== branch[singleQuadLoc.gridIndex][singleQuadLoc.quadIndex].operationType) &&
        singleQuadLoc.gridIndex !== gridIndex) {
      const quadIndex = items.findIndex(item => item.status === UNUSED && item.pairedGridValue === singleQuadItemGrid16Value && 
            item.operationType !==  branch[singleQuadLoc.gridIndex][singleQuadLoc.quadIndex].operationType);
      return { gridIndex, quadIndex };
    }
  }
  return NOT_FOUND;
}

function removeQuadsInTheCorrespondingGridItemExceptTheOneThatLinksWithTheSingle(branch, singleQuadItemGrid16Index, correspondingItemGrid16Index) {
  let unused = branch[singleQuadItemGrid16Index].filter(quad => quad.status === UNUSED);
  if (unused.length > 0) {
    for (let quad of unused) {
      quad.status = REJECTED;
    }
  }
  
  // Copy the quad object and flip the operation type
  const linkedQuad = { ...branch[singleQuadItemGrid16Index][0] };
  linkedQuad.operationType = linkedQuad.operationType === SUM_SIGNIFIER ? PRODUCT_SIGNIFIER : SUM_SIGNIFIER;
  // Swap primary and paired grid values for the linked quad
  const tempValue = linkedQuad.primaryGridValue;
  linkedQuad.primaryGridValue = linkedQuad.pairedGridValue;
  linkedQuad.pairedGridValue = tempValue;
  
  // Replace the entire array with just the linked quad
  branch[correspondingItemGrid16Index] = [linkedQuad];
}

function removeOtherQuadsThatLinkToAGridItem(branch, itemIndex, grid16Value, grid16) {
  if (isLastOccurrenceOfGridValue(branch, itemIndex, grid16Value)) {
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
}

function isLastOccurrenceOfGridValue(branch, itemIndex, grid16Value) {
  for (let index = 0; index < branch.length; index++) {
    if (index !== itemIndex && 
        branch[index].length > 0 && //Error handling
        branch[index][0].primaryGridValue === grid16Value && 
        branch[index][0].status === "unused") {
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
