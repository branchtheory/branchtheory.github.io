export const HIGHLIGHT_COLORS = [
    '#ffadad',
    '#ffd6a5', 
    '#fdffb6',
    '#caffbf',
    '#9bf6ff',
    '#a0c4ff',
    '#bdb2ff',
    '#ffc6ff'
];

export function clearAllPairHighlighting() {
    const allInputs = document.querySelectorAll('.grid-input, .strip-input, .small-input, .operation-input');
    allInputs.forEach(input => {
        input.classList.remove('conflict-cell');
        // Remove any existing highlight colors
        input.style.backgroundColor = '';
        input.parentElement.style.backgroundColor = '';
    });
}

export function highlightGridInputs(gridIndices, color) {
    const gridInputs = document.querySelectorAll('.grid-input');
    gridIndices.forEach(index => {
        if (index >= 0 && index < gridInputs.length) {
            // Highlight the parent cell (big-number cell) for better visibility
            gridInputs[index].parentElement.style.backgroundColor = color;
        }
    });
}

export function highlightStripInputs(stripIndices, color) {
    const stripInputs = document.querySelectorAll('.strip-input');
    stripIndices.forEach(index => {
        if (index >= 0 && index < stripInputs.length) {
            stripInputs[index].parentElement.style.backgroundColor = color;
        }
    });
}

export function highlightSolutionPairs(solution) {
    clearAllPairHighlighting();
    
    if (!solution || !solution.grids || !solution.grids[0] || !solution.lines || !solution.lines[0]) {
        console.warn('Invalid solution data for highlighting');
        return;
    }
    
    const selectedGrid = solution.grids[0];
    const lineValues = solution.lines[0];
    const usedLineIndices = new Set(); // Track which line positions we've already used
    
    let colorIndex = 0;
    
    // Process each cell in the grid
    selectedGrid.forEach((cellOptions, gridIndex) => {
        const selectedCell = cellOptions.find(cell => cell.status === 'selected');
        
        // Only process addition cells to avoid duplicates
        if (selectedCell && selectedCell.operation === '+') {
            const pairIndex = parseInt(selectedCell.pairIndex);
            const pairCell = selectedGrid[pairIndex]?.find(cell => cell.status === 'selected');
            
            if (!pairCell) {
                console.warn(`Could not find pair cell at index ${pairIndex}`);
                return;
            }
            
            // Get the operands that both cells use
            const [operand1, operand2] = selectedCell.operands;
            
            // Find unused positions in the line that match these operands
            const lineIndices = [];
            
            // Find position for first operand
            for (let i = 0; i < lineValues.length; i++) {
                if (lineValues[i] === operand1 && !usedLineIndices.has(i)) {
                    lineIndices.push(i);
                    usedLineIndices.add(i);
                    break;
                }
            }
            
            // Find position for second operand
            for (let i = 0; i < lineValues.length; i++) {
                if (lineValues[i] === operand2 && !usedLineIndices.has(i)) {
                    lineIndices.push(i);
                    usedLineIndices.add(i);
                    break;
                }
            }
            
            if (lineIndices.length === 2) {
                // Get color for this pair
                const color = HIGHLIGHT_COLORS[colorIndex % HIGHLIGHT_COLORS.length];
                
                // Highlight both grid cells (addition and multiplication)
                highlightGridInputs([gridIndex, pairIndex], color);
                
                // Highlight the corresponding line positions
                highlightStripInputs(lineIndices, color);
                
                colorIndex++;
            } else {
                console.warn(`Could not find both operands ${operand1}, ${operand2} in unused line positions`);
            }
        }
    });
}

export function highlightPartialSolution(partialSolution) {
    clearAllPairHighlighting();
    
    if (!partialSolution) {
        console.warn('No partial solution data provided');
        return;
    }
    
    console.log('Partial solution highlighting - to be implemented', partialSolution);
}
