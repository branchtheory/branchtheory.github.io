document.addEventListener('keydown', function(e) {
    if (e.key === "Tab") {
        moveToNextCell(e);
    }
});

document.addEventListener('beforeinput', function(e) {
    if (e.data === ' ' || e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') {
        moveToNextCell(e);
    }
});

function moveToNextCell (e) {
    const allInputs = Array.from(document.querySelectorAll('.main-grid input, .bottom-line input'));
    const index = allInputs.indexOf(e.target);
    if (index === -1) return;
  
    const isBig = e.target.classList.contains('big-input');
    const isSmall = e.target.classList.contains('operand-input') || e.target.classList.contains('operation-input');
    const isBottom = e.target.classList.contains('line-input');

    const bigInputs = Array.from(document.querySelectorAll('.main-grid .big-input'));
    const smallInputs = Array.from(document.querySelectorAll('.main-grid .operand-input, .main-grid .operation-input'));
    const bottomInputs = Array.from(document.querySelectorAll('.bottom-line .line-input'));
    
    e.preventDefault();
  
    if (isBig) {
        const bigIndex = bigInputs.indexOf(e.target);
        const posInRow = bigIndex % 4;
        const isLastInRow = posInRow === 3;
    
        if (!isLastInRow) {
            bigInputs[bigIndex + 1].focus();
        } else {
            const nextRowStart = bigIndex + 1;
            if (nextRowStart < bigInputs.length) {
                bigInputs[nextRowStart].focus();
            } else {
                bottomInputs[0].focus();
            }
        }
    } else if (isSmall) {
        const smallIndex = smallInputs.indexOf(e.target);
        const posInRow = smallIndex % 12;
        const isLastInRow = posInRow === 11;
    
        if (!isLastInRow) {
          smallInputs[smallIndex + 1].focus();
        } else {
          const nextRowStart = smallIndex + 1;
          if (nextRowStart < smallInputs.length) {
            smallInputs[nextRowStart].focus();
          } else {
            bottomInputs[0].focus();
          }
        }
    } else if (isBottom) {
        const bottomIndex = bottomInputs.indexOf(e.target);
        if (bottomIndex < bottomInputs.length - 1) {
            bottomInputs[bottomIndex + 1].focus();
        }
    }
}