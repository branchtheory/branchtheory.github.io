export const GRID_PLACEHOLDERS = ['23', '23', '26', '27', '27', '28', '29', '31', '92', '120', '126', '130', '132', '168', '180', '198'];
export const STRIP_PLACEHOLDERS = ['', '', '6', '', '9', '9', '10', '', '', '','', '', '', '', '22', ''];
export const DEMO_GRID_DATA = GRID_PLACEHOLDERS.map(str => parseInt(str, 10));
export const DEMO_STRIP_DATA = STRIP_PLACEHOLDERS.map(str => str === '' ? 0 : parseInt(str, 10));

export function isInDemoMode(gridInputs, stripInputs, smallInputs, operationInputs) {
    const mainInputsEmpty = Array.from(gridInputs).every(input => !input.value.trim()) &&
                           Array.from(stripInputs).every(input => !input.value.trim());
    
    const smallOpInputsEmpty = Array.from(smallInputs).every(input => !input.value.trim()) &&
                              Array.from(operationInputs).every(input => !input.value.trim());
    
    return mainInputsEmpty && smallOpInputsEmpty;
}
