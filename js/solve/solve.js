import { BranchQueue } from './branchQueue.js';
import { isPotentialSolution, isValidSolution } from './solutionChecker.js';
import { deduce } from './logicalDeductions.js';
import { splitFirstBranch, deepCopyABranch } from './branchSplitter.js';
import { isBrokenBranch, getLine16FromFinishedBranch, BLANK_LINE_ITEM } from './sharedValuesAndTools.js';
import { findPotentialQuads } from './potentialQuadsFinder.js';

export function getSolution(grid16original, line16original) {
  const grid16 = [...grid16original];
  const line16 = fillBetweenLine16Duplicates([...line16original]);

  const potentialQuads = findPotentialQuads(grid16, line16);
  if (isBrokenBranch(potentialQuads)) {
    return "invalid";
  }

  const branchQueue = new BranchQueue();
  prepBranchQueue(deepCopyABranch(potentialQuads), branchQueue, grid16, line16);

  if (isPotentialSolution(branchQueue.firstBranch)) {
    if (isValidSolution(branchQueue.firstBranch, line16)) {
      return buildSolutionObject([branchQueue.firstBranch], potentialQuads);
    } else {
      return "invalid";
    }
  }

  const solutions = loopBranchDeductions(branchQueue, grid16, line16)

  if (solutions.length === 0) {
    return "invalid";
  } else {
    return buildSolutionObject(solutions, potentialQuads);
  }
}

function loopBranchDeductions(branchQueue, grid16, line16) {
  let solutions = [];
  splitFirstBranch(branchQueue);

  while (!branchQueue.isEmpty()) {
    branchQueue.setFirstBranch();

    branchQueue.firstBranch = deduce(branchQueue.firstBranch, grid16, line16);

    if (isBrokenBranch(branchQueue.firstBranch)) {
      branchQueue.removeFirstBranch();
    } else if (isPotentialSolution(branchQueue.firstBranch)) {
      if (isValidSolution(branchQueue.firstBranch, line16)) {
        solutions.push(deepCopyABranch(branchQueue.firstBranch));
      }
      branchQueue.removeFirstBranch();
    } else {
      splitFirstBranch(branchQueue);
    }
  }
  return solutions;
}

function buildSolutionObject(solutions, potentialQuads) {
  let line16OfSolutions = [];
  for (let s of solutions) {
    line16OfSolutions.push(getLine16FromFinishedBranch(s));
  }

  return {
    lines: line16OfSolutions,
    partialSolution: potentialQuads,
    grids: solutions,
  }
}

function prepBranchQueue(initialQuads, branchQueue, grid16, line16) {
  branchQueue.createNewBranch(initialQuads);
  branchQueue.setFirstBranch();
  branchQueue.firstBranch = deduce(branchQueue.firstBranch, grid16, line16);
}

function fillBetweenLine16Duplicates(line16) {
  const result = [...line16];

  const valuePositions = {};

  line16.forEach((value, index) => {
    if (value !== 0) {
      if (!valuePositions[value]) {
        valuePositions[value] = [];
      }
      valuePositions[value].push(index);
    }
  });

  for (const [valueString, positions] of Object.entries(valuePositions)) {
    const value = Number(valueString);

    if (positions.length < 2) continue;

    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i];
      const end = positions[i + 1];

      const between = line16.slice(start + 1, end);
      if (between.every(v => v === BLANK_LINE_ITEM)) {
        for (let j = start + 1; j < end; j++) {
          result[j] = value;
        }
      }
    }
  }

  return result;
}
