import { fetchFooter } from '../services/objectService.js';
import { searchAnnotations } from '../services/searchService.js';

function showSection(id) {
  document
    .querySelectorAll(".sandbox-section")
    .forEach((sec) => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

window.showSection = showSection;

async function handleSearch() {
  const query = document.getElementById("search-query").value;
  const searchType = document.getElementById("search-type").value;
  const resultsEl = document.getElementById("search-results");

  resultsEl.innerHTML = '<p class="search-status">Searching…</p>';

  const { results, error } = await searchAnnotations(query, searchType);

  if (error) {
    resultsEl.innerHTML = `<p class="search-status search-status--error">${error}</p>`;
    return;
  }

  if (!results.length) {
    resultsEl.innerHTML = '<p class="search-status">No results found.</p>';
    return;
  }

  resultsEl.innerHTML = results.map((r) => `
    <div class="search-result-item">
      <div class="search-result-id">
        <strong>ID:</strong>
        ${r.annotationId ? `<a href="${r.annotationId}" target="_blank" rel="noopener">${r.annotationId}</a>` : '—'}
      </div>
      <div class="search-result-body">
        <strong>Body:</strong> ${r.snippet || '—'}
      </div>
      <div class="search-result-target">
        <strong>Target:</strong>
        ${r.targetUri ? `<a href="${r.targetUri}" target="_blank" rel="noopener">${r.targetUri}</a>` : '—'}
      </div>
      <div class="search-result-score">
        <strong>Score:</strong> ${r.score !== null ? r.score : '—'}
      </div>
    </div>
  `).join('');
}

// Placeholder action handlers
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.textContent.trim();
      console.log(`${action} action triggered (placeholder).`);
      alert(`${action} action clicked (placeholder).`);
    });
  });

  document.getElementById("search-run-btn")?.addEventListener("click", handleSearch);
});