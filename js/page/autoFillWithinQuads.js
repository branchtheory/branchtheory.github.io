export function autoFillWithinQuad(input) {
    const td = input.closest('td');
    const isBigInput = input.classList.contains('big-input');

    if (isBigInput) {
        const tr = td.closest('tr');
        const nextTr = tr.nextElementSibling;
        if (!nextTr) return;
        const cells = Array.from(nextTr.children);
        const prevCells = Array.from(tr.children);
        const groupIndex = Array.from(prevCells).indexOf(td);
        autoFill(cells, groupIndex, tr, input);
    } else {
        const tr = td.closest('tr');
        const prevTr = tr.previousElementSibling;
        if (!prevTr) return;
        const cells = Array.from(tr.children);
        const cellIndex = cells.indexOf(td);
        const groupIndex = Math.floor(cellIndex / 3);
        autoFill(cells, groupIndex, prevTr, input);
    }
}

export function autoFill(cells, groupIndex, prevTr, changedInput) {
    const groupStart = groupIndex * 3;

    const operand1Input = cells[groupStart].querySelector('.operand-input');
    const operand2Input = cells[groupStart + 2].querySelector('.operand-input');
    const operationInput = cells[groupStart + 1].querySelector('.operation-input');

    const prevCells = Array.from(prevTr.children);
    const bigInput = prevCells[groupIndex]?.querySelector('.big-input');

    const val1 = parseFloat(operand1Input?.value);
    const val2 = parseFloat(operand2Input?.value);
    const operation = operationInput?.value;
    const bigValue = parseFloat(bigInput?.value);

    const val1IsFactor = bigValue % val1 === 0;
    const val2IsFactor = bigValue % val2 === 0;
    const val1CanAdd = val1 < bigValue && bigValue - val1 < 100;
    const val2CanAdd = val2 < bigValue && bigValue - val2 < 100;
    const val1CanOnlyAdd = !val1IsFactor && val1CanAdd;
    const val2CanOnlyAdd = !val2IsFactor && val2CanAdd;

    const has1 = !isNaN(val1);
    const has2 = !isNaN(val2);
    const hasBig = !isNaN(bigValue);
    const hasOperation = /[×xX*+]/.test(operation);
    const isMultiplyOperation = /[×xX*]/.test(operation);

    if (bigValue === 4) return;

    else if (!hasBig && has1 && has2 && hasOperation) {
        bigInput.value = isMultiplyOperation ? val1 * val2 : val1 + val2;
        return;
    }

    else if (hasBig && has1 && has2 && !hasOperation) {
        if (val1 * val2 === bigValue) operationInput.value = '×';
        else if (val1 + val2 === bigValue) operationInput.value = '+';
    }
    
    else if (hasBig && has1 && !has2 && hasOperation) {
        if (isMultiplyOperation && val1IsFactor) {
            operand2Input.value = bigValue / val1;
        } else if (!isMultiplyOperation && val1CanAdd) {
            operand2Input.value = bigValue - val1;
        }
    } else if (hasBig && !has1 && has2 && hasOperation) {
        if (isMultiplyOperation && val2IsFactor) {
            operand1Input.value = bigValue / val2;
        } else if (!isMultiplyOperation && val2CanAdd) {
            operand1Input.value = bigValue - val2;
        }
    }

    else if (hasBig && has1 && !has2 && !hasOperation && val1CanOnlyAdd) {
        operationInput.value = '+';
        operand2Input.value = bigValue - val1;
    } else if (hasBig && !has1 && has2 && !hasOperation && val2CanOnlyAdd) {
        operationInput.value = '+';
        operand1Input.value = bigValue - val2;
    }

    else if (hasBig && has1 && has2 && hasOperation) {
        if (changedInput === operand1Input && (val1CanOnlyAdd || (!isMultiplyOperation && val1CanAdd))) {
            operationInput.value = '+';
            operand2Input.value = bigValue - val1;
        } else if (changedInput === operand2Input && (val1CanOnlyAdd || (!isMultiplyOperation && val1CanAdd))) {
            operationInput.value = '+';
            operand1Input.value = bigValue - val2;
        }

        else if (changedInput === operand1Input && isMultiplyOperation && val1IsFactor) {
            operand2Input.value = bigValue / val1;
        } else if (changedInput === operand2Input && isMultiplyOperation && val2IsFactor) {
            operand1Input.value = bigValue / val2;
        }
    }
}