export function generatePartialSolutionTable(partialSolveArray) {
  const table = document.getElementById('partialSolveTable');
  table.innerHTML = ''; // Clear existing content

  for (let i = 0; i < partialSolveArray.length; i++) {
    const [primaryValue, dataArray] = partialSolveArray[i];

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
