const RERUM_SANDBOX_CREATE = "https://tinydev.rerum.io/app/create";

import { getStoredManifestLinks } from "./manifestStorage.js";
// ---------- Helpers ----------

// Check if URL is valid
function isValidHttpUrl(url) {
    try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

// ---------- Annotation Builder ----------

function buildAnnotation(target, bodyText, motivation) {
    const annotation = {
        "@context": "http://www.w3.org/ns/anno.jsonld",
        type: "Annotation",
        motivation,
        target
    };

    if (bodyText && bodyText.trim()) {
        annotation.body = {
            type: "TextualBody",
            value: bodyText.trim(),
            format: "text/plain"
        };
    }

    return annotation;
}

async function saveAnnotationToRerum(annotation) {
    const resp = await fetch(RERUM_SANDBOX_CREATE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(annotation)
    });

    if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`RERUM save failed: ${resp.status} ${resp.statusText} ${text}`);
    }

    const raw = await resp.json();  // full RERUM response (with new_obj_state etc.)

    // This is the actual stored object. If new_obj_state exists, use that; otherwise fall back.
    const stored = raw.new_obj_state || raw;

    // Try to determine the URI in a robust way
    const uri =
        stored.id ||
        stored['@id'] ||
        raw['@id'] ||
        resp.headers.get('location') ||
        null;

    // raw = full response, stored = “clean” object you want to show
    return { raw, stored, uri };
}

// ---------- UI Logic ----------

document.addEventListener("DOMContentLoaded", () => {
    const generateBtn   = document.getElementById("generateBtn");
    const output        = document.getElementById("annotationOutput");
    const downloadBtn   = document.getElementById("downloadBtn");
    const saveRerumBtn  = document.getElementById("saveRerumBtn");
    const statusEl      = document.getElementById("rerumStatus");

    let currentAnnotation = null;

    // --- populate recent targets from manifests saved elsewhere ---
    const recentTargetsList = document.getElementById("recentTargets");
    if (recentTargetsList) {
        const manifests = getStoredManifestLinks();
        manifests.forEach(uri => {
            const opt = document.createElement("option");
            opt.value = uri;
            recentTargetsList.appendChild(opt);
        });
    }

    generateBtn.addEventListener("click", () => {
        const target = document.getElementById("targetUrl").value.trim();
        const body = document.getElementById("annotationBody").value.trim();
        const motivation = document.getElementById("motivation").value;

        if (!isValidHttpUrl(target)) {
            alert("Please enter a valid http/https URL.");
            return;
        }

        const annotation = buildAnnotation(target, body, motivation);
        currentAnnotation = annotation;

        output.textContent = JSON.stringify(annotation, null, 2);
        downloadBtn.disabled  = false;
        if (saveRerumBtn) {
            saveRerumBtn.disabled = false;
        }
        if (statusEl) {
            statusEl.textContent = "";
        }
    });

    // --- Download Annotation ---
    downloadBtn.addEventListener("click", () => {
        if (!currentAnnotation) return;

        const blob = new Blob(
            [JSON.stringify(currentAnnotation, null, 2)],
            { type: "application/json;charset=utf-8" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "annotation.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    });

    // --- Save Annotation to RERUM sandbox ---
    if (saveRerumBtn) {
        saveRerumBtn.addEventListener("click", async () => {
            if (!currentAnnotation) return;

            saveRerumBtn.disabled = true;
            if (statusEl) statusEl.textContent = "Saving to RERUM sandbox…";

            try {
                const { raw, stored, uri } = await saveAnnotationToRerum(currentAnnotation);

                // Use the cleaned version for display and download
                currentAnnotation = stored;
                output.textContent = JSON.stringify(stored, null, 2);

                if (statusEl) {
                    if (uri) {
                        statusEl.innerHTML = `Saved to RERUM: <a href="${uri}"
                            target="_blank" rel="noopener noreferrer">${uri}</a>`;
                    } else {
                        statusEl.textContent = "Saved to RERUM (no URI returned).";
                    }
                }
                // (optional) If you also want to treat annotation URIs as "recent links",
                // you could call storeManifestLink(uri) here, or make a parallel storeAnnotationLink().
            } catch (err) {
                console.error(err);
                if (statusEl) {
                    statusEl.textContent = "Error saving to RERUM. See console for details.";
                }
            } finally {
                saveRerumBtn.disabled = false;
            }
        });
    }
});
