const MANIFEST_LINKS_KEY ='storedManifestLinks';


 // Save the given manifest link to local storage.
 
export function storeManifestLink(manifestLink) {
    let manifestLinks = getStoredManifestLinks();

    if (!manifestLinks.includes(manifestLink)) {
        manifestLinks.push(manifestLink);

        // save updated links array to local storage
        localStorage.setItem(MANIFEST_LINKS_KEY, JSON.stringify(manifestLinks));

        // refresh the manifest cards display
        renderManifestCards();
    }   
}

export function getStoredManifestLinks() {
    const manifestLinks = localStorage.getItem(MANIFEST_LINKS_KEY);
    return manifestLinks ? JSON.parse(manifestLinks) : [];
}

async function fetchManifestDetails(uri) {
    try {
        const response = await fetch(uri);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Extract title from various possible manifest structures
        let title = 'Untitled Manifest';
        if (data.label) {
            if (typeof data.label === 'string') {
                title = data.label;
            } 
            else if (data.label.en && Array.isArray(data.label.en)) {
                title = data.label.en[0];
            } 
            else if (Array.isArray(data.label)) {
                title = data.label[0];
            }
            else if (typeof data.label === 'object') {
                // This handles IIIF 3.0 language map format
                const firstKey = Object.keys(data.label)[0];
                if (firstKey && Array.isArray(data.label[firstKey])) {
                    title = data.label[firstKey][0];
                }
            } 
        }

        // Extract thumbnail URL
        let thumbnail = null;
        if (data.thumbnail) {
            if (typeof data.thumbnail === 'string') {
                thumbnail = data.thumbnail;
            } 
            else if (Array.isArray(data.thumbnail)) {
                thumbnail = data.thumbnail[0].id || data.thumbnail[0];
            } 
            else if (data.thumbnail.id) {
                thumbnail = data.thumbnail.id;
            }
            else if (data.thumbnail['@id']) {
                thumbnail = data.thumbnail['@id'];
            }
        } 

        return {
            title: title,
            itemCount: data.items?.length || 0,
            thumbnail: thumbnail,
            uri: uri
        };
    } catch (error) {
        console.error('Error fetching manifest:', error);
        return {
            title: 'Error Loading Manifest',
            itemCount: 0,
            thumbnail: null,
            uri: uri
        };
    }
}

   

   function createManifestCard(details) {
    const card = document.createElement('div');
    card.className = 'manifest-card';
    
    const thumbnailHtml = details.thumbnail 
        ? `<img src="${details.thumbnail}" alt="${details.title}" onerror="this.onerror=null; this.src='/api/placeholder/400/320';">`
        : `<div class="placeholder-image">No Image Available</div>`;

    card.innerHTML = `
        <div class="manifest-card-image">
            ${thumbnailHtml}
        </div>
        <div class="manifest-card-content">
            <h3 class="manifest-title" title="${details.title}">${details.title}</h3>
            <p class="manifest-items">Items: ${details.itemCount}</p>
            <div class="manifest-actions">
                <a href="${details.uri}" target="_blank" class="manifest-link">View Manifest</a>
                <button class="manifest-load-btn" data-uri="${details.uri}">Load</button>
            </div>
        </div>
    `;

    // Add click handler for the Load button
    const loadBtn = card.querySelector('.manifest-load-btn');
    if (loadBtn) {
        loadBtn.addEventListener('click', (e) => {
            const uri = e.target.dataset.uri;
            const manifestUrlInput = document.getElementById('manifestUrl');
            if (manifestUrlInput) {
                manifestUrlInput.value = uri;
                const loadButton = document.getElementById('loadManifest');
                if (loadButton) {
                    loadButton.click();
                }
            }
        });
    }

    return card;
}

   
   export async function renderManifestCards() {
    const manifestContainer = document.getElementById('stored_manifest_links');
    if (!manifestContainer) {
        console.error("Manifest container not found.");
        return;
    }

    //Clear previous content
    manifestContainer.innerHTML = '';

    const storedManifests = getStoredManifestLinks();

    if (storedManifests.length === 0) {
        manifestContainer.innerHTML = '<p class="no-manifests">No stored manifest links.</p>';
        return;
    }

    const loadingMessage = document.createElement('p');
    loadingMessage.textContent = 'Loading manifests...';
    loadingMessage.className = 'loading-message';
    manifestContainer.appendChild(loadingMessage);

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'manifest-cards-grid';
    
    try {
        // Fetch all manifest details concurrently
        const manifestDetails = await Promise.all(
            storedManifests.map(uri => fetchManifestDetails(uri))
        );

        loadingMessage.remove();

        // Create and append all cards
        manifestDetails.forEach(details => {
            const card = createManifestCard(details);
            cardsContainer.appendChild(card);
        });
        
        manifestContainer.appendChild(cardsContainer);
    } catch (error) {
        console.error('Error rendering manifest cards:', error);
        manifestContainer.innerHTML = '<p class="error-message">Error loading manifests. Please try again.</p>';
    }
}   

    // Toggle the dropdown visibility and render cards

    export function toggleDropdown() {
        try {
            console.log("toggleDropdown called"); // Debug log
            const manifestContainer = document.getElementById('stored_manifest_links');
            const dropdownArrow = document.getElementById('dropdownArrow');
    
            if (!manifestContainer || !dropdownArrow) {
                console.error("Required elements not found");
                return;
            }
        
            if (manifestContainer.style.display === 'none' || manifestContainer.style.display === '') {
                manifestContainer.style.display = 'block';
                dropdownArrow.textContent = '▲';
                renderManifestCards().catch(err => console.error('Error rendering cards:', err));
            } else {
                manifestContainer.style.display = 'none';
                dropdownArrow.textContent = '▼';
            }
        } catch (error) {
            console.error("Error in toggleDropdown:", error);
        }
    }

    export async function loadManifest(url) {
        const manifestMessage = document.getElementById('manifestMessage');
        const loadMessage = document.getElementById('loadMessage');
        const manifestLabelField = document.getElementById('manifestLabelField');
        
        if (!url) {
            manifestMessage.textContent = 'Please enter a URL.';
            manifestMessage.style.color = 'red';
            return;
        }
    
        manifestMessage.textContent = 'Loading...';
        manifestMessage.style.color = 'black';
    
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const loadedManifest = await response.json();
            
            manifestMessage.textContent = 'Manifest loaded successfully!';
            manifestMessage.style.color = 'green';
    
            // Store the manifest link
            await storeManifestLink(url);
            
            // Display manifest metadata
            const manifestLabel = loadedManifest.label?.en?.[0] || 'Untitled';
            const manifestType = loadedManifest.type || 'Unknown Type';
            const manifestItemCount = loadedManifest.items?.length || 0;
    
            loadMessage.innerHTML = "<u>Current Object:</u>";
            manifestLabelField.innerHTML = `Name: ${manifestLabel}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Type: ${manifestType}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Number of Items: ${manifestItemCount}`;
        } catch (error) {
            manifestMessage.textContent = "Failed to load manifest. Please check the URL and try again.";
            manifestMessage.style.color = "red";
            console.error('Error:', error);
        }
    }
    
    export function initializeManifestHandlers() {
        // Handle manifest loading button
        const loadManifestBtn = document.getElementById('loadManifest');
        const manifestUrl = document.getElementById('manifestUrl');
        if (loadManifestBtn) {
            loadManifestBtn.textContent = 'Upload';
            loadManifestBtn.addEventListener('click', () => {
                if (manifestUrl) {
                    loadManifest(manifestUrl.value.trim());
                }
            });
        }
    
        // Handle dropdown toggling
        const dropdownLabel = document.getElementById('dropdownLabel');
        const dropdownArrow = document.getElementById('dropdownArrow');
        if (dropdownLabel) dropdownLabel.addEventListener('click', toggleDropdown);
        if (dropdownArrow) dropdownArrow.addEventListener('click', toggleDropdown);
    } 

window.loadManifest = loadManifest;
window.toggleDropdown = toggleDropdown;
window.renderManifestCards = renderManifestCards;