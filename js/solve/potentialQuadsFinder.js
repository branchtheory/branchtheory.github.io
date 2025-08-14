import {
  NUMBER_OF_GRID_ITEMS,
  PRODUCT_SIGNIFIER,
  SUM_SIGNIFIER,
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

    if (gridPairExistsInGrid16(gridItemIndex, gridPairValue, grid16)) {
      quads.push(buildTheQuad(gridItemValue, gridPairValue, linePair1, linePair2, SUM_SIGNIFIER));
    }
  }
  return quads;
}

function linePair2IsAWholeNumber(linePair1, gridItemValue) {
  return gridItemValue % linePair1 === 0;
}

function buildTheQuad(gridItemValue, gridPairValue, linePair1, linePair2, operation) {
  return {
    value: gridItemValue,
    gridPair: {
      value: gridPairValue,
      index: "",
      status: UNUSED
    },
    operation,
    operands: [
      {
        value: linePair1,
        index: "",
        status: UNUSED
      },
      {
        value: linePair2,
        index: "",
        status: UNUSED
      }
    ],
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
