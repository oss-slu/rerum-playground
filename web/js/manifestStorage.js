const MANIFEST_LINKS_KEY = 'storedManifestLinks';

/**
 * Save the given manifest link to local storage.
 */
export function storeManifestLink(manifestLink) {
    let manifestLinks = getStoredManifestLinks();

    if (!manifestLinks.includes(manifestLink)) {
        manifestLinks.push(manifestLink);
    }

    // save updated links array to local storage
    localStorage.setItem(MANIFEST_LINKS_KEY, JSON.stringify(manifestLinks));
}

export function getStoredManifestLinks() {
    // get the stored links from local storage, or return an empty array if none are found
    const manifestLinks = localStorage.getItem(MANIFEST_LINKS_KEY);
    return manifestLinks ? JSON.parse(manifestLinks) : [];
}

/**
 * Prepare manifest for RERUM - ensure it has the required structure
 */
function prepareManifestForRerum(manifest) {
    // Create a copy to avoid modifying the original
    const rerumManifest = JSON.parse(JSON.stringify(manifest));
    
    // RERUM v1 expects @context (not context)
    if (!rerumManifest['@context'] && manifest.context) {
        rerumManifest['@context'] = manifest.context;
    }
    
    // Ensure @context exists
    if (!rerumManifest['@context']) {
        rerumManifest['@context'] = 'http://iiif.io/api/presentation/3/context.json';
    }
    
    return rerumManifest;
}

/**
 * Save a manifest to RERUM and return the RERUM URL.
 * This posts to the RERUM API and gets back a permanent URL.
 */
export async function saveManifest(manifest) {
    // Try the public v1 endpoint first (no auth required for some operations)
    const RERUM_API_URL = 'https://store.rerum.io/v1/api/create';
    
    try {
        // Prepare the manifest with required RERUM fields
        const rerumManifest = prepareManifestForRerum(manifest);
        
        console.log('Sending to RERUM:', JSON.stringify(rerumManifest, null, 2));
        
        const response = await fetch(RERUM_API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json'
            },
            body: JSON.stringify(rerumManifest)
        });

        console.log('RERUM response status:', response.status);
        
        // Get the response text first to see what we're dealing with
        const responseText = await response.text();
        console.log('RERUM response body:', responseText);

        if (!response.ok) {
            // Try to parse as JSON for better error message
            let errorMessage = `RERUM API error: ${response.status} ${response.statusText}`;
            try {
                const errorData = JSON.parse(responseText);
                if (errorData.message) {
                    errorMessage += ` - ${errorData.message}`;
                }
            } catch (e) {
                // Not JSON, use text as-is
                if (responseText) {
                    errorMessage += ` - ${responseText}`;
                }
            }
            throw new Error(errorMessage);
        }

        // Parse the successful response
        const result = JSON.parse(responseText);
        console.log('RERUM created object:', result);
        
        // RERUM returns the created object with an @id property
        const rerumUrl = result['@id'] || result.id;
        
        if (!rerumUrl) {
            console.error('RERUM response missing ID:', result);
            throw new Error('RERUM did not return a valid ID. Response: ' + JSON.stringify(result));
        }

        // Store the RERUM link in recently used links
        storeManifestLink(rerumUrl);

        return rerumUrl;

    } catch (error) {
        console.error('Error saving to RERUM:', error);
        
        // If it's a CORS or network error
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Network error. RERUM may be down or blocking requests from this domain.');
        }
        
        // If it's an auth error
        if (error.message.includes('401') || error.message.includes('403')) {
            throw new Error('Authentication required. RERUM requires an access token for this operation.');
        }
        
        throw error;
    }
}

/**
 * Get stored manifest links for display
 */
export function getStoredManifests() {
    return getStoredManifestLinks();
}