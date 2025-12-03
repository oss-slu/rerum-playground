# Modernizing the RERUM Playground Architecture  
### A Technical Refactor for Sustainable Open Source Development

**Author:** Devayani Chakravarthi Konakalla  
**Project:** RERUM Playground   
**Published On:** December 2024

## Introduction

The RERUM Playground is a web-based environment built to demonstrate the capabilities of the RERUM API and its ecosystem tools. As the project has grown, new interfaces, metadata tools, and annotation utilities have been added. With this growth, the codebase became harder to navigate and maintain for both SLU student developers and external contributors.

During Sprint 5, I led a core architectural refactor to reorganize the Playground into a clean, layered, and contributor-friendly structure. This blog documents the refactor design, the engineering principles behind it, and how the updated architecture now supports long-term sustainability and onboarding.

# Refactor Objectives

| Goal | Implementation |
|------|---------------|
| Improve maintainability | Folder restructuring & component isolation |
| Separate responsibilities clearly | Services ≠ Features ≠ UI |
| Reduce repeated fetch logic | Centralized service layer |
| Enable future testing | Smaller modules and isolated logic |
| Improve contributor onboarding | Cleaner directory structure & documentation |
| Simplify adding new tools | Standardized architecture pattern |


# Problems Before Refactor

###  Architecture Issues Found

- `sandbox.js`, `tools.js`, and `playground.js` contained multiple responsibilities:
  - DOM handling
  - API calls
  - Interface orchestration
- Fetch logic duplicated across files
- Hard to understand how tools were rendered or registered
- No consistent pattern for contributors to add new tools
- Difficult to test or mock RERUM API calls

 **Core Issue: Lack of Separation of Concerns**  
Logic, UI, utilities, and API operations were not isolated.

# Core Refactor Principles

###  Single Responsibility
Each module should do only ONE thing.

###  Separation of Concerns
Clear boundary between:
- Fetch/API services
- UI rendering components
- Tool orchestration features
- Utility helpers

###  Developer-friendly Architecture
Future contributors should know immediately:
 “Where do I write my UI? Where do I call RERUM? How do I register a tool?”

###  Sustainability
Architecture must support long-term growth without rewriting core files.


# Before vs. After Structure

##  Before

/web/js/
│ playground.js
│ tools.js
│ sandbox.js
│ utilities.js
│ json-utils.js
│ toolsCatalog.js
- API calls scattered everywhere  
- UI and network logic mixed together  
- No reusable service layer  
- Difficult to onboard contributors

##  After (Layered Design)

/web/js/
│
├─ services/
│ └─ objectService.js
│
├─ utils/
│ └─ generalUtils.js
│
├─ components/
│ ├─ sandboxUI.js
│ └─ toolsUI.js
│
├─ features/
│ ├─ tools-feature.js
│ ├─ sandbox-feature.js
│ └─ playground-feature.js
│
├─ catalog/
│ └─ toolsCatalog.js
│
├─ manifest/
│ └─ manifestStorage.js
│
└─ config.js

✔ Centralized service logic  
✔ UI code separate  
✔ Feature modules orchestrate functionality  
✔ Modular and scalable  


# Key Technical Changes

## 1. Centralized API Layer
`services/objectService.js` now contains *all* fetch-based RERUM API calls:

- `create`
- `update`
- `overwrite`
- `deleteObject`
- `query`
- `resolveJSON`
- `resolveString`

**Reason:**  
No duplicated fetch logic anywhere in the codebase.

## 2. Shared Utility Library
`utils/generalUtils.js` stores reusable helpers:
- Logging
- Thumbnail generation
- Event broadcasting

**Benefit:** Eliminates redundant helper functions.


## 3. UI Extracted into Components
For example:
- `components/sandboxUI.js`
- `components/toolsUI.js`

UI files now:
- render tool cards
- handle manifest dropdowns
- manage DOM events

