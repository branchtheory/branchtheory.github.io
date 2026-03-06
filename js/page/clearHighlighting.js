const allInputs = document.querySelectorAll('.big-input, .operand-input, .operation-input, .line-input');

export function clearAllHighlights() {
    allInputs.forEach(input => {
        input.classList.remove('conflict-cell');
    });
}