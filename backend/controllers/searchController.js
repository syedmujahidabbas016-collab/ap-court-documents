const { pool } = require('../config/database');

// Search documents
exports.search = async (req, res) => {
    try {
        const {
            q,
            type,
            court,
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const offset = (pageNumber - 1) * limitNumber;

        let where = 'WHERE 1=1';
        const params = [];

        if (q) {
            where += ` AND (
                d.title LIKE ?
                OR d.caseNumber LIKE ?
                OR d.description LIKE ?
            )`;

            const search = `%${q}%`;
            params.push(search, search, search);
        }

        if (type) {
            where += ` AND d.type = ?`;
            params.push(type);
        }

        if (court) {
            where += ` AND d.court = ?`;
            params.push(court);
        }

        const [documents] = await pool.execute(
            `SELECT
                d.*,
                u.firstName,
                u.lastName,
                u.email
             FROM documents d
             LEFT JOIN users u ON d.uploadedBy = u.id
             ${where}
             ORDER BY d.createdAt DESC
             LIMIT ${limitNumber} OFFSET ${offset}`,
            params
        );

        const [countResult] = await pool.execute(
            `SELECT COUNT(*) AS total
             FROM documents d
             ${where}`,
            params
        );

        const total = countResult[0].total;

        res.json({
            success: true,
            results: documents,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber)
        });

    } catch (error) {
        console.error('Search error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error during search'
        });
    }
};


// Advanced search
exports.advancedSearch = async (req, res) => {
    try {
        const {
            title,
            caseNumber,
            type,
            court,
            dateFrom,
            dateTo,
            page = 1,
            limit = 10
        } = req.body;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const offset = (pageNumber - 1) * limitNumber;

        let where = 'WHERE 1=1';
        const params = [];

        if (title) {
            where += ` AND d.title LIKE ?`;
            params.push(`%${title}%`);
        }

        if (caseNumber) {
            where += ` AND d.caseNumber LIKE ?`;
            params.push(`%${caseNumber}%`);
        }

        if (type) {
            where += ` AND d.type = ?`;
            params.push(type);
        }

        if (court) {
            where += ` AND d.court = ?`;
            params.push(court);
        }

        if (dateFrom) {
            where += ` AND d.date >= ?`;
            params.push(dateFrom);
        }

        if (dateTo) {
            where += ` AND d.date <= ?`;
            params.push(dateTo);
        }

        const [documents] = await pool.execute(
            `SELECT
                d.*,
                u.firstName,
                u.lastName,
                u.email
             FROM documents d
             LEFT JOIN users u ON d.uploadedBy = u.id
             ${where}
             ORDER BY d.date DESC
             LIMIT ${limitNumber} OFFSET ${offset}`,
            params
        );

        const [countResult] = await pool.execute(
            `SELECT COUNT(*) AS total
             FROM documents d
             ${where}`,
            params
        );

        const total = countResult[0].total;

        res.json({
            success: true,
            results: documents,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber)
        });

    } catch (error) {
        console.error('Advanced search error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error during advanced search'
        });
    }
};


// Search suggestions
exports.getSuggestions = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                suggestions: []
            });
        }

        const search = `%${q}%`;

        const [rows] = await pool.execute(
            `SELECT title, caseNumber
             FROM documents
             WHERE title LIKE ?
                OR caseNumber LIKE ?
             ORDER BY createdAt DESC
             LIMIT 10`,
            [search, search]
        );

        const suggestions = [];

        rows.forEach(row => {
            if (row.title) {
                suggestions.push(row.title);
            }

            if (row.caseNumber) {
                suggestions.push(row.caseNumber);
            }
        });

        res.json({
            success: true,
            suggestions: [...new Set(suggestions)].slice(0, 10)
        });

    } catch (error) {
        console.error('Suggestions error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error fetching suggestions'
        });
    }
};


// Search history
exports.getSearchHistory = async (req, res) => {
    res.json({
        success: true,
        history: []
    });
};


// Save search
exports.saveSearch = async (req, res) => {
    res.json({
        success: true,
        message: 'Search saved successfully'
    });
};