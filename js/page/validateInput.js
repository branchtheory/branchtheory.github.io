export function validateAllFieldsFilled(bigNumberInputs) {
    for (let input of bigNumberInputs) {
        if (!input.value.trim()) {
            return false;
        }
    }
    return true;
}

export function validateStripSequential(stripInputs) {
    const values = [];
    
    stripInputs.forEach((input, index) => {
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
    
    for (let i = 0; i < stripInputs.length - 1; i++) {
        const currentValue = stripInputs[i].value.trim();
        if (!currentValue) continue;
        
        for (let j = i + 1; j < stripInputs.length; j++) {
            const laterValue = stripInputs[j].value.trim();
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
    const stripInputs = document.querySelectorAll('.strip-input');
    
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
    addValidationTo('.strip-input', validateStripInput);
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

function validateStripInput(event) {
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
        const stripInputs = document.querySelectorAll('.strip-input');
        clearAllPlaceholders(bigNumberInputs);
        clearAllPlaceholders(stripInputs);
    }
}
