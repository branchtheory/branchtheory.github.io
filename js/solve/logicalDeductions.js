import { isBrokenBranch } from './sharedValuesAndTools.js';
import { deduceFromSingleQuads } from './deduceFromSingleQuads.js';
import { rejectQuadsThatCannotFitInLine16 } from './checkQuadFitWithLine16.js';

export function deduce(branch, grid16, line16) {
  let thereMayBeFurtherDeductions = true;

  while (thereMayBeFurtherDeductions && !isBrokenBranch(branch)) {
    branch = rejectQuadsThatCannotFitInLine16(branch, line16)
    const result = deduceFromSingleQuads(branch, grid16);
    branch = result.branch;
    thereMayBeFurtherDeductions = result.furtherDeductions;
  } 

  return branch;
}

