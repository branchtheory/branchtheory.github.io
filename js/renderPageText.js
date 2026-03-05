import { 
    DEMO_GRID_DATA, 
    DEMO_LINE_DATA,
} from './page/getPuzzle.js';
import {
    strings
} from './page/strings.js'
import { 
    setUpInputValidation 
} from './page/validateInput.js';

const bigNumberInputs = document.querySelectorAll('.big-input');
const lineInputs = document.querySelectorAll('.line-input');

document.addEventListener('DOMContentLoaded', function() {
    document.title = strings[lang].title;
    document.getElementById('main-heading').textContent = strings[lang].mainHeading;
    document.getElementById('intro-para').textContent = strings[lang].intro;
    document.getElementById('solveBtn').textContent = strings[lang].buttons.solve;
    document.getElementById('partialSolveBtn').textContent = strings[lang].buttons.partialSolve;
    document.getElementById('checkBtn').textContent = strings[lang].buttons.check;
    document.getElementById('unsolveBtn').textContent = strings[lang].buttons.undo;
    document.getElementById('clearBtn').textContent = strings[lang].buttons.clearAll;

    bigNumberInputs.forEach((input, index) => {
        input.placeholder = DEMO_GRID_DATA[index] || '';
    });
    
    lineInputs.forEach((input, index) => {
        input.placeholder = DEMO_LINE_DATA[index] || '';
    });

   setUpInputValidation();   
});