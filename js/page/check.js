import { 
    collectOperationOperandData, 
    collectStripData 
} from './getPageData.js';

export function findUniversalConflicts(solution) {
    const allUserInputElements = Array.from(document.querySelectorAll('.strip-input, .operand-input, .operation-input'))
        .filter(el => el.value.trim() !== '');

    const operationOperandData = collectOperationOperandData("return as elements");

    const universalConflicts = [];

    for (const element of allUserInputElements) {
        let isCorrectInAtLeastOneSolution = false;

        for (let i = 0; i < solution.grids.length; i++) {
            const solutionLine = solution.lines[i]; 
            const solutionGrid = solution.grids[i];

            if (isElementCorrectForSolution(element, solutionLine, solutionGrid, operationOperandData)) {
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

function isElementCorrectForSolution(element, solutionLine, solutionGrid, operationOperandData) {
    if (element.classList.contains('strip-input')) {
        const stripInputs = Array.from(document.querySelectorAll('.strip-input'));
        const elIndex = stripInputs.indexOf(element);
        if (elIndex > -1 && parseInt(element.value, 10) === solutionLine[elIndex]) {
            return true;
        }
    }

    for (let i = 0; i < operationOperandData.length; i++) {
        const gridCellElements = operationOperandData[i];
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
    const userStrip = collectStripData();
    const operationOperandData = collectOperationOperandData("return as values");

    for (let i = 0; i < solution.grids.length; i++) {
        const solutionLine = solution.lines[i];
        const solutionGrid = solution.grids[i];
        
        if (checkAgainstSingleSolution(userStrip, operationOperandData, solutionLine, solutionGrid)) {
            return true;
        }
    }
    
    return false;
}

function checkAgainstSingleSolution(userStrip, operationOperandData, solutionLine, solutionGrid) {
    for (let i = 0; i < userStrip.length; i++) {
        if (userStrip[i] !== null && userStrip[i] !== solutionLine[i]) {
            return false;
        }
    }
    
    for (let i = 0; i < 16; i++) {
        const smallCells = operationOperandData[i];
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
