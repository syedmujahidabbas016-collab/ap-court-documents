const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    caseNumber: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['judgment', 'order', 'petition', 'affidavit'],
        required: true,
    },
    court: {
        type: String,
        enum: ['supreme', 'high', 'district'],
        required: true,
    },
    judge: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    downloads: {
        type: Number,
        default: 0,
    },
    tags: [String],
    metadata: {
        type: Map,
        of: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for better search performance
DocumentSchema.index({ title: 'text', description: 'text', caseNumber: 'text' });
DocumentSchema.index({ caseNumber: 1 });
DocumentSchema.index({ type: 1 });
DocumentSchema.index({ court: 1 });
DocumentSchema.index({ date: -1 });
DocumentSchema.index({ status: 1 });

// Update timestamps on save
DocumentSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Document', DocumentSchema);