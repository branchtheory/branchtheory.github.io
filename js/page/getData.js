import { 
        validateAllFieldsFilled, 
        validateStripSequential
} from './validateInput.js';
import { 
        DEMO_GRID_DATA, 
        DEMO_STRIP_DATA,
        getIsDemoMode,
        setIsDemoMode
} from './saveAndDemoData.js';

export function collectUserGridData(returnElements = false) {
    const gridCells = getGridCellElements();
    
    return gridCells.map(cell => {
        if (returnElements) {
            // Return DOM elements
            return {
                operand1: cell.operand1Element,
                operation: cell.operationElement,
                operand2: cell.operand2Element
            };
        } else {
            // Return parsed values
            const operand1 = cell.operand1Element?.value.trim();
            const operation = cell.operationElement?.value.trim();
            const operand2 = cell.operand2Element?.value.trim();

            return {
                operand1: operand1 === '' ? null : parseInt(operand1, 10),
                operation: operation === '' ? null : operation,
                operand2: operand2 === '' ? null : parseInt(operand2, 10)
            };
        }
    });
}

export function collectUserStrip() {
    const stripInputs = document.querySelectorAll('.strip-input');
    return Array.from(stripInputs).map(input => {
        const value = input.value.trim();
        return value === '' ? null : parseInt(value, 10);
    });
}

function getGridCellElements() {
    const smallInputs = document.querySelectorAll('.small-input');
    const operationInputs = document.querySelectorAll('.operation-input');
    
    const gridCells = [];
    
    // Process each of the 16 grid positions
    for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        
        const smallInputBaseIndex = row * 8 + col * 2;
        const operationIndex = row * 4 + col;

        const operand1Element = smallInputs[smallInputBaseIndex];
        const operationElement = operationInputs[operationIndex];
        const operand2Element = smallInputs[smallInputBaseIndex + 1];
        
        gridCells.push({
            operand1Element,
            operationElement,
            operand2Element
        });
    }
    
    return gridCells;
}

export function getDemoOrUserPuzzle() {
    const demoState = getIsDemoMode();
    setIsDemoMode(demoState);
        
    const gridInputs = document.querySelectorAll('.grid-input');
    const stripInputs = document.querySelectorAll('.strip-input');

    if (demoState) {
        return {
            gridData: DEMO_GRID_DATA,
            stripData: DEMO_STRIP_DATA
        };
    }
    
    // Normal mode validation
    if (!validateAllFieldsFilled(gridInput)) {
        return { error: 'Fill in the grid first.' };
    }
    
    if (!validateStripSequential(stripInput)) {
        return { error: 'Numbers in the bottom strip must be in ascending order from left to right.' };
    }
    
    return {
        gridData: collectGridData().map(str => parseInt(str, 10)),
        stripData: collectStripData().map(str => parseInt(str, 10))
    };
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
