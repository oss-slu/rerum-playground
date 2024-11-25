import { toggleDropdown, loadManifest, renderManifestCards, initializeManifestHandlers } from './manifestStorage.js';
import { default as UTILS } from 'https://centerfordigitalhumanities.github.io/rerum-playground/web/js/utilities.js';
import PLAYGROUND from './config.js';
import ToolsCatalog from './toolsCatalog.js';

window.loadManifest = loadManifest;
window.toggleDropdown = toggleDropdown;
window.renderManifestCards = renderManifestCards;

const RECENTLY_USED_KEY = 'recentlyUsedTools';

function getRecentlyUsedTools() {
    const recentTools = localStorage.getItem(RECENTLY_USED_KEY);
    return recentTools ? JSON.parse(recentTools) : [];
}

function saveRecentlyUsedTools(recentTools) {
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recentTools));
}

function updateRecentlyUsedTools(clickedTool) {
    let recentTools = getRecentlyUsedTools();
    recentTools = recentTools.filter(tool => tool.label.toLowerCase() !== clickedTool.label.toLowerCase());
    recentTools.unshift(clickedTool);
    const topThreeTools = recentTools.slice(0, 3);
    saveRecentlyUsedTools(topThreeTools);
}

function initializeInterfaces() {
    return new Promise((res) => {
        let setContainer = document.getElementById(PLAYGROUND.INTERFACES.id);
        if (setContainer) {
            Array.from(PLAYGROUND.INTERFACES.catalog).forEach(inter => {
                setContainer.innerHTML += UTILS.thumbnailGenerator(inter);
            });
            UTILS.broadcast(undefined, PLAYGROUND.EVENTS.LOADED, setContainer, {});
        }
        setTimeout(res, 200);
    });
}

function initializeTechnologies() {
    return new Promise((res) => {
        let setContainer = document.getElementById(PLAYGROUND.TECHNOLOGIES.id);
        if (setContainer) {
            Array.from(PLAYGROUND.TECHNOLOGIES.catalog).forEach(tech => {
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

    toolSetContainer.innerHTML = '';
    const recentTools = getRecentlyUsedTools();
    const hasRecentlyUsedTools = recentTools.length > 0;
    const recentlyUsedLabels = recentTools.map(tool => tool.label.toLowerCase());
    const recentToolsSet = new Set(recentlyUsedLabels);

    const sortedTools = [
        ...ToolsCatalog.filter(tool => recentToolsSet.has(tool.label.toLowerCase())),
        ...ToolsCatalog.filter(tool => !recentToolsSet.has(tool.label.toLowerCase()))
    ];

    const toolsWrapper = document.createElement('div');
    sortedTools.forEach((tool, index) => {
        const isRecentlyUsed = hasRecentlyUsedTools && index < 3 && recentToolsSet.has(tool.label.toLowerCase());
        toolsWrapper.innerHTML += UTILS.thumbnailGenerator(tool, isRecentlyUsed);
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
    const clickedTool = ToolsCatalog.find(tool => tool.label === toolLabel);
    if (clickedTool) {
        updateRecentlyUsedTools(clickedTool);
        renderTools();
        setTimeout(() => window.open(clickedTool.view, '_blank'), 100);
    }
}

function initializeApp() {
    try {
        // Initialize manifest handlers
        initializeManifestHandlers();
        
        // Initialize tools display
        renderTools();
        
        // Initial manifest cards render
        const manifestContainer = document.getElementById('stored_manifest_links');
        if (manifestContainer?.style.display !== 'none') {
            renderManifestCards().catch(err => console.error('Error rendering cards:', err));
        }

        // Add click handler for dropdown
        const dropdownLabel = document.getElementById('dropdownLabel');
        const dropdownArrow = document.getElementById('dropdownArrow');
        
        if (dropdownLabel) {
            dropdownLabel.addEventListener('click', () => toggleDropdown());
        }
        if (dropdownArrow) {
            dropdownArrow.addEventListener('click', () => toggleDropdown());
        }
    } catch (err) {
        console.error("Error initializing app:", err);
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);