## 4. Tool Logic Moved to Feature Modules

`features/tools-feature.js` is the orchestrator responsible for:
- loading tool catalog
- managing recently used tools
- initializing UI rendering
- handling tool click events

This follows:
 **Load Feature → Render UI → Call Services**


# Architecture Diagram

+------------------------+
| HTML Pages |
| index.html, tools.html |
+-----------+------------+
|
v
+------------------------+
| Feature Layer |
| sandbox-feature.js |
| tools-feature.js |
+-----------+------------+
|
v
+------------------------+
| UI Components |
| sandboxUI.js |
| toolsUI.js |
+-----------+------------+
|
v
+------------------------+
| Services Layer |
| objectService.js |
| manifestStorage.js |
+-----------+------------+
|
v
+------------------------+
| Utilities & Helpers |
| generalUtils.js |
+------------------------+

# Outcomes of the Refactor

###  Clean system boundaries  
UI, feature logic, and services no longer overlap.

###  Clarity for contributors  
Anyone can locate:
- tool UI
- feature scripts
- API fetch logic

###  Testability  
Services can be mocked independently.

###  Faster onboarding  
New developer can learn architecture in one glance.

###  Extensibility  
Adding tools no longer requires rewriting core files.

# TUTORIAL

## How to Add a New Tool in the Refactored Playground

Below is the official standard onboarding workflow for future contributors.

#### Step 1: Add tool in tool catalog
{
  label: "IIIF Manifest Generator",
  icon: "./img/manifest.png",
  view: "./iiif-manifest.html",
  description: "Generate simple IIIF Manifest Objects"
}

#### Step 2: Create Your UI File
/components/myToolUI.js
export function initMyToolUI() {
  document.getElementById("run")
    .addEventListener("click", () => {
      alert("Tool Triggered");
    });
}

#### Step 3: Add Feature File
/features/myTool-feature.js
import { initMyToolUI } from "../components/myToolUI.js";

window.onload = () => {
  initMyToolUI();
};

#### Step 4: Reference Feature in HTML
<script type="module" src="./js/features/myTool-feature.js"></script>
Step 5: Use RERUM API via Services
import { create } from "../services/objectService.js";

async function storeManifest(obj) {
  const result = await create(obj);
  console.log("Manifest stored:", result);
}

### Evidence of Architectural Work
 - Tools for:
   - manifest generation
   - manifest storage
   - recently used tools
 - Refactor PRs merged into dev_devayani
 - All fetch logic removed from UI
 - UI components rewritten into modular files
 - New IIIF manifest generator added as an independent tool page

### Contributor Impact
##### Maintainers benefit because:
 - code is uniformly structured
 - UI bugs isolated to components
 - API bugs isolated to service layer
##### Incoming developers benefit because:
 - path for new tools is standardized
 - architecture is self-explanatory
##### External contributors benefit because:
 - catalog entries are transparent
 - no need to edit core scripts

### Leadership Reflection
As Tech Lead, I authored the refactor plan, structured implementation via issues, and reviewed PRs using architecture acceptance criteria:
 - UI components must not call fetch()
 - Services must be reusable
 - Tools must register in the catalog
 - Feature modules must initialize UI
 - Utilities cannot contain business logic

This refactor was also guided by governance principles from Birdaro Training, focusing on:
 - clarity
 - documentation
 - contributor health
 - long-term sustainability

The final result is a cleaner codebase that future SLU teams and external developers can confidently build upon.

### Conclusion
This refactor marks a milestone for the RERUM Playground:
 - maintainable architecture
 - predictable structure
 - modular extensibility
 - future-proof onboarding

As the Playground grows with IIIF, annotation tools, and data transformation utilities, this architecture ensures that innovation does not require rewriting foundations.

Instead, it empowers:
 - reuse
 - modularity
 - contributor self-sufficiency

This is the foundation upon which the next generation of RERUM ecosystem tools will be built.

