export const validatePassword = (password) => {
    const validations = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const messages = {
        length: 'At least 8 characters',
        uppercase: 'At least one uppercase letter',
        lowercase: 'At least one lowercase letter',
        number: 'At least one number',
        special: 'At least one special character',
    };

    const failed = Object.entries(validations)
        .filter(([_, valid]) => !valid)
        .map(([key]) => messages[key]);

    return {
        isValid: failed.length === 0,
        requirements: failed,
        allRequirements: messages,
        validations
    };
}; 