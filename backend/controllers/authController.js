const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '7d',
        }
    );
};

// Register new user
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const {
            firstName,
            lastName,
            email,
            phone,
            role,
            password
        } = req.body;

        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            `INSERT INTO users
            (firstName, lastName, email, phone, role, password)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                firstName,
                lastName,
                email,
                phone || null,
                role || 'public',
                hashedPassword
            ]
        );

        const userId = result.insertId;

        const [users] = await pool.execute(
            `SELECT id, firstName, lastName, email, phone, role,
                    isActive, lastLogin, createdAt, updatedAt
             FROM users WHERE id = ?`,
            [userId]
        );

        const user = users[0];

        const token = generateToken(userId);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user,
        });

    } catch (error) {
        console.error('Register error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ? LIMIT 1',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Update last login.
        // If this update fails, don't stop the login.
        try {
            await pool.execute(
                'UPDATE users SET lastLogin = ? WHERE id = ?',
                [new Date(), user.id]
            );
        } catch (updateError) {
            console.error(
                'Last login update failed:',
                updateError
            );
        }

        // Remove password from response
        delete user.password;

        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user,
        });

    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
};

// Logout user
exports.logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
};

// Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const newToken = generateToken(decoded.id);

        res.json({
            success: true,
            token: newToken,
        });

    } catch (error) {
        console.error('Refresh token error:', error);

        res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};