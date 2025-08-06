import { isBrokenBranch } from './sharedValuesAndTools.js';
import { deduceFromSingleQuads } from './deduceFromSingleQuads.js';
import { rejectQuadsThatCannotFitInLine16 } from './checkQuadFitWithLine16.js';
import { deduceFromSingleOperands } from './deduceFromSingleOperands.js';

export function deduce(branch, grid16, line16, ns) {
  let thereMayBeFurtherDeductions = true;

  while (thereMayBeFurtherDeductions && !isBrokenBranch(branch)) {
    let result;
    branch = rejectQuadsThatCannotFitInLine16(branch, line16, ns)

    result = deduceFromSingleOperands(branch, line16, ns);
    branch = result.branch;
    thereMayBeFurtherDeductions = result.furtherDeductions;

    if (isBrokenBranch(branch)) { return branch; }

    result = deduceFromSingleQuads(branch, grid16, undefined, ns);
    branch = result.branch;
    thereMayBeFurtherDeductions = thereMayBeFurtherDeductions || result.furtherDeductions;
  }

  return branch;
}
