import { BranchQueue } from './branchQueue.js';
import { isPotentialSolution, isValidSolution } from './solutionChecker.js';
import { deduceFromSingles, deduceAfterASplit } from './logicalDeductions.js';
import { splitFirstBranch } from './branchSplitter.js';
import { BROKEN_BRANCH, isBrokenBranch, NUMBER_OF_GRID_ITEMS } from './sharedValuesAndTools.js';
import { findPotentialQuads } from './potentialQuadsFinder.js';

export function getSolution (grid16, line16) {
  console.log(grid16original);
  console.log(line16original);
  const result = solve(grid16, line16);
  console.log(result);
  if (isBrokenBranch(result) || isBrokenBranch(result.solution)) {
    return("invalid");
  } else {
    const line16OfSolution = extractLine16FromSolution(result.solution);
    const gridSolution = convertSolutionToOutput(result.solution);
    const initialExpansion = convertInitialExpansionToOutput(result.initialExpansion);
    return {
      line: line16OfSolution,
      grid: gridSolution,
      crunchedNumbers: initialExpansion
    }
  }
}

export function solve(grid16, line16) {
  const potentialQuads = findPotentialQuads(grid16, line16);
  console.log(potentialQuads);
  if (isBrokenBranch(potentialQuads)) {
    return "invalid";
  }

  const branchQueue = new BranchQueue();
  prepBranchQueue(potentialQuads, branchQueue, grid16);

  if (!isPotentialSolution(branchQueue.firstBranch)) {
    return {
      initialExpansion: potentialQuads,
      solution: loopBranchDeductions(branchQueue, grid16, line16)
    }
  } else {
    if (isValidSolution(branchQueue.firstBranch, line16)) {
      return {
        initialExpansion: potentialQuads,
        solution: branchQueue.firstBranch
      }
    } else {
      return BROKEN_BRANCH;
    }
  }
}

function prepBranchQueue(initialQuads, branchQueue, grid16) {
  branchQueue.createNewBranch(initialQuads);
  branchQueue.setFirstBranch();
  branchQueue.firstBranch = deduceFromSingles(branchQueue.firstBranch, grid16);
}

function loopBranchDeductions(branchQueue, grid16, line16) {
  splitFirstBranch(branchQueue);

  while (!branchQueue.isEmpty()) {
    branchQueue.setFirstBranch();

    branchQueue.firstBranch = deduceAfterASplit(branchQueue.firstBranch, grid16);

    if (!isBrokenBranch(branchQueue.firstBranch)) {
      branchQueue.firstBranch = deduceFromSingles(branchQueue.firstBranch, grid16);
    }

    if (isBrokenBranch(branchQueue.firstBranch)) {
      branchQueue.removeFirstBranch();
    } else if (isPotentialSolution(branchQueue.firstBranch)) {
      if (isValidSolution(branchQueue.firstBranch, line16)) {
        return branchQueue.firstBranch;
      } else {
        branchQueue.removeFirstBranch();
      }
    } else {
      splitFirstBranch(branchQueue);
    }
  }

  return BROKEN_BRANCH;
}

function convertInitialExpansionToOutput(initialExpansion) {
  const result = new Map();

  initialExpansion.forEach(innerArray => {
    const primaryGridValue = innerArray[0].primaryGridValue;

    const transformedObjects = innerArray.map(obj => {
      const operationType = obj.operationType === 'sum' ? '+' : '×';

      return {
        operation: operationType,
        primaryValue: obj.primaryGridValue,
        pairedValue: obj.pairedGridValue,
        operand1: obj.operand1,
        operand2: obj.operand2
      };
    });

    result.set(primaryGridValue, transformedObjects);
  });

  return result;
}


function convertSolutionToOutput(solution) {
  const result = {};
  const objectsPerGroup = 4;

  // Extract all objects from the nested arrays and transform them
  const transformedObjects = solution.map(innerArray => {
    const obj = innerArray[0];
    const operationType = obj.operationType === 'sum' ? '+' : '×';

    return {
      operation: operationType,
      value: obj.primaryGridValue,
      operand1: obj.operand1,
      operand2: obj.operand2
    };
  });

  // Group into chunks of 4 and assign to numbered keys
  for (let i = 0; i < transformedObjects.length; i += objectsPerGroup) {
    const groupNumber = Math.floor(i / objectsPerGroup) + 1;
    result[groupNumber] = transformedObjects.slice(i, i + objectsPerGroup);
  }

  return result;
}


function extractLine16FromSolution(solution) {
  if (isBrokenBranch(solution)) return null;

  const finishedLine16 = new Array(NUMBER_OF_GRID_ITEMS).fill(0);
  let putIndex = 0;

  for (let gridItem = 0; gridItem < NUMBER_OF_GRID_ITEMS; gridItem++) {
    const quad = solution[gridItem][0];
    if (quad.operationType === SUM_SIGNIFIER) {
      finishedLine16[putIndex] = quad.operand1;
      finishedLine16[putIndex + 1] = quad.operand2;
      putIndex += 2;
    }
  }

  return finishedLine16.slice().sort((a, b) => a - b);
}
