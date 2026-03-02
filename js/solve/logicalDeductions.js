import { isBrokenBranch } from './sharedValuesAndTools.js';
import { deduceFromSingleQuads } from './deduceFromSingleQuads.js';
import { rejectQuadsThatCannotFitInLine16 } from './checkQuadFitWithLine16.js';
import { deduceFromSingleOperands } from './deduceFromSingleOperands.js';

export function deduce(branch, grid16, line16) {
  let thereMayBeFurtherDeductions = true;

  while (thereMayBeFurtherDeductions && !isBrokenBranch(branch)) {
    let result;
   // branch = rejectQuadsThatCannotFitInLine16(branch, line16)

   // result = deduceFromSingleOperands(branch, line16);
   // branch = result.branch;
  //  thereMayBeFurtherDeductions = result.furtherDeductions;

  //  if (isBrokenBranch(branch)) { return branch; }

    result = deduceFromSingleQuads(branch, grid16, undefined);
    branch = result.branch;
    thereMayBeFurtherDeductions = /*thereMayBeFurtherDeductions ||*/ result.furtherDeductions;
  }

  return branch;
}

