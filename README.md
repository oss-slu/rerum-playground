# Rerum Playground
This is a web space that uses the RERUM installation of the Research Computing Group at Saint Louis University to explore the possibilities of interoperable tools and standards. By using the Tiny Things sandbox, users can immediately create reusable JSON-LD objects that conform to IIIF and Web Annotation standards and find new ways to interact with them.

**RERUM Playground** is a web-based toolset enabling users to work with IIIF manifests and JSON-LD objects. Users can bring their own manifest or create one within the playground, then use the listed tools to visualize, edit, and redirect the manifest to other compatible applications.

## Overview

This project allows users to create, interact with, and manage IIIF-compliant JSON-LD objects, with an intuitive interface.

### Key Features
- **Manifest Handling**: Import or create IIIF manifests.
- **Tool Integration**: Choose tools to interact with manifests, redirecting to compatible applications.
- **Local Storage**: Manifests persist locally for easy access across sessions.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/oss-slu/rerum-playground.git
   ```
2. Open the project in your preferred code editor.
3. Use the Live Server extension to launch the app:
   - Right-click on `index.html` and select "Open with Live Server."

## Usage

- **Create or Import a Manifest**: Start with your own manifest or use the creation tool.
- **Explore Tools**: Select from available tools to visualize or enhance your manifest, with redirection support.

## Project Structure

- **`web/`**: Contains frontend files, including HTML, CSS, and JavaScript.
- **`.github/`**: GitHub-specific configuration files for CI workflows.
- **`README.md`**: Setup and project overview.

## Sandbox Implementation

The Sandbox provides an interactive environment for experimenting with CRUD operations against the RERUM API and for testing JSON payloads and UI interactions before integrating with other tools.

Purpose:
- Allows users to create, read, update, overwrite, delete, and view JSON objects via a simple UI.
- Serves as a playground for developers to test app-level behaviors and example workflows without affecting production data.

Main files:
- `/web/js/sandbox.js` — Contains the sandbox UI logic, including `showSection(id)` to switch visible sandbox panels and placeholder action handlers bound to `.action-btn` elements.
- `/web/sandbox.html` — The sandbox HTML page that loads the sandbox UI and includes buttons and sections for Create, Read, Update, Overwrite, Delete, and View workflows.

Documentation:
- A full reference for the sandbox implementation is available in the project's Docusaurus docs: `docs/docs/sandbox.md` (renders at the docs site as the Sandbox reference page).

### Usage & setup

You can access and test the Sandbox in two quick ways depending on your needs:

- Open the standalone page (fast, no install):

   1. Use the live-server extension to open sandbox by right-clicking `web/sandbox.html` and choose "Open with Live Server" (recommended).
   2. The page will open in your browser and the client-side sandbox UI will be available immediately. The sandbox uses client-side placeholders for actions; no server/backend is required to try the UI.

- Run the docs site locally (if you want the Docusaurus docs and integrated site):

   1. Ensure Node.js is >= 18: `node -v` (Docusaurus preset in `docs/package.json` requires Node 18+).
   2. From the `docs/` folder, install dependencies:

       ```powershell
       cd docs
       npm install
       ```

   3. Start the Docusaurus dev server:

       ```powershell
       npm run start
       ```

   4. Open the local site URL printed by the dev server (usually http://localhost:3000) and navigate to the "Sandbox" docs page.

   Note: If `docusaurus` is not recognized, use `npx docusaurus start` as a fallback or ensure dependencies installed correctly. See `docs/package.json` for required packages.

### Dependencies & configuration

- Node.js >= 18 (only required to run the Docusaurus docs site).
- VS Code Live Server extension (recommended) for quickly opening `web/sandbox.html`.
- No backend is required to use the placeholder sandbox UI; real CRUD operations would require a reachable RERUM API endpoint and appropriate credentials.

### For contributors

- The Sandbox is intended as an experimentation and testing area for the RERUM Playground. Contributions are welcome — please open issues or pull requests to improve the UI, add real API integrations, or expand the documentation.
- Documentation changes should be made under the `docs/docs/` folder (for example, `docs/docs/sandbox.md`) so the Docusaurus site can render updates.

### Docs link

View the project's documentation (local Docusaurus site) in `docs/` or the rendered docs when hosted. To quickly find the Sandbox reference in the repo, see: `docs/docs/sandbox.md`.

## Contributing

Contributions are welcome! Check out the `CONTRIBUTING.md` for guidelines.

## License

Licensed under the MIT License. See `LICENSE` for more details.

---
