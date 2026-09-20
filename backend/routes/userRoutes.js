const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(authMiddleware);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put(
    '/profile',
    [
        body('firstName').optional().notEmpty(),
        body('lastName').optional().notEmpty(),
        body('phone').optional(),
    ],
    userController.updateProfile
);

// Change password
router.put(
    '/change-password',
    [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    ],
    userController.changePassword
);

// Get user activity
router.get('/activity', userController.getActivity);

// Delete account
router.delete('/account', userController.deleteAccount);

module.exports = router;