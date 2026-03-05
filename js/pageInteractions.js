import { 
        getSolution 
} from './solve/solve.js';
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
        DEMO_GRID_DATA, 
        DEMO_LINE_DATA,
        getPuzzle,
} from './page/getPuzzle.js';
import { 
        clearAllPairHighlighting,
        highlightSolutionPairs,
} from './page/highlightPairs.js';
import { 
        autoFillWithinQuad 
} from './page/autoFillWithinQuads.js';
import { 
        moveToNextCell
} from './page/moveToNextCellBehaviour.js'; 
import {
        strings
} from './page/localisationStrings.js'
import { 
        setUpInputValidation 
} from './page/validateInput.js';

const bigNumberInputs = document.querySelectorAll('.big-input');
const lineInputs = document.querySelectorAll('.line-input');
const allInputs = document.querySelectorAll('.big-input, .line-input, .operand-input, .operation-input');

document.addEventListener('DOMContentLoaded', function() {
    bigNumberInputs.forEach((input, index) => {
        input.placeholder = DEMO_GRID_DATA[index] || '';
    });
    
    lineInputs.forEach((input, index) => {
        input.placeholder = DEMO_LINE_DATA[index] || '';
    });

   setUpInputValidation();   
});

document.querySelectorAll('.big-input, .operand-input, .operation-input').forEach(input => {
    input.dataset.lastInputType = '';

    input.addEventListener('input', (e) => {
        input.dataset.lastInputType = e.inputType;
        if (e.inputType.startsWith('delete')) return;
        autoFillWithinQuad(input);
    });

    input.addEventListener('blur', () => {
        if (input.dataset.lastInputType.startsWith('delete')) return;
        autoFillWithinQuad(input);
    });
});

document.addEventListener('keydown', function(e) {
    if (e.key === "Tab") {
        moveToNextCell(e);
    }
});

document.addEventListener('beforeinput', function(e) {
    if (e.data === ' ' || e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') {
        moveToNextCell(e);
    }
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

function clearAllHighlights() {
    allInputs.forEach(input => {
        input.classList.remove('conflict-cell');
    });
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
        showError(strings[lang].notifications.noSolutionFound);
        return;
    }

    if (solution.grids.length && solution.grids.length > 1) {
        showNotification(strings[lang].notifications.multipleSolutionsFound(solution.grids.length));
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
        showError(strings[lang].notifications.noSolutionFoundOrWrongLine);
        return;
    }

    if (checkUserSolution(solution)) {
        showNotification(strings[lang].notifications.passedCheck);
    } else {
        showError(strings[lang].notifications.failedCheck); 
        const conflicts = findUniversalConflicts(solution);
        highlightConflicts(conflicts); 
    }
});