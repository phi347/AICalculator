document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.button');

    let currentInput = '0';
    let operator = null;
    let previousInput = '';
    let shouldResetDisplay = false;

    const updateDisplay = () => {
        display.value = currentInput;
    };

    const handleNumber = (num) => {
        if (shouldResetDisplay) {
            currentInput = num;
            shouldResetDisplay = false;
        } else if (currentInput === '0' && num !== '.') {
            currentInput = num;
        } else {
            currentInput += num;
        }
    };

    const handleDecimal = () => {
        if (shouldResetDisplay) {
            currentInput = '0.';
            shouldResetDisplay = false;
        } else if (!currentInput.includes('.')) {
            currentInput += '.';
        }
    };

    const handleOperator = (op) => {
        if (previousInput !== '' && currentInput !== '' && operator !== null) {
            calculate();
        }
        operator = op;
        previousInput = currentInput;
        shouldResetDisplay = true;
    };

    const calculate = () => {
        if (previousInput === '' || currentInput === '' || operator === null) return;

        let result;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);

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
                result = prev % current;
                break;
            default:
                return;
        }
        currentInput = result.toString();
        operator = null;
        previousInput = '';
        shouldResetDisplay = true;
    };

    const clearAll = () => {
        currentInput = '0';
        operator = null;
        previousInput = '';
        shouldResetDisplay = false;
    };

    const backspace = () => {
        if (currentInput.length === 1 || shouldResetDisplay) {
            currentInput = '0';
        } else {
            currentInput = currentInput.slice(0, -1);
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
                calculate();
            } else {
                handleNumber(buttonText);
            }
            updateDisplay();
        });
    });

    updateDisplay(); // Initialize display with '0'
});