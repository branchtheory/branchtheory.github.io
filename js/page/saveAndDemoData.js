export const DEMO_GRID_DATA = [23, 23, 26, 27, 27, 28, 29, 31, 92, 120, 126, 130, 132, 168, 180, 198];
export const DEMO_STRIP_DATA = [4, null, 6, null, 9, 9, 10, 12, 13, null, null, null, null, null, 22, null];

let originalGridData = [];
let originalStripData = [];
let originalDataSaved = false; 
let isDemoMode = false;

export function getIsDemoMode() {
    const bigNumberInputs = document.querySelectorAll('.big-input');
    const stripInputs = document.querySelectorAll('.strip-input');
    const operandInputs = document.querySelectorAll('.operand-input');
    const operationInputs = document.querySelectorAll('.operation-input');

    const mainInputsEmpty = Array.from(bigNumberInputs).every(input => !input.value.trim()) &&
                           Array.from(stripInputs).every(input => !input.value.trim());
    
    const smallOpInputsEmpty = Array.from(operandInputs).every(input => !input.value.trim()) &&
                              Array.from(operationInputs).every(input => !input.value.trim());
    
    return mainInputsEmpty && smallOpInputsEmpty;
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
    
    // Restore strip data
    const stripInputs = document.querySelectorAll('.strip-input');
    stripInputs.forEach((input, index) => {
        input.value = originalStripData[index] || '';
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
    
    // Clear strip inputs
    const stripInputs = document.querySelectorAll('.strip-input');
    stripInputs.forEach(input => {
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
    originalStripData = [];

    bigNumberInputs.forEach((input, index) => {
    input.placeholder = DEMO_GRID_DATA[index] || '';
    });
    
    stripInputs.forEach((input, index) => {
        input.placeholder = DEMO_STRIP_DATA[index] || '';
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
    
    // Save strip data
    const stripInputs = document.querySelectorAll('.strip-input');
    originalStripData = Array.from(stripInputs).map(input => input.value);
    
    originalDataSaved = true;
}
