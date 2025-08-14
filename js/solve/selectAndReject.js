import {
  UNUSED,
  REJECTED
} from './sharedValuesAndTools.js';

export function pairSelectAndReject(branch, quad1Location, quad1, quad2Location, quad2) {
  pairUpLocations (branch, quad1Location, quad2Location);
  rejectBrokenLinksInOtherQuads (branch, quad1Location, quad1, quad2Location, quad2);
}

function rejectBrokenLinksInOtherQuads (branch, quad1Location, quad1, quad2Location, quad2) {
  const valuesToReject = [];
  if (isLastIncompleteOccurrenceOfGridValue(branch, quad1Location.grid, quad1.value)) { valuesToReject.push(quad1.value); }
  if (isLastIncompleteOccurrenceOfGridValue(branch, quad2Location.grid, quad2.value)) { valuesToReject.push(quad2.value); }
  rejectOtherLinkedQuads(branch, quad1Location.grid, quad2Location.grid, valuesToReject);
}

function pairUpLocations (branch, quad1Location, quad2Location) {
  selectThisQuadAndRejectOthers(branch, quad1Location, quad2Location.grid);
  selectThisQuadAndRejectOthers(branch, quad2Location, quad1Location.grid);
}

function selectThisQuadAndRejectOthers(branch, quadLocation, gridPairIndex) {
  for (let quad = 0; quad < branch[quadLocation.grid].length; quad++) {
    if (quad !== quadLocation.quad) {
      branch[quadLocation.grid][quad].gridPairIndex = REJECTED;
    } else {
      branch[quadLocation.grid][quad].gridPairIndex = gridPairIndex;
    }
  }
}

function isLastIncompleteOccurrenceOfGridValue(branch, gridIndex, gridValue) {
  for (let index = 0; index < branch.length; index++) {
    if (index !== gridIndex && 
        branch[index][0].value === gridValue &&
        branch[index].some(quad => quad.gridStatus === UNUSED)) {
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
        if (valuesToReject.includes(quad.pairedValue) && quad.gridStatus === UNUSED) {
          quad.gridStatus = REJECTED;
        }
      }
    }
  }
}
