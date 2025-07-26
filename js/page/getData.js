export function collectUserGridData(returnElements = false) {
    const gridCells = getGridCellElements();
    
    return gridCells.map(cell => {
        if (returnElements) {
            // Return DOM elements
            return {
                operand1: cell.operand1Element,
                operation: cell.operationElement,
                operand2: cell.operand2Element
            };
        } else {
            // Return parsed values
            const operand1 = cell.operand1Element?.value.trim();
            const operation = cell.operationElement?.value.trim();
            const operand2 = cell.operand2Element?.value.trim();

            return {
                operand1: operand1 === '' ? null : parseInt(operand1, 10),
                operation: operation === '' ? null : operation,
                operand2: operand2 === '' ? null : parseInt(operand2, 10)
            };
        }
    });
}

export function collectUserStrip() {
    const stripInputs = document.querySelectorAll('.strip-input');
    return Array.from(stripInputs).map(input => {
        const value = input.value.trim();
        return value === '' ? null : parseInt(value, 10);
    });
}

function getGridCellElements() {
    const smallInputs = document.querySelectorAll('.small-input');
    const operationInputs = document.querySelectorAll('.operation-input');
    
    const gridCells = [];
    
    // Process each of the 16 grid positions
    for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        
        const smallInputBaseIndex = row * 8 + col * 2;
        const operationIndex = row * 4 + col;

        const operand1Element = smallInputs[smallInputBaseIndex];
        const operationElement = operationInputs[operationIndex];
        const operand2Element = smallInputs[smallInputBaseIndex + 1];
        
        gridCells.push({
            operand1Element,
            operationElement,
            operand2Element
        });
    }
    
    return gridCells;
}
