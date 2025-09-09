// marketplace.js - Basic functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Marketplace loaded successfully!');

    // Add interactivity here later
    const searchBox = document.querySelector('.search-box');
    const searchBtn = document.querySelector('.search-btn');

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            alert('Search functionality will be implemented soon!');
        });
    }

    if (searchBox) {
        searchBox.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                alert('Search for: ' + this.value);
            }
        });
    }
});