export const GRID_PLACEHOLDERS = ['23', '23', '26', '27', '27', '28', '29', '31', '92', '120', '126', '130', '132', '168', '180', '198'];
export const STRIP_PLACEHOLDERS = ['', '', '6', '', '9', '9', '10', '', '', '','', '', '', '', '22', ''];
export const DEMO_GRID_DATA = GRID_PLACEHOLDERS.map(str => parseInt(str, 10));
export const DEMO_STRIP_DATA = STRIP_PLACEHOLDERS.map(str => str === '' ? 0 : parseInt(str, 10));
let originalGridData = [];
let originalStripData = [];
let originalDataSaved = false; 
let isDemoMode = false;

export function getIsDemoMode(gridInputs, stripInputs, smallInputs, operationInputs) {
    const mainInputsEmpty = Array.from(gridInputs).every(input => !input.value.trim()) &&
                           Array.from(stripInputs).every(input => !input.value.trim());
    
    const smallOpInputsEmpty = Array.from(smallInputs).every(input => !input.value.trim()) &&
                              Array.from(operationInputs).every(input => !input.value.trim());
    
    return mainInputsEmpty && smallOpInputsEmpty;
}

export function setIsDemoMode(state) {
  isDemoMode = state;
}

export function restoreOriginalData() {
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

    document.getElementById('partialSolutionTable').style.display = 'none';
}

export function clearAllData() {
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

    document.getElementById('partialSolutionTable').style.display = 'none';
}

export function saveOriginalData() {
    if (originalDataSaved) return; // Don't overwrite already saved data
    
    // Save grid data
    const gridInputs = document.querySelectorAll('.grid-input');
    originalGridData = Array.from(gridInputs).map(input => input.value);
    
    // Save strip data
    const stripInputs = document.querySelectorAll('.strip-input');
    originalStripData = Array.from(stripInputs).map(input => input.value);
    
    originalDataSaved = true;
}
