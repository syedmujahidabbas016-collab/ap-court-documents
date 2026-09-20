const express = require('express');

const router = express.Router();

// Search documents
router.get('/', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Search API is working',
            data: []
        });
    } catch (error) {
        console.error('Search error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error during search'
        });
    }
});

module.exports = router;