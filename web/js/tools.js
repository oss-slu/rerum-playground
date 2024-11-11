// Import the function for storing manifest links
import { storeManifestLink } from './manifestStorage.js';

//Importing all of these until I can figure out what I am missing.
import { default as UTILS } from 'https://centerfordigitalhumanities.github.io/rerum-playground/web/js/utilities.js'

import PLAYGROUND from './config.js';
import ToolsCatalog from './toolsCatalog.js';
import { storeManifestLink, getStoredManifestLinks } from './manifestStorage.js';

const RECENTLY_USED_KEY = 'recentlyUsedTools';

console.log("script is loading...");

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

function renderStoredManifests() {
    const manifestContainer = document.getElementById('stored_manifest_links');
    const storedManifests = getStoredManifestLinks();

    if (!manifestContainer) {
        console.error("Manifest container not found.");
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
    // const recentTools = getRecentlyUsedTools();
    // const existingIndex = recentTools.findIndex(tool => tool.label.toLowerCase() === clickedTool.label.toLowerCase());

    // if (existingIndex !== -1) {
    //     recentTools.splice(existingIndex, 1);
    // }
    console.log("updateRecentlyUsedTools called with:", clickedTool);
    let recentTools = getRecentlyUsedTools();

    // Remove the tool if it exists in recentTools, then add it to the top
    recentTools = recentTools.filter(tool => tool.label.toLowerCase() !== clickedTool.label.toLowerCase());
    recentTools.unshift(clickedTool);

    const topThreeTools = recentTools.slice(0, 3);
    saveRecentlyUsedTools(topThreeTools);
    console.log("updated recent tools after click:", topThreeTools);
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
    const hasRecentlyUsedTools = recentTools.length > 0;

    // Divide ToolsCatalog into recently used tools and non-recently-used tools
    const recentlyUsedLabels = recentTools.map(tool => tool.label.toLowerCase());
    const recentToolsSet = new Set(recentlyUsedLabels);

    const recentlyUsedTools = ToolsCatalog.filter(tool =>
        recentToolsSet.has(tool.label.toLowerCase())
    );

    const nonRecentlyUsedTools = ToolsCatalog.filter(tool =>
        !recentToolsSet.has(tool.label.toLowerCase())
    );

    // Sort recently used tools based on their order in recentTools array
    const sortedRecentlyUsedTools = recentlyUsedTools.sort(
        (a, b) =>
            recentToolsSet.has(a.label.toLowerCase()) - recentToolsSet.has(b.label.toLowerCase())
    );

    // Combine sorted recently used tools and non-recently-used tools
    const sortedTools = [...sortedRecentlyUsedTools, ...nonRecentlyUsedTools];

    const toolsWrapper = document.createElement('div');

    sortedTools.forEach((tool, index) => {
        const isRecentlyUsed = hasRecentlyUsedTools && index < 3 && recentToolsSet.has(tool.label.toLowerCase()) ? `<span class="recent-badge">Recently used</span>` : '';
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