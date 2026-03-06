import { 
    getSolution 
} from '../solve/solve.js';
import { 
    generatePartialSolutionTable 
} from './partialSolveButton.js';
import {
    saveOriginalData,
} from './saveAndRestore.js';
import {
    showError,
    showNotification
} from './notify.js';
import { 
    getPuzzle,  
} from './getPuzzle.js';
import { 
    highlightSolutionPairs,
} from './highlightPairs.js';
import './autoFillWithinQuads.js';
import './moveToNextCellBehaviour.js'; 
import {
    clearAllHighlights
} from './clearHighlighting.js';
import './clearButton.js';
import {
    strings
} from './localisationStrings.js'

const allInputs = document.querySelectorAll('.big-input, .operand-input, .operation-input, .line-input');
const bigNumberInputs = document.querySelectorAll('.big-input');
const lineInputs = document.querySelectorAll('.line-input')

allInputs.forEach(input => {
    input.addEventListener('input', updateSolveBtn);
});

function updateSolveBtn() {
    const bigInputAllFilled = [...bigNumberInputs].every(input => input.value.trim() !== '');
    document.getElementById('partial-solve-btn').disabled = !bigInputAllFilled;
    document.getElementById('solve-btn').disabled = !bigInputAllFilled;
    document.getElementById('check-btn').disabled = !bigInputAllFilled;
}

document.getElementById('solve-btn').addEventListener('click', function() {
    clearAllHighlights();
    document.getElementById('notification-message').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';

    const dataResult = getPuzzle();
    
    if (Object.hasOwn(dataResult, 'error')) {
        showError(dataResult.error); 
        return;
    }
    
    saveOriginalData();

    const solution = getSolution(dataResult.bigNumberData, dataResult.lineData);
    
    if (solution === "invalid") {
        showError(strings[lang].notifications.noSolutionFound);
        return;
    }

    if (solution.grids.length && solution.grids.length > 1) {
        showNotification(strings[lang].notifications.multipleSolutionsFound(solution.grids.length));
    }

    allInputs.forEach(input => {
        input.disabled = true;
    });
    
    solution.lines[0].forEach((value, index) => {
        if (index < lineInputs.length) {
            lineInputs[index].value = value;
        }
    });
    
    const mainGridRows = document.querySelectorAll('.main-grid tr');
    const smallCellRows = [mainGridRows[1], mainGridRows[3], mainGridRows[5], mainGridRows[7]];

    smallCellRows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td');
        
        for (let cellIndex = 0; cellIndex < 4; cellIndex++) {
            const gridIndex = rowIndex * 4 + cellIndex;
            const cellData = solution.grids[0][gridIndex].find(cell => cell.status === 'selected');
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
    
    highlightSolutionPairs(solution);
                
    this.disabled = true;
    document.getElementById('partial-solve-btn').disabled = true;
    document.getElementById('undo-btn').disabled = false;
    document.getElementById('clear-btn').disabled = false;
    document.getElementById('check-btn').disabled = true;
});