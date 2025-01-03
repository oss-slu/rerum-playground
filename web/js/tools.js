// Import the function for storing manifest links
import { storeManifestLink, getStoredManifestLinks } from './manifestStorage.js';

// Playground scripting utilities.  Will be available as github CDN.
import { default as UTILS } from 'https://centerfordigitalhumanities.github.io/rerum-playground/web/js/utilities.js'

import PLAYGROUND from './config.js';
import ToolsCatalog from './toolsCatalog.js';

const RECENTLY_USED_KEY = 'recentlyUsedTools';

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
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recentTools));
}

/**
 * Update recently used tools, move the clicked tool to the top.
 */
function updateRecentlyUsedTools(clickedTool) {
    let allTools = getRecentlyUsedTools();

    allTools = allTools.filter(
        tool => tool.label.toLowerCase() !== clickedTool.label.toLowerCase()
    );

    allTools.unshift(clickedTool);

    const updatedTools = [
        ...allTools,
        ...ToolsCatalog.filter(tool =>
            !allTools.some(recentTool => recentTool.label === tool.label)
        ),
    ];

    saveRecentlyUsedTools(updatedTools);
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
    const toolSetContainer = document.getElementById('tool_set');
    if (!toolSetContainer) {
        console.error("Tool set container not found.");
        return;
    }

    toolSetContainer.innerHTML = '';

    const recentTools = getRecentlyUsedTools();

    const toolsToRender = recentTools.length > 0
        ? [...recentTools, ...ToolsCatalog.filter(tool =>
            !recentTools.some(recentTool => recentTool.label === tool.label)
        )]
        : [...ToolsCatalog];

    const toolsWrapper = document.createElement('div');

    toolsToRender.forEach((tool, index) => {
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

window.onload = function() {
    renderStoredManifests(); 
};

/**
 * Handle tool click event to manage recently used logic and allow default navigation
 */
function handleToolClick(toolLabel) {
    const clickedTool = ToolsCatalog.find(
        tool => tool.label.toLowerCase() === toolLabel.toLowerCase()
    );
    
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

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const manifestUrl = document.getElementById('manifestUrl');
    const loadManifest = document.getElementById('loadManifest');
    const manifestMessage = document.getElementById('manifestMessage');
    const loadMessage = document.getElementById("loadMessage");
    const manifestLabelField = document.getElementById("manifestLabelField");
    const loadingOverlay = document.querySelector('.loading-overlay');

    // Function to show loading overlay
    function showLoading() {
        loadingOverlay.style.display = 'flex';
        manifestMessage.textContent = '';
    }

    // Function to hide loading overlay
    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    // Event listener for loading manifest
    loadManifest.addEventListener('click', async function() {
        const url = manifestUrl.value.trim();
        if (!url) {
            manifestMessage.textContent = 'Please enter a URL.';
            manifestMessage.style.color = 'red';
            return;
        }

        showLoading();

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            hideLoading();
            manifestMessage.textContent = 'Manifest loaded successfully!';
            manifestMessage.style.color = 'green';

            storeManifestLink(url);

            try {
                let manifestLabel = `Name: ${data.label.en[0]}`;
                let manifestType = `Type: ${data.type}`;
                let manifestItemCount = `Number of Items: ${data.items.length}`;

                loadMessage.innerHTML = "<u>Current Object:</u>";
                manifestLabelField.innerHTML = `${manifestLabel} &nbsp;&nbsp;&nbsp;&nbsp; ${manifestType} &nbsp;&nbsp;&nbsp;&nbsp; ${manifestItemCount}`;
            } catch (metadataError) {
                loadMessage.innerHTML = "No metadata available!";
                manifestLabelField.innerHTML = "";
            }
        } catch (error) {
            hideLoading();
            manifestMessage.textContent = 'Failed to load manifest. Please check the URL and try again.';
            manifestMessage.style.color = 'red';
            console.error('Error:', error);
        }
    });
});

// Toggle dropdown function, defined outside of DOMContentLoaded to ensure it's globally accessible
function toggleDropdown() {
    const manifestContainer = document.getElementById('stored_manifest_links');
    const dropdownArrow = document.getElementById('dropdownArrow');

    if (manifestContainer.style.display === 'none' || manifestContainer.style.display === '') {
        manifestContainer.style.display = 'block';
        dropdownArrow.textContent = '▲';
    } else {
        manifestContainer.style.display = 'none';
        dropdownArrow.textContent = '▼';
    }
}

document.getElementById('dropdownLabel').addEventListener('click', toggleDropdown);
document.getElementById('dropdownArrow').addEventListener('click', toggleDropdown);

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