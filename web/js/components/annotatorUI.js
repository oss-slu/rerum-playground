import { buildAnnotation, MOTIVATIONS, MINIMAL_ANNOTATION_TEMPLATE } from '../annotationTemplate.js';
import { create } from '../services/objectService.js';
import PLAYGROUND from '../config.js';

const PREVIEW_ID = "annotation-preview";
const STATUS_ID  = "annotator-status";
const SAVE_BTN_ID = "annotator-save-btn";

function getFields() {
    return {
        bodyText:   document.getElementById("annotator-body")?.value ?? "",
        targetUri:  document.getElementById("annotator-target")?.value ?? "",
        motivation: document.getElementById("annotator-motivation")?.value ?? MOTIVATIONS.COMMENTING,
        language:   document.getElementById("annotator-language")?.value ?? "en"
    };
}

function isFormValid({ bodyText, targetUri }) {
    return bodyText.trim().length > 0 && targetUri.trim().length > 0;
}

function updatePreview() {
    const previewEl = document.getElementById(PREVIEW_ID);
    const saveBtn   = document.getElementById(SAVE_BTN_ID);
    const { bodyText, targetUri, motivation, language } = getFields();

    if (!previewEl) return;

    if (!isFormValid({ bodyText, targetUri })) {
        // Show the empty template when required fields are absent
        previewEl.textContent = JSON.stringify(MINIMAL_ANNOTATION_TEMPLATE, null, 2);
        if (saveBtn) saveBtn.disabled = true;
        return;
    }

    try {
        const annotation = buildAnnotation(bodyText, targetUri, motivation, language);
        previewEl.textContent = JSON.stringify(annotation, null, 2);
        if (saveBtn) saveBtn.disabled = false;
    } catch {
        if (saveBtn) saveBtn.disabled = true;
    }
}

function setStatus(message, isError = false) {
    const statusEl = document.getElementById(STATUS_ID);
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = isError ? "annotator-status annotator-status--error" : "annotator-status annotator-status--success";
}

async function handleSave() {
    const saveBtn = document.getElementById(SAVE_BTN_ID);
    const { bodyText, targetUri, motivation, language } = getFields();

    if (!isFormValid({ bodyText, targetUri })) return;

    saveBtn.disabled = true;
    setStatus("Saving to RERUM…");

    try {
        const annotation = buildAnnotation(bodyText, targetUri, motivation, language);
        const saved = await create(annotation);
        const savedId = saved?.["@id"] ?? saved?.id ?? "";

        setStatus(savedId
            ? `Saved. RERUM URI: ${savedId}`
            : "Saved to RERUM."
        );

        document.getElementById(PREVIEW_ID).textContent = JSON.stringify(saved, null, 2);

        document.dispatchEvent(new CustomEvent(PLAYGROUND.EVENTS.CREATED, {
            detail: { annotation: saved },
            bubbles: true
        }));
    } catch (err) {
        setStatus("Save failed: " + (err?.message ?? "Unknown error"), true);
        saveBtn.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const inputs = ["annotator-body", "annotator-target", "annotator-motivation", "annotator-language"];
    inputs.forEach(id => {
        document.getElementById(id)?.addEventListener("input", updatePreview);
    });

    document.getElementById(SAVE_BTN_ID)?.addEventListener("click", handleSave);

    // Initialize preview with the empty template
    updatePreview();
});
