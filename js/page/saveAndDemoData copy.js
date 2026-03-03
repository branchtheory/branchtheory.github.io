import { 
    DEMO_GRID_DATA, 
    DEMO_LINE_DATA,
} from './getPuzzle.js';

let originalGridData = [];
let originalLineData = [];
let originalDataSaved = false; 
let isDemoMode = false;

export function getIsDemoMode() {
    const bigNumberInputs = Array.from(document.querySelectorAll('.big-input'));
    
    return bigNumberInputs[0].placeholder !== ''; // could be any of them -- all placeholders should be ''s
}

export function setIsDemoMode(state) {
  isDemoMode = state;
}

export function restoreOriginalData() {
    // Restore grid data
    const bigNumberInputs = document.querySelectorAll('.big-input');
    bigNumberInputs.forEach((input, index) => {
        input.value = originalGridData[index] || '';
        input.disabled = false;
    });
    
    // Restore line data
    const lineInputs = document.querySelectorAll('.line-input');
    lineInputs.forEach((input, index) => {
        input.value = originalLineData[index] || '';
        input.disabled = false;
    });
    
    // Clear small cell inputs (not the cells themselves)
    const operandInputs = document.querySelectorAll('.operand-input');
    operandInputs.forEach(input => {
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

    document.getElementById('partialSolutionTable').style.display = 'none';
}

export function clearAllData() {
    // Clear grid inputs
    const bigNumberInputs = document.querySelectorAll('.big-input');
    bigNumberInputs.forEach(input => {
        input.value = '';
        input.disabled = false;
    });
    
    // Clear line inputs
    const lineInputs = document.querySelectorAll('.line-input');
    lineInputs.forEach(input => {
        input.value = '';
        input.disabled = false;
    });
    
    // Clear small cell inputs and operation inputs
    const operandInputs = document.querySelectorAll('.operand-input');
    operandInputs.forEach(input => {
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
    originalLineData = [];

    bigNumberInputs.forEach((input, index) => {
    input.placeholder = DEMO_GRID_DATA[index] || '';
    });
    
    lineInputs.forEach((input, index) => {
        input.placeholder = DEMO_LINE_DATA[index] || '';
    });

    isDemoMode = false;
    originalDataSaved = false; 

    document.getElementById('partialSolutionTable').style.display = 'none';
}

export function saveOriginalData() {
    if (originalDataSaved) return; // Don't overwrite already saved data
    
    // Save grid data
    const bigNumberInputs = document.querySelectorAll('.big-input');
    originalGridData = Array.from(bigNumberInputs).map(input => input.value);
    
    // Save line data
    const lineInputs = document.querySelectorAll('.line-input');
    originalLineData = Array.from(lineInputs).map(input => input.value);
    
    originalDataSaved = true;
}
