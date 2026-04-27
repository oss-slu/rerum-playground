import { create } from '../services/objectService.js';

let currentAnnotation = null;

function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function setStatus(message, type = 'info') {
  const el = document.getElementById('anno-status');
  el.textContent = message;
  el.className = `anno-status--${type}`;
}

function clearStatus() {
  const el = document.getElementById('anno-status');
  el.textContent = '';
  el.className = '';
}

export function buildAnnotation(target, bodyText, label, motivation) {
  const annotation = {
    '@context': 'https://www.w3.org/ns/anno.jsonld',
    'type': 'Annotation',
    'motivation': motivation || 'commenting',
    'body': {
      'type': 'TextualBody',
      'value': bodyText,
      'format': 'text/plain',
      'language': 'en'
    },
    'target': target
  };
  if (label) {
    annotation.label = label;
  }
  return annotation;
}

function handleGenerate() {
  const target = document.getElementById('anno-target').value.trim();
  const bodyText = document.getElementById('anno-body').value.trim();
  const label = document.getElementById('anno-label').value.trim();
  const motivation = document.getElementById('anno-motivation').value;

  if (!target) {
    setStatus('Please enter a Target URI.', 'error');
    document.getElementById('anno-target').focus();
    return;
  }
  if (!isValidUrl(target)) {
    setStatus('Target URI must be a valid URL (e.g. https://example.com/page).', 'error');
    document.getElementById('anno-target').focus();
    return;
  }
  if (!bodyText) {
    setStatus('Please enter body text.', 'error');
    document.getElementById('anno-body').focus();
    return;
  }

  currentAnnotation = buildAnnotation(target, bodyText, label, motivation);

  document.getElementById('anno-json-output').textContent =
    JSON.stringify(currentAnnotation, null, 2);

  const preview = document.getElementById('anno-preview');
  preview.classList.remove('hidden');
  preview.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('save-btn').disabled = false;
  clearStatus();
}

async function handleSave() {
  if (!currentAnnotation) return;

  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;

  const loadingEl = document.createElement('div');
  loadingEl.className = 'anno-loading';
  loadingEl.innerHTML = '<div class="anno-spinner" aria-hidden="true"></div><span>Saving to RERUM…</span>';
  document.getElementById('anno-status').replaceChildren(loadingEl);

  try {
    const result = await create(currentAnnotation);
    if (result instanceof Error) {
      throw result;
    }
    const uri = result?.['@id'] ?? result?.id ?? JSON.stringify(result);
    setStatus(`Saved! RERUM URI: ${uri}`, 'success');
  } catch (err) {
    setStatus(`Save failed: ${err.message}`, 'error');
    saveBtn.disabled = false;
  }
}

function handleDownload() {
  if (!currentAnnotation) return;
  const json = JSON.stringify(currentAnnotation, null, 2);
  const blob = new Blob([json], { type: 'application/ld+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'annotation.jsonld';
  a.click();
  URL.revokeObjectURL(url);
}

function handleReset() {
  document.getElementById('anno-target').value = '';
  document.getElementById('anno-body').value = '';
  document.getElementById('anno-label').value = '';
  document.getElementById('anno-motivation').value = 'commenting';
  document.getElementById('anno-preview').classList.add('hidden');
  document.getElementById('anno-json-output').textContent = '';
  currentAnnotation = null;
  clearStatus();
  document.getElementById('anno-target').focus();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generate-btn').addEventListener('click', handleGenerate);
  document.getElementById('save-btn').addEventListener('click', handleSave);
  document.getElementById('download-btn').addEventListener('click', handleDownload);
  document.getElementById('reset-btn').addEventListener('click', handleReset);
});
