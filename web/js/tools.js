// tools.js

// Import the function for storing manifest links
import { storeManifestLink, getStoredManifestLinks } from './manifestStorage.js';
import { renderManifestCards } from './manifestCards.js';
import { default as UTILS } from 'https://centerfordigitalhumanities.github.io/rerum-playground/web/js/utilities.js';
import PLAYGROUND from './config.js';
import ToolsCatalog from './toolsCatalog.js';

const RECENTLY_USED_KEY = 'recentlyUsedTools';

// Utility functions
function getRecentlyUsedTools() {
    const recentTools = localStorage.getItem(RECENTLY_USED_KEY);
    return recentTools ? JSON.parse(recentTools) : [];
}

function saveRecentlyUsedTools(recentTools) {
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recentTools));
}

function updateRecentlyUsedTools(clickedTool) {
    let allTools = getRecentlyUsedTools();
    allTools = allTools.filter(tool => tool.label.toLowerCase() !== clickedTool.label.toLowerCase());
    allTools.unshift(clickedTool);
    const updatedTools = [
        ...allTools,
        ...ToolsCatalog.filter(tool => !allTools.some(recentTool => recentTool.label === tool.label))
    ];
    saveRecentlyUsedTools(updatedTools);
}

function initializeInterfaces(config) {
    return new Promise((res) => {
        let setContainer = document.getElementById(config.id);
        if (setContainer) {
            Array.from(config.catalog).forEach(inter => {
                setContainer.innerHTML += UTILS.thumbnailGenerator(inter);
            });
            UTILS.broadcast(undefined, PLAYGROUND.EVENTS.LOADED, setContainer, {});
        }
        setTimeout(res, 200);
    });
}

function initializeTechnologies(config) {
    return new Promise((res) => {
        let setContainer = document.getElementById(config.id);
        if (setContainer) {
            Array.from(config.catalog).forEach(tech => {
                setContainer.innerHTML += UTILS.thumbnailGenerator(tech);
            });
            UTILS.broadcast(undefined, PLAYGROUND.EVENTS.LOADED, setContainer, {});
        }
        setTimeout(res, 200);
    });
}

function renderTools() {
    const toolSetContainer = document.getElementById('tool_set');
    if (!toolSetContainer) {
        console.error("Tool set container not found.");
        return;
    }

    toolSetContainer.innerHTML = '<h4>Tools</h4>';
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
    addToolClickHandlers();
}

function addToolClickHandlers() {
    const toolLinks = document.querySelectorAll('a.catalogEntry');
    toolLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const toolLabel = this.querySelector('label').innerText;
            handleToolClick(toolLabel);
        });
    });
}

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

function showLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    const manifestMessage = document.getElementById('manifestMessage');
    if (manifestMessage) {
        manifestMessage.textContent = '';
    }
}

function hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function toggleDropdown() {
    const manifestContainer = document.getElementById('stored_manifest_links');
    const dropdownArrow = document.getElementById('dropdownArrow');
    
    console.log('Toggle dropdown called');
    console.log('Current stored manifests:', getStoredManifestLinks());

    if (!manifestContainer) {
        console.error('Manifest container not found');
        return;
    }

    // Toggle the show class instead of using style.display
    if (manifestContainer.classList.contains('show')) {
        manifestContainer.classList.remove('show');
        dropdownArrow.textContent = '▼';
        console.log('Closing dropdown');
    } else {
        manifestContainer.classList.add('show');
        dropdownArrow.textContent = '▲';
        console.log('Opening dropdown, rendering cards...');
        renderManifestCards().then(() => {
            console.log('Cards rendered');
            // Force a reflow to ensure the content is visible
            manifestContainer.offsetHeight;
        }).catch(err => {
            console.error('Error rendering cards:', err);
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize UI components
        await initializeInterfaces(PLAYGROUND.INTERFACES);
        await initializeTechnologies(PLAYGROUND.TECHNOLOGIES);
        renderTools();

        // Add event listeners
        const dropdownLabel = document.getElementById('dropdownLabel');
        const dropdownArrow = document.getElementById('dropdownArrow');
        if (dropdownLabel) dropdownLabel.addEventListener('click', toggleDropdown);
        if (dropdownArrow) dropdownArrow.addEventListener('click', toggleDropdown);

        // Setup manifest loading
        const loadManifest = document.getElementById('loadManifest');
        if (loadManifest) {
            loadManifest.addEventListener('click', async function() {
                const manifestUrl = document.getElementById('manifestUrl');
                const manifestMessage = document.getElementById('manifestMessage');
                const url = manifestUrl.value.trim();
                
                if (!url) {
                    manifestMessage.textContent = 'Please enter a URL.';
                    manifestMessage.style.color = 'red';
                    return;
                }

                showLoading();
                console.log('Loading manifest from URL:', url);

                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const data = await response.json();

                    hideLoading();
                    manifestMessage.textContent = 'Manifest loaded successfully!';
                    manifestMessage.style.color = 'green';

                    console.log('Storing manifest link:', url);
                    storeManifestLink(url);
                    console.log('Current stored manifests:', getStoredManifestLinks());
                    
                    renderManifestCards().then(() => {
                        console.log('Cards rendered after new manifest loaded'); 
                    }).catch(err => {
                        console.error('Error rendering cards:', err);
                    });

                    const loadMessage = document.getElementById("loadMessage");
                    const manifestLabelField = document.getElementById("manifestLabelField");
                    
                    try {
                        const manifestLabel = `Name: ${data.label.en[0]}`;
                        const manifestType = `Type: ${data.type}`;
                        const manifestItemCount = `Number of Items: ${data.items.length}`;

                        loadMessage.innerHTML = "<u>Current Object:</u>";
                        manifestLabelField.innerHTML = `${manifestLabel} &nbsp;&nbsp;&nbsp;&nbsp; ${manifestType} &nbsp;&nbsp;&nbsp;&nbsp; ${manifestItemCount}`;
                    } catch (metadataError) {
                        console.error('Error displaying metadata:', metadataError);
                        loadMessage.innerHTML = "No metadata available!";
                        manifestLabelField.innerHTML = "";
                    }
                } catch (error) {
                    console.error('Error loading manifest:', error);
                    hideLoading();
                    manifestMessage.textContent = 'Failed to load manifest. Please check the URL and try again.';
                    manifestMessage.style.color = 'red';
                    console.error('Error:', error);
                }
            });
        }
    } catch (err) {
        console.error("Error initializing the playground:", err);
    }
});

// Make necessary functions available globally
window.updateToolOrder = function(toolLabel) {
    const clickedTool = ToolsCatalog.find(tool => tool.label === toolLabel);
    if (clickedTool) {
        updateRecentlyUsedTools(clickedTool);
        renderTools();
    }
};

window.openCloseMenu = function() {
    const toolBar = document.getElementById("toolBar");
    const mainContent = document.querySelector(".content") || document.querySelector(".container") || document.querySelector("#tool_set");
    if (toolBar) toolBar.classList.toggle("sidebar-open");
    if (mainContent) mainContent.classList.toggle("shift");
};