const { pool } = require('../config/database');
const { validationResult } = require('express-validator');
const { bcrypt } = require('../models/User');

// ===============================
// GET USER PROFILE
// ===============================
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT id, firstName, lastName, email, phone, role,
                    isActive, lastLogin, createdAt, updatedAt
             FROM users
             WHERE id = ?`,
            [req.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: rows[0]
        });

    } catch (error) {
        console.error('Get profile error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error fetching profile'
        });
    }
};


// ===============================
// UPDATE USER PROFILE
// ===============================
exports.updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { firstName, lastName, phone } = req.body;

        const [result] = await pool.execute(
            `UPDATE users
             SET firstName = ?,
                 lastName = ?,
                 phone = ?
             WHERE id = ?`,
            [
                firstName,
                lastName,
                phone || null,
                req.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const [rows] = await pool.execute(
            `SELECT id, firstName, lastName, email, phone, role,
                    isActive, lastLogin, createdAt, updatedAt
             FROM users
             WHERE id = ?`,
            [req.userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: rows[0]
        });

    } catch (error) {
        console.error('Update profile error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
};


// ===============================
// CHANGE PASSWORD
// ===============================
exports.changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        const [rows] = await pool.execute(
            `SELECT id, password
             FROM users
             WHERE id = ?`,
            [req.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = rows[0];

        // Check old password
        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        await pool.execute(
            `UPDATE users
             SET password = ?
             WHERE id = ?`,
            [
                hashedPassword,
                req.userId
            ]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error changing password'
        });
    }
};


// ===============================
// GET USER ACTIVITY
// ===============================
exports.getActivity = async (req, res) => {
    try {
        const [userRows] = await pool.execute(
            `SELECT createdAt, lastLogin
             FROM users
             WHERE id = ?`,
            [req.userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const [documentRows] = await pool.execute(
            `SELECT COUNT(*) AS uploadCount
             FROM documents
             WHERE uploadedBy = ?`,
            [req.userId]
        );

        res.json({
            success: true,
            activity: {
                uploadCount: documentRows[0].uploadCount,
                viewCount: 0,
                recentDocuments: [],
                lastLogin: userRows[0].lastLogin,
                memberSince: userRows[0].createdAt
            }
        });

    } catch (error) {
        console.error('Get activity error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error fetching activity'
        });
    }
};


// ===============================
// DELETE ACCOUNT
// ===============================
exports.deleteAccount = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT id
             FROM users
             WHERE id = ?`,
            [req.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete user's documents first
        await pool.execute(
            `DELETE FROM documents
             WHERE uploadedBy = ?`,
            [req.userId]
        );

        // Delete user
        await pool.execute(
            `DELETE FROM users
             WHERE id = ?`,
            [req.userId]
        );

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error deleting account'
        });
    }
};