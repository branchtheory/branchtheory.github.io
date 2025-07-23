import { getSolution } from './solve.js';
let originalGridData = [];
let originalStripData = [];
let originalDataSaved = false; 
let isSolved = false;
let isDemoMode = false;

const GRID_PLACEHOLDERS = ['23', '23', '26', '27', '27', '28', '29', '31', '92', '120', '126', '130', '132', '168', '180', '198'];
const STRIP_PLACEHOLDERS = ['', '', '6', '', '9', '9', '10', '', '', '','', '', '', '', '22', ''];
const DEMO_GRID_DATA = GRID_PLACEHOLDERS.map(str => parseInt(str, 10));
const DEMO_STRIP_DATA = STRIP_PLACEHOLDERS.map(str => str === '' ? 0 : parseInt(str, 10));

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showNotification(message) {
    const notificationDiv = document.getElementById('notificationMessage');
    notificationDiv.textContent = message;
    notificationDiv.style.display = 'block';
}

function isInDemoMode() {
    const gridInputs = document.querySelectorAll('.grid-input');
    const stripInputs = document.querySelectorAll('.strip-input');
    const smallInputs = document.querySelectorAll('.small-input');
    const operationInputs = document.querySelectorAll('.operation-input');
    
    const mainInputsEmpty = Array.from(gridInputs).every(input => !input.value.trim()) &&
                           Array.from(stripInputs).every(input => !input.value.trim());
    
    const smallOpInputsEmpty = Array.from(smallInputs).every(input => !input.value.trim()) &&
                              Array.from(operationInputs).every(input => !input.value.trim());
    
    return mainInputsEmpty && smallOpInputsEmpty;
}

function collectGridData() {
    const gridInputs = document.querySelectorAll('.grid-input');
    const gridData = [];
    
    gridInputs.forEach(input => {
        const value = input.value.trim();
        gridData.push(value === '' ? '0' : value);
    });
    
    return gridData;
}

function collectStripData() {
    const stripInputs = document.querySelectorAll('.strip-input');
    const stripData = [];
    
    stripInputs.forEach(input => {
        const value = input.value.trim();
        stripData.push(value === '' ? '0' : value);
    });
    
    return stripData;
}

function restoreOriginalData() {
    // Restore grid data
    const gridInputs = document.querySelectorAll('.grid-input');
    gridInputs.forEach((input, index) => {
        input.value = originalGridData[index] || '';
        input.disabled = false;
    });
    
    // Restore strip data
    const stripInputs = document.querySelectorAll('.strip-input');
    stripInputs.forEach((input, index) => {
        input.value = originalStripData[index] || '';
        input.disabled = false;
    });
    
    // Clear small cell inputs (not the cells themselves)
    const smallInputs = document.querySelectorAll('.small-input');
    smallInputs.forEach(input => {
        input.value = '';
        input.disabled = false;
    });

    // Clear operation inputs (not the cells themselves)
    const operationInputs = document.querySelectorAll('.operation-input');
    operationInputs.forEach(input => {
        input.value = '';
        input.disabled = false;
    });

    originalDataSaved = false;

    document.getElementById('partialResultsTable').style.display = 'none';
}

function validateAllFieldsFilled() {
    const gridInputs = document.querySelectorAll('.grid-input');
    for (let input of gridInputs) {
        if (!input.value.trim()) {
            return false;
        }
    }
    return true;
}

function validateStripSequential() {
    const stripInputs = document.querySelectorAll('.strip-input');
    const values = [];
    
    // Collect all non-empty values with their positions
    stripInputs.forEach((input, index) => {
        const value = input.value.trim();
        if (value) {
            values.push({ position: index, value: parseInt(value) });
        }
    });
    
    // Check if values are in ascending order
    for (let i = 1; i < values.length; i++) {
        if (values[i].value < values[i-1].value) {
            return false;
        }
        // Also check that earlier positions don't have larger values than later positions
        if (values[i].position < values[i-1].position && values[i].value > values[i-1].value) {
            return false;
        }
    }
    
    // Additional check: ensure no value appears before a smaller value in the strip
    for (let i = 0; i < stripInputs.length - 1; i++) {
        const currentValue = stripInputs[i].value.trim();
        if (!currentValue) continue;
        
        for (let j = i + 1; j < stripInputs.length; j++) {
            const laterValue = stripInputs[j].value.trim();
            if (!laterValue) continue;
            
            if (parseInt(currentValue) > parseInt(laterValue)) {
                return false;
            }
        }
    }
    
    return true;
}

