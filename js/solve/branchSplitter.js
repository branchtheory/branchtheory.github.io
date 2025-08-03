import {
  NUMBER_OF_GRID_ITEMS,
  SELECTED,
  REJECTED,
  UNUSED,
  NOT_FOUND,
} from './sharedValuesAndTools.js';

export function splitFirstBranch(branchQueue) {
  const indexOfGridItemToSplit = getIndexOfGridItemToSplit(branchQueue.firstBranch);
  if (indexOfGridItemToSplit === NOT_FOUND) return;

  createANewBranchForEachQuad(branchQueue, indexOfGridItemToSplit);
  branchQueue.removeFirstBranch();
}

function getIndexOfGridItemToSplit(branch) {
  for (let gridItemIndex = 0; gridItemIndex < NUMBER_OF_GRID_ITEMS; gridItemIndex++) {
    if (branch[gridItemIndex].some(quad => quad.status === SELECTED)) {
      continue;
    }
    if (branch[gridItemIndex].filter(quad => quad.status === UNUSED).length >= 2) {
      return gridItemIndex;
    }
  }
  return NOT_FOUND;
}

function createANewBranchForEachQuad(branchQueue, indexOfGridItemToSplit) {
  const gridItem = branchQueue.firstBranch[indexOfGridItemToSplit];

  gridItem.forEach((quad, quadIndex) => {
    if (quad.status === UNUSED) {
      const branchCopy = deepCopyABranch(branchQueue.firstBranch);
      const copiedGridItem = branchCopy[indexOfGridItemToSplit];

      copiedGridItem.forEach((copiedQuad, i) => {
        copiedQuad.status = (i === quadIndex) ? UNUSED : REJECTED;
      });

      branchQueue.createNewBranch(branchCopy);
    }
  });
}

export function deepCopyABranch(branch) {
  const branchCopy = Array(NUMBER_OF_GRID_ITEMS).fill(null).map((_, gridItemIndex) =>
    branch[gridItemIndex].map(quad => ({ ...quad }))
  );
  return branchCopy;
}
