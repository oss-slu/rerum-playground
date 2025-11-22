import { saveManifest } from './manifestStorage.js';

/**
 * Construct an ID if none is provided
 */
function generateId(base) {
    if (base && base.trim()) return base.trim();
    return (location.origin || '') + location.pathname + '#manifest-' + Date.now();
}

/**
 * Try parsing the file extension from the URL as a fallback format guess
 */
function inferFormatFromUrl(url) {
    if (!url) return null;
    const ext = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'tif', 'tiff', 'gif'].includes(ext)) {
        return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    }
    return null;
}

/**
 * If the URL is a IIIF Image API base, fetch its info.json for real dimensions + format support
 * Returns null if not IIIF or request fails.
 */
async function fetchIIIFInfo(imageUrl) {
    if (!imageUrl) return null;
    // Basic heuristic: IIIF URLs contain `/full/` or `/info.json`
    if (!imageUrl.includes('/full/') && !imageUrl.includes('/info.json')) return null;

    const base = imageUrl.split('/full')[0];
    const infoUrl = base + '/info.json';

    try {
        const res = await fetch(infoUrl);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.warn('IIIF info.json fetch failed:', e);
        return null;
    }
}

/**
 * Build the manifest using dynamic image metadata if possible
 */
async function buildManifest({ id, label, description, canvasImage, canvasLabel }) {
    const manifest = {
        '@context': 'http://iiif.io/api/presentation/3/context.json',
        id,
        type: 'Manifest',
        label: { en: [label || 'Untitled Manifest'] },
    };

    if (description) manifest.description = { en: [description] };

    if (!canvasImage || !canvasImage.trim()) {
        manifest.items = [];
        return manifest;
    }

    // Attempt metadata fetch
    const info = await fetchIIIFInfo(canvasImage);

    // Resolve dimensions
    const width = info?.width || 1000;
    const height = info?.height || 1000;

    // Resolve image format
    const inferredFormat = inferFormatFromUrl(canvasImage);
    const format = info?.profile?.formats?.[0] || inferredFormat || 'image/jpeg';

    const canvasId = id + '/canvas/1';
    const annotationId = canvasId + '/annotation/1';

    const canvas = {
        id: canvasId,
        type: 'Canvas',
        label: { en: [canvasLabel || 'Page 1'] },
        width,
        height,
        items: [
            {
                id: canvasId + '/page',
                type: 'AnnotationPage',
                items: [
                    {
                        id: annotationId,
                        type: 'Annotation',
                        motivation: 'painting',
                        body: {
                            id: canvasImage,
                            type: 'Image',
                            format
                        },
                        target: canvasId
                    }
                ]
            }
        ]
    };

    manifest.items = [canvas];
    return manifest;
}

/**
 * Download helper
 */
function downloadData(filename, data) {
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

/**
 * UI binding logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('manifestForm');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const saveBtn = document.getElementById('saveBtn');
    const output = document.getElementById('manifestOutput');
    const saveMessage = document.getElementById('saveMessage');

    let currentManifest = null;

    generateBtn.addEventListener('click', async () => {
        const formData = new FormData(form);
        const rawId = formData.get('manifestId');
        const id = generateId(rawId);
        const label = formData.get('manifestLabel') || 'Untitled Manifest';
        const description = formData.get('manifestDesc');
        const canvasImage = formData.get('canvasImage');
        const canvasLabel = formData.get('canvasLabel');

        const manifest = await buildManifest({ id, label, description, canvasImage, canvasLabel });
        currentManifest = manifest;

        output.textContent = JSON.stringify(manifest, null, 2);
        downloadBtn.disabled = false;
        saveBtn.disabled = false;
        saveMessage.textContent = '';
    });

    downloadBtn.addEventListener('click', () => {
        if (!currentManifest) return;
        const filename = (currentManifest.label?.en?.[0] || 'manifest').replace(/[^a-z0-9\-]/gi, '_') + '.json';
        downloadData(filename, JSON.stringify(currentManifest, null, 2));
    });

    saveBtn.addEventListener('click', () => {
        if (!currentManifest) return;
        const link = saveManifest(currentManifest);
        saveMessage.textContent = 'Manifest saved to playground and available in Stored Manifests.';
        // window.open(link, '_blank'); // optional
    });
});