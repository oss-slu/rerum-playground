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

// ---------- UI Logic ----------

document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generateBtn");
    const output = document.getElementById("annotationOutput");
    const downloadBtn = document.getElementById("downloadBtn");

    let currentAnnotation = null;

    generateBtn.addEventListener("click", async () => {
        const target = document.getElementById("targetUrl").value.trim();
        const body = document.getElementById("annotationBody").value.trim();
        const motivation = document.getElementById("motivation").value;

        // --- Validation ---
        if (!isValidHttpUrl(target)) {
            alert("Please enter a valid http/https URL.");
            return;
        }

        // --- Build Annotation ---
        const annotation = buildAnnotation(target, body, motivation);
        currentAnnotation = annotation;

        output.textContent = JSON.stringify(annotation, null, 2);
        downloadBtn.disabled = false;
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
});
