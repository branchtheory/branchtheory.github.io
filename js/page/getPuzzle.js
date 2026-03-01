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
import {
        collectBigNumberData,
        collectStripData
} from './getPageData.js';

export function getPuzzle() {
    const demoState = getIsDemoMode();
    setIsDemoMode(demoState);

    if (demoState) {
        return {
            bigNumberData: DEMO_GRID_DATA,
            stripData: DEMO_STRIP_DATA
        };
    }
    
    const bigNumberInput = document.querySelectorAll('.big-input');
    if (!validateAllFieldsFilled(bigNumberInput)) { return { error: 'Fill the big numbers in the grid first.' } } 
    const stripInput = document.querySelectorAll('.strip-input');
    if (!validateStripSequential(stripInput)) { return { error: 'Numbers in the bottom strip must be in ascending order.' } }
    
    return {
        bigNumberData: collectBigNumberData(),
        stripData: collectStripData()
    };
}