/* 
 * App specific functions.  This is for unique functionality and application initialization.  
 */
   
// Playground scripting utilities.  Will be available as github CDN.
import { default as UTILS } from 'https://centerfordigitalhumanities.github.io/rerum-playground/web/js/utilities.js'

import PLAYGROUND from './config.js';
import ToolsCatalog from './tools.js';
import { storeManifestLink, getStoredManifestLinks } from './manifestStorage.js';

const RECENTLY_USED_KEY = 'recentlyUsedTools';

console.log("script is loading...");

/**
 * Retrieve recently used tools from local storage.
 */
function getRecentlyUsedTools() {
    const recentTools = localStorage.getItem(RECENTLY_USED_KEY);
    return recentTools ? JSON.parse(recentTools) : [];
}

/** 
 * Save recently used tools to local storage.
 */
function saveRecentlyUsedTools(recentTools) {
    console.log("Saving recent tools:", recentTools);
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recentTools));
}

/**
 * Update recently used tools, move the clicked tool to the top.
 */
function updateRecentlyUsedTools(clickedTool) {
    console.log("updateRecentlyUsedTools called with:", clickedTool);
    let recentTools = getRecentlyUsedTools();

    // Remove the tool if it exists in recentTools, then add it to the top
    recentTools = recentTools.filter(tool => tool.label.toLowerCase() !== clickedTool.label.toLowerCase());
    recentTools.unshift(clickedTool);

    //const topThreeTools = recentTools.slice(0, 3);
    saveRecentlyUsedTools(recentTools.slice(0, 3));
    console.log("updated recent tools after click:", recentTools.slice(0, 3));
}

/**
*  Landing behavior for interfaces.  This should populate the set of available interfaces to the DOM.
*/
function initializeInterfaces(config) {
    return new Promise((res) => {
        let setContainer = document.getElementById(config.id)
        Array.from(config.catalog).forEach(inter => {
            setContainer.innerHTML += UTILS.thumbnailGenerator(inter)
        })
        UTILS.broadcast(undefined, PLAYGROUND.EVENTS.LOADED, setContainer, {})
        /**
         * Really each render should be a promise and we should return a Promise.all() here of some kind.
         * That would only work if PlaygroundRender resulted in a Promise where we could return Promise.all(renderPromises).
         */
        setTimeout(res, 200) //A small hack to ensure all the HTML generated by processing the views enters the DOM before this says it has resolved.
    })
}

/**
*  Landing behavior for technologies.  This should populate the technologies to the DOM.
*/
function initializeTechnologies(config) {
    return new Promise((res) => {
        let setContainer = document.getElementById(config.id)
        Array.from(config.catalog).forEach(tech => {
            setContainer.innerHTML += UTILS.thumbnailGenerator(tech)
        })
        UTILS.broadcast(undefined, PLAYGROUND.EVENTS.LOADED, setContainer, {})
        /**
         * Really each render should be a promise and we should return a Promise.all() here of some kind.
         * That would only work if PlaygroundRender resulted in a Promise where we could return Promise.all(renderPromises).
         */
        setTimeout(res, 200) //A small hack to ensure all the HTML generated by processing the views enters the DOM before this says it has resolved.
    })
}

/**
 * Render tools, higlighting recently used ones.
 */
function renderTools() {
    console.log("renderTools is running");
    const toolSetContainer = document.getElementById('tool_set');
    if (!toolSetContainer) {
        console.error("Tool set container not found.");
        return;
    }

    toolSetContainer.innerHTML = '';

    const recentTools = getRecentlyUsedTools();
    //const recentToolLabels = new Set(recentTools.map(tool => tool.label.toLowerCase()));

    const sortedTools = [...recentTools, ...ToolsCatalog.filter(tool => 
        !recentTools.some(recentTool => recentTool.label === tool.label))];

    const toolsWrapper = document.createElement('div');

    sortedTools.forEach((tool, index) => {
        const isRecentlyUsed = index < 3 ? `<span class="recent-badge">Recently used</span>` : '';
        const toolHTML = `
            <a href="${tool.view}" target="_blank" class="catalogEntry">
                <figure class="thumb">
                    ${isRecentlyUsed}
                    <label>${tool.label}</label>
                    <img src="${tool.icon}" alt="${tool.label}" />
                    <figcaption>${tool.description}</figcaption>
                </figure>
            </a>
        `;
        toolsWrapper.innerHTML += toolHTML;
    });

    toolSetContainer.appendChild(toolsWrapper);

    // Add event listeners after elements are created
    const toolLinks = toolSetContainer.querySelectorAll('a.catalogEntry');
    toolLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const toolLabel = this.querySelector('label').innerText;
            handleToolClick(toolLabel);
        });
    });
    console.log("rendered tool order:", sortedTools.map(tool => tool.label));
}

/**
 * Render stored manifest links.
 */
function renderStoredManifests() {
    const manifestContainer = document.getElementById('stored_manifest_links');
    const storedManifests = getStoredManifestLinks();

    if (!manifestContainer) {
        console.error("Manifest set container not found.");
        return;
    }

    manifestContainer.innerHTML = '';

    if (storedManifests.length === 0) {
        manifestContainer.innerHTML = '<p>No stored manifest links.</p>';
        return;
    }

    storedManifests.forEach(manifestLink => {
        const manifestHTML = `
            <a href="${manifestLink}" target="_blank" class="manifestLink">
                <p>${manifestLink}</p>
            </a>
        `;
        manifestContainer.innerHTML += manifestHTML;
    });
}


/**
 * Handle tool click event to manage recently used logic and allow default navigation
 */
function handleToolClick(toolLabel) {
    console.log("handleToolClick called with:", toolLabel);
    const clickedTool = ToolsCatalog.find(tool => tool.label === toolLabel);
    if (clickedTool) {
        updateRecentlyUsedTools(clickedTool);
        renderTools();
        setTimeout(() => {
            window.open(clickedTool.view, '_blank');
        }, 100);
    } else {
        console.error('Clicked tool not found:', toolLabel);
    }
}

/**
 * Update tool order when a tool is clicked.
 */
window.updateToolOrder = function(toolLabel) {
    const clickedTool = ToolsCatalog.find(tool => tool.label === toolLabel);
    if (clickedTool) {
        updateRecentlyUsedTools(clickedTool);
        renderTools();
    }
}

document.addEventListener('DOMContentLoaded', () => {
/**
*  These are promises so we can control the chaining how we like, if necessary.
*/
    try {
        initializeInterfaces(PLAYGROUND.INTERFACES)
        initializeTechnologies(PLAYGROUND.TECHNOLOGIES)
        renderTools();
        renderStoredManifests();
    } catch (err) {
        console.error("Error initializing the playground: ", err);
    }
});    

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