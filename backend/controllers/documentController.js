const { pool } = require('../config/database');
const { validationResult } = require('express-validator');
const fs = require('fs');

// ===============================
// UPLOAD DOCUMENT
// ===============================

exports.uploadDocument = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const {
            title,
            caseNumber,
            type,
            court,
            date,
            description
        } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO documents
            (title, caseNumber, type, court, date, description,
             fileName, filePath, fileSize, mimeType, uploadedBy)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                caseNumber,
                type,
                court,
                date,
                description || null,
                req.file.originalname,
                req.file.path,
                req.file.size,
                req.file.mimetype,
                req.userId
            ]
        );

        const [documents] = await pool.execute(
            `SELECT * FROM documents WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            document: documents[0]
        });

    } catch (error) {
        console.error('Upload document error:', error);

        if (
            req.file &&
            req.file.path &&
            fs.existsSync(req.file.path)
        ) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Server error during document upload'
        });
    }
};


// ===============================
// GET ALL DOCUMENTS
// ===============================

exports.getDocuments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let sql = `
            SELECT
                d.*,
                u.firstName,
                u.lastName,
                u.email
            FROM documents d
            LEFT JOIN users u
                ON d.uploadedBy = u.id
            WHERE 1=1
        `;

        const params = [];

        if (req.query.type) {
            sql += ` AND d.type = ?`;
            params.push(req.query.type);
        }

        if (req.query.court) {
            sql += ` AND d.court = ?`;
            params.push(req.query.court);
        }

        if (req.query.status) {
            sql += ` AND d.status = ?`;
            params.push(req.query.status);
        }

        if (req.query.search) {
            sql += ` AND (
                d.title LIKE ?
                OR d.caseNumber LIKE ?
            )`;

            const search = `%${req.query.search}%`;

            params.push(search);
            params.push(search);
        }

        sql += `
            ORDER BY d.createdAt DESC
            LIMIT ${limit}
            OFFSET ${offset}
        `;

        const [documents] =
            await pool.execute(sql, params);

        const [countResult] =
            await pool.execute(
                `SELECT COUNT(*) AS total
                 FROM documents`
            );

        const total =
            countResult[0].total;

        res.json({
            success: true,

            results: documents,

            documents: documents,

            total: total,

            page: page,

            totalPages:
                Math.ceil(total / limit),

            pagination: {
                page: page,
                limit: limit,
                total: total,
                pages:
                    Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error(
            'Get documents error:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Server error fetching documents'
        });
    }
};


// ===============================
// GET DOCUMENT BY ID
// ===============================

exports.getDocumentById = async (req, res) => {
    try {

        const [documents] =
            await pool.execute(
                `SELECT
                    d.*,
                    u.firstName,
                    u.lastName,
                    u.email
                 FROM documents d
                 LEFT JOIN users u
                    ON d.uploadedBy = u.id
                 WHERE d.id = ?`,
                [req.params.id]
            );

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.json({
            success: true,
            document: documents[0]
        });

    } catch (error) {

        console.error(
            'Get document error:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Server error fetching document'
        });
    }
};


// ===============================
// UPDATE DOCUMENT
// ===============================

exports.updateDocument = async (req, res) => {
    try {

        const errors =
            validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const [documents] =
            await pool.execute(
                `SELECT *
                 FROM documents
                 WHERE id = ?`,
                [req.params.id]
            );

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const document =
            documents[0];

        if (
            String(document.uploadedBy) !==
            String(req.userId)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'Not authorized to update this document'
            });
        }

        const {
            title,
            status
        } = req.body;

        const fields = [];
        const values = [];

        if (title !== undefined) {
            fields.push('title = ?');
            values.push(title);
        }

        if (status !== undefined) {
            fields.push('status = ?');
            values.push(status);
        }

        if (fields.length > 0) {

            fields.push(
                'updatedAt = CURRENT_TIMESTAMP'
            );

            values.push(req.params.id);

            await pool.execute(
                `UPDATE documents
                 SET ${fields.join(', ')}
                 WHERE id = ?`,
                values
            );
        }

        const [updated] =
            await pool.execute(
                `SELECT *
                 FROM documents
                 WHERE id = ?`,
                [req.params.id]
            );

        res.json({
            success: true,
            message:
                'Document updated successfully',
            document: updated[0]
        });

    } catch (error) {

        console.error(
            'Update document error:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Server error updating document'
        });
    }
};


// ===============================
// DELETE DOCUMENT
// ===============================

exports.deleteDocument = async (req, res) => {
    try {

        const [documents] =
            await pool.execute(
                `SELECT *
                 FROM documents
                 WHERE id = ?`,
                [req.params.id]
            );

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    'Document not found'
            });
        }

        const document =
            documents[0];

        if (
            String(document.uploadedBy) !==
            String(req.userId)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'Not authorized to delete this document'
            });
        }

        if (
            document.filePath &&
            fs.existsSync(document.filePath)
        ) {
            fs.unlinkSync(
                document.filePath
            );
        }

        await pool.execute(
            `DELETE FROM documents
             WHERE id = ?`,
            [req.params.id]
        );

        res.json({
            success: true,
            message:
                'Document deleted successfully'
        });

    } catch (error) {

        console.error(
            'Delete document error:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Server error deleting document'
        });
    }
};


// ===============================
// DASHBOARD STATS
// ===============================

exports.getStats = async (req, res) => {
    try {

        const [totalResult] =
            await pool.execute(
                `SELECT COUNT(*) AS total
                 FROM documents`
            );

        const [activeResult] =
            await pool.execute(
                `SELECT COUNT(*) AS total
                 FROM documents
                 WHERE status = 'in-progress'`
            );

        const [pendingResult] =
            await pool.execute(
                `SELECT COUNT(*) AS total
                 FROM documents
                 WHERE status = 'pending'`
            );

        const [completedResult] =
            await pool.execute(
                `SELECT COUNT(*) AS total
                 FROM documents
                 WHERE status = 'completed'`
            );

        const [todayResult] =
            await pool.execute(
                `SELECT COUNT(*) AS total
                 FROM documents
                 WHERE DATE(createdAt) = CURDATE()`
            );

        res.json({
            success: true,

            totalDocuments:
                totalResult[0].total,

            activeCases:
                activeResult[0].total,

            pendingItems:
                pendingResult[0].total,

            completedItems:
                completedResult[0].total,

            uploadedToday:
                todayResult[0].total
        });

    } catch (error) {

        console.error(
            'Get stats error:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Server error fetching stats'
        });
    }
};


// ===============================
// RECENT DOCUMENTS
// ===============================

exports.getRecentDocuments = async (req, res) => {
    try {

        const [documents] =
            await pool.execute(
                `SELECT
                    d.*,
                    u.firstName,
                    u.lastName
                 FROM documents d
                 LEFT JOIN users u
                    ON d.uploadedBy = u.id
                 ORDER BY d.createdAt DESC
                 LIMIT 5`
            );

        res.json({
            success: true,
            documents: documents,
            results: documents
        });

    } catch (error) {

        console.error(
            'Get recent documents error:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Server error fetching recent documents'
        });
    }
};


// ===============================
// RECENT ACTIVITY
// ===============================

exports.getRecentActivity = async (req, res) => {
    try {

        const [documents] =
            await pool.execute(
                `SELECT
                    title,
                    caseNumber,
                    createdAt
                 FROM documents
                 ORDER BY createdAt DESC
                 LIMIT 10`
            );

        const activity =
            documents.map(doc => ({
                type: 'upload',

                message:
                    `Document uploaded: ${doc.title} (${doc.caseNumber})`,

                timestamp:
                    doc.createdAt
            }));

        res.json({
            success: true,
            activity: activity
        });

    } catch (error) {

        console.error(
            'Get activity error:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Server error fetching activity'
        });
    }
};


// ===============================
// DOWNLOAD DOCUMENT
// ===============================

exports.downloadDocument = async (req, res) => {
    try {

        const [documents] =
            await pool.execute(
                `SELECT *
                 FROM documents
                 WHERE id = ?`,
                [req.params.id]
            );

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    'Document not found'
            });
        }

        const document =
            documents[0];

        if (
            !document.filePath ||
            !fs.existsSync(document.filePath)
        ) {
            return res.status(404).json({
                success: false,
                message:
                    'File not found'
            });
        }

        res.download(
            document.filePath,
            document.fileName
        );

    } catch (error) {

        console.error(
            'Download document error:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Server error downloading document'
        });
    }
};