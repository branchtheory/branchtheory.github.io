import {
  BLANK_LINE_ITEM,
  SUM_SIGNIFIER,
  UNUSED,
  SELECTED,
  REJECTED,
  BROKEN_BRANCH,
} from './sharedValuesAndTools.js';

export function rejectQuadsThatCannotFitInLine16(branch, line16) {
  let workingLine16 = [];
  line16.forEach(value => workingLine16.push({ value, status: UNUSED }));
  let operandsOfSelected = getOperandsOfSelected(branch);
  
  workingLine16 = fillLineWithSelectedQuads([...operandsOfSelected], workingLine16);

  if (workingLine16 === BROKEN_BRANCH) return BROKEN_BRANCH;

  checkUnused(branch, workingLine16);

  return branch;
}

function checkUnused(branch, line16) {
  for (let item of branch) {
    for (let quad of item) {
      if (quad.status === UNUSED) {
        const deepCopyLine16 = line16.map(obj => ({ value: obj.value, status: obj.status }));
        const result = fillLineWithSelectedQuads([...quad.operands], deepCopyLine16);
        if (result === BROKEN_BRANCH) {
          quad.status = REJECTED;
        }
      }
    }
  }
}


function fillLineWithSelectedQuads(operands, line16) {
  if (operands.length === 0) return line16;

  const remainingOperands = [];
  for (let i = 0; i < operands.length; i++) {
    let found = false;
    for (let val of line16) {
      if (val.status === UNUSED && val.value === operands[i]) {
        val.status = SELECTED;
        found = true;
        break;
      }
    }
    if (!found) {
      remainingOperands.push(operands[i]);
    }
  }
  operands = remainingOperands;

  let gapSequences = findGapSequences(line16);

  let someOperandInserted = false;
  do {
    someOperandInserted = false;
    const remainingOperands = [];
    
    for (let i = 0; i < operands.length; i++) {
      const op = operands[i];
      const result = fitInAGapV2(op, line16, gapSequences);
      if (result.state === BROKEN_BRANCH) {
        return BROKEN_BRANCH;
      } else if (result.state) {
        someOperandInserted = true;
        gapSequences = findGapSequences(line16); // Recalc gaps
      } else {
        remainingOperands.push(op); // Keep unprocessed operands
      }
    }
    operands = remainingOperands;
  } while (someOperandInserted);
  return line16;
}

function getOperandsOfSelected(branch) {
  let operands = [];
  for (let item of branch) {
    for (let quad of item) {
      if (quad.status === SELECTED && quad.operation === SUM_SIGNIFIER) {
        operands.push(...quad.operands);
      }
    }
  }
  return operands;
}

function fitInAGapV2(operand, line16, gapSequences) {
  const validSequences = [];

  for (const sequence of gapSequences) {
    if (operandFitsInSequence(operand, sequence, line16)) {
      validSequences.push(sequence);
    }
  }

  if (validSequences.length > 1) {
    return { line16, state: false };
  } else if (validSequences.length === 1) {
    const sequence = validSequences[0];
    line16[sequence.startIndex].status = SELECTED;
    return { line16, state: true };
  } else {
    return { line16: BROKEN_BRANCH, state: BROKEN_BRANCH };
  }
}

function findGapSequences(line16) {
  const sequences = [];
  let currentSequence = null;

  for (let i = 0; i < line16.length; i++) {
    if (line16[i].value === BLANK_LINE_ITEM && line16[i].status !== SELECTED) {
      if (currentSequence === null) {
        // Start new sequence
        currentSequence = {
          startIndex: i,
          endIndex: i,
          leftValue: null,
          rightValue: null
        };
      } else {
        // Extend current sequence
        currentSequence.endIndex = i;
      }
    } else if (line16[i].value !== 0) {
      if (currentSequence !== null) {
        currentSequence.leftValue = findLeftBoundary(line16, currentSequence.startIndex);
        currentSequence.rightValue = findRightBoundary(line16, currentSequence.endIndex);
        sequences.push(currentSequence);
        currentSequence = null;
      }
    }
  }

  // Don't forget the last sequence if it ends at the array boundary
  if (currentSequence !== null) {
    currentSequence.leftValue = findLeftBoundary(line16, currentSequence.startIndex);
    currentSequence.rightValue = findRightBoundary(line16, currentSequence.endIndex);
    sequences.push(currentSequence);
  }

  return sequences;
}

function findLeftBoundary(line16, startIndex) {
  for (let i = startIndex - 1; i >= 0; i--) {
    if (line16[i].value !== 0) {
      return line16[i].value;
    }
  }
  return null; // No left boundary (beginning of array)
}

function findRightBoundary(line16, startIndex) {
  for (let i = startIndex + 1; i < line16.length; i++) {
    if (line16[i].value !== 0) {
      return line16[i].value;
    }
  }
  return null; // No right boundary (end of array)
}

function operandFitsInSequence(operand, sequence, line16) {
  const { leftValue, rightValue } = sequence;

  const fitsAfterLeft = leftValue === null || operand >= leftValue;
  const fitsBeforeRight = rightValue === null || operand <= rightValue;

  return fitsAfterLeft && fitsBeforeRight;
}
