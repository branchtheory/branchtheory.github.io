import {
        clearAllData
} from './saveAndRestore.js';
import {
        clearAllHighlights
} from './clearHighlighting.js';
import { 
        clearAllPairHighlighting
} from './highlightPairs.js';

document.getElementById('clear-btn').addEventListener('click', function() {
    clearAllHighlights();
    clearAllPairHighlighting()
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('notification-message').style.display = 'none';
    
    clearAllData();
    
    document.getElementById('solve-btn').disabled = false;
    document.getElementById('partial-solve-btn').disabled = false; 
    document.getElementById('undo-btn').disabled = true;
    document.getElementById('check-btn').disabled = false;
    this.disabled = false;
});