import {
  NUMBER_OF_GRID_ITEMS,
  UNUSED,
  NOT_FOUND,
} from './sharedValuesAndTools.js';

export function splitFirstBranch(branchQueue) {
  const indexOfGridItemToSplit = getIndexOfGridItemToSplit(branchQueue.firstBranch);
  if (indexOfGridItemToSplit === NOT_FOUND) return;

  createANewBranchForEachQuad(branchQueue, indexOfGridItemToSplit);
  branchQueue.removeFirstBranch();
}

function getIndexOfGridItemToSplit(firstBranch) {
  for (let gridItemIndex = 0; gridItemIndex < NUMBER_OF_GRID_ITEMS; gridItemIndex++) {
    if (firstBranch[gridItemIndex].length > 0 && firstBranch[gridItemIndex].some(quad => quad.status === UNUSED) {
      return gridItemIndex;
    }
  }
  return NOT_FOUND;
}

function createANewBranchForEachQuad(branchQueue, indexOfGridItemToSplit) {
  let quadIndex = 0;

  while (quadIndex < branchQueue.firstBranch[indexOfGridItemToSplit].length) {
    const branchCopy = deepCopyABranch(branchQueue.firstBranch);
    setThisQuadToBeTheOnlyQuadInThisGridItem(branchCopy, indexOfGridItemToSplit, quadIndex);
    branchQueue.createNewBranch(branchCopy);
    quadIndex++;
  }
}

export function deepCopyABranch(firstBranch) {
  const branchCopy = Array(NUMBER_OF_GRID_ITEMS).fill(null).map((_, gridItemIndex) =>
    firstBranch[gridItemIndex].map(quad => ({ ...quad }))
  );
  return branchCopy;
}

function setThisQuadToBeTheOnlyQuadInThisGridItem(branchCopy, indexOfGridItemToSplit, quadIndex) {
  const selectedQuad = branchCopy[indexOfGridItemToSplit][quadIndex];
  branchCopy[indexOfGridItemToSplit] = [{ ...selectedQuad }];
}
