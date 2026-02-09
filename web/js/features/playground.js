/* 
 * App specific functions.  This is for unique functionality and application initialization.  
 */
   
// Playground scripting utilities.  Will be available as github CDN.

import { fetchFooter, fetchMenu } from './services/objectService.js';

// fetch footer via service
fetchFooter()
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));

// fetch menu via service
fetchMenu()
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