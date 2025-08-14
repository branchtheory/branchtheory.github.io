/* 

* Format the line16 as a series of objects:
{
value,
gridPairIndices,
status
}
* Use selected stuff to set pair indices and statuses
* Then look at the gaps, and see where selected stuff could go into.
* Then work out where the unselected stuff could fit.
* Look at a sequence of gaps, 1 or more long. See if there's only one single collection of items from the remaining
quads that fit in it. If so, fit them in and select them.
* Look at the sequence of gaps, 1 or more long. See if there's only one single gridItem's quads that fit into 
the gaps. If so, eliminate all the other instances of that gridItem's quads.
* 

*/
export function fillLine(line16Original, branch) {
  const line16 = createLine16Obj([...line16Original]);

  for (const lineItem of line16) {
    for (let gridIndex = 0; gridIndex < branch.length; gridIndex++) {
      for (const quad of branch[gridIndex].filter(quad => quad.operation === SUM_SIGNIFIER
        && quad.status !== REJECTED)) {
        for (const op of quad.operands) {
          if (lineItem.value === op) {
            lineItem.sumPairIndex = gridIndex;
          }
        }
      }
    }
  }
}

function createLine16Obj(line16) {
  return line16.map(value => ({
    value: value,
    sumPairIndex: "",
  }));
}

