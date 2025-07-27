import { getSolution } from './solve/solve.js';
import { setUpInputValidation } from './page/validateInput.js';
import { 
        partialSolve,
        generatePartialSolutionTable 
} from './page/partialSolve.js';
import {
        GRID_PLACEHOLDERS, 
        STRIP_PLACEHOLDERS,
        getIsDemoMode,
        setIsDemoMode,
        saveOriginalData,
        restoreOriginalData,
        clearAllData
} from './page/dataState.js';
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
        getDemoOrUserPuzzle,
        collectUserGridData, 
        collectUserStrip 
} from './page/getData.js';

function clearAllHighlights() {
        const allInputs = document.querySelectorAll('.grid-input, .strip-input, .small-input, .operation-input');
    allInputs.forEach(input => {
        input.classList.remove('conflict-cell');
    });
}
        
// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Set placeholders from constants
    const gridInputs = document.querySelectorAll('.grid-input');
    gridInputs.forEach((input, index) => {
        input.placeholder = GRID_PLACEHOLDERS[index] || '';
    });
    
    const stripInputs = document.querySelectorAll('.strip-input');
    stripInputs.forEach((input, index) => {
        input.placeholder = STRIP_PLACEHOLDERS[index] || '';
    });

   setUpInputValidation();

        // Unsolve button event listener
        document.getElementById('unsolveBtn').addEventListener('click', function() {
            clearAllHighlights();
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('notificationMessage').style.display = 'none';
            
            restoreOriginalData();
            
            // Update button states
            document.getElementById('solveBtn').disabled = false;
            document.getElementById('partialSolveBtn').disabled = false; // Add this line
            document.getElementById('checkBtn').disabled = false;
            this.disabled = true;
            document.getElementById('resetBtn').disabled = false;
        });
        
        // Reset button event listener
        document.getElementById('resetBtn').addEventListener('click', function() {
            clearAllHighlights();
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('notificationMessage').style.display = 'none';
            
            clearAllData();
            
            // Update button states
            document.getElementById('solveBtn').disabled = false;
            document.getElementById('partialSolveBtn').disabled = false; // Add this line
            document.getElementById('unsolveBtn').disabled = true;
            document.getElementById('checkBtn').disabled = false;
            this.disabled = false;
        });
        
        // Partial Solve button event listener
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
        
            const demoModeState = getIsDemoMode(document.querySelectorAll('.grid-input'), document.querySelectorAll('.strip-input'), document.querySelectorAll('.small-input'), document.querySelectorAll('.operation-input'))
            const dataResult = getDemoOrUserPuzzle(demoModeState, document.querySelectorAll('.grid-input'), document.querySelectorAll('.strip-input'));
            if (Object.hasOwn(dataResult, 'isDemo')) { setIsDemoMode(dataResult.isDemo) }
            
            if (dataResult.error) {
                showError(dataResult.error);
                return;
            }
            
            // Save original data
            saveOriginalData();
        
            // Get solution data
            const solution = getSolution(dataResult.gridData, dataResult.stripData);
            
            // Check if solution is invalid
            if (solution === "invalid") {
                showError('There is no solution for this puzzle.');
                return;
            }
        
            if (solution.grids.length && solution.grids.length > 1) {
                showNotification(`This puzzle has ${solution.grids.length} solutions. Showing one of them.`);
            }
            
            // Make most inputs non-editable
            const gridInputs = document.querySelectorAll('.grid-input');
            const stripInputs = document.querySelectorAll('.strip-input');
        
            gridInputs.forEach(input => {
                input.disabled = true;
            });
        
            stripInputs.forEach(input => {
                input.disabled = true;
            });
            
            // Fill the bottom strip with solution values
            solution.lines[0].forEach((value, index) => {
                if (index < stripInputs.length) {
                    stripInputs[index].value = value;
                }
            });
            
            // Fill the small cells with operation data
            // Get all small cell rows (rows 2, 4, 6, 8 - which are index 1, 3, 5, 7)
            const mainGridRows = document.querySelectorAll('.main-grid tr');
            const smallCellRows = [mainGridRows[1], mainGridRows[3], mainGridRows[5], mainGridRows[7]];
        
            smallCellRows.forEach((row, rowIndex) => {
                const cells = row.querySelectorAll('td');
                
                for (let cellIndex = 0; cellIndex < 4; cellIndex++) {
                    const gridIndex = rowIndex * 4 + cellIndex; // Flat array index
                    const cellData = solution.grids[0][gridIndex];
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
                        
            // Update button states
            this.disabled = true;
            document.getElementById('partialSolveBtn').disabled = true; // Add this line
            document.getElementById('unsolveBtn').disabled = false;
            document.getElementById('resetBtn').disabled = false;
            document.getElementById('checkBtn').disabled = true;
        });
        
        document.getElementById('checkBtn').addEventListener('click', function() {
            clearAllHighlights(); 
            document.getElementById('notificationMessage').style.display = 'none';
            document.getElementById('errorMessage').style.display = 'none';
            const gridInput = document.querySelectorAll('.grid-input');
            const stripInput = document.querySelectorAll('.strip-input');
            const smallInput = document.querySelectorAll('.small-input');
            const operationInput = document.querySelectorAll('.operation-input');
        
            const demoModeState = getIsDemoMode(gridInput, stripInput, smallInput, operationInput)
            const dataResult = getDemoOrUserPuzzle(demoModeState, gridInput, stripInput);
            if (Object.hasOwn(dataResult, 'isDemo')) { setIsDemoMode(dataResult.isDemo) }
                
            if (Object.hasOwn(dataResult, 'error')) {
                showError(dataResult.error); 
                return;
            }
        
            const solution = getSolution(dataResult.gridData, dataResult.stripData); 
        
            if (solution === "invalid") {
                showError('There is no solution for this puzzle.');
                return;
            }
        
            // First, check if the user's input combination is valid for ANY solution.
            if (checkUserSolution(solution)) {
                showNotification('All correct. That matches a solution.');
            } else {
                // If the combination is not valid, show an error.
                showError('Some of that does not match any solution.'); 
        
                // THEN, find and highlight the specific cells that are wrong in ALL solutions.
                const conflicts = findUniversalConflicts(solution);
                highlightConflicts(conflicts); 
            }
        });

});


