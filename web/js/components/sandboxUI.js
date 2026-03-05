import { searchAnnotations } from '../services/searchService.js';

function showSection(id) {
  document
    .querySelectorAll(".sandbox-section")
    .forEach((sec) => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

window.showSection = showSection;

function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

async function handleSearch() {
  const query = document.getElementById("search-query").value.trim();
  const searchType = document.getElementById("search-type").value;
  const resultsEl = document.getElementById("search-results");
  const searchBtn = document.getElementById("search-run-btn");

  if (!query) {
    const msg = document.createElement("p");
    msg.className = "search-status search-status--error";
    msg.textContent = "Please enter a search query.";
    resultsEl.replaceChildren(msg);
    return;
  }

  searchBtn.disabled = true;
  const status = document.createElement("p");
  status.className = "search-status";
  status.textContent = "Searching\u2026";
  resultsEl.replaceChildren(status);

  try {
    const { results, error } = await searchAnnotations(query, searchType);

    if (error) {
      const errMsg = document.createElement("p");
      errMsg.className = "search-status search-status--error";
      errMsg.textContent = error;
      resultsEl.replaceChildren(errMsg);
      return;
    }

    if (!results.length) {
      const noResults = document.createElement("p");
      noResults.className = "search-status";
      noResults.textContent = "No results found.";
      resultsEl.replaceChildren(noResults);
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const r of results) {
      const item = document.createElement("div");
      item.className = "search-result-item";

      const idDiv = document.createElement("div");
      idDiv.className = "search-result-id";
      const idStrong = document.createElement("strong");
      idStrong.textContent = "ID:";
      idDiv.appendChild(idStrong);
      idDiv.appendChild(document.createTextNode(" "));
      if (r.annotationId && isValidUrl(r.annotationId)) {
        const a = document.createElement("a");
        a.href = r.annotationId;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = r.annotationId;
        idDiv.appendChild(a);
      } else {
        idDiv.appendChild(document.createTextNode(r.annotationId || "\u2014"));
      }

      const bodyDiv = document.createElement("div");
      bodyDiv.className = "search-result-body";
      const bodyStrong = document.createElement("strong");
      bodyStrong.textContent = "Body:";
      bodyDiv.appendChild(bodyStrong);
      bodyDiv.appendChild(document.createTextNode(" " + (r.snippet || "\u2014")));

      const targetDiv = document.createElement("div");
      targetDiv.className = "search-result-target";
      const targetStrong = document.createElement("strong");
      targetStrong.textContent = "Target:";
      targetDiv.appendChild(targetStrong);
      targetDiv.appendChild(document.createTextNode(" "));
      if (r.targetUri && isValidUrl(r.targetUri)) {
        const a = document.createElement("a");
        a.href = r.targetUri;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = r.targetUri;
        targetDiv.appendChild(a);
      } else {
        targetDiv.appendChild(document.createTextNode(r.targetUri || "\u2014"));
      }

      const scoreDiv = document.createElement("div");
      scoreDiv.className = "search-result-score";
      const scoreStrong = document.createElement("strong");
      scoreStrong.textContent = "Score:";
      scoreDiv.appendChild(scoreStrong);
      scoreDiv.appendChild(document.createTextNode(" " + (r.score !== null ? r.score : "\u2014")));

      item.appendChild(idDiv);
      item.appendChild(bodyDiv);
      item.appendChild(targetDiv);
      item.appendChild(scoreDiv);
      fragment.appendChild(item);
    }
    resultsEl.replaceChildren(fragment);
  } catch (err) {
    const errMsg = document.createElement("p");
    errMsg.className = "search-status search-status--error";
    errMsg.textContent = "An unexpected error occurred. Please try again.";
    resultsEl.replaceChildren(errMsg);
    console.error(err);
  } finally {
    searchBtn.disabled = false;
  }
}

// Placeholder action handlers
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".action-btn:not(#search-run-btn)").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.textContent.trim();
      console.log(`${action} action triggered (placeholder).`);
      alert(`${action} action clicked (placeholder).`);
    });
  });

  document.getElementById("search-run-btn")?.addEventListener("click", handleSearch);
});
