function showSection(id) {
  document
    .querySelectorAll(".sandbox-section")
    .forEach((sec) => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

window.showSection = showSection;

// Placeholder action handlers
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      alert(`${btn.textContent} action clicked (placeholder).`);
    });
  });
});