function validateSmallInput(event) {
    const input = event.target;
    const value = input.value;
    
    // Clear all placeholders on first input to any field
    if (value.length === 1) {
        clearAllGridPlaceholders();
        clearAllStripPlaceholders();
    }
    
    // Remove any non-digit characters and limit to 2 digits
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 2) {
        cleanValue = cleanValue.substring(0, 2);
    }
    
    input.value = cleanValue;
}

function validateOperationInput(event) {
    const input = event.target;
    const value = input.value;
    
    // Clear all placeholders on first input to any field
    if (value.length === 1) {
        clearAllGridPlaceholders();
        clearAllStripPlaceholders();
    }
    
    // Only allow + and x, limit to 1 character
    let cleanValue = value.replace(/[^+x*×]/g, '');
    if (cleanValue.length > 1) {
        cleanValue = cleanValue.substring(0, 1);
    }
    
    input.value = cleanValue;
}

function getDemoOrUserData() {
    if (isInDemoMode()) {
        isDemoMode = true; // Lock into demo mode once detected
        return {
            isDemo: true,
            gridData: DEMO_GRID_DATA,
            stripData: DEMO_STRIP_DATA
        };
    }
    
    // Normal mode validation
    if (!validateAllFieldsFilled()) {
        return { error: 'Fill in the grid first.' };
    }
    
    if (!validateStripSequential()) {
        return { error: 'Numbers in the bottom strip must be in ascending order from left to right.' };
    }
    
    return {
        isDemo: false,
        gridData: collectGridData().map(str => parseInt(str, 10)),
        stripData: collectStripData().map(str => parseInt(str, 10))
    };
}

function clearAllData() {
    // Clear grid inputs
    const gridInputs = document.querySelectorAll('.grid-input');
    gridInputs.forEach(input => {
        input.value = '';
        input.disabled = false;
    });
    
    // Clear strip inputs
    const stripInputs = document.querySelectorAll('.strip-input');
    stripInputs.forEach(input => {
        input.value = '';
        input.disabled = false;
    });
    
    // Clear small cell inputs and operation inputs
    const smallInputs = document.querySelectorAll('.small-input');
    smallInputs.forEach(input => {
        input.value = '';
        input.disabled = false;
    });

    const operationInputs = document.querySelectorAll('.operation-input');
    operationInputs.forEach(input => {
        input.value = '';
        input.disabled = false;
    });
    
    // Reset arrays
    originalGridData = [];
    originalStripData = [];

    gridInputs.forEach((input, index) => {
    input.placeholder = GRID_PLACEHOLDERS[index] || '';
    });
    
    stripInputs.forEach((input, index) => {
        input.placeholder = STRIP_PLACEHOLDERS[index] || '';
    });

    isDemoMode = false;
    originalDataSaved = false; 

    document.getElementById('partialResultsTable').style.display = 'none';
}

// Placeholder management
function clearAllGridPlaceholders() {
    const gridInputs = document.querySelectorAll('.grid-input');
    gridInputs.forEach(input => {
        input.placeholder = '';
    });

}

function clearAllStripPlaceholders() {
    const stripInputs = document.querySelectorAll('.strip-input');
    stripInputs.forEach(input => {
        input.placeholder = '';
    });
}

// Input validation functions
function validateGridInput(event) {
    const input = event.target;
    const value = input.value;
    
    // Clear all placeholders on first input to any field
    if (value.length === 1) {
        clearAllGridPlaceholders();
        clearAllStripPlaceholders();
    }
    
    // Remove any non-digit characters and limit to 3 digits
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 3) {
        cleanValue = cleanValue.substring(0, 3);
    }
    
    input.value = cleanValue;
}

function validateStripInput(event) {
    const input = event.target;
    const value = input.value;
    
    // Clear all placeholders on first input to any field
    if (value.length === 1) {
        clearAllGridPlaceholders();
        clearAllStripPlaceholders();
    }
    
    // Remove any non-digit characters and limit to 2 digits
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 2) {
        cleanValue = cleanValue.substring(0, 2);
    }
    
    input.value = cleanValue;
}

function saveOriginalData() {
    if (originalDataSaved) return; // Don't overwrite already saved data
    
    // Save grid data
    const gridInputs = document.querySelectorAll('.grid-input');
    originalGridData = Array.from(gridInputs).map(input => input.value);
    
    // Save strip data
    const stripInputs = document.querySelectorAll('.strip-input');
    originalStripData = Array.from(stripInputs).map(input => input.value);
    
    originalDataSaved = true;
}

