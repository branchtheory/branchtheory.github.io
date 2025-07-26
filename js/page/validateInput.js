export function validateAllFieldsFilled(gridInputs) {
    for (let input of gridInputs) {
        if (!input.value.trim()) {
            return false;
        }
    }
    return true;
}

export function validateStripSequential(stripInputs) {
    const values = [];
    
    // Collect all non-empty values with their positions
    stripInputs.forEach((input, index) => {
        const value = input.value.trim();
        if (value) {
            values.push({ position: index, value: parseInt(value) });
        }
    });
    
    // Check if values are in ascending order
    for (let i = 1; i < values.length; i++) {
        if (values[i].value < values[i-1].value) {
            return false;
        }
        // Also check that earlier positions don't have larger values than later positions
        if (values[i].position < values[i-1].position && values[i].value > values[i-1].value) {
            return false;
        }
    }
    
    // Additional check: ensure no value appears before a smaller value in the strip
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
    const gridInputs = document.querySelectorAll('.grid-input');
    const stripInputs = document.querySelectorAll('.strip-input');
    
    // Helper function to add validation to a set of inputs
    function addValidationTo(selector, validationFn) {
        document.querySelectorAll(selector).forEach(input => {
            input.addEventListener('input', (event) => {
                clearAllPlaceholdersOnFirstInput(event) 
                validationFn(event);
            });
        });
    }
    
    // Apply to different input types
    addValidationTo('.small-input', validateSmallInput);
    addValidationTo('.operation-input', validateOperationInput);
    addValidationTo('.grid-input', validateGridInput);
    addValidationTo('.strip-input', validateStripInput);
}

export function validateSmallInput(event) {
    const input = event.target;
    const value = input.value;
    
    // Remove any non-digit characters and limit to 2 digits
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 2) {
        cleanValue = cleanValue.substring(0, 2);
    }
    
    input.value = cleanValue;
}

function validateOperationInput(event, gridInput, stripInput) {
    const input = event.target;
    const value = input.value;
    
    // Only allow + and x, limit to 1 character
    let cleanValue = value.replace(/[^+x*X×]/g, '');
    if (cleanValue.length > 1) {
        cleanValue = cleanValue.substring(0, 1);
    }
    
    input.value = cleanValue;
}

function validateGridInput(event, gridInput, stripInput) {
    const input = event.target;
    const value = input.value;
    
    // Remove any non-digit characters and limit to 3 digits
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 3) {
        cleanValue = cleanValue.substring(0, 3);
    }
    
    input.value = cleanValue;
}

function validateStripInput(event, gridInput, stripInput) {
    const input = event.target;
    const value = input.value;
    
    // Remove any non-digit characters and limit to 2 digits
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
        const gridInputs = document.querySelectorAll('.grid-input');
        const stripInputs = document.querySelectorAll('.strip-input');
        clearAllPlaceholders(gridInputs);
        clearAllPlaceholders(stripInputs);
    }
}
