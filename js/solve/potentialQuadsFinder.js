import {
  NUMBER_OF_GRID_ITEMS,
  BLANK_LINE_ITEM,
  PRODUCT_SIGNIFIER,
  SUM_SIGNIFIER,
  UNUSED,
} from './sharedValuesAndTools.js';

export function findPotentialQuads(grid16, line16) {
  const potentialQuads = Array(NUMBER_OF_GRID_ITEMS).fill(null).map(() => []);

  for (let gridItemIndex = 0; gridItemIndex < NUMBER_OF_GRID_ITEMS; gridItemIndex++) {
    const gridItemValue = grid16[gridItemIndex];

    const productQuads = getQuadsWhereThisGridItemIsTheProductOfTwoNumbers(gridItemValue, gridItemIndex, grid16, line16);
    const sumQuads = getQuadsWhereThisGridItemIsTheSumOfTwoNumbers(gridItemValue, gridItemIndex, grid16, line16);

    potentialQuads[gridItemIndex] = [...productQuads, ...sumQuads];
  }

  return potentialQuads;
}

function getQuadsWhereThisGridItemIsTheProductOfTwoNumbers(gridItemValue, gridItemIndex, grid16, line16) {
  const quads = [];

  const valueAtWhichLinePair1IsGreaterThanLinePair2 = getValueAtWhichLinePair1IsGreaterThanLinePair2(gridItemValue);

  for (let linePair1 = 1; linePair1 <= valueAtWhichLinePair1IsGreaterThanLinePair2; linePair1++) {
    const linePair2 = gridItemValue / linePair1;
    const gridPairValue = linePair1 + linePair2;

    if (linePair2IsAWholeNumber(linePair1, gridItemValue)
      //&& linePairsCanFitInTheLine16(linePair1, linePair2, line16)
      && gridPairExistsInGrid16(gridItemIndex, gridPairValue, grid16)) {
      quads.push(buildTheQuad(gridItemValue, gridPairValue, linePair1, linePair2, PRODUCT_SIGNIFIER));
    }
  }
  return quads;
}

function getQuadsWhereThisGridItemIsTheSumOfTwoNumbers(gridItemValue, gridItemIndex, grid16, line16) {
  const quads = [];

  const valueAtWhichLinePair1IsGreaterThanLinePair2 = Math.floor(gridItemValue / 2);

  for (let linePair1 = 1; linePair1 <= valueAtWhichLinePair1IsGreaterThanLinePair2; linePair1++) {
    const linePair2 = gridItemValue - linePair1;
    const gridPairValue = linePair1 * linePair2;

    if (gridPairExistsInGrid16(gridItemIndex, gridPairValue, grid16)
      //&& linePairsCanFitInTheLine16(linePair1, linePair2, line16)
      ) {
      quads.push(buildTheQuad(gridItemValue, gridPairValue, linePair1, linePair2, SUM_SIGNIFIER));
    }
  }
  return quads;
}

function linePair2IsAWholeNumber(linePair1, gridItemValue) {
  return gridItemValue % linePair1 === 0;
}

function linePairsCanFitInTheLine16(linePair1, linePair2, line16original) {
  let line16 = [...line16original];
  let linePair1OK = false;
  let linePair2OK = false;
  let gapAttempt1;

  if (line16.includes(linePair1)) {
    linePair1OK = true;
  } else {
    gapAttempt1 = fitInAGap(linePair1, line16);
    line16 = gapAttempt1.line16;
    linePair1OK = gapAttempt1.ok;
  }

  if (line16.includes(linePair2)) {
    linePair2OK = true;
  } else {
    linePair2OK = fitInAGap(linePair2, line16).ok;
  }

  return linePair1OK && linePair2OK;
}

function fitInAGap(linePair, line16) {
  // Check if it's smaller than the first item
  if (line16[0] > linePair) {
    return { "line16": line16, ok: false }
  }

  // Check if there's a gap before values that equal the linePair, or before the first one that's greater than it
  for (let index = 1; index < line16.length; index++) {
    if (linePair <= line16[index]) {
      if (line16[index - 1] === BLANK_LINE_ITEM) {
        line16.splice(index - 1, 1);
        return { "line16": line16, ok: true }
      }
      if (linePair < line16[index]) {
        break;
      }
    }
  }

  // Check if there's a gap at the end of the array
  if (line16[line16.length - 1] === BLANK_LINE_ITEM) {
    line16.splice(line16.length - 1, 1);
    return { "line16": line16, ok: true }
  }

  return { "line16": line16, ok: false }
}

function buildTheQuad(gridItemValue, gridPairValue, linePair1, linePair2, mathematicalFunction) {
  return {
    operationType: mathematicalFunction,
    primaryGridValue: gridItemValue,
    pairedGridValue: gridPairValue,
    operand1: linePair1,
    operand2: linePair2,
    status: UNUSED
  };
}

function gridPairExistsInGrid16(gridItemIndex, gridPairValue, grid16) {
  for (let potentialGridPairIndex = 0; potentialGridPairIndex < NUMBER_OF_GRID_ITEMS; potentialGridPairIndex++) {
    if (grid16[potentialGridPairIndex] === gridPairValue
      && potentialGridPairIndex !== gridItemIndex) {
      return true;
    }
  }
  return false;
}

function getValueAtWhichLinePair1IsGreaterThanLinePair2(gridItemValue) {
  if (gridItemValue !== 2) {
    return Math.floor(Math.sqrt(gridItemValue));
  }
  return 2;
}
