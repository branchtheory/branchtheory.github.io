import { BranchQueue } from './branchQueue.js';
import { isPotentialSolution, isValidSolution } from './solutionChecker.js';
import { deduce } from './logicalDeductions.js';
import { splitFirstBranch, deepCopyABranch } from './branchSplitter.js';
import { isBrokenBranch, getLine16FromFinishedBranch, BLANK_LINE_ITEM } from './sharedValuesAndTools.js';
import { findPotentialQuads } from './potentialQuadsFinder.js';

export async function main(ns) {
  const startTime = performance.now();
  const failures = [];

  for (const p in puzzles) {
    ns.tprint("");
    ns.tprint("=====");
    ns.tprint(p);
    const grid16 = puzzles[p].grid16;
    let line16 = puzzles[p].line16;
    line16 = fillZerosBetweenLine16Duplicates(line16);
    const result = getSolution(grid16, line16, ns);
    ns.tprint(result.partialSolution);
    //ns.tprint("==== RESULTS ====");

    ns.exit();

    if (puzzles[p].valid ? result === "invalid" : Array.isArray(result)) {
      failures.push(puzzles[p]);
      //ns.tprint("=> invalid")
      // ns.tprint(p);
      // ns.exit();
    } else {
      //      ns.tprint("Solution count: " + result.grids.length);
      // ns.tprint("Grids: " + JSON.stringify(result.grids));
      // ns.tprint("Pot Q: " + JSON.stringify(result.partialSolution));
      // ns.tprint("Line : " + JSON.stringify(result.lines));
    }

  }
  ns.tprint("Failures");
  ns.tprint(JSON.stringify(failures));

  const endTime = performance.now();
  const executionTime = endTime - startTime;
  ns.tprint(`Function executed in ${executionTime} milliseconds.`);
}

export function getSolution(grid16original, line16original, ns) {
  const grid16 = [...grid16original];
  const line16 = fillZerosBetweenLine16Duplicates([...line16original]);

  const potentialQuads = findPotentialQuads(grid16, line16);
  if (isBrokenBranch(potentialQuads)) {
    return "invalid";
  }

  const branchQueue = new BranchQueue();
  prepBranchQueue(deepCopyABranch(potentialQuads), branchQueue, grid16, line16, ns);

  ns.tprint(branchQueue.firstBranch);

  if (isPotentialSolution(branchQueue.firstBranch, ns)) {
    if (isValidSolution(branchQueue.firstBranch, line16)) {
      return buildSolutionObject([branchQueue.firstBranch], potentialQuads);
    } else {
      return "invalid";
    }
  }

  const solutions = loopBranchDeductions(branchQueue, grid16, line16, ns)

  if (solutions.length === 0) {
    return "invalid";
  } else {
    return buildSolutionObject(solutions, potentialQuads);
  }
}

function loopBranchDeductions(branchQueue, grid16, line16, ns) {
  let loops = 0;
  let solutions = [];
  splitFirstBranch(branchQueue);

  while (!branchQueue.isEmpty()) {
    loops++;
    branchQueue.setFirstBranch();

    branchQueue.firstBranch = deduce(branchQueue.firstBranch, grid16, line16, ns);

    if (isBrokenBranch(branchQueue.firstBranch)) {
      branchQueue.removeFirstBranch();
    } else if (isPotentialSolution(branchQueue.firstBranch, ns)) {
      if (isValidSolution(branchQueue.firstBranch, line16)) {
        solutions.push(deepCopyABranch(branchQueue.firstBranch));
        ns.tprint("Loops: " + loops);
        return solutions;
      }
      branchQueue.removeFirstBranch();
    } else {
      splitFirstBranch(branchQueue);
    }
    //ns.tprint(branchQueue.firstBranch);
  }
  ns.tprint("Loops: " + loops);
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

function prepBranchQueue(initialQuads, branchQueue, grid16, line16, ns) {
  branchQueue.createNewBranch(initialQuads);
  branchQueue.setFirstBranch();
  branchQueue.firstBranch = deduce(branchQueue.firstBranch, grid16, line16, ns);
}

function fillZerosBetweenLine16Duplicates(line16) {
  const result = [...line16];

  // Map to track positions of each non-zero value
  const valuePositions = {};

  // Collect all positions for each non-zero value
  line16.forEach((value, index) => {
    if (value !== 0) {
      if (!valuePositions[value]) {
        valuePositions[value] = [];
      }
      valuePositions[value].push(index);
    }
  });

  // Iterate over each value with multiple occurrences
  for (const [valueString, positions] of Object.entries(valuePositions)) {
    const value = Number(valueString);

    if (positions.length < 2) continue;

    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i];
      const end = positions[i + 1];

      const between = line16.slice(start + 1, end);
      if (between.every(v => v === BLANK_LINE_ITEM)) {
        // Fill in between with value
        for (let j = start + 1; j < end; j++) {
          result[j] = value;
        }
      }
    }
  }

  return result;
}

