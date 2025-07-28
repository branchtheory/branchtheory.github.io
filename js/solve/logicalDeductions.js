// rather than removing bad quads, mark their status as "rejected"
// move splitter to be the last port of call, and to be a part of logical deductions? -- it's bifurcation, and it's often a valid (and sometimes the only) way of moving forward
// 

import {
  PRODUCT_SIGNIFIER,
  SUM_SIGNIFIER,
  UNUSED,
  DONE,
  NOT_FOUND,
  BROKEN_BRANCH
} from './sharedValuesAndTools.js';

export function deduceFromSingles(firstBranch, grid16) {
  let thereMayBeFurtherLogicalDeductionsToMake;
  let workingBranch = [...firstBranch];
  
  do {
    const result = deduceFromGridItemsWithASingleQuad(workingBranch, grid16);
    workingBranch = result.branch;
    thereMayBeFurtherLogicalDeductionsToMake = result.furtherDeductions;
  } while (thereMayBeFurtherLogicalDeductionsToMake);

  return workingBranch;
}

export function deduceAfterASplit(firstBranch, grid16) {
  const singleQuadItemGrid16Index = getTheIndexOfTheGridItemContainingTheSingleQuad(firstBranch, grid16);
  const singleQuadItemGrid16Value = grid16[singleQuadItemGrid16Index];

  const correspondingItemGrid16Value = getCorrespondingItemGridItemValue(firstBranch, singleQuadItemGrid16Index, singleQuadItemGrid16Value);
  const correspondingItemGrid16Index = getCorrespondingGridItemIndex(firstBranch, singleQuadItemGrid16Index, correspondingItemGrid16Value, grid16);

  if (correspondingItemGrid16Index === NOT_FOUND) {
    return BROKEN_BRANCH;
  }

  removeQuadsInTheCorrespondingGridItemExceptTheOneThatLinksWithTheSingle(firstBranch, singleQuadItemGrid16Index, correspondingItemGrid16Index);
  removeOtherQuadsThatLinkToAGridItem(firstBranch, correspondingItemGrid16Index, correspondingItemGrid16Value, grid16);
  removeOtherQuadsThatLinkToAGridItem(firstBranch, singleQuadItemGrid16Index, singleQuadItemGrid16Value, grid16);

  return firstBranch;
}

function deduceFromGridItemsWithASingleQuad(firstBranch, grid16) {
  const singleQuadItemGrid16Index = getTheIndexOfTheGridItemContainingTheSingleQuad(firstBranch, grid16);

  if (singleQuadItemGrid16Index === NOT_FOUND) {
    return { branch: firstBranch, furtherDeductions: false };
  }

  const singleQuadItemGrid16Value = grid16[singleQuadItemGrid16Index];

  const correspondingItemGrid16Value = getCorrespondingItemGridItemValue(firstBranch, singleQuadItemGrid16Index, singleQuadItemGrid16Value);
  const correspondingItemGrid16Index = getCorrespondingGridItemIndex(firstBranch, singleQuadItemGrid16Index, correspondingItemGrid16Value, grid16);

  if (correspondingItemGrid16Index === NOT_FOUND) {
    return { branch: BROKEN_BRANCH, furtherDeductions: false };
  }

  removeQuadsInTheCorrespondingGridItemExceptTheOneThatLinksWithTheSingle(firstBranch, singleQuadItemGrid16Index, correspondingItemGrid16Index);
  removeOtherQuadsThatLinkToAGridItem(firstBranch, correspondingItemGrid16Index, correspondingItemGrid16Value, grid16);

  return { branch: firstBranch, furtherDeductions: true };
}

function getTheIndexOfTheGridItemContainingTheSingleQuad(firstBranch, grid16) {
  for (let gridItem = 0; gridItem < grid16.length; gridItem++) {
    if (firstBranch[gridItem].length === 1 && firstBranch[gridItem][0].status === UNUSED) {
      return gridItem;
    }
  }
  return NOT_FOUND;
}

function getCorrespondingGridItemIndex(firstBranch, singleQuadItemGrid16Index, correspondingItemGrid16Value, grid16) {
  for (let gridItemIndex = 0; gridItemIndex < grid16.length; gridItemIndex++) {
    if (grid16[gridItemIndex] === correspondingItemGrid16Value &&
        firstBranch[gridItemIndex].length > 0 &&
        firstBranch[gridItemIndex][0].status === UNUSED &&
        firstBranch[singleQuadItemGrid16Index] !== firstBranch[gridItemIndex]) {
      return gridItemIndex;
    }
  }
  return NOT_FOUND;
}

function getCorrespondingItemGridItemValue(firstBranch, singleQuadItemGrid16Index, singleQuadItemGrid16Value) {
  const quad = firstBranch[singleQuadItemGrid16Index][0];
  return singleQuadItemGrid16Value === quad.primaryGridValue ? quad.pairedGridValue : quad.primaryGridValue;
}

function removeQuadsInTheCorrespondingGridItemExceptTheOneThatLinksWithTheSingle(firstBranch, singleQuadItemGrid16Index, correspondingItemGrid16Index) {
  firstBranch[singleQuadItemGrid16Index][0].status = DONE;
  
  // Copy the quad object and flip the operation type
  const linkedQuad = { ...firstBranch[singleQuadItemGrid16Index][0] };
  linkedQuad.operationType = linkedQuad.operationType === SUM_SIGNIFIER ? PRODUCT_SIGNIFIER : SUM_SIGNIFIER;
  // Swap primary and paired grid values for the linked quad
  const tempValue = linkedQuad.primaryGridValue;
  linkedQuad.primaryGridValue = linkedQuad.pairedGridValue;
  linkedQuad.pairedGridValue = tempValue;
  
  // Replace the entire array with just the linked quad
  firstBranch[correspondingItemGrid16Index] = [linkedQuad];
}

function removeOtherQuadsThatLinkToAGridItem(firstBranch, itemIndex, grid16Value, grid16) {
  if (isLastOccurrenceOfGridValue(firstBranch, itemIndex, grid16Value)) {
    for (let gridItemIndex = 0; gridItemIndex < grid16.length; gridItemIndex++) {
      // Filter out quads that link to this grid item value
      firstBranch[gridItemIndex] = firstBranch[gridItemIndex].filter(quad => {
        if (quad.status === UNUSED) {
          const shouldKeep = !(quad.primaryGridValue === grid16Value || quad.pairedGridValue === grid16Value);
          return shouldKeep;
        }
        return true;
      });
    }
  }
}

function isLastOccurrenceOfGridValue(firstBranch, itemIndex, grid16Value) {
  for (let index = 0; index < firstBranch.length; index++) {
    if (index !== itemIndex && 
        firstBranch[index].length > 0 && //Error handling
        firstBranch[index][0].primaryGridValue === grid16Value && 
        firstBranch[index][0].status === "unused") {
      return false;
    }
  }
  return true;
}
