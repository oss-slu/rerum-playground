function showSection(id) {
  document
    .querySelectorAll(".sandbox-section")
    .forEach((sec) => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// Exposed globally for sandbox.html onclick attributes
window.showSection = showSection;

// Event handlers
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".action-btn:not(#search-run-btn):not(#search-clear-btn)").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.textContent.trim();
      alert(`${action} action clicked (placeholder).`);
    });
  });
});
