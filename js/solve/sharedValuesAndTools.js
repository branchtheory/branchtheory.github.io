export const PRODUCT_SIGNIFIER = "product";
export const SUM_SIGNIFIER = "sum";
export const UNUSED = "unused";
export const DONE = "done";

export const BLANK_LINE_ITEM = 0;

export const NUMBER_OF_GRID_ITEMS = 16;

export const BROKEN_BRANCH = "BROKEN BRANCH";

export const NOT_FOUND = -1;

export function isBrokenBranch(branch) {
  if (Array.isArray(branch)) {
    return branch.length != NUMBER_OF_GRID_ITEMS || branch.some(e => !Array.isArray(e) || e.length === 0);
  } else {
    return branch === "invalid" || branch === BROKEN_BRANCH;
  }
}
