const MANIFEST_LINKS_KEY ='storedManifestLinks';


 // Save the given manifest link to local storage.
 
export function storeManifestLink(manifestLink) {
    let manifestLinks = getStoredManifestLinks();

    if (!manifestLinks.includes(manifestLink)) {
        manifestLinks.push(manifestLink);
    }

    // save updated links array to local storage
    localStorage.setItem(MANIFEST_LINKS_KEY, JSON.stringify(manifestLinks));
    // refresh the manifest cards display if the container is visable
    const container = document.getElementById("stored_manifest_links");
    if (container && container.style.display !== "none") {
        renderManifestCards();
    }
}

export function getStoredManifestLinks() {
    // get the stored links from local storage, or return an empty array if none are found
    const manifestLinks = localStorage.getItem(MANIFEST_LINKS_KEY);
    return manifestLinks ? JSON.parse(manifestLinks) : [];
}

// Fetch details for a single manifest

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
            } else if (data.label.en && Array.isArray(data.label.en)) {
                title = data.label.en[0];
            } else if (Array.isArray(data.label)) {
                title = data.label[0];
            }
        }

        // Extract thumbnail URL
        let thumbnail = null;
        if (data.thumbnail) {
            if (typeof data.thumbnail === 'string') {
                thumbnail = data.thumbnail;
            } else if (Array.isArray(data.thumbnail)) {
                thumbnail = data.thumbnail[0].id || data.thumbnail[0];
            } else if (data.thumbnail.id) {
                thumbnail = data.thumbnail.id;
            }
        } else if (data.items && data.items[0]?.thumbnail) {
            const firstItem = data.items[0];
            if (Array.isArray(firstItem.thumbnail)) {
                thumbnail = firstItem.thumbnail[0].id || firstItem.thumbnail[0];
            } else if (firstItem.thumbnail.id) {
                thumbnail = firstItem.thumbnail.id;
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

   // create a single manifest card element

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
    card.querySelector('.manifest-load-btn').addEventListener('click', (e) => {
        const uri = e.target.dataset.uri;
        const manifestUrlInput = document.getElementById('manifestUrl');
        if (manifestUrlInput) {
            manifestUrlInput.value = uri;
            // Trigger the load manifest button if it exists
            const loadButton = document.getElementById('loadManifest');
            if (loadButton) {
                loadButton.click();
            }
        }
    });

    return card;
}

   // Render all manifest cards
   
   export async function renderManifestCards() {
    const manifestContainer = document.getElementById('stored_manifest_links');
    const storedManifests = getStoredManifestLinks();

    if (!manifestContainer) {
        console.error("Manifest container not found.");
        return;
    }

    manifestContainer.innerHTML = ''; // Clear previous content

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
        const manifestDetailsPromises = storedManifests.map(uri => fetchManifestDetails(uri));
        const manifestDetails = await Promise.all(manifestDetailsPromises);

        // Remove loading message
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
        const manifestContainer = document.getElementById('stored_manifest_links');
        const dropdownArrow = document.getElementById('dropdownArrow');
    
        if (manifestContainer.style.display === 'none' || manifestContainer.style.display === '') {
            manifestContainer.style.display = 'block';
            dropdownArrow.textContent = '▲';
            renderManifestCards(); // This calls the render function when opening the dropdown
        } else {
            manifestContainer.style.display = 'none';
            dropdownArrow.textContent = '▼';
        }
    }