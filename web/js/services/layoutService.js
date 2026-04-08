export function loadMenu() {
    fetch("./menu.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById("menu-placeholder").innerHTML = html;
        })
        .catch(error => console.error("Error loading menu:", error));
}

export function loadFooter() {
    fetch("./footer.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById("footer-placeholder").innerHTML = html;
        })
        .catch(error => console.error("Error loading footer:", error));
}
