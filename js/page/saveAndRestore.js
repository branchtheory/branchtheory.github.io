import { 
    DEMO_GRID_DATA, 
    DEMO_LINE_DATA,
} from './getPuzzle.js';

let originalGridData = [];
let originalLineData = [];
let originalOperandData = [];
let originalOperationData = [];
let originalDataSaved = false; 
let isDemoMode = false;

const bigNumberInputs = document.querySelectorAll('.big-input');
const lineInputs = document.querySelectorAll('.line-input');
const operandInputs = document.querySelectorAll('.operand-input');
const operationInputs = document.querySelectorAll('.operation-input');

const inputGroups = [
    { inputs: bigNumberInputs, getData: () => originalGridData },
    { inputs: lineInputs, getData: () => originalLineData },
    { inputs: operandInputs, getData: () => originalOperandData },
    { inputs: operationInputs, getData: () => originalOperationData },
];

export function getIsDemoMode() {
    const bigNumberInputs = Array.from(document.querySelectorAll('.big-input'));
    return bigNumberInputs[0].placeholder !== '';
}

export function setIsDemoMode(state) {
  isDemoMode = state;
}

export function restoreOriginalData() {
    inputGroups.forEach(({ inputs, getData }) => {
        inputs.forEach((input, index) => {
            input.value = getData()[index] || '';
            input.disabled = false;
        });
    });
    
    originalDataSaved = false;
}

export function clearAllData() {
    inputGroups.forEach(({ inputs }) => {
        inputs.forEach(input => {
            input.value = '';
            input.disabled = false;
        });
    });

    originalGridData = [];
    originalLineData = [];
    originalOperandData = [];
    originalOperationData = [];

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
    
    originalGridData = Array.from(bigNumberInputs).map(input => input.value);
    originalLineData = Array.from(lineInputs).map(input => input.value);
    originalOperandData = Array.from(operandInputs).map(input => input.value);
    originalOperationData = Array.from(operationInputs).map(input => input.value);

    originalDataSaved = true;
}
