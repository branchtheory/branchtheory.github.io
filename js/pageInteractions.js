import { getSolution } from './solve/solve.js';
import { setUpInputValidation } from './page/validateInput.js';
import { 
        partialSolve,
        generatePartialSolutionTable 
} from './page/partialSolve.js';
import {
        saveOriginalData,
        restoreOriginalData,
        clearAllData
} from './page/saveAndRestore.js';
import {
        showError,
        showNotification
} from './page/notify.js';
import {
        findUniversalConflicts,
        checkUserSolution,
        highlightConflicts
} from './page/check.js';
import { 
        getPuzzle,
        DEMO_GRID_DATA, 
        DEMO_LINE_DATA,
} from './page/getPuzzle.js';
import { 
        clearAllPairHighlighting,
        highlightSolutionPairs,
} from './page/highlightPairs.js';

const bigNumberInputs = document.querySelectorAll('.big-input');
const lineInputs = document.querySelectorAll('.line-input');
const allInputs = document.querySelectorAll('.big-input, .line-input, .operand-input, .operation-input');

function clearAllHighlights() {
    allInputs.forEach(input => {
        input.classList.remove('conflict-cell');
    });
}
        
document.addEventListener('DOMContentLoaded', function() {
    bigNumberInputs.forEach((input, index) => {
        input.placeholder = DEMO_GRID_DATA[index] || '';
    });
    
    lineInputs.forEach((input, index) => {
        input.placeholder = DEMO_LINE_DATA[index] || '';
    });

   setUpInputValidation();   
});

