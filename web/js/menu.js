export function openCloseMenu() {
    const toolBar = document.getElementById("toolBar");
    const mainContent = document.querySelector(".content") || 
                       document.querySelector(".container") || 
                       document.querySelector("#tool_set");
    
    toolBar?.classList.toggle("sidebar-open");
    mainContent?.classList.toggle("shift");
}

window.openCloseMenu = openCloseMenu;

// Initialize menu and footer
export function initializeLayout() {
    Promise.all([
        fetch('footer.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('footer-placeholder').innerHTML = data;
            }),
        fetch('menu.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('menu-placeholder').innerHTML = data;
            })
    ]).catch(error => console.error('Error loading layout:', error));
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', initializeLayout);