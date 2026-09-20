const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController.js');

const registerValidation = [
    body('firstName')
        .notEmpty()
        .withMessage('First name is required'),

    body('lastName')
        .notEmpty()
        .withMessage('Last name is required'),

    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    body('role')
        .optional()
        .isIn(['advocate', 'judge', 'court_staff', 'public'])
        .withMessage('Invalid role'),
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

router.post(
    '/register',
    registerValidation,
    authController.register
);

router.post(
    '/login',
    loginValidation,
    authController.login
);

router.post(
    '/logout',
    authController.logout
);

router.post(
    '/refresh-token',
    authController.refreshToken
);

module.exports = router;