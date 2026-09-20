// Upload JavaScript

let selectedFile = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!requireAuth()) return;
    
    // Setup file drop zone
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Setup form submission
    document.getElementById('uploadForm').addEventListener('submit', handleUpload);
    
    // Set default date
    const dateInput = document.getElementById('docDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
});

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    this.classList.remove('dragover');
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        validateAndSelectFile(files[0]);
    }
}

// Handle file select from input
function handleFileSelect(e) {
    const files = this.files;
    if (files.length > 0) {
        validateAndSelectFile(files[0]);
    }
}

// Validate and select file
function validateAndSelectFile(file) {
    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        showNotification('Invalid file type. Please upload PDF, DOCX, JPEG, or PNG.', 'error');
        return;
    }
    
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        showNotification('File too large. Maximum size is 10MB.', 'error');
        return;
    }
    
    selectedFile = file;
    
    // Update UI
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const dropZone = document.getElementById('dropZone');
    
    fileName.textContent = file.name;
    fileSize.textContent = `(${formatFileSize(file.size)})`;
    fileInfo.style.display = 'block';
    dropZone.style.borderColor = '#10b981';
    dropZone.style.background = '#f0fdf4';
    
    // Update drop zone text
    dropZone.querySelector('h3').textContent = 'File selected!';
    dropZone.querySelector('p').textContent = 'Click to change file';
}

// Handle upload
async function handleUpload(e) {
    e.preventDefault();
    
    // Validate form
    const title = document.getElementById('docTitle').value;
    const caseNumber = document.getElementById('caseNumber').value;
    const docType = document.getElementById('docType').value;
    const court = document.getElementById('court').value;
    const date = document.getElementById('docDate').value;
    
    if (!title || !caseNumber || !docType || !court || !date) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    if (!selectedFile) {
        showNotification('Please select a file to upload.', 'error');
        return;
    }
    
    // Show progress
    const progressDiv = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const uploadBtn = document.getElementById('uploadBtn');
    
    progressDiv.style.display = 'block';
    uploadBtn.disabled = true;
    
    try {
        // Create form data
        const formData = new FormData();
        formData.append('title', title);
        formData.append('caseNumber', caseNumber);
        formData.append('type', docType);
        formData.append('court', court);
        formData.append('date', date);
        formData.append('judge', document.getElementById('judge').value || '');
        formData.append('description', document.getElementById('description').value || '');
        formData.append('file', selectedFile);
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 95) {
                progress = 95;
                clearInterval(interval);
            }
            progressBar.style.width = progress + '%';
            progressText.textContent = `Uploading... ${Math.round(progress)}%`;
        }, 300);
        
        // Make API call
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/documents/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        
        clearInterval(interval);
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        
        // Complete progress
        progressBar.style.width = '100%';
        progressText.textContent = 'Upload complete!';
        
        showNotification('Document uploaded successfully!', 'success');
        
        // Reset form after delay
        setTimeout(() => {
            document.getElementById('uploadForm').reset();
            selectedFile = null;
            document.getElementById('fileInfo').style.display = 'none';
            document.getElementById('dropZone').querySelector('h3').textContent = 'Drag and drop your file here';
            document.getElementById('dropZone').querySelector('p').textContent = 'or click to browse';
            document.getElementById('dropZone').style.borderColor = '#d0d5dd';
            document.getElementById('dropZone').style.background = '#f8f9fc';
            progressDiv.style.display = 'none';
            progressBar.style.width = '0%';
            uploadBtn.disabled = false;
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        console.error('Upload error:', error);
        showNotification(error.message || 'Upload failed. Please try again.', 'error');
        progressDiv.style.display = 'none';
        uploadBtn.disabled = false;
    }
}