import {
  PRODUCT_SIGNIFIER,
  SUM_SIGNIFIER,
  UNUSED,
  SELECTED,
  REJECTED,
  NOT_FOUND,
  BROKEN_BRANCH,
  isBrokenBranch
} from './sharedValuesAndTools.js';

export function deduce(branch, grid16, line16) {
  let thereMayBeFurtherDeductions = true;
  
  while (thereMayBeFurtherDeductions && !isBrokenBranch(branch)) {
    const result = deduceFromSingleQuads(branch, grid16);
    branch = result.branch;
    thereMayBeFurtherDeductions = result.furtherDeductions;
  } 

  return branch;
}

function deduceFromSingleQuads(branch, grid16) {
  const singleQuadLocation = getSingleQuadLocation(branch, grid16);
  if (singleQuadLocation === NOT_FOUND) { return { branch: branch, furtherDeductions: false }; }

  const singleQuad = branch[singleQuadLocation.grid][singleQuadLocation.quad];
  singleQuad.status = SELECTED;

  const correspondingQuadLocation = getCorrespondingQuadLocation(branch, singleQuadLocation, singleQuad, grid16);
  if (correspondingQuadLocation === NOT_FOUND) { return { branch: BROKEN_BRANCH, furtherDeductions: false }; }

  const correspondingQuad = branch[correspondingQuadLocation.grid][correspondingQuadLocation.quad];
  setStatusesInCorrespondingItem(branch, correspondingQuadLocation);

  const valuesToReject = [];
  if (isLastIncompleteOccurrenceOfGridValue(branch, singleQuadLocation.grid, singleQuad.primaryGridValue)) { valuesToReject.push(singleQuad.primaryGridValue); }
  if (isLastIncompleteOccurrenceOfGridValue(branch, correspondingQuadLocation.grid, correspondingQuad.primaryGridValue)) { valuesToReject.push(correspondingQuad.primaryGridValue); }
  rejectOtherLinkedQuads(branch, singleQuadLocation.grid, correspondingQuadLocation.grid, valuesToReject);

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
        && singleQuadLocation.grid !== gridIndex
        && quads.length > 0) {
        
        quadIndex = quads.findIndex(quad => quad.status === UNUSED 
          && quad.pairedGridValue === singleQuad.primaryGridValue 
          && quad.operationType !== singleQuad.operationType
        );
        
        if (quadIndex !== -1) {
          return { grid: gridIndex, quad: quadIndex };
        }
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

function isLastIncompleteOccurrenceOfGridValue(branch, gridIndex, gridValue) {
  for (let index = 0; index < branch.length; index++) {
    if (index !== gridIndex && 
        branch[index].length > 0 && //Error handling
        branch[index][0].primaryGridValue === gridValue &&
        branch[index].some(quad => quad.status === UNUSED) {
      return false;
    }
  }
  return true;
}

function rejectOtherLinkedQuads(branch, excludeItem1, excludeItem2, valuesToReject) {
  if (valuesToReject.length === 0) return;
  
  for (let gridIndex = 0; gridIndex < branch.length; gridIndex++) {
    if (gridIndex !== excludeItem1 && gridIndex !== excludeItem2) {
      for (let quad of branch[gridIndex]) {
        if (valuesToReject.includes(quad.pairedGridValue)) {
          quad.status = REJECTED;
        }
      }
    }
  }
}

function deduceFromLine16(branch, line16) {
  const workingLine = [...line16];
  fillLineWithSelectedQuads(branch, line16);
  /*
  for (unused quads in branch) {
    if (!linePairsCanFitInTheLine16) {
      reject them;
  }
  */
}

function fillLineWithSelectedQuads(branch, line16) {
  
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