const puzzles = {
  fromAmazon1: {
    "grid16": [60, 23, 13, 6, 12, 112, 17, 48, 22, 18, 105, 30, 26, 7, 19, 9],
    "line16": [0, 0, 2, 3, 3, 3, 0, 6, 0, 8, 12, 14, 0, 16, 0, 21],
    "valid": true,
  },
  longCompletionTime: {
    "grid16": [23, 23, 26, 27, 27, 28, 29, 31, 92, 120, 126, 130, 132, 168, 180, 198],
    "line16": [0, 0, 6, 0, 9, 9, 10, 0, 0, 0, 0, 0, 0, 0, 22, 0],
    "valid": true
  },
  lowNumbersTest: {
    "grid16": [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3],
    "line16": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "valid": true,
    "completedLine16": [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2]
  },
  onesandtwostest: {
    "grid16": [2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1],
    "line16": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "valid": true,
    "completedLine16": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  },
  invalidTetonor: {
    "grid16": [25, 84, 34, 44, 140, 19, 150, 34, 36, 144, 24, 128, 48, 33, 135, 26],
    "line16": [1, 2, 2, 3, 0, 0, 8, 0, 0, 16, 17, 0, 0, 0, 42, 0],
    "valid": false
  },
  completeLine16: {
    "grid16": [24, 36, 12, 80, 17, 18, 11, 15, 16, 24, 20, 20, 15, 75, 56, 63],
    "line16": [1, 2, 3, 3, 4, 5, 7, 7, 8, 8, 9, 10, 12, 15, 17, 20],
    "valid": true,
    "completedLine16": [1, 2, 3, 3, 4, 5, 7, 7, 8, 8, 9, 10, 12, 15, 17, 20]
  },
  fours: {
    "grid16": [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    "line16": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "valid": true,
    "completedLine16": [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
  },
  foursWith2002: {
    "grid16": [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    "line16": [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    "valid": true,
    "completedLine16": [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
  },
  threesAndFours: {
    "grid16": [4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3],
    "line16": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "valid": true,
  },
  invalidTetonor2: {
    "grid16": [160, 23, 13, 6, 12, 112, 17, 48, 22, 18, 105, 30, 26, 7, 19, 9],
    "line16": [0, 0, 2, 3, 3, 3, 0, 6, 0, 8, 12, 14, 0, 16, 0, 21],
    "valid": false
  },
  invalid3: {
    "grid16": [11.5, 196, 66, 29, 40, 28, 100, 25, 168, 144, 26, 380, 204, 35, 160, 39],
    "line16": [0, 0, 6, 7, 0, 0, 12, 14, 16, 0, 20, 0, 0, 25, 0, 34],
    "valid": false,
  },
  fromReddit: {
    "grid16": [38, 500, 37, 28, 420, 50, 256, 40, 41, 264, 32, 336, 192, 52, 342, 60],
    "line16": [0, 6, 8, 0, 0, 0, 18, 19, 0, 21, 24, 0, 0, 0, 0, 50],
    "valid": true,
  },
  newspaperWithMultipleSolutions: {
    "grid16": [16, 64, 100, 84, 63, 150, 20, 53, 120, 29, 124, 31, 23, 96, 35, 102],
    "line16": [0, 0, 3, 4, 5, 0, 8, 8, 0, 0, 0, 25, 0, 0, 0, 0],
    "valid": true,
  },
  newspaperWithMultipleSolutions: {
    "grid16": [16, 64, 100, 84, 63, 150, 20, 53, 120, 29, 124, 31, 23, 96, 35, 102],
    "line16": [0, 0, 3, 4, 5, 0, 8, 8, 0, 0, 0, 25, 0, 0, 0, 0],
    "valid": true,
  },
  cover1: {
    "grid16": [12, 13, 26, 17, 40, 42, 18, 30, 35, 13, 45, 70, 30, 17, 14, 15],
    "line16": [0, 2, 3, 0, 4, 5, 6, 0, 7, 7, 0, 10, 10, 13, 0, 15],
    "valid": true,
  },
  anagramNewsletter: {
    "grid16": [252, 260, 13, 30, 25, 144, 36, 30, 48, 21, 40, 30, 224, 56, 46, 22],
    "line16": [1, 0, 0, 5, 6, 0, 0, 10, 0, 0, 21, 23, 24, 0, 28, 0],
    "valid": true,
  },

  fromAmazon2: {
    "grid16": [25, 13, 72, 30, 69, 29, 100, 24, 11, 9, 26, 22, 15, 36, 10, 54],
    "line16": [1, 2, 3, 3, 3, 0, 0, 0, 0, 9, 10, 12, 18, 20, 0, 0],
    "valid": true,
  },
  fromAmazon3: {
    "grid16": [29, 220, 61, 32, 38, 31, 116, 280, 204, 180, 29, 261, 228, 33, 192, 38],
    "line16": [4, 0, 0, 9, 9, 10, 0, 12, 17, 0, 0, 0, 29, 29, 0, 0],
    "valid": true,
  },
  fromAmazon4: {
    "grid16": [19, 198, 70, 30, 39, 29, 90, 19, 176, 170, 27, 224, 220, 31, 170, 39],
    "line16": [0, 5, 0, 0, 9, 10, 0, 11, 11, 14, 0, 0, 20, 0, 0, 34],
    "valid": true,
  },
  fromAmazon5: {
    "grid16": [130, 37, 32, 102, 18, 31, 108, 24, 27, 132, 28, 23, 126, 38, 72, 160],
    "line16": [0, 0, 4, 5, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "valid": true,
  },
  fromAmazon6: {
    "grid16": [60, 18, 19, 66, 144, 30, 81, 25, 17, 128, 80, 24, 66, 21, 189, 90],
    "line16": [0, 0, 0, 5, 0, 0, 9, 9, 10, 0, 0, 0, 16, 0, 0, 0],
    "valid": true,
  },
  fromAmazon7: {
    "grid16": [130, 37, 32, 102, 18, 31, 108, 24, 27, 132, 28, 23, 126, 38, 72, 160],
    "line16": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "valid": true,
    "completedLine16": [2, 2, 4, 5, 6, 6, 6, 8, 16, 17, 18, 20, 21, 26, 33, 36]
  },
  fromAmazon8: {
    "grid16": [400, 52, 104, 54, 50, 290, 39, 162, 147, 28, 200, 33, 27, 182, 33, 270],
    "line16": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "valid": true,
    "completedLine16": [2, 2, 2, 6, 8, 9, 10, 13, 14, 25, 26, 27, 30, 40, 52, 145]
  },
  fromAmazon9: {
    "grid16": [320, 27, 18, 180, 18, 72, 19, 33, 55, 32, 84, 16, 182, 63, 48, 156],
    "line16": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "valid": true,
    "completedLine16": [1, 1, 3, 3, 4, 4, 6, 12, 12, 13, 14, 18, 32, 52, 50, 80]
  },
  fromAmazon10: {
    "grid16": [150, 25, 41, 180, 40, 240, 26, 144, 198, 31, 204, 34, 29, 168, 25, 210],
    "line16": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "valid": true,
    "completedLine16": [5, 6, 9, 10, 10, 10, 11, 12, 14, 15, 16, 18, 21, 24, 34, 36]
  }
}