function resolveGroup(cells, groupIndex, prevTr, changedInput) {
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
    const val1CanOnlyAdd = !val1IsFactor && val1 < bigValue && bigValue - val1 < 100;
    const val2CanOnlyAdd = !val2IsFactor && val2 < bigValue && bigValue - val2 < 100;

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
        } else if (!isMultiplyOperation) {
            operand2Input.value = bigValue - val1;
        }
    } else if (hasBig && !has1 && has2 && hasOperation) {
        if (isMultiplyOperation && val2IsFactor) {
            operand1Input.value = bigValue / val2;
        } else if (!isMultiplyOperation) {
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
        if (changedInput === operand1Input && (val1CanOnlyAdd || !isMultiplyOperation)) {
            operationInput.value = '+';
            operand2Input.value = bigValue - val1;
        } else if (changedInput === operand2Input && (val1CanOnlyAdd || !isMultiplyOperation)) {
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

function handleInput(input) {
    const td = input.closest('td');
    const isBigInput = input.classList.contains('big-input');

    if (isBigInput) {
        const tr = td.closest('tr');
        const nextTr = tr.nextElementSibling;
        if (!nextTr) return;
        const cells = Array.from(nextTr.children);
        const prevCells = Array.from(tr.children);
        const groupIndex = Array.from(prevCells).indexOf(td);
        resolveGroup(cells, groupIndex, tr, input);
    } else {
        const tr = td.closest('tr');
        const prevTr = tr.previousElementSibling;
        if (!prevTr) return;
        const cells = Array.from(tr.children);
        const cellIndex = cells.indexOf(td);
        const groupIndex = Math.floor(cellIndex / 3);
        resolveGroup(cells, groupIndex, prevTr, input);
    }
}

document.querySelectorAll('.big-input, .operand-input, .operation-input').forEach(input => {
    input.dataset.lastInputType = '';

    input.addEventListener('input', (e) => {
        input.dataset.lastInputType = e.inputType;
        if (e.inputType.startsWith('delete')) return;
        handleInput(input);
    });

    input.addEventListener('blur', () => {
        if (input.dataset.lastInputType.startsWith('delete')) return;
        handleInput(input);
    });
});

document.getElementById('unsolveBtn').addEventListener('click', function() {
    clearAllHighlights();
    clearAllPairHighlighting()
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('notificationMessage').style.display = 'none';
    
    restoreOriginalData();
    
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('partialSolveBtn').disabled = false; 
    document.getElementById('checkBtn').disabled = false;
    this.disabled = true;
    document.getElementById('clearBtn').disabled = false;
});

document.getElementById('clearBtn').addEventListener('click', function() {
    clearAllHighlights();
    clearAllPairHighlighting()
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('notificationMessage').style.display = 'none';
    
    clearAllData();
    
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('partialSolveBtn').disabled = false; 
    document.getElementById('unsolveBtn').disabled = true;
    document.getElementById('checkBtn').disabled = false;
    this.disabled = false;
});

document.getElementById('partialSolveBtn').addEventListener('click', function() {
    clearAllHighlights();
    document.getElementById('notificationMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    partialSolve();
});


function updateSolveBtn() {
    const bigInputAllFilled = [...bigNumberInputs].every(input => input.value.trim() !== '');
    document.getElementById('partialSolveBtn').disabled = !bigInputAllFilled;
    document.getElementById('solveBtn').disabled = !bigInputAllFilled;
    document.getElementById('checkBtn').disabled = !bigInputAllFilled;
}

allInputs.forEach(input => {
    input.addEventListener('input', updateSolveBtn);
});

document.getElementById('solveBtn').addEventListener('click', function() {
    clearAllHighlights();
    document.getElementById('notificationMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    const dataResult = getPuzzle();
    
    if (Object.hasOwn(dataResult, 'error')) {
        showError(dataResult.error); 
        return;
    }
    
    saveOriginalData();

    const solution = getSolution(dataResult.bigNumberData, dataResult.lineData);
    
    if (solution === "invalid") {
        showError('There is no solution for this puzzle.');
        return;
    }

    if (solution.grids.length && solution.grids.length > 1) {
        showNotification(`This puzzle has ${solution.grids.length} solutions. Showing one of them.`);
    }

    allInputs.forEach(input => {
        input.disabled = true;
    });
    
    solution.lines[0].forEach((value, index) => {
        if (index < lineInputs.length) {
            lineInputs[index].value = value;
        }
    });
    
    const mainGridRows = document.querySelectorAll('.main-grid tr');
    const smallCellRows = [mainGridRows[1], mainGridRows[3], mainGridRows[5], mainGridRows[7]];

    smallCellRows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td');
        
        for (let cellIndex = 0; cellIndex < 4; cellIndex++) {
            const gridIndex = rowIndex * 4 + cellIndex;
            const cellData = solution.grids[0][gridIndex].find(cell => cell.status === 'selected');
            const startIdx = cellIndex * 3;
            
            if (startIdx + 2 < cells.length) {
                const operand1Input = cells[startIdx].querySelector('input');
                const operationInput = cells[startIdx + 1].querySelector('input');
                const operand2Input = cells[startIdx + 2].querySelector('input');
                
                if (operand1Input) operand1Input.value = cellData.operands[0];
                if (operationInput) operationInput.value = cellData.operation;
                if (operand2Input) operand2Input.value = cellData.operands[1];
            }
        }
    });

    generatePartialSolutionTable(solution.partialSolution);
    document.getElementById('partialSolutionTable').style.display = 'table';
    
    highlightSolutionPairs(solution);
                
    this.disabled = true;
    document.getElementById('partialSolveBtn').disabled = true;
    document.getElementById('unsolveBtn').disabled = false;
    document.getElementById('clearBtn').disabled = false;
    document.getElementById('checkBtn').disabled = true;
});

document.getElementById('checkBtn').addEventListener('click', function() {
    clearAllHighlights(); 
    document.getElementById('notificationMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    const dataResult = getPuzzle();
        
    if (Object.hasOwn(dataResult, 'error')) {
        showError(dataResult.error); 
        return;
    }

    const solution = getSolution(dataResult.bigNumberData, dataResult.lineData); 

    if (solution === "invalid") {
        showError('Either there is no solution for this puzzle, or some of the numbers in the strip at the bottom are incorrect.');
        return;
    }

    if (checkUserSolution(solution)) {
        showNotification('All correct. That matches a solution.');
    } else {
        showError('Some of that does not match any solution.'); 
        const conflicts = findUniversalConflicts(solution);
        highlightConflicts(conflicts); 
    }
});