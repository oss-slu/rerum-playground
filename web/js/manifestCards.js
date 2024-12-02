// manifestCards.js
import { getStoredManifestLinks } from './manifestStorage.js';

/**
 * Extract the title from a manifest using various possible locations
 * @param {Object} manifestData - The manifest data
 * @returns {string} The extracted title
 */
function extractTitle(manifestData) {
    // IIIF 3.0 style label
    if (manifestData.label) {
        if (manifestData.label.en?.[0]) return manifestData.label.en[0];
        if (manifestData.label.none?.[0]) return manifestData.label.none[0];
    }

    // IIIF 2.0 style label
    if (typeof manifestData.label === 'string') {
        return manifestData.label;
    }

    // Check metadata for title
    const metadata = manifestData.metadata || [];
    const titleEntry = metadata.find(entry => {
        const label = entry.label?.none?.[0] || entry.label;
        return label?.toLowerCase() === 'title';
    });

    if (titleEntry) {
        return titleEntry.value?.none?.[0] || titleEntry.value;
    }

    // If no title is found, create one from the URL
    return 'Untitled Manifest';
}

/**
 * Creates a card element for a manifest
 * @param {Object} manifestData - The manifest data
 * @param {string} manifestUrl - The URL of the manifest
 * @returns {HTMLElement} The card element
 */

function createManifestCard(manifestData, manifestUrl) {
    const card = document.createElement('div');
    card.className = 'manifest-card';
    
    const thumbnailUrl = manifestData.thumbnail?.[0]?.id || './images/rerum_logo.png';
    const title = extractTitle(manifestData);
    const itemCount = manifestData.items?.length || 
                     manifestData.sequences?.[0]?.canvases?.length || 0;

    card.innerHTML = `
        <div class="manifest-card-image-container">
            <img 
                class="manifest-card-image" 
                src="${thumbnailUrl}" 
                alt="${title}"
                onerror="this.src='./images/rerum_logo.png'"
            >
        </div>
        <div class="manifest-card-content">
            <h3 class="manifest-card-title">${title}</h3>
            <div class="manifest-card-info">
                <span>${itemCount} items</span>
                <a href="${manifestUrl}" target="_blank" class="manifest-card-link">View Manifest</a>
            </div>
        </div>
    `;

    return card;
}

/**
 * Renders the manifest cards in the container
 * @returns {Promise<void>}
 */
export async function renderManifestCards() {
    console.log('renderManifestCards called');
    const manifestContainer = document.getElementById('stored_manifest_links');
    const storedManifests = getStoredManifestLinks();
    
    console.log('Found stored manifests:', storedManifests);

    if (!manifestContainer) {
        console.error("Manifest container not found.");
        return;
    }

    manifestContainer.innerHTML = '';

    if (storedManifests.length === 0) {
        manifestContainer.innerHTML = '<p class="text-center text-gray-500">No stored manifest links.</p>';
        return;
    }

    const manifestGrid = document.createElement('div');
    manifestGrid.className = 'manifest-grid';

    for (const manifestUrl of storedManifests) {
        console.log('Processing manifest URL:', manifestUrl);
        try {
            const response = await fetch(manifestUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('Successfully fetched manifest data:', data);
            const card = createManifestCard(data, manifestUrl);
            manifestGrid.appendChild(card);
        } catch (error) {
            console.error('Error loading manifest:', manifestUrl, error);
            const errorCard = document.createElement('div');
            errorCard.className = 'manifest-card';
            errorCard.innerHTML = `
                <div class="manifest-card-content">
                    <h3 class="manifest-card-title">Error Loading Manifest</h3>
                    <div class="manifest-card-info">
                        <span>Failed to load: ${manifestUrl}</span>
                    </div>
                </div>
            `;
            manifestGrid.appendChild(errorCard);
        }
    }

    console.log('Appending manifest grid to container');
    manifestContainer.appendChild(manifestGrid);
}