import { 
        validateAllFieldsFilled, 
        validateLineSequential
} from './validateInput.js';
import { 
        getIsDemoMode,
        setIsDemoMode
} from './saveAndRestore.js';
import {
        collectBigNumberData,
        collectLineData
} from './getPageData.js';

export const DEMO_GRID_DATA = [23, 23, 26, 27, 27, 28, 29, 31, 92, 120, 126, 130, 132, 168, 180, 198];
export const DEMO_LINE_DATA = [4, null, 6, null, 9, 9, 10, 12, 13, null, null, null, null, null, 22, null];

export function getPuzzle() {
    const demoState = getIsDemoMode();
    setIsDemoMode(demoState);

    if (demoState) {
        return {
            bigNumberData: DEMO_GRID_DATA,
            lineData: DEMO_LINE_DATA
        };
    }
    
    const bigNumberInput = document.querySelectorAll('.big-input');
    if (!validateAllFieldsFilled(bigNumberInput)) { return { error: strings[lang].notifications.cannotGetGrid } } 
    const lineInput = document.querySelectorAll('.line-input');
    if (!validateLineSequential(lineInput)) { return { error: strings[lang].notifications.cannotGetBottomLine } }
    
    return {
        bigNumberData: collectBigNumberData(),
        lineData: collectLineData()
    };
}