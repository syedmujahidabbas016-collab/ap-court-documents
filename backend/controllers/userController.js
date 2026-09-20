const { pool } = require('../config/database');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
    try {
        const sql = 'SELECT id, firstName, lastName, email, phone, role, isActive, lastLogin, createdAt, updatedAt FROM users WHERE id = ?';
        const [rows] = await pool.execute(sql, [req.userId]);

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

        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const phone = req.body.phone;

        const sql = 'UPDATE users SET firstName = ?, lastName = ?, phone = ? WHERE id = ?';

        const [result] = await pool.execute(
            sql,
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

        const selectSql = 'SELECT id, firstName, lastName, email, phone, role, isActive, lastLogin, createdAt, updatedAt FROM users WHERE id = ?';

        const [rows] = await pool.execute(
            selectSql,
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

        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;

        const sql = 'SELECT id, password FROM users WHERE id = ?';

        const [rows] = await pool.execute(
            sql,
            [req.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = rows[0];

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

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        const updateSql = 'UPDATE users SET password = ? WHERE id = ?';

        await pool.execute(
            updateSql,
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


exports.getActivity = async (req, res) => {
    try {
        const userSql = 'SELECT createdAt, lastLogin FROM users WHERE id = ?';

        const [userRows] = await pool.execute(
            userSql,
            [req.userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const documentSql = 'SELECT COUNT(*) AS uploadCount FROM documents WHERE uploadedBy = ?';

        const [documentRows] = await pool.execute(
            documentSql,
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


exports.deleteAccount = async (req, res) => {
    try {
        const checkSql = 'SELECT id FROM users WHERE id = ?';

        const [rows] = await pool.execute(
            checkSql,
            [req.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const deleteDocumentsSql = 'DELETE FROM documents WHERE uploadedBy = ?';

        await pool.execute(
            deleteDocumentsSql,
            [req.userId]
        );

        const deleteUserSql = 'DELETE FROM users WHERE id = ?';

        await pool.execute(
            deleteUserSql,
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