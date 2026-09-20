const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirectories = [
    'uploads',
    'uploads/judgments',
    'uploads/orders',
    'uploads/petitions',
    'uploads/affidavits'
];

uploadDirectories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads';
        const docType = req.body.type || 'general';

        switch (docType) {
            case 'judgment':
                folder = 'uploads/judgments';
                break;

            case 'order':
                folder = 'uploads/orders';
                break;

            case 'petition':
                folder = 'uploads/petitions';
                break;

            case 'affidavit':
                folder = 'uploads/affidavits';
                break;
        }

        cb(null, folder);
    },

    filename: (req, file, cb) => {
        const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1E9);

        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);

        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                'Invalid file type. Only PDF, DOCX, JPEG, and PNG are allowed.'
            ),
            false
        );
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize:
            parseInt(process.env.MAX_FILE_SIZE) ||
            10 * 1024 * 1024
    }
});

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    next();
};

module.exports = upload;
module.exports.handleUploadError = handleUploadError;