import './page/checkButton.js';
import './page/clearButton.js';
import './page/partialSolveButton.js';
import './page/solveButton.js';
import './page/undoButton.js';

import './page/autoFillWithinQuads.js';
import './page/moveToNextCellBehaviour.js';
import { 
        setUpInputValidation 
} from './page/validateInput.js';

document.addEventListener('DOMContentLoaded', function() {
   setUpInputValidation();   
}); 