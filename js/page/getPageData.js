export function collectSmallCellData(returnType) {
    const smallCells = getSmallCells();
    
    return smallCells.map(cell => {
        if (returnType === "return as elements") {
            return {
                operand1: cell.operand1Element,
                operation: cell.operationElement,
                operand2: cell.operand2Element
            };
        } else if (returnType === "return as values") {
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

function getSmallCells() {
    const operandInputs = document.querySelectorAll('.operand-input');
    const operationInputs = document.querySelectorAll('.operation-input');
    
    const smallCells = [];
    
    for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        
        const operandInputBaseIndex = row * 8 + col * 2;
        const operationIndex = row * 4 + col;

        const operand1Element = operandInputs[operandInputBaseIndex];
        const operationElement = operationInputs[operationIndex];
        const operand2Element = operandInputs[operandInputBaseIndex + 1];
        
        smallCells.push({
            operand1Element,
            operationElement,
            operand2Element
        });
    }
    
    return smallCells;
}

export function collectBigNumberData() {
    const bigNumberInputs = document.querySelectorAll('.big-input');
    const bigNumberData = [];

    bigNumberInputs.forEach(input => {
        const value = input.value.trim();
        bigNumberData.push(value === '' ? null : parseInt(value, 10));
    });

    return bigNumberData;
}

export function collectLineData() {
    const lineInputs = document.querySelectorAll('.line-input');
    const lineData = [];

    lineInputs.forEach(input => {
        const value = input.value.trim();
        lineData.push(value === '' ? null : parseInt(value, 10));
    });

    return lineData;
}