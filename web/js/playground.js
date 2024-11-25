/* 
 * App specific functions.  This is for unique functionality and application initialization.  
 */
   
// Playground scripting utilities.  Will be available as github CDN.

//fetch footer
fetch('footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));

//fetch menu
fetch('menu.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('menu-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading menu:', error));

//menubar js 
function openCloseMenu() {
    var toolBar = document.getElementById("toolBar");
    var mainContent = document.querySelector(".content") || document.querySelector(".container") || document.querySelector("#tool_set");
    toolBar.classList.toggle("sidebar-open");
    if (mainContent) {
        mainContent.classList.toggle("shift");
    }
}

window.openCloseMenu = openCloseMenu;