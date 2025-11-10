import { saveManifest } from './manifestStorage.js';

function generateId(base) {
    if (base && base.trim()) return base.trim();
    return (location.origin || '') + location.pathname + '#manifest-' + Date.now();
}

function buildManifest({ id, label, description, canvasImage, canvasLabel }) {
    const manifest = {
        '@context': 'http://iiif.io/api/presentation/3/context.json',
        id: id,
        type: 'Manifest',
        label: { en: [label || 'Untitled Manifest'] },
    };

    if (description) manifest.description = { en: [description] };

    // optionally add one canvas if provided
    if (canvasImage && canvasImage.trim()) {
        const canvasId = id + '/canvas/1';
        const annotationId = canvasId + '/annotation/1';

        const canvas = {
            id: canvasId,
            type: 'Canvas',
            label: { en: [canvasLabel || 'Page 1'] },
            width: 1000,
            height: 1000,
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
                                format: 'image/jpeg'
                            },
                            target: canvasId
                        }
                    ]
                }
            ]
        };

        manifest.items = [canvas];
    } else {
        manifest.items = [];
    }

    return manifest;
}

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

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('manifestForm');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const saveBtn = document.getElementById('saveBtn');
    const output = document.getElementById('manifestOutput');
    const saveMessage = document.getElementById('saveMessage');

    let currentManifest = null;

    generateBtn.addEventListener('click', (e) => {
        const formData = new FormData(form);
        const rawId = formData.get('manifestId');
        const id = generateId(rawId);
        const label = formData.get('manifestLabel') || 'Untitled Manifest';
        const description = formData.get('manifestDesc');
        const canvasImage = formData.get('canvasImage');
        const canvasLabel = formData.get('canvasLabel');

        const manifest = buildManifest({ id, label, description, canvasImage, canvasLabel });
        currentManifest = manifest;

        output.textContent = JSON.stringify(manifest, null, 2);
        downloadBtn.disabled = false;
        saveBtn.disabled = false;
        saveMessage.textContent = '';
    });

    downloadBtn.addEventListener('click', () => {
        if (!currentManifest) return;
        const filename = (currentManifest.label && currentManifest.label.en && currentManifest.label.en[0]) ? currentManifest.label.en[0].replace(/[^a-z0-9\-]/gi, '_') + '.json' : 'manifest.json';
        downloadData(filename, JSON.stringify(currentManifest, null, 2));
    });

    saveBtn.addEventListener('click', () => {
        if (!currentManifest) return;
        // use saveManifest exported from manifestStorage.js which registers the data URL link
        const link = saveManifest(currentManifest);
        saveMessage.textContent = 'Manifest saved to playground and available in Stored Manifests.';
        // optionally open the manifest in a new tab
        // window.open(link, '_blank');
    });
});
