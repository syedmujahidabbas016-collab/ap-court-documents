const Case = require('../models/Case');

/**
 * Generate a unique case ID
 * Format: APYYYY-NNNN
 * Example: AP2024-0001
 */
const generateCaseId = async () => {
    const year = new Date().getFullYear();
    const prefix = `AP${year}`;
    
    // Find the last case number for this year
    const lastCase = await Case.findOne({
        caseNumber: { $regex: `^${prefix}` },
    }).sort({ caseNumber: -1 });
    
    let sequence = 1;
    
    if (lastCase) {
        const lastNumber = parseInt(lastCase.caseNumber.split('-')[1]);
        sequence = lastNumber + 1;
    }
    
    // Pad with zeros
    const paddedSequence = String(sequence).padStart(4, '0');
    
    return `${prefix}-${paddedSequence}`;
};

/**
 * Validate case ID format
 */
const validateCaseId = (caseId) => {
    const regex = /^AP\d{4}-\d{4}$/;
    return regex.test(caseId);
};

/**
 * Extract year from case ID
 */
const extractYearFromCaseId = (caseId) => {
    const match = caseId.match(/^AP(\d{4})/);
    return match ? parseInt(match[1]) : null;
};

module.exports = {
    generateCaseId,
    validateCaseId,
    extractYearFromCaseId,
};