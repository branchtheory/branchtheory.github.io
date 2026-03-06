import { getSolution } from '../solve/solve.js';
import {
        getIsDemoMode,
        setIsDemoMode,
        saveOriginalData
} from './saveAndRestore.js';
import { getPuzzle } from './getPuzzle.js';
import { strings } from './localisationStrings.js';
import {
  clearAllHighlights
} from './clearHighlighting.js';
import {
  showError,
} from './notify.js';

document.getElementById('partial-solve-btn').addEventListener('click', function() {
  clearAllHighlights();
  document.getElementById('notification-message').style.display = 'none';
  document.getElementById('error-message').style.display = 'none';
  partialSolve();
});

export function generatePartialSolutionTable(partialSolveArray) {
  const table = document.getElementById('partialSolutionTable');
  table.innerHTML = ''; // Clear existing content ///////////////////////////// <<<<<<<<<<<<<<<< THIS IS BAD
  
  for (let i = 0; i < partialSolveArray.length; i++) {
    const dataArray = partialSolveArray[i]; // Now directly an array of operation objects
    
    if (!dataArray || dataArray.length === 0) continue; // Skip empty arrays
    
    // Use the 'value' from the first item as the primary value (since all items in a group share the same value)
    const primaryValue = dataArray[0].value;
    
    // Header row for this primary value
    const keyHeaderRow = document.createElement('tr');
    const keyCell = document.createElement('td');
    keyCell.rowSpan = 2;
    keyCell.className = 'key-cell';
    keyCell.textContent = primaryValue;
    keyHeaderRow.appendChild(keyCell);
    
    // Paired value headers
    dataArray.forEach(item => {
      const pairedValueCell = document.createElement('td');
      pairedValueCell.colSpan = 3;
      pairedValueCell.className = 'paired-value-header';
      pairedValueCell.textContent = item.pairedValue;
      keyHeaderRow.appendChild(pairedValueCell);
    });
    
    table.appendChild(keyHeaderRow);
    
    // Data row: operand1, operation, operand2
    const dataRow = document.createElement('tr');
    dataArray.forEach(item => {
      const operand1Cell = document.createElement('td');
      operand1Cell.className = 'operand-cell';
      operand1Cell.textContent = item.operands[0];
      dataRow.appendChild(operand1Cell);
      
      const operationCell = document.createElement('td');
      operationCell.className = 'operation-cell';
      operationCell.textContent = item.operation;
      dataRow.appendChild(operationCell);
      
      const operand2Cell = document.createElement('td');
      operand2Cell.className = 'operand-cell';
      operand2Cell.textContent = item.operands[1];
      dataRow.appendChild(operand2Cell);
    });
    
    table.appendChild(dataRow);
  }
  
  // Show the table
  table.style.display = 'table';
}

export function partialSolve() {
    if (document.getElementById('partialSolutionTable').style.display === 'table') {
      document.getElementById('partialSolutionTable').style.display = 'none';
      return;
    }

    const demoModeState = getIsDemoMode(document.querySelectorAll('.big-input'), document.querySelectorAll('.line-input'), document.querySelectorAll('.operand-input'), document.querySelectorAll('.operation-input'))
    const dataResult = getPuzzle(demoModeState, document.querySelectorAll('.big-input'), document.querySelectorAll('.line-input'));
    if (Object.hasOwn(dataResult, 'isDemo')) { setIsDemoMode(dataResult.isDemo); }

    if (dataResult.error) {
        showError(dataResult.error);
        return;
    }

    const solution = getSolution(dataResult.bigNumberData, dataResult.lineData);

    if (solution === "invalid") {
        showError(strings[lang].notifications.noSolutionFound);
        return;
    }

    saveOriginalData();

    generatePartialSolutionTable(solution.partialSolution);

    setTimeout(() => {
        document.getElementById('partialSolutionTable').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}