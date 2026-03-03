export function validateAllFieldsFilled(bigNumberInputs) {
    for (let input of bigNumberInputs) {
        if (!input.value.trim()) {
            return false;
        }
    }
    return true;
}

export function validateLineSequential(lineInputs) {
    const values = [];
    
    lineInputs.forEach((input, index) => {
        const value = input.value.trim();
        if (value) {
            values.push({ position: index, value: parseInt(value) });
        }
    });
    
    for (let i = 1; i < values.length; i++) {
        if (values[i].value < values[i-1].value) {
            return false;
        }
        if (values[i].position < values[i-1].position && values[i].value > values[i-1].value) {
            return false;
        }
    }
    
    for (let i = 0; i < lineInputs.length - 1; i++) {
        const currentValue = lineInputs[i].value.trim();
        if (!currentValue) continue;
        
        for (let j = i + 1; j < lineInputs.length; j++) {
            const laterValue = lineInputs[j].value.trim();
            if (!laterValue) continue;
            
            if (parseInt(currentValue) > parseInt(laterValue)) {
                return false;
            }
        }
    }
    
    return true;
}

export function setUpInputValidation() {
    const bigNumberInputs = document.querySelectorAll('.big-input');
    const lineInputs = document.querySelectorAll('.line-input');
    
    function addValidationTo(selector, validationFn) {
        document.querySelectorAll(selector).forEach(input => {
            input.addEventListener('input', (event) => {
                clearAllPlaceholdersOnFirstInput(event) 
                validationFn(event);
            });
        });
    }
    
    addValidationTo('.operand-input', validateSmallInput);
    addValidationTo('.operation-input', validateOperationInput);
    addValidationTo('.big-input', validatebigNumberInput);
    addValidationTo('.line-input', validateLineInput);
}

function validateNumericInput(event, maxLength) {
    const input = event.target;
    input.value = input.value
        .replace(/\D/g, '')
        .replace(/^0+/, '')
        .substring(0, maxLength);
}

export function validateSmallInput(event) {
    validateNumericInput(event, 2);
}

function validatebigNumberInput(event) {
    validateNumericInput(event, 3);
}

function validateLineInput(event) {
    validateNumericInput(event, 2);
}

function validateOperationInput(event) {
    const input = event.target;
    input.value = input.value
        .replace(/[^+x*X×]/g, '')
        .replace(/[x*X]/, '×')
        .substring(0, 1);
}

// These don't belong here! Not sure where to put them though.

function clearAllPlaceholders(inputs) {
    inputs.forEach(input => {
        input.placeholder = '';
    });
}

function clearAllPlaceholdersOnFirstInput(event) {
    if (event.target.value.length === 1) {
        const bigNumberInputs = document.querySelectorAll('.big-input');
        const lineInputs = document.querySelectorAll('.line-input');
        clearAllPlaceholders(bigNumberInputs);
        clearAllPlaceholders(lineInputs);
    }
}
