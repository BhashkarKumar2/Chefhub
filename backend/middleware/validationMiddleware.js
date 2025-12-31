import { body, validationResult } from 'express-validator';

// Middleware to handle validation errors
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(422).json({
        errors: extractedErrors,
        message: 'Validation failed'
    });
};

// Auth validation rules
export const registerValidationRules = () => {
    return [
        body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
        body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/).withMessage('Password must contain at least one letter and one number'),
    ];
};

export const loginValidationRules = () => {
    return [
        body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ];
};

// Password management rules
export const forgotPasswordValidationRules = () => {
    return [
        body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    ];
};

export const resetPasswordValidationRules = () => {
    return [
        body('password')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/).withMessage('Password must contain at least one letter and one number'),
    ];
};

// User profile validation rules
export const updateProfileValidationRules = () => {
    return [
        body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
        body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
        body('phone').optional().trim().matches(/^\+?[1-9]\d{9,14}$/).withMessage('Please provide a valid phone number'),
    ];
};
