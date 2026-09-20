// Documents JavaScript - For document viewer and management

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on document page
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');
    
    if (docId) {
        loadDocument(docId);
    }
});

// Load document data
async function loadDocument(docId) {
    try {
        const doc = await apiRequest(`/documents/${docId}`);
        
        if (!doc) {
            showNotification('Document not found', 'error');
            return;
        }
        
        // Update UI with document data
        document.getElementById('docTitle').textContent = doc.title;
        document.getElementById('docCaseNo').textContent = doc.caseNumber;
        document.getElementById('docType').innerHTML = `<span class="badge ${doc.type}">${capitalize(doc.type)}</span>`;
        document.getElementById('docDate').textContent = formatDate(doc.date);
        document.getElementById('docJudge').textContent = doc.judge || 'Not specified';
        document.getElementById('docStatus').innerHTML = `<span class="status ${doc.status}">${capitalize(doc.status)}</span>`;
        
        // Update iframe source
        const iframe = document.getElementById('docViewer');
        if (iframe && doc.fileUrl) {
            iframe.src = doc.fileUrl;
        }
        
        // Update page title
        document.title = `${doc.title} - AP Court Documents`;
        
    } catch (error) {
        console.error('Error loading document:', error);
        showNotification('Failed to load document', 'error');
    }
}

// Download document
function downloadDocument() {
    const iframe = document.getElementById('docViewer');
    if (iframe && iframe.src) {
        window.open(iframe.src, '_blank');
    } else {
        showNotification('No document available for download', 'error');
    }
}

// Print document
function printDocument() {
    const iframe = document.getElementById('docViewer');
    if (iframe && iframe.src) {
        // Open print dialog for the iframe content
        iframe.contentWindow.print();
    } else {
        showNotification('No document available to print', 'error');
    }
}