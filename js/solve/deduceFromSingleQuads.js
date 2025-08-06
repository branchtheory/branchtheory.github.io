import {
  UNUSED,
  SELECTED,
  NOT_FOUND,
  BROKEN_BRANCH,
  isBrokenBranch
} from './sharedValuesAndTools.js';
import {
  pairSelectAndReject,
} from './selectAndReject.js';

export function deduceFromSingleQuads(branch, grid16, optionalSingleLocation, ns) {
  const singleQuadLocation = optionalSingleLocation ?? getSingleQuadLocation(branch, grid16);
  if (singleQuadLocation === NOT_FOUND) { return { branch: branch, furtherDeductions: false }; }
  const singleQuad = branch[singleQuadLocation.grid][singleQuadLocation.quad];

  const correspondingQuadLocation = getCorrespondingQuadLocation(branch, singleQuadLocation, singleQuad, grid16);
  if (correspondingQuadLocation === NOT_FOUND) { return { branch: BROKEN_BRANCH, furtherDeductions: false }; }
  const correspondingQuad = branch[correspondingQuadLocation.grid][correspondingQuadLocation.quad];

  pairSelectAndReject(branch, singleQuadLocation, singleQuad, correspondingQuadLocation, correspondingQuad);
  if (isBrokenBranch(branch)) { return { branch: BROKEN_BRANCH, furtherDeductions: false }; }

  return optionalSingleLocation === undefined ? { branch, furtherDeductions: true } : branch;
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
