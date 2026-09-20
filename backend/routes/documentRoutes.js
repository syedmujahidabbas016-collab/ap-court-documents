const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// All document routes require authentication
router.use(authMiddleware);


// ===============================
// UPLOAD DOCUMENT
// ===============================

router.post(
    '/upload',
    uploadMiddleware.single('file'),
    [
        body('title')
            .notEmpty()
            .withMessage('Title is required'),

        body('caseNumber')
            .notEmpty()
            .withMessage('Case number is required'),

        body('type')
            .isIn([
                'judgment',
                'order',
                'petition',
                'affidavit'
            ])
            .withMessage('Invalid document type'),

        body('court')
            .isIn([
                'supreme',
                'high',
                'district'
            ])
            .withMessage('Invalid court'),

        body('date')
            .isISO8601()
            .withMessage('Invalid date format'),
    ],
    documentController.uploadDocument
);


// ===============================
// DOCUMENT STATS
// ===============================

router.get(
    '/stats',
    documentController.getStats
);


// ===============================
// RECENT DOCUMENTS
// ===============================

router.get(
    '/recent',
    documentController.getRecentDocuments
);


// ===============================
// RECENT ACTIVITY
// ===============================

router.get(
    '/recent-activity',
    documentController.getRecentActivity
);


// ===============================
// ALL DOCUMENTS
// ===============================

router.get(
    '/',
    documentController.getDocuments
);


// ===============================
// DOWNLOAD DOCUMENT
// ===============================

router.get(
    '/:id/download',
    documentController.downloadDocument
);


// ===============================
// GET DOCUMENT BY ID
// ===============================

router.get(
    '/:id',
    documentController.getDocumentById
);


// ===============================
// UPDATE DOCUMENT
// ===============================

router.put(
    '/:id',
    [
        body('title')
            .optional()
            .notEmpty(),

        body('status')
            .optional()
            .isIn([
                'pending',
                'in-progress',
                'completed'
            ]),
    ],
    documentController.updateDocument
);


// ===============================
// DELETE DOCUMENT
// ===============================

router.delete(
    '/:id',
    documentController.deleteDocument
);


module.exports = router;