function checkUserSolution(solution) {
    // Collect user's input from small cells and operations
    const userBottomStrip = collectUserBottomStrip();
    const userGrid = collectUserGrid();
    
    // Check against each possible solution
    for (let i = 0; i < solution.grids.length; i++) {
        const solutionLine = solution.lines[i];
        const solutionGrid = solution.grids[i];
        
        // Check if user input conflicts with this solution
        if (checkAgainstSingleSolution(userBottomStrip, userGrid, solutionLine, solutionGrid)) {
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

function collectUserGridElements() {
    const smallInputs = document.querySelectorAll('.small-input');
    const operationInputs = document.querySelectorAll('.operation-input');
    
    const userGrid = {};
    // Process each row (4 rows total)
    for (let row = 1; row <= 4; row++) {
        userGrid[row.toString()] = [];
        // Each row has 4 groups of (operand1, operation, operand2)
        for (let col = 0; col < 4; col++) {
            const smallInputBaseIndex = (row - 1) * 8 + col * 2;
            const operationIndex = (row - 1) * 4 + col;

            userGrid[row.toString()].push({
                operand1: smallInputs[smallInputBaseIndex],
                operation: operationInputs[operationIndex],
                operand2: smallInputs[smallInputBaseIndex + 1]
            });
        }
    }
    
    return userGrid;
}

function collectUserBottomStrip() {
    const stripInputs = document.querySelectorAll('.strip-input');
    return Array.from(stripInputs).map(input => {
        const value = input.value.trim();
        return value === '' ? null : parseInt(value, 10);
    });
}

function collectUserGrid() {
    const smallInputs = document.querySelectorAll('.small-input');
    const operationInputs = document.querySelectorAll('.operation-input');
    
    const userGrid = {};
    // Process each row (4 rows total)
    for (let row = 1; row <= 4; row++) {
        userGrid[row.toString()] = [];
        // Each row has 4 groups of (operand1, operation, operand2)
        for (let col = 0; col < 4; col++) {
            // Corrected indexing: There are 8 small inputs per row.
            const smallInputBaseIndex = (row - 1) * 8 + col * 2;
            const operationIndex = (row - 1) * 4 + col;

            const operand1Input = smallInputs[smallInputBaseIndex];
            const operationInput = operationInputs[operationIndex];
            const operand2Input = smallInputs[smallInputBaseIndex + 1]; // Get the next small input
            
            const operand1 = operand1Input?.value.trim();
            const operation = operationInput?.value.trim();
            const operand2 = operand2Input?.value.trim();

            userGrid[row.toString()].push({
                operand1: operand1 === '' ? null : parseInt(operand1, 10),
                operation: operation === '' ? null : operation,
                operand2: operand2 === '' ? null : parseInt(operand2, 10)
            });
        }
    }
    
    return userGrid;
}
function checkAgainstSingleSolution(userBottomStrip, userGrid, solutionLine, solutionGrid) {
    // Check bottom strip
    for (let i = 0; i < userBottomStrip.length; i++) {
        if (userBottomStrip[i] !== null && userBottomStrip[i] !== solutionLine[i]) {
            return false; // Conflict found
        }
    }
    
    // Check grid operations
    for (let row = 1; row <= 4; row++) {
        const rowKey = row.toString();
        const userRow = userGrid[rowKey];
        const solutionRow = solutionGrid[rowKey];
        
        for (let col = 0; col < 4; col++) {
            const userCell = userRow[col];
            const solutionCell = solutionRow[col];
            
            // Check operands - collect user operands and compare as sets
            const userOperands = [];
            if (userCell.operand1 !== null) userOperands.push(userCell.operand1);
            if (userCell.operand2 !== null) userOperands.push(userCell.operand2);
            
            // If user has entered operands, they must match solution operands (ignoring order)
            if (userOperands.length > 0) {
                const sortedUserOperands = [...userOperands].sort();
                const sortedSolutionOperands = [...solutionCell.operands].sort();
                
                // Check if partial match is valid (user may have only filled some operands)
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
                    if (op === '×' || op === '*' || op === 'x') return 'x';
                    return op;
                };
            
                const normalizedUserOp = normalizeOp(userCell.operation);
                const normalizedSolutionOp = normalizeOp(solutionCell.operation);
            
                if (normalizedUserOp !== normalizedSolutionOp) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

function partialSolve() {
    const dataResult = getDemoOrUserData();
    
    if (dataResult.error) {
        showError(dataResult.error);
        return;
    }

    // Get solution data
    const solution = getSolution(dataResult.gridData, dataResult.stripData);
    
    if (solution === "invalid") {
        showError('There is no solution for this puzzle.');
        return;
    }

    saveOriginalData();
    
    // Generate the partial results table
    generatePartialResultsTable(solution.crunchedNumbers);

    document.getElementById('unsolveBtn').disabled = false;

    setTimeout(() => {
        document.getElementById('partialResultsTable').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

function generatePartialResultsTable(partialSolveArray) {
  const table = document.getElementById('partialResultsTable');
  table.innerHTML = ''; // Clear existing content

  for (let i = 0; i < partialSolveArray.length; i++) {
    const [primaryValue, dataArray] = partialSolveArray[i];

    // Header row for this primary value
    const keyHeaderRow = document.createElement('tr');
    const keyCell = document.createElement('td');
    keyCell.rowSpan = 2;
    keyCell.className = 'key-cell';
    keyCell.textContent = primaryValue;
    keyHeaderRow.appendChild(keyCell);

    // Paired value headers
    dataArray.forEach(item => {
      const pairedValueCell = document.createElement('td');
      pairedValueCell.colSpan = 3;
      pairedValueCell.className = 'paired-value-header';
      pairedValueCell.textContent = item.pairedValue;
      keyHeaderRow.appendChild(pairedValueCell);
    });

    table.appendChild(keyHeaderRow);

    // Data row: operand1, operation, operand2
    const dataRow = document.createElement('tr');
    dataArray.forEach(item => {
      const operand1Cell = document.createElement('td');
      operand1Cell.className = 'operand-cell';
      operand1Cell.textContent = item.operand1;
      dataRow.appendChild(operand1Cell);

      const operationCell = document.createElement('td');
      operationCell.className = 'operation-cell';
      operationCell.textContent = item.operation;
      dataRow.appendChild(operationCell);

      const operand2Cell = document.createElement('td');
      operand2Cell.className = 'operand-cell';
      operand2Cell.textContent = item.operand2;
      dataRow.appendChild(operand2Cell);
    });

    table.appendChild(dataRow);
  }

  // Show the table
  table.style.display = 'table';
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
    
    // Existing validation event listeners...
    gridInputs.forEach(input => {
        input.addEventListener('input', validateGridInput);
    });
    
    stripInputs.forEach(input => {
        input.addEventListener('input', validateStripInput);
    });
});

// Solve button event listener
document.getElementById('solveBtn').addEventListener('click', function() {
    clearAllHighlights();
    document.getElementById('notificationMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    
    const dataResult = getDemoOrUserData();
    
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
    const bottomStripInputs = document.querySelectorAll('.bottom-strip input');
    solution.lines[0].forEach((value, index) => {
        if (index < bottomStripInputs.length) {
            bottomStripInputs[index].value = value;
        }
    });
    
    // Fill the small cells with operation data
    // Get all small cell rows (rows 2, 4, 6, 8 - which are index 1, 3, 5, 7)
    const mainGridRows = document.querySelectorAll('.main-grid tr');
    const smallCellRows = [mainGridRows[1], mainGridRows[3], mainGridRows[5], mainGridRows[7]];

    smallCellRows.forEach((row, rowIndex) => {
        const gridRowNumber = rowIndex + 1; // Convert to 1,2,3,4
        const cells = row.querySelectorAll('td');
        
        solution.grids[0][gridRowNumber.toString()].forEach((cellData, cellIndex) => {
            const startIdx = cellIndex * 3; // Each group of 3 cells (operand1, operator, operand2)
            if (startIdx + 2 < cells.length) {
                // Left cell: operand1, Middle cell: operation, Right cell: operand2
                const operand1Input = cells[startIdx].querySelector('input');
                const operationInput = cells[startIdx + 1].querySelector('input');
                const operand2Input = cells[startIdx + 2].querySelector('input');
                
                if (operand1Input) operand1Input.value = cellData.operands[0];
                if (operationInput) operationInput.value = cellData.operation;
                if (operand2Input) operand2Input.value = cellData.operands[1];
            }
        });
    });

    generatePartialResultsTable(solution.crunchedNumbers);
    document.getElementById('partialResultsTable').style.display = 'table';
                
    // Update button states
    this.disabled = true;
    document.getElementById('partialSolveBtn').disabled = true; // Add this line
    document.getElementById('unsolveBtn').disabled = false;
    document.getElementById('resetBtn').disabled = false;
    document.getElementById('checkBtn').disabled = true;
    isSolved = true;
});

// Add validation for new input types
const smallInputs = document.querySelectorAll('.small-input');
smallInputs.forEach(input => {
    input.addEventListener('input', validateSmallInput);
});

const operationInputs = document.querySelectorAll('.operation-input');
operationInputs.forEach(input => {
    input.addEventListener('input', validateOperationInput);
});

document.getElementById('checkBtn').addEventListener('click', function() {
    clearAllHighlights(); // Clear previous highlights first
    document.getElementById('notificationMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    const dataResult = getDemoOrUserData();
    
    if (dataResult.error) {
        showError(dataResult.error);
        return;
    }
    
    const solution = getSolution(dataResult.gridData, dataResult.stripData);
    
    if (solution === "invalid") {
        showError('There is no solution for this puzzle.');
        return;
    } else if (checkUserSolution(solution)) {
        showNotification('All correct.');
    } else {
        showError('Some of that does not match any solution.');
    }

    // --- New Logic to find and highlight conflicts ---

    // Find cells that are wrong in ALL solutions
    const findUniversalConflicts = () => {
        const userGridElements = collectUserGridElements();
        const userStripElements = document.querySelectorAll('.strip-input');
        let universalConflicts = new Set();

        // Initialize with all filled-in inputs as potential conflicts
        const allUserInputElements = document.querySelectorAll('.strip-input, .small-input, .operation-input');
        allUserInputElements.forEach(el => {
            if (el.value.trim() !== '') {
                universalConflicts.add(el);
            }
        });

        // For each potential solution, remove any cells that are VALID in it.
        // What remains after checking all solutions must be wrong in all of them.
        for (let i = 0; i < solution.grids.length; i++) {
            const solutionGrid = solution.grids[i];
            const solutionLine = solution.lines[i];
            const conflictsInThisIteration = new Set(universalConflicts);

            conflictsInThisIteration.forEach(el => {
                let isCorrectInThisSolution = false;
                
                // Check if the element is in the grid or strip and if it matches this solution
                if (el.classList.contains('strip-input')) {
                    const elIndex = Array.from(userStripElements).indexOf(el);
                    if (parseInt(el.value, 10) === solutionLine[elIndex]) {
                        isCorrectInThisSolution = true;
                    }
                } else { // It's a grid input
                    // Find the element's position in the grid
                    for (let row = 1; row <= 4; row++) {
                        for (let col = 0; col < 4; col++) {
                            const gridCellElements = userGridElements[row.toString()][col];
                            const solutionCell = solutionGrid[row.toString()][col];

                            const userOperands = [];
                            const userElements = [];
                            if (gridCellElements.operand1 && gridCellElements.operand1.value.trim()) {
                                userOperands.push(parseInt(gridCellElements.operand1.value, 10));
                                userElements.push(gridCellElements.operand1);
                            }
                            if (gridCellElements.operand2 && gridCellElements.operand2.value.trim()) {
                                userOperands.push(parseInt(gridCellElements.operand2.value, 10));
                                userElements.push(gridCellElements.operand2);
                            }
                            
                            if (userOperands.length > 0) {
                                const sortedUserOperands = [...userOperands].sort();
                                const sortedSolutionOperands = [...solutionCell.operands].sort();
                                
                                let operandsMatch = true;
                                for (let userOp of userOperands) {
                                    if (!solutionCell.operands.includes(userOp)) {
                                        operandsMatch = false;
                                        break;
                                    }
                                }
                                
                                if (userOperands.length === 2 && JSON.stringify(sortedUserOperands) !== JSON.stringify(sortedSolutionOperands)) {
                                    operandsMatch = false;
                                }
                                
                                if (operandsMatch) {
                                    userElements.forEach(el => {
                                        if (el === element) isCorrectInThisSolution = true;
                                    });
                                }
                            }
                        }
                    }
                }

                // If this element's value is correct for this solution, it's not universally wrong.
                // Remove it from the set for this iteration.
                if (isCorrectInThisSolution) {
                    universalConflicts.delete(el);
                }
            });
        }
        return Array.from(universalConflicts);
    };

    const conflictsToHighlight = findUniversalConflicts();
    highlightConflicts(conflictsToHighlight);
});

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
    isSolved = false;
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
    isSolved = false;
});

// Partial Solve button event listener
document.getElementById('partialSolveBtn').addEventListener('click', function() {
    clearAllHighlights();
    document.getElementById('notificationMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    partialSolve();
});
