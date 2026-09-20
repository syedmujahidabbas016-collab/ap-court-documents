// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!requireAuth()) return;
    
    // Load dashboard data
    loadDashboardData();
    
    // Setup event listeners
    document.getElementById('newCaseBtn')?.addEventListener('click', handleNewCase);
});

// Load dashboard data
async function loadDashboardData() {
    try {
        // Show loading state
        document.querySelectorAll('.stat-info p').forEach(p => p.textContent = '...');
        
        // Fetch dashboard stats
        const stats = await apiRequest('/documents/stats');
        
        // Update stats
        document.getElementById('totalDocuments').textContent = stats.totalDocuments || 0;
        document.getElementById('activeCases').textContent = stats.activeCases || 0;
        document.getElementById('pendingItems').textContent = stats.pendingItems || 0;
        document.getElementById('completedItems').textContent = stats.completedItems || 0;
        
        // Load recent activity
        loadRecentActivity();
        
        // Load recent documents
        loadRecentDocuments();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const activities = await apiRequest('/documents/recent-activity');
        const activityList = document.getElementById('activityList');
        
        if (!activityList) return;
        
        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <p>No recent activity</p>
                    </div>
                </div>
            `;
            return;
        }
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i class="fas ${getActivityIcon(activity.type)}"></i>
                <div>
                    <p>${activity.message}</p>
                    <span class="time">${formatTime(activity.timestamp)}</span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

// Load recent documents
async function loadRecentDocuments() {
    try {
        const documents = await apiRequest('/documents/recent');
        const tableBody = document.getElementById('recentDocumentsTable');
        
        if (!tableBody) return;
        
        if (documents.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                        No documents found
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = documents.map(doc => `
            <tr>
                <td>${doc.title}</td>
                <td>${doc.caseNumber}</td>
                <td><span class="badge ${doc.type}">${capitalize(doc.type)}</span></td>
                <td>${formatDate(doc.date)}</td>
                <td><span class="status ${doc.status}">${capitalize(doc.status)}</span></td>
                <td><a href="document.html?id=${doc.id}" class="view-btn">View</a></td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

// Handle new case
function handleNewCase(e) {
    e.preventDefault();
    showNotification('New case creation feature coming soon!', 'info');
}

// Helper functions
function getActivityIcon(type) {
    const icons = {
        'upload': 'fa-upload',
        'search': 'fa-search',
        'view': 'fa-eye',
        'download': 'fa-download',
        'update': 'fa-pen',
        'delete': 'fa-trash',
        'default': 'fa-circle'
    };
    return icons[type] || icons.default;
}

function formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' minutes ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + ' days ago';
    
    return formatDate(timestamp);
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}