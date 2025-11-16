document.addEventListener('DOMContentLoaded', () => {
    const expressionDisplay = document.getElementById('expression-display');
    const resultDisplay = document.getElementById('result-display');
    const buttons = document.querySelectorAll('.button');

    let currentInput = '0'; // The number currently being typed or the last result shown
    let expression = ''; // The full mathematical expression built for the top display
    let operator = null;
    let previousValue = null; // The value before an operator was pressed
    let shouldResetResultDisplay = false; // Flag to clear resultDisplay for new number input
    let lastButtonPressedWasEquals = false; // Flag to manage state after '='

    const updateDisplays = () => {
        expressionDisplay.value = expression;
        resultDisplay.value = currentInput;
    };

    // Helper to rebuild the expression string accurately
    const buildExpression = () => {
        if (previousValue === null && operator === null) {
            return currentInput; // Only a number has been entered
        } else if (previousValue !== null && operator === null) {
            // This case might happen after equals, if currentInput is the result
            return currentInput; // Or if chaining, then previousValue would be set.
        } else if (previousValue !== null && operator !== null && shouldResetResultDisplay) {
            // Operator just pressed, waiting for second number
            return previousValue + operator;
        } else if (previousValue !== null && operator !== null && !shouldResetResultDisplay) {
            // Second number is being typed
            return previousValue + operator + currentInput;
        }
        return ''; // Default empty
    };

    const handleNumber = (num) => {
        if (lastButtonPressedWasEquals || (shouldResetResultDisplay && operator === null)) {
            // If starting a new calculation after equals or C
            currentInput = num;
            previousValue = null; // Reset previousValue to start fresh
            expression = num;
            operator = null; // Clear operator as well
        } else if (shouldResetResultDisplay) {
            // After an operator, input a new number
            currentInput = num;
            expression = previousValue + operator + currentInput;
        } else if (currentInput === '0' && num !== '.') {
            currentInput = num;
            // Update expression only if it's currently showing '0' or is empty
            if (expression === '' || expression === '0') {
                expression = num;
            } else if (operator !== null) {
                // If operator is present, replace the '0' after it
                expression = previousValue + operator + num;
            } else {
                expression = num; // This would be the first number being typed
            }
        } else {
            currentInput += num;
            // Append to expression, handling if an operator is active
            if (operator !== null) {
                expression = previousValue + operator + currentInput;
            } else {
                expression = currentInput;
            }
        }

        shouldResetResultDisplay = false;
        lastButtonPressedWasEquals = false;
    };

    const handleDecimal = () => {
        if (lastButtonPressedWasEquals || (shouldResetResultDisplay && operator === null)) {
            currentInput = '0.';
            previousValue = null;
            expression = '0.';
            operator = null;
        } else if (shouldResetResultDisplay) {
            currentInput = '0.';
            expression = previousValue + operator + '0.';
        } else if (!currentInput.includes('.')) {
            currentInput += '.';
            if (operator !== null) {
                expression = previousValue + operator + currentInput;
            } else {
                expression = currentInput;
            }
        }

        shouldResetResultDisplay = false;
        lastButtonPressedWasEquals = false;
    };

    const handleOperator = (op) => {
        lastButtonPressedWasEquals = false;

        if (previousValue !== null && operator !== null && !shouldResetResultDisplay) {
            // If there's a pending calculation (e.g., 5 + 3 and then press *), execute it first
            performCalculation(); // This updates currentInput with the result
            previousValue = currentInput; // Result becomes new previousValue for chaining
        } else if (currentInput !== '0' && previousValue === null) {
            // First number entered, now setting operator
            previousValue = currentInput;
        } else if (shouldResetResultDisplay && currentInput !== '0') {
            // If a result is currently displayed (e.g., after 2+2=4), and a new operator is pressed
            // we use the result as the new previousValue.
            previousValue = currentInput;
        } else if (currentInput === '0' && previousValue === null && expression === '') {
            // If '0' is on display and operator pressed, set previousValue to '0'
            previousValue = '0';
        }


        operator = op;
        expression = previousValue + operator; // Always update expression with previousValue and new operator
        shouldResetResultDisplay = true; // Next number input should clear result display
    };

    const performCalculation = () => {
        if (previousValue === null || currentInput === '' || operator === null) return;

        let result;
        const prev = parseFloat(previousValue);
        const current = parseFloat(currentInput);

        // Basic error handling for division by zero
        if (operator === '/' && current === 0) {
            currentInput = 'Error';
            expression = ''; // Clear expression on error
            previousValue = null;
            operator = null;
            return;
        }

        switch (operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                result = prev / current;
                break;
            case '%':
                // For percentage as an operator (e.g., 50% of 200)
                // If you want it as '50 %' means 0.5
                // If you want '200 + 10%' means 200 + (200 * 0.1)
                // Current interpretation: prev % current (e.g., 100 % 50 = 0) - standard JS modulo
                // If you meant "X percent of Y", that's different.
                // For now, let's stick to JavaScript's modulo behavior
                result = prev % current;
                break;
            default:
                return;
        }
        currentInput = result.toString();
        previousValue = currentInput; // Result becomes new previousValue for chaining
        operator = null; // Clear the operator after calculation
    };

    const handleEquals = () => {
        if (previousValue === null || operator === null || (shouldResetResultDisplay && !lastButtonPressedWasEquals)) {
            // If no full operation, or operator was just pressed without second operand
            // and it's not a chain of equals, just set expression to currentInput
            if (previousValue !== null && operator !== null && shouldResetResultDisplay) {
                 expression = previousValue + operator + (currentInput === '0' ? '0' : currentInput) + '='; // If nothing after op, show op.
                 shouldResetResultDisplay = true;
                 lastButtonPressedWasEquals = true;
                 operator = null;
                 return;
            }
            if (lastButtonPressedWasEquals) {
                // If equals was pressed immediately after another equals,
                // re-evaluate the last operation (e.g., 2+2=4, then =, result is still 4, but expression should show 2+2=)
                expression = previousValue + operator + currentInput + '='; // If repeating last op, needs the operator saved
                performCalculation(); // Re-calculate using previous values
            }
            lastButtonPressedWasEquals = true; // Still mark as equals pressed
            shouldResetResultDisplay = true; // Ensure next number clears
            operator = null; // Clear operator
            return;
        }

        // Capture the full expression before calculation
        const currentSecondOperand = currentInput; // Store this before currentInput changes
        const fullExpression = previousValue + operator + currentSecondOperand;

        performCalculation(); // This updates currentInput with the result
        expression = fullExpression + '='; // Display the full expression + equals sign
        shouldResetResultDisplay = true;
        lastButtonPressedWasEquals = true; // Mark that equals was pressed
        previousValue = currentInput; // The result is the new previousValue for chaining (e.g. 5+3=8, then +2)
        operator = null; // Clear operator after equals
    };


    const clearAll = () => {
        currentInput = '0';
        expression = '';
        operator = null;
        previousValue = null;
        shouldResetResultDisplay = false;
        lastButtonPressedWasEquals = false;
    };

    const backspace = () => {
        if (shouldResetResultDisplay || lastButtonPressedWasEquals) {
            // If a result is displayed or equals was pressed, backspace clears everything
            clearAll();
            return;
        }

        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
            if (operator === null) {
                expression = currentInput;
            } else {
                expression = previousValue + operator + currentInput;
            }
        } else { // CurrentInput length is 1 (e.g., '5') or '0'
            currentInput = '0';
            if (operator === null) {
                expression = '';
            } else {
                // If we backspace the last digit of the second operand,
                // the expression should revert to just previousValue + operator
                expression = previousValue + operator;
            }
        }

        // If currentInput becomes '0' and there's no operator, reset previousValue
        if (currentInput === '0' && operator === null) {
            previousValue = null;
            expression = '';
        }
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent;

            if (button.classList.contains('clear')) {
                clearAll();
            } else if (button.classList.contains('backspace')) {
                backspace();
            } else if (button.classList.contains('decimal')) {
                handleDecimal();
            } else if (button.classList.contains('operator') && !button.classList.contains('equal')) {
                handleOperator(buttonText);
            } else if (button.classList.contains('equal')) {
                handleEquals();
            } else { // It's a number
                handleNumber(buttonText);
            }
            updateDisplays();
        });
    });

    updateDisplays(); // Initialize display with '0' on load
});