import {
    clearAllHighlights
} from './clearHighlighting.js';
import { 
    clearAllPairHighlighting
} from './highlightPairs.js';
import { 
    restoreOriginalData
} from './saveAndRestore.js';

document.getElementById('undo-btn').addEventListener('click', function() {
    clearAllHighlights();
    clearAllPairHighlighting();
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('notification-message').style.display = 'none';
    
    restoreOriginalData(); 

    document.getElementById('partialSolutionTable').style.display = 'none';
    
    document.getElementById('solve-btn').disabled = false;
    document.getElementById('partial-solve-btn').disabled = false; 
    document.getElementById('check-btn').disabled = false;
    this.disabled = true;
    document.getElementById('clear-btn').disabled = false;
});