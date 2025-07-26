import { 
        validateAllFieldsFilled, 
        validateStripSequential
} from './validateInput.js';
import { 
        DEMO_GRID_DATA, 
        DEMO_STRIP_DATA,
        validateStripSequential 
} from './demoData.js';

export function getDemoOrUserData(demoModeState, gridInput, stripInput) {
    if (demoModeState) {
        return {
            isDemo: true,
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
        isDemo: false,
        gridData: collectGridData(gridInput).map(str => parseInt(str, 10)),
        stripData: collectStripData(stripInput).map(str => parseInt(str, 10))
    };
}

