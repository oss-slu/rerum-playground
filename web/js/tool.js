// Import the function for storing manifest links
import { storeManifestLink } from './manifestStorage.js';

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