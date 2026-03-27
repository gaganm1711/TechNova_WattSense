const NavHTML = `
<div class="sidebar" id="global-sidebar">
    <div class="sidebar-header">
        <i class="fa-solid fa-leaf text-green"></i> WattSense
    </div>
    
    <div class="nav-group">
        <a href="dashboard.html" class="nav-item" data-page="dashboard"><i class="fa-solid fa-chart-line"></i> Dashboard</a>
        <a href="analytics.html" class="nav-item" data-page="analytics"><i class="fa-solid fa-chart-pie"></i> Infographics</a>
        <a href="ai-summarization.html" class="nav-item" data-page="ai-summarization"><i class="fa-solid fa-robot"></i> AI Summarization</a>
        <a href="settings.html" class="nav-item" data-page="settings" style="margin-top: 20px;"><i class="fa-solid fa-gear"></i> Settings</a>
    </div>
</div>
<div class="mobile-toggle" onclick="document.getElementById('global-sidebar').classList.toggle('open')">
    <i class="fa-solid fa-bars"></i>
</div>
`;

function injectNavigation(activePageId) {
    document.body.insertAdjacentHTML('afterbegin', NavHTML);
    
    // Highlight active page
    const items = document.querySelectorAll('.nav-item');
    items.forEach(item => {
        if(item.getAttribute('data-page') === activePageId) {
            item.classList.add('active');
        }
    });

    // Wrap body content automatically if not already wrapped
    if(!document.querySelector('.app-layout')) {
        const children = Array.from(document.body.children).filter(el => 
            el.id !== 'global-sidebar' && !el.classList.contains('mobile-toggle') && el.tagName !== 'SCRIPT'
        );
        
        const wrapper = document.createElement('div');
        wrapper.className = 'app-layout';
        
        const mainContent = document.createElement('div');
        mainContent.className = 'main-content';
        
        children.forEach(child => mainContent.appendChild(child));
        wrapper.appendChild(document.getElementById('global-sidebar'));
        wrapper.appendChild(mainContent);
        
        // Push mobile toggle outside if needed
        document.body.prepend(wrapper);
        document.body.appendChild(document.querySelector('.mobile-toggle'));
    }
}
