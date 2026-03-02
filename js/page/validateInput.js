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

export function validateSmallInput(event) {
    const input = event.target;
    const value = input.value;
    
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 2) {
        cleanValue = cleanValue.substring(0, 2);
    }
    
    input.value = cleanValue;
}

function validateOperationInput(event) {
    const input = event.target;
    const value = input.value;
    
    let cleanValue = value.replace(/[^+x*X×]/g, '');
    if (cleanValue.length > 1) {
        cleanValue = cleanValue.substring(0, 1);
    }
    
    input.value = cleanValue;
}

function validatebigNumberInput(event) {
    const input = event.target;
    const value = input.value;
    
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 3) {
        cleanValue = cleanValue.substring(0, 3);
    }
    
    input.value = cleanValue;
}

function validateLineInput(event) {
    const input = event.target;
    const value = input.value;
    
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 2) {
        cleanValue = cleanValue.substring(0, 2);
    }
    
    input.value = cleanValue;
}

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
