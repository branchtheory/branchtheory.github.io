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
    let cleanValue = value.replace(/[^+x]/g, '');
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
            const baseIndex = (row - 1) * 12 + col * 3; // 12 cells per row, 3 cells per group
            
            const operand1Input = smallInputs[baseIndex];
            const operationInput = operationInputs[(row - 1) * 4 + col]; // 4 operations per row
            const operand2Input = smallInputs[baseIndex + 2];

            console.log("operand1 raw input: " + operand1Input);
            console.log("operation raw input: " + operationInput);
            console.log("operand2 raw input: " + operand2Input);
            
            const operand1 = operand1Input?.value.trim();
            const operation = operationInput?.value.trim();
            const operand2 = operand2Input?.value.trim();

            console.log("operand1 trimmed: " + operand1);
            console.log("operation trimmed: " + operation);
            console.log("operand2 trimmed: " + operand2);
            
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
            
            // Check operand1
            if (userCell.operand1 !== null && userCell.operand1 !== solutionCell.operand1) {
                console.log(solutionCell.operand1);
                console.log(userCell.operand1);
                return false;
            }
            
            // Check operation (convert × to x for comparison)
            if (userCell.operation !== null) {
                const normalizedUserOp = userCell.operation === '×' ? 'x' : userCell.operation;
                const normalizedSolutionOp = solutionCell.operation === '×' ? 'x' : solutionCell.operation;
                if (normalizedUserOp !== normalizedSolutionOp) {
                    console.log(solutionCell.operation);
                    console.log(userCell.operation);
                    return false;
                }
            }
            
            // Check operand2
            if (userCell.operand2 !== null && userCell.operand2 !== solutionCell.operand2) {
                console.log(solutionCell.operand2);
                console.log(userCell.operand2);
                return false;
            }
        }
    }
    
    return true; // No conflicts found
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
                
                if (operand1Input) operand1Input.value = cellData.operand1;
                if (operationInput) operationInput.value = cellData.operation;
                if (operand2Input) operand2Input.value = cellData.operand2;
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
    
    // Check user's solution
    if (checkUserSolution(solution)) {
        showNotification('✓ All entered values are correct!');
    } else {
        showError('✗ Some entered values conflict with the solution.');
    }
});

// Unsolve button event listener
document.getElementById('unsolveBtn').addEventListener('click', function() {
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
    partialSolve();
});
