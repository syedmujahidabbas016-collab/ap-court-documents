// Search JavaScript

let currentPage = 1;
let totalPages = 1;
let currentResults = [];

document.addEventListener('DOMContentLoaded', function() {
    // Load initial search results
    performSearch();
    
    // Setup event listeners
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    document.getElementById('applyFilters').addEventListener('click', performSearch);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const view = this.dataset.view;
            const results = document.getElementById('searchResults');
            results.className = `search-results ${view}-view`;
        });
    });
    
    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderResults(currentResults);
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderResults(currentResults);
        }
    });
});

// Perform search
async function performSearch() {
    const query = document.getElementById('searchInput').value;
    const docType = document.getElementById('docType').value;
    const court = document.getElementById('court').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const status = document.getElementById('status').value;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (docType) params.append('type', docType);
    if (court) params.append('court', court);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (status) params.append('status', status);
    params.append('page', currentPage);
    params.append('limit', 10);
    
    try {
        const response = await apiRequest(`/search?${params.toString()}`);
        
        currentResults = response.results || [];
        totalPages = response.totalPages || 1;
        
        renderResults(currentResults);
        updatePagination();
        updateResultCount(response.total || 0);
        
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Search failed. Please try again.', 'error');
    }
}

// Render search results
function renderResults(results) {
    const container = document.getElementById('searchResults');
    
    if (!results || results.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No documents found</h3>
                <p>Try adjusting your search filters or keywords</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = results.map(doc => `
        <div class="result-item">
            <h4><a href="document.html?id=${doc.id}">${doc.title}</a></h4>
            <div class="meta">
                <span><i class="fas fa-gavel"></i> ${doc.caseNumber}</span>
                <span><i class="fas fa-tag"></i> <span class="badge ${doc.type}">${capitalize(doc.type)}</span></span>
                <span><i class="fas fa-calendar"></i> ${formatDate(doc.date)}</span>
                <span><i class="fas fa-building"></i> ${capitalize(doc.court)}</span>
                <span><i class="fas fa-user"></i> ${doc.judge || 'N/A'}</span>
            </div>
            ${doc.snippet ? `<div class="snippet">${doc.snippet}</div>` : ''}
        </div>
    `).join('');
}

// Update pagination
function updatePagination() {
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    
    // Style disabled buttons
    [prevBtn, nextBtn].forEach(btn => {
        btn.style.opacity = btn.disabled ? '0.5' : '1';
        btn.style.cursor = btn.disabled ? 'not-allowed' : 'pointer';
    });
}

// Update result count
function updateResultCount(total) {
    document.getElementById('resultCount').textContent = `${total} results found`;
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('docType').value = '';
    document.getElementById('court').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('status').value = '';
    currentPage = 1;
    performSearch();
}