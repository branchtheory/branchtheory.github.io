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

document.querySelectorAll('.operand-input').forEach(input => {
    input.addEventListener('blur', () => {
      const td = input.closest('td');
      const tr = td.closest('tr');
      const prevTr = tr.previousElementSibling;
      if (!prevTr) return;
  
      const cells = Array.from(tr.children);
      const cellIndex = cells.indexOf(td);

      const groupIndex = Math.floor(cellIndex / 3);
      const groupStart = groupIndex * 3;
  
      const operand1 = parseFloat(cells[groupStart].querySelector('.operand-input')?.value);
      const operand2 = parseFloat(cells[groupStart + 2].querySelector('.operand-input')?.value);
      const operationInput = cells[groupStart + 1].querySelector('.operation-input');
  
      const prevCells = Array.from(prevTr.children);
      const bigInput = prevCells[groupIndex]?.querySelector('.big-input');
      const bigValue = parseFloat(bigInput?.value);
  
      if (isNaN(bigValue) || !operationInput) return;

      if (operand1 !== operand2) {
        if (operand1 * operand2 === bigValue) {
          operationInput.value = '×';
        } else if (operand1 + operand2 === bigValue) {
          operationInput.value = '+';
        }
      }
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
        showError('Either there is no solution for this puzzle, or the line is incorrect.');
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