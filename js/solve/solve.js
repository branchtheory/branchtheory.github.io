import { BranchQueue } from './branchQueue.js';
import { isPotentialSolution, isValidSolution } from './solutionChecker.js';
import { deduce } from './logicalDeductions.js';
import { splitFirstBranch, deepCopyABranch } from './branchSplitter.js';
import { isBrokenBranch, NUMBER_OF_GRID_ITEMS, SUM_SIGNIFIER } from './sharedValuesAndTools.js';
import { findPotentialQuads } from './potentialQuadsFinder.js';

export function getSolution(grid16original, line16original) {
  const grid16 = [...grid16original];
  const line16 = [...line16original];

  const potentialQuads = findPotentialQuads(grid16, line16);
  if (isBrokenBranch(potentialQuads)) {
    return "invalid";
  }

  const branchQueue = new BranchQueue();
  prepBranchQueue(potentialQuads, branchQueue, grid16);

  if (isPotentialSolution(branchQueue.firstBranch)) {
    if (isValidSolution(branchQueue.firstBranch, line16)) {
      console.log(buildSolutionObject([branchQueue.firstBranch], potentialQuads));
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

function loopBranchDeductions(branchQueue, grid16, line16,ns) {
  let solutions = [];

  splitFirstBranch(branchQueue);

  while (!branchQueue.isEmpty()) {
    branchQueue.setFirstBranch();
    
    branchQueue.firstBranch = deduce(branchQueue.firstBranch, grid16);

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
  let gridSolutions = [];
  for (let s of solutions) {
    gridSolutions.push(convertSolutionToOutput(s));
    line16OfSolutions.push(extractLine16FromSolution(s))
  }
  const initialExpansion = convertInitialExpansionToOutput(potentialQuads);
  return {
    lines: line16OfSolutions,
    partialSolution: initialExpansion,
    grids: gridSolutions,
  }
}

function prepBranchQueue(initialQuads, branchQueue, grid16) {
  branchQueue.createNewBranch(initialQuads);
  branchQueue.setFirstBranch();
  branchQueue.firstBranch = deduceFromSingles(branchQueue.firstBranch, grid16);
}

function convertInitialExpansionToOutput(initialExpansion) {
  return initialExpansion.map(group => {
    if (!Array.isArray(group) || group.length === 0) return null;

    const primaryGridValue = group[0].primaryGridValue;

    const transformedObjects = group.map(obj => {
      const operationType = obj.operationType === 'sum' ? '+' : '×';

      return {
        operation: operationType,
        primaryValue: obj.primaryGridValue,
        pairedValue: obj.pairedGridValue,
        operands: [obj.operand1, obj.operand2]
      };
    });

    return [primaryGridValue, transformedObjects];
  }).filter(Boolean); // Filter out any nulls in case of bad input
}

function convertSolutionToOutput(solution) {
  return solution.map(innerArray => {
    const obj = innerArray[0];
    const operationType = obj.operationType === 'sum' ? '+' : '×';

    return {
      operation: operationType,
      value: obj.primaryGridValue,
      operands: [obj.operand1, obj.operand2]
    };
  });
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
