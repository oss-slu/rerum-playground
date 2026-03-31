import { searchAnnotations } from '../services/searchService.js';

const BODY_TRUNCATE_LENGTH = 250;

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

/**
 * Wrap occurrences of query terms in <mark> elements for highlighting.
 * Returns a DocumentFragment with text nodes and <mark> elements.
 * DOM-based (no innerHTML) — safe against XSS.
 */
function highlightTerms(text, query, searchType) {
  if (!query || !text) {
    return document.createTextNode(text || "");
  }

  let pattern;
  if (searchType === "phrase") {
    pattern = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  } else {
    const terms = query.split(/\s+/).filter(Boolean)
      .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!terms.length) return document.createTextNode(text);
    pattern = terms.join("|");
  }

  const regex = new RegExp(`(${pattern})`, "gi");
  const frag = document.createDocumentFragment();
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    const mark = document.createElement("mark");
    mark.textContent = match[0];
    frag.appendChild(mark);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  return frag;
}

async function handleSearch() {
  const query = document.getElementById("search-query").value.trim();
  const searchType = document.getElementById("search-type").value;
  const resultsEl = document.getElementById("search-results");
  const searchBtn = document.getElementById("search-run-btn");

  if (!query) {
    const msg = document.createElement("p");
    msg.className = "search-status search-status--error";
    msg.setAttribute("role", "alert");
    msg.textContent = "Please enter a search query.";
    resultsEl.replaceChildren(msg);
    return;
  }

  searchBtn.disabled = true;

  // Loading spinner
  const spinnerWrapper = document.createElement("div");
  spinnerWrapper.className = "search-loading";
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinner.setAttribute("role", "status");
  spinner.setAttribute("aria-label", "Searching");
  spinnerWrapper.appendChild(spinner);
  const loadingText = document.createElement("p");
  loadingText.className = "search-status";
  loadingText.textContent = "Searching\u2026";
  spinnerWrapper.appendChild(loadingText);
  resultsEl.replaceChildren(spinnerWrapper);

  try {
    const { results, error } = await searchAnnotations(query, searchType);

    if (error) {
      const errMsg = document.createElement("p");
      errMsg.className = "search-status search-status--error";
      errMsg.setAttribute("role", "alert");
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

    // Result count
    const countEl = document.createElement("p");
    countEl.className = "search-result-count";
    countEl.setAttribute("role", "status");
    countEl.textContent = `${results.length} result${results.length !== 1 ? "s" : ""} found.`;

    const fragment = document.createDocumentFragment();
    for (const r of results) {
      const item = document.createElement("div");
      item.className = "search-result-item";

      // ID
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

      // Body with highlighting and truncation
      const bodyDiv = document.createElement("div");
      bodyDiv.className = "search-result-body";
      const bodyStrong = document.createElement("strong");
      bodyStrong.textContent = "Body:";
      bodyDiv.appendChild(bodyStrong);
      bodyDiv.appendChild(document.createTextNode(" "));

      const fullText = r.snippet || "\u2014";
      const needsTruncation = fullText.length > BODY_TRUNCATE_LENGTH;
      const truncatedText = needsTruncation
        ? fullText.slice(0, BODY_TRUNCATE_LENGTH) + "\u2026"
        : fullText;

      const bodySpan = document.createElement("span");
      bodySpan.className = "search-body-text";
      bodySpan.appendChild(highlightTerms(truncatedText, query, searchType));
      bodyDiv.appendChild(bodySpan);

      if (needsTruncation) {
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "search-read-more-btn";
        toggleBtn.textContent = "Read More";
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.addEventListener("click", () => {
          const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
          bodySpan.textContent = "";
          if (isExpanded) {
            bodySpan.appendChild(highlightTerms(truncatedText, query, searchType));
            toggleBtn.textContent = "Read More";
            toggleBtn.setAttribute("aria-expanded", "false");
          } else {
            bodySpan.appendChild(highlightTerms(fullText, query, searchType));
            toggleBtn.textContent = "Read Less";
            toggleBtn.setAttribute("aria-expanded", "true");
          }
        });
        bodyDiv.appendChild(toggleBtn);
      }

      // Target
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

      // Score
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
    resultsEl.replaceChildren(countEl, fragment);
  } catch (err) {
    const errMsg = document.createElement("p");
    errMsg.className = "search-status search-status--error";
    errMsg.setAttribute("role", "alert");
    errMsg.textContent = "An unexpected error occurred. Please try again.";
    resultsEl.replaceChildren(errMsg);
    console.error(err);
  } finally {
    searchBtn.disabled = false;
  }
}

// Event handlers
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".action-btn:not(#search-run-btn):not(#search-clear-btn)").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.textContent.trim();
      console.log(`${action} action triggered (placeholder).`);
      alert(`${action} action clicked (placeholder).`);
    });
  });

  document.getElementById("search-run-btn")?.addEventListener("click", handleSearch);

  // Enter key triggers search
  document.getElementById("search-query")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  });

  // Clear button resets search
  document.getElementById("search-clear-btn")?.addEventListener("click", () => {
    document.getElementById("search-query").value = "";
    document.getElementById("search-type").value = "text";
    document.getElementById("search-results").replaceChildren();
    document.getElementById("search-query").focus();
  });
});
