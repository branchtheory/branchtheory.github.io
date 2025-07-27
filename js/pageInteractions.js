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
    getDemoOrUserPuzzle,
    collectUserGridData, 
    collectUserStrip 
} from './page/getData.js';

function checkUserSolution(solution) {
    // Collect user's input from small cells and operations
    const userStrip = collectUserStrip();
    const userGrid = collectUserGridData();
    
    // Check against each possible solution
    for (let i = 0; i < solution.grids.length; i++) {
        const solutionLine = solution.lines[i];
        const solutionGrid = solution.grids[i];
        
        // Check if user input conflicts with this solution
        if (checkAgainstSingleSolution(userStrip, userGrid, solutionLine, solutionGrid)) {
            return true; // No conflicts found with this solution
        }
    }
    
    return false; // Conflicts found with all solutions
}

function clearAllHighlights() {
    const allInputs = document.querySelectorAll('.grid-input, .strip-input, .small-input, .operation-input');
    allInputs.forEach(input => {
        input.classList.remove('conflict-cell');
    });
}

function highlightConflicts(elements) {
    elements.forEach(el => {
        el.classList.add('conflict-cell');
    });
}

function checkAgainstSingleSolution(userStrip, userGrid, solutionLine, solutionGrid) {
    // Check bottom strip
    for (let i = 0; i < userStrip.length; i++) {
        if (userStrip[i] !== null && userStrip[i] !== solutionLine[i]) {
            return false;
        }
    }
    
    // Check grid operations (now flat array)
    for (let i = 0; i < 16; i++) {
        const userCell = userGrid[i];
        const solutionCell = solutionGrid[i];
        
        // Check operands - collect user operands and compare as sets
        const userOperands = [];
        if (userCell.operand1 !== null) userOperands.push(userCell.operand1);
        if (userCell.operand2 !== null) userOperands.push(userCell.operand2);
        
        // If user has entered operands, they must match solution operands (ignoring order)
        if (userOperands.length > 0) {
            const sortedUserOperands = [...userOperands].sort();
            const sortedSolutionOperands = [...solutionCell.operands].sort();
            
            // Check if partial match is valid
            for (let userOp of userOperands) {
                if (!solutionCell.operands.includes(userOp)) {
                    return false;
                }
            }
            
            // If user filled both operands, ensure no duplicates unless solution has duplicates
            if (userOperands.length === 2) {
                if (JSON.stringify(sortedUserOperands) !== JSON.stringify(sortedSolutionOperands)) {
                    return false;
                }
            }
        }
        
        // Check operation
        if (userCell.operation !== null) {
            const normalizeOp = (op) => {
                if (op === '×' || op === '*' || op === 'X' || op === 'x') return 'x';
                return op;
            };
        
            const normalizedUserOp = normalizeOp(userCell.operation);
            const normalizedSolutionOp = normalizeOp(solutionCell.operation);
        
            if (normalizedUserOp !== normalizedSolutionOp) {
                return false;
            }
        }
    }
    
    return true;
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

   setUpInputValidation()
});

// Solve button event listener
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

function isElementCorrectForSolution(element, solutionLine, solutionGrid, userGridElements) {
    // Check if it's a bottom strip input
    if (element.classList.contains('strip-input')) {
        const stripInputs = Array.from(document.querySelectorAll('.strip-input'));
        const elIndex = stripInputs.indexOf(element);
        if (elIndex > -1 && parseInt(element.value, 10) === solutionLine[elIndex]) {
            return true;
        }
    }

    // Check if it's a grid input (operand or operation)
    for (let i = 0; i < userGridElements.length; i++) {
        const gridCellElements = userGridElements[i];
        const solutionCell = solutionGrid[i];

        // Check if the element is an operand in this grid cell
        if (gridCellElements.operand1 === element || gridCellElements.operand2 === element) {
            const operand1Value = gridCellElements.operand1.value.trim();
            const operand2Value = gridCellElements.operand2.value.trim();

            // If both operand fields are filled, they must be validated as a pair.
            if (operand1Value && operand2Value) {
                // Collect, parse, and sort the user's operands numerically.
                const userOperands = [parseInt(operand1Value, 10), parseInt(operand2Value, 10)];
                userOperands.sort((a, b) => a - b);

                // Sort the solution's operands numerically.
                const solutionOperands = [...solutionCell.operands];
                solutionOperands.sort((a, b) => a - b);

                // The sorted pairs must match exactly [cite: 178-181, 229-232].
                if (JSON.stringify(userOperands) === JSON.stringify(solutionOperands)) {
                    return true;
                }
            }
            // If only one operand field is filled, check if it exists in the solution's operands.
            else {
                const userValue = parseInt(element.value, 10);
                if (solutionCell.operands.includes(userValue)) {
                    return true;
                }
            }
        }

        // Check if the element is the operation in this grid cell
        if (gridCellElements.operation === element) {
            const normalizeOp = (op) => (op === '×' || op === '*' || op === 'X' || op === 'x') ? 'x' : op; //
            const normalizedUserOp = normalizeOp(element.value);
            const normalizedSolutionOp = normalizeOp(solutionCell.operation);
            if (normalizedUserOp === normalizedSolutionOp) {
                return true;
            }
        }
    }

    return false; // The element's value was not correct for this specific solution.
}

function findUniversalConflicts(solution) {
    // Get all elements the user has typed a value into
    const allUserInputElements = Array.from(document.querySelectorAll('.strip-input, .small-input, .operation-input'))
        .filter(el => el.value.trim() !== '');

    // Get the mapping of elements to their grid positions
    const userGridElements = collectUserGridData(true);
    const universalConflicts = [];

    // Check each user-filled element
    for (const element of allUserInputElements) {
        let isCorrectInAtLeastOneSolution = false;

        // Loop through all possible solutions to see if this element is valid in any of them
        for (let i = 0; i < solution.grids.length; i++) {
            const solutionLine = solution.lines[i]; 
            const solutionGrid = solution.grids[i];

            // Use the helper to check against this specific solution
            if (isElementCorrectForSolution(element, solutionLine, solutionGrid, userGridElements)) {
                isCorrectInAtLeastOneSolution = true;
                break; // It's valid in this solution, so it's not a universal conflict.
                       // We can stop checking other solutions for this element.
            }
        }

        // If, after checking all solutions, it was never correct, it's a universal conflict.
        if (!isCorrectInAtLeastOneSolution) {
            universalConflicts.push(element);
        }
    }

    return universalConflicts;
}

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
