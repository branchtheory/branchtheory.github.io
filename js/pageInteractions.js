import { getSolution } from './solve/solve.js';
import { setUpInputValidation } from './page/validateInput.js';
import { 
        partialSolve,
        generatePartialSolutionTable 
} from './page/partialSolve.js';
import {
        DEMO_GRID_DATA, 
        DEMO_STRIP_DATA,
        saveOriginalData,
        restoreOriginalData,
        clearAllData
} from './page/saveAndDemoData.js';
import {
        showError,
        showNotification
} from './page/notify.js';
import {
        findUniversalConflicts,
        checkUserSolution,
        highlightConflicts
} from './page/check.js';
import { getPuzzle } from './page/getPuzzle.js';
import { 
    clearAllPairHighlighting,
    highlightSolutionPairs,
    highlightPartialSolution
} from './page/highlightPairs.js';

function clearAllHighlights() {
        const allInputs = document.querySelectorAll('.big-input, .strip-input, .operand-input, .operation-input');
    allInputs.forEach(input => {
        input.classList.remove('conflict-cell');
    });
}
        
document.addEventListener('DOMContentLoaded', function() {
    const bigNumberInputs = document.querySelectorAll('.big-input');
    bigNumberInputs.forEach((input, index) => {
        input.placeholder = DEMO_GRID_DATA[index] || '';
    });
    
    const stripInputs = document.querySelectorAll('.strip-input');
    stripInputs.forEach((input, index) => {
        input.placeholder = DEMO_STRIP_DATA[index] || '';
    });

   setUpInputValidation();   
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

    const solution = getSolution(dataResult.bigNumberData, dataResult.stripData);
    
    if (solution === "invalid") {
        showError('There is no solution for this puzzle.');
        return;
    }

    if (solution.grids.length && solution.grids.length > 1) {
        showNotification(`This puzzle has ${solution.grids.length} solutions. Showing one of them.`);
    }
    
    const bigNumberInputs = document.querySelectorAll('.big-input');
    const stripInputs = document.querySelectorAll('.strip-input');

    bigNumberInputs.forEach(input => {
        input.disabled = true;
    });

    stripInputs.forEach(input => {
        input.disabled = true;
    });
    
    solution.lines[0].forEach((value, index) => {
        if (index < stripInputs.length) {
            stripInputs[index].value = value;
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

    const solution = getSolution(dataResult.bigNumberData, dataResult.stripData); 

    if (solution === "invalid") {
        showError('Either there is no solution for this puzzle, or the strip is incorrect.');
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