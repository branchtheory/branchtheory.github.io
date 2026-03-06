import { 
    collectSmallCellData, 
    collectLineData 
} from './getPageData.js';
import {
    clearAllHighlights
} from './clearHighlighting.js';
import { 
    getSolution 
} from '../solve/solve.js';
import {
    showError,
    showNotification
} from './notify.js';
import {
    getPuzzle
} from './getPuzzle.js';
import {
    strings
} from './localisationStrings.js';

document.getElementById('check-btn').addEventListener('click', function() {
    clearAllHighlights(); 
    document.getElementById('notification-message').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';

    const dataResult = getPuzzle();
        
    if (Object.hasOwn(dataResult, 'error')) {
        showError(dataResult.error); 
        return;
    }

    const solution = getSolution(dataResult.bigNumberData, dataResult.lineData); 

    if (solution === "invalid") {
        showError(strings[lang].notifications.noSolutionFoundOrWrongLine);
        return;
    }

    if (checkUserSolution(solution)) {
        showNotification(strings[lang].notifications.passedCheck);
    } else {
        showError(strings[lang].notifications.failedCheck); 
        const conflicts = findUniversalConflicts(solution);
        highlightConflicts(conflicts); 
    }
});

export function findUniversalConflicts(solution) {
    const allUserInputElements = Array.from(document.querySelectorAll('.line-input, .operand-input, .operation-input'))
        .filter(el => el.value.trim() !== '');

    const smallCellData = collectSmallCellData("return as elements");

    const universalConflicts = [];

    for (const element of allUserInputElements) {
        let isCorrectInAtLeastOneSolution = false;

        for (let i = 0; i < solution.grids.length; i++) {
            const solutionLine = solution.lines[i]; 
            const solutionGrid = solution.grids[i];

            if (isElementCorrectForSolution(element, solutionLine, solutionGrid, smallCellData)) {
                isCorrectInAtLeastOneSolution = true;
                break;
            }
        }

        if (!isCorrectInAtLeastOneSolution) {
            universalConflicts.push(element);
        }
    }

    return universalConflicts;
}

function isElementCorrectForSolution(element, solutionLine, solutionGrid, smallCellData) {
    if (element.classList.contains('line-input')) {
        const lineInputs = Array.from(document.querySelectorAll('.line-input'));
        const elIndex = lineInputs.indexOf(element);
        if (elIndex > -1 && parseInt(element.value, 10) === solutionLine[elIndex]) {
            return true;
        }
    }

    for (let i = 0; i < smallCellData.length; i++) {
        const gridCellElements = smallCellData[i];
        const [solutionData] = solutionGrid[i].filter((pair) => pair.status === "selected");

        if (gridCellElements.operand1 === element || gridCellElements.operand2 === element) {
            const operand1Value = gridCellElements.operand1.value.trim();
            const operand2Value = gridCellElements.operand2.value.trim();

            if (operand1Value && operand2Value) {
                const userOperands = [parseInt(operand1Value, 10), parseInt(operand2Value, 10)];
                userOperands.sort((a, b) => a - b);

                const solutionOperands = [...solutionData.operands];
                solutionOperands.sort((a, b) => a - b);

                // The sorted pairs must match exactly
                if (JSON.stringify(userOperands) === JSON.stringify(solutionOperands)) {
                    return true;
                }
            } else {
                const userValue = parseInt(element.value, 10);
                if (solutionData.operands.includes(userValue)) {
                    return true;
                }
            }
        }

        if (gridCellElements.operation === element) {
            const normalizeOp = (op) => (op === '×' || op === '*' || op === 'X' || op === 'x') ? 'x' : op; //
            const normalizedUserOp = normalizeOp(element.value);
            const normalizedSolutionOp = normalizeOp(solutionData.operation);
            if (normalizedUserOp === normalizedSolutionOp) {
                return true;
            }
        }
    }

    return false;
}

export function checkUserSolution(solution) {
    const userLine = collectLineData();
    const smallCellData = collectSmallCellData("return as values");

    for (let i = 0; i < solution.grids.length; i++) {
        const solutionLine = solution.lines[i];
        const solutionGrid = solution.grids[i];
        
        if (checkAgainstSingleSolution(userLine, smallCellData, solutionLine, solutionGrid)) {
            return true;
        }
    }
    
    return false;
}

function checkAgainstSingleSolution(userLine, smallCellData, solutionLine, solutionGrid) {
    for (let i = 0; i < userLine.length; i++) {
        if (userLine[i] !== null && userLine[i] !== solutionLine[i]) {
            return false;
        }
    }
    
    for (let i = 0; i < 16; i++) {
        const smallCells = smallCellData[i];
        const [solutionData] = solutionGrid[i].filter((pair) => pair.status === "selected");
        
        const userOperands = [];
        if (smallCells.operand1 !== null) userOperands.push(smallCells.operand1);
        if (smallCells.operand2 !== null) userOperands.push(smallCells.operand2);
        
        if (userOperands.length > 0) {
            const sortedUserOperands = [...userOperands].sort();
            const sortedSolutionOperands = [...solutionData.operands].sort();
            
            for (let userOp of userOperands) {
                if (!solutionData.operands.includes(userOp)) {
                    return false;
                }
            }
            
            if (userOperands.length === 2) {
                if (JSON.stringify(sortedUserOperands) !== JSON.stringify(sortedSolutionOperands)) {
                    return false;
                }
            }
        }
        
        if (smallCells.operation !== null) {
            const normalizeOp = (op) => {
                if (op === '×' || op === '*' || op === 'X' || op === 'x') return 'x';
                return op;
            };
        
            const normalizedUserOp = normalizeOp(smallCells.operation);
            const normalizedSolutionOp = normalizeOp(solutionData.operation);
        
            if (normalizedUserOp !== normalizedSolutionOp) {
                return false;
            }
        }
    }
    
    return true;
}

export function highlightConflicts(elements) {
    elements.forEach(el => {
        el.classList.add('conflict-cell');
    });
}
