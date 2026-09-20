const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
    caseNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['civil', 'criminal', 'family', 'corporate', 'tax', 'others'],
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
    parties: {
        petitioner: {
            name: String,
            advocate: String,
        },
        respondent: {
            name: String,
            advocate: String,
        },
    },
    status: {
        type: String,
        enum: ['filed', 'pending', 'hearing', 'adjourned', 'reserved', 'judgment', 'disposed'],
        default: 'filed',
    },
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
    }],
    filedDate: {
        type: Date,
        required: true,
    },
    lastHearing: {
        type: Date,
    },
    nextHearing: {
        type: Date,
    },
    disposedDate: {
        type: Date,
    },
    description: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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

// Indexes
CaseSchema.index({ caseNumber: 1 });
CaseSchema.index({ type: 1 });
CaseSchema.index({ status: 1 });
CaseSchema.index({ 'parties.petitioner.name': 1 });
CaseSchema.index({ 'parties.respondent.name': 1 });

// Update timestamps
CaseSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Case', CaseSchema);