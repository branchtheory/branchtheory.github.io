import { getSolution } from './solve.js';
// Store original data for restore functionality
let originalGridData = [];
let originalStripData = [];
let isSolved = false;

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
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

function saveOriginalData() {
    // Save grid data
    const gridInputs = document.querySelectorAll('.grid-input');
    originalGridData = Array.from(gridInputs).map(input => input.value);
    
    // Save strip data
    const stripInputs = document.querySelectorAll('.strip-input');
    originalStripData = Array.from(stripInputs).map(input => input.value);
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
    
    // Clear small cells
    const smallCells = document.querySelectorAll('.small-cell');
    smallCells.forEach(cell => {
        cell.textContent = '';
    });

    // Clear operation cells too
    const operationCells = document.querySelectorAll('.small-operation-cell');
    operationCells.forEach(cell => {
        cell.textContent = '';
    });

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

function getDemoOrUserData() {
    const gridInputs = document.querySelectorAll('.grid-input');
    const stripInputs = document.querySelectorAll('.strip-input');
    const hasGridPlaceholders = Array.from(gridInputs).some(input => input.placeholder && !input.value.trim());
    const hasStripPlaceholders = Array.from(stripInputs).some(input => input.placeholder && !input.value.trim());
    
    if (hasGridPlaceholders && hasStripPlaceholders) {
        // Demo mode - use hardcoded data
        return {
            isDemo: true,
            gridData: [38, 500, 37, 28, 420, 50, 256, 40, 41, 264, 32, 336, 192, 52, 342, 60],
            stripData: [0, 6, 8, 0, 0, 0, 18, 19, 0, 21, 24, 0, 0, 0, 0, 50]
        };
    } else {
        // Normal mode - validate and collect user data
        if (!validateAllFieldsFilled()) {
            return { isDemo: false, error: 'Fill in the grid first.' };
        }
        
        if (!validateStripSequential()) {
            return { isDemo: false, error: 'Numbers in the bottom strip must be in ascending order from left to right.' };
        }
        
        return {
            isDemo: false,
            gridData: collectGridData().map(str => parseInt(str, 10)),
            stripData: collectStripData().map(str => parseInt(str, 10))
        };
    }
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
    
    // Clear small cells and operation cells
    const smallCells = document.querySelectorAll('.small-cell');
    smallCells.forEach(cell => {
        cell.textContent = '';
    });
    
    const operationCells = document.querySelectorAll('.small-operation-cell');
    operationCells.forEach(cell => {
        cell.textContent = '';
    });
    
    // Reset arrays
    originalGridData = [];
    originalStripData = [];

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
    
    // Clear all grid placeholders on first input
    if (value.length === 1) {
        clearAllGridPlaceholders();
    }
    
    // Remove any non-digit characters
    let cleanValue = value.replace(/\D/g, '');
    
    // Limit to 3 digits
    if (cleanValue.length > 3) {
        cleanValue = cleanValue.substring(0, 3);
    }
    
    input.value = cleanValue;
}

function validateStripInput(event) {
    const input = event.target;
    const value = input.value;
    
    // Clear all strip placeholders on first input
    if (value.length === 1) {
        clearAllStripPlaceholders();
    }
    
    // Remove any non-digit characters
    let cleanValue = value.replace(/\D/g, '');
    
    // Limit to 2 digits
    if (cleanValue.length > 2) {
        cleanValue = cleanValue.substring(0, 2);
    }
    
    input.value = cleanValue;
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

function generatePartialResultsTable(partialSolveMap) {
    const table = document.getElementById('partialResultsTable');
    table.innerHTML = ''; // Clear existing content
    
    // Generate rows for each key in the map (in order)
    for (let [primaryValue, dataArray] of partialSolveMap) {
        // Header row for this primary value
        const keyHeaderRow = document.createElement('tr');
        const keyCell = document.createElement('td');
        keyCell.rowSpan = 2;
        keyCell.className = 'key-cell';
        keyCell.textContent = primaryValue;
        keyHeaderRow.appendChild(keyCell);
        
        // Add paired value headers
        dataArray.forEach(item => {
            const pairedValueCell = document.createElement('td');
            pairedValueCell.colSpan = 3;
            pairedValueCell.className = 'paired-value-header';
            pairedValueCell.textContent = item.pairedValue;
            keyHeaderRow.appendChild(pairedValueCell);
        });
        
        table.appendChild(keyHeaderRow);
        
        // Data row for operands and operations
        const dataRow = document.createElement('tr');
        dataArray.forEach(item => {
            // Operand1
            const operand1Cell = document.createElement('td');
            operand1Cell.className = 'operand-cell';
            operand1Cell.textContent = item.operand1;
            dataRow.appendChild(operand1Cell);
            
            // Operation
            const operationCell = document.createElement('td');
            operationCell.className = 'operation-cell';
            operationCell.textContent = item.operation;
            dataRow.appendChild(operationCell);
            
            // Operand2
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
    // Grid inputs (3 digits max)
    const gridInputs = document.querySelectorAll('.grid-input');
    gridInputs.forEach(input => {
        input.addEventListener('input', validateGridInput);
    });
    
    // Strip inputs (2 digits max)
    const stripInputs = document.querySelectorAll('.strip-input');
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
    
    // Make all inputs non-editable
    const allInputs = document.querySelectorAll('input');
    allInputs.forEach(input => {
        input.disabled = true;
    });
    
    // Fill the bottom strip with solution values
    const bottomStripInputs = document.querySelectorAll('.bottom-strip input');
    solution.line.forEach((value, index) => {
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
        
        solution.grid[gridRowNumber.toString()].forEach((cellData, cellIndex) => {
            const startIdx = cellIndex * 3; // Each group of 3 cells (operand1, operator, operand2)
            if (startIdx + 2 < cells.length) {
                // Left cell: operand1, Middle cell: operation, Right cell: operand2
                cells[startIdx].textContent = cellData.operand1;         // Left cell
                cells[startIdx + 1].textContent = cellData.operation;    // Middle cell (operator)
                cells[startIdx + 2].textContent = cellData.operand2;     // Right cell
            }
        });
    });

    generatePartialResultsTable(solution.crunchedNumbers);
    document.getElementById('partialResultsTable').style.display = 'table';
                
    // Update button states
    this.disabled = true;
    document.getElementById('unsolveBtn').disabled = false;
    document.getElementById('resetBtn').disabled = false;
    isSolved = true;
});

// Unsolve button event listener
document.getElementById('unsolveBtn').addEventListener('click', function() {
    restoreOriginalData();
    
    // Update button states
    document.getElementById('solveBtn').disabled = false;
    this.disabled = true;
    document.getElementById('resetBtn').disabled = false;
    isSolved = false;
});

// Reset button event listener
document.getElementById('resetBtn').addEventListener('click', function() {
    clearAllData();
    
    // Update button states
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('unsolveBtn').disabled = true;
    this.disabled = false;
    isSolved = false;
});

// Partial Solve button event listener
document.getElementById('partialSolveBtn').addEventListener('click', function() {
    partialSolve();
});
