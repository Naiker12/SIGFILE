document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.section');

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            this.classList.add('active');
            
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    function showSectionFromHash() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const tab = document.querySelector(`[data-section="${hash}"]`);
            if (tab) {
                tab.click();
            }
        }
    }
    showSectionFromHash();
    window.addEventListener('hashchange', showSectionFromHash);
});