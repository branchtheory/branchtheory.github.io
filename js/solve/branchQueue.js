import { NUMBER_OF_GRID_ITEMS } from "./sharedValuesAndTools.js";

export class BranchQueue {
  constructor() {
    this.branchesQueue = new Map();
    this.newBranchKey = 1;
    this.firstBranchKey = 1;
    this.firstBranch = Array(NUMBER_OF_GRID_ITEMS).fill(null).map(() => []);
  }

  removeFirstBranch() {
    this.branchesQueue.delete(this.firstBranchKey);
  }

  createNewBranch(newBranch) {
    this.branchesQueue.set(this.newBranchKey, newBranch);
    this.newBranchKey++;
  }

  setFirstBranch() {
    for (let branchKey = this.firstBranchKey; branchKey <= this.newBranchKey; branchKey++) {
      if (this.branchesQueue.has(branchKey)) {
        this.firstBranchKey = branchKey;
        this.firstBranch = this.branchesQueue.get(branchKey);
        return;
      }
    }
  }

  isEmpty() {
    return this.branchesQueue.size === 0;
  }
}
