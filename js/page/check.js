import { 
    collectUserGridData, 
    collectUserStrip 
} from './page/getData.js';

export function findUniversalConflicts(solution) {
    // Get all elements the user has typed a value into
    const allUserInputElements = Array.from(document.querySelectorAll('.strip-input, .small-input, .operation-input'))
        .filter(el => el.value.trim() !== '');

    // Get the mapping of elements to their grid positions
    const userGridElements = collectUserGridData(true);
    const universalConflicts = [];

    // Check each user-filled element
    for (const element of allUserInputElements) {
        let isCorrectInAtLeastOneSolution = false;

        // Loop through all possible solutions to see if this element is valid in any of them
        for (let i = 0; i < solution.grids.length; i++) {
            const solutionLine = solution.lines[i]; 
            const solutionGrid = solution.grids[i];

            // Use the helper to check against this specific solution
            if (isElementCorrectForSolution(element, solutionLine, solutionGrid, userGridElements)) {
                isCorrectInAtLeastOneSolution = true;
                break; // It's valid in this solution, so it's not a universal conflict.
                       // We can stop checking other solutions for this element.
            }
        }

        // If, after checking all solutions, it was never correct, it's a universal conflict.
        if (!isCorrectInAtLeastOneSolution) {
            universalConflicts.push(element);
        }
    }

    return universalConflicts;
}

function isElementCorrectForSolution(element, solutionLine, solutionGrid, userGridElements) {
    // Check if it's a bottom strip input
    if (element.classList.contains('strip-input')) {
        const stripInputs = Array.from(document.querySelectorAll('.strip-input'));
        const elIndex = stripInputs.indexOf(element);
        if (elIndex > -1 && parseInt(element.value, 10) === solutionLine[elIndex]) {
            return true;
        }
    }

    // Check if it's a grid input (operand or operation)
    for (let i = 0; i < userGridElements.length; i++) {
        const gridCellElements = userGridElements[i];
        const solutionCell = solutionGrid[i];

        // Check if the element is an operand in this grid cell
        if (gridCellElements.operand1 === element || gridCellElements.operand2 === element) {
            const operand1Value = gridCellElements.operand1.value.trim();
            const operand2Value = gridCellElements.operand2.value.trim();

            // If both operand fields are filled, they must be validated as a pair.
            if (operand1Value && operand2Value) {
                // Collect, parse, and sort the user's operands numerically.
                const userOperands = [parseInt(operand1Value, 10), parseInt(operand2Value, 10)];
                userOperands.sort((a, b) => a - b);

                // Sort the solution's operands numerically.
                const solutionOperands = [...solutionCell.operands];
                solutionOperands.sort((a, b) => a - b);

                // The sorted pairs must match exactly [cite: 178-181, 229-232].
                if (JSON.stringify(userOperands) === JSON.stringify(solutionOperands)) {
                    return true;
                }
            }
            // If only one operand field is filled, check if it exists in the solution's operands.
            else {
                const userValue = parseInt(element.value, 10);
                if (solutionCell.operands.includes(userValue)) {
                    return true;
                }
            }
        }

        // Check if the element is the operation in this grid cell
        if (gridCellElements.operation === element) {
            const normalizeOp = (op) => (op === '×' || op === '*' || op === 'X' || op === 'x') ? 'x' : op; //
            const normalizedUserOp = normalizeOp(element.value);
            const normalizedSolutionOp = normalizeOp(solutionCell.operation);
            if (normalizedUserOp === normalizedSolutionOp) {
                return true;
            }
        }
    }

    return false; // The element's value was not correct for this specific solution.
}

export function checkUserSolution(solution) {
    // Collect user's input from small cells and operations
    const userStrip = collectUserStrip();
    const userGrid = collectUserGridData();
    
    // Check against each possible solution
    for (let i = 0; i < solution.grids.length; i++) {
        const solutionLine = solution.lines[i];
        const solutionGrid = solution.grids[i];
        
        // Check if user input conflicts with this solution
        if (checkAgainstSingleSolution(userStrip, userGrid, solutionLine, solutionGrid)) {
            return true; // No conflicts found with this solution
        }
    }
    
    return false; // Conflicts found with all solutions
}

function checkAgainstSingleSolution(userStrip, userGrid, solutionLine, solutionGrid) {
    // Check bottom strip
    for (let i = 0; i < userStrip.length; i++) {
        if (userStrip[i] !== null && userStrip[i] !== solutionLine[i]) {
            return false;
        }
    }
    
    // Check grid operations (now flat array)
    for (let i = 0; i < 16; i++) {
        const userCell = userGrid[i];
        const solutionCell = solutionGrid[i];
        
        // Check operands - collect user operands and compare as sets
        const userOperands = [];
        if (userCell.operand1 !== null) userOperands.push(userCell.operand1);
        if (userCell.operand2 !== null) userOperands.push(userCell.operand2);
        
        // If user has entered operands, they must match solution operands (ignoring order)
        if (userOperands.length > 0) {
            const sortedUserOperands = [...userOperands].sort();
            const sortedSolutionOperands = [...solutionCell.operands].sort();
            
            // Check if partial match is valid
            for (let userOp of userOperands) {
                if (!solutionCell.operands.includes(userOp)) {
                    return false;
                }
            }
            
            // If user filled both operands, ensure no duplicates unless solution has duplicates
            if (userOperands.length === 2) {
                if (JSON.stringify(sortedUserOperands) !== JSON.stringify(sortedSolutionOperands)) {
                    return false;
                }
            }
        }
        
        // Check operation
        if (userCell.operation !== null) {
            const normalizeOp = (op) => {
                if (op === '×' || op === '*' || op === 'X' || op === 'x') return 'x';
                return op;
            };
        
            const normalizedUserOp = normalizeOp(userCell.operation);
            const normalizedSolutionOp = normalizeOp(solutionCell.operation);
        
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
