import { isBrokenBranch } from './sharedValuesAndTools.js';
import { deduceFromSingleQuads } from './deduceFromSingleQuads.js';
import { rejectQuadsThatCannotFitInLine16 } from './checkQuadFitWithLine16.js';
import { deduceFromLineOperandCountMatchingGrid } from './deduceFromLineOperandCountMatchingGrid.js';
import { isPotentialSolution } from './solutionChecker.js';

export function deduce(branch, grid16, line16, ns) {
  let thereMayBeFurtherDeductions = true;

  while (thereMayBeFurtherDeductions && !isBrokenBranch(branch)) {
   // ns.tprint("=== Start of deductions");
   // ns.tprint(branch);

    let result;
  //  branch = rejectQuadsThatCannotFitInLine16(branch, line16, ns)

   // ns.tprint("=== Post checking quads that cannot fit line16");
   // ns.tprint(branch);

   // if (isBrokenBranch(branch) || isPotentialSolution(branch)) { return branch; }

   // result = deduceFromLineOperandCountMatchingGrid(branch, line16, ns);
  //  branch = result.branch;
  //  thereMayBeFurtherDeductions = result.furtherDeductions;

   // ns.tprint("Post deducing from when operand count matches grid");
   // ns.tprint(branch);

    if (isBrokenBranch(branch) || isPotentialSolution(branch)) { return branch; }

    result = deduceFromSingleQuads(branch, grid16, undefined, ns);
    branch = result.branch;
    thereMayBeFurtherDeductions = /*thereMayBeFurtherDeductions || */ result.furtherDeductions;

   // ns.tprint("Post deducing from singles");
   // ns.tprint(branch);

   // if (isBrokenBranch(branch) || isPotentialSolution(branch)) { return branch; }
  }
  return branch;
}
