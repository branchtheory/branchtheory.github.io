import {
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
  if (isLastIncompleteOccurrenceOfGridValue(branch, singleQuadLocation.grid, singleQuad.value)) { valuesToReject.push(singleQuad.value); }
  if (isLastIncompleteOccurrenceOfGridValue(branch, correspondingQuadLocation.grid, correspondingQuad.value)) { valuesToReject.push(correspondingQuad.value); }
  rejectOtherLinkedQuads(branch, singleQuadLocation.grid, correspondingQuadLocation.grid, valuesToReject);
  if (isBrokenBranch(branch)) { return { branch: BROKEN_BRANCH, furtherDeductions: false }; }

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
    if (grid16[gridIndex] === singleQuad.pairedValue
        && singleQuadLocation.grid !== gridIndex
        && quads.length > 0) {
        
        quadIndex = quads.findIndex(quad => quad.status === UNUSED 
          && quad.pairedValue === singleQuad.value 
          && quad.operation !== singleQuad.operation
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
        branch[index][0].value === gridValue &&
        branch[index].some(quad => quad.status === UNUSED)) {
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
        if (valuesToReject.includes(quad.pairedValue) && quad.status === UNUSED) {
          quad.status = REJECTED;
        }
      }
    }
  }
}
