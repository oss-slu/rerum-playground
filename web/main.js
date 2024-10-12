/*
 * The global config for the app.
 * There should be no functions or HTML template literals here.
 *
 */

const ToolsCatalog = [
    {
        label: "TinyNode",
        icon: "./images/rerum_logo.png",
        view: "https://tiny.rerum.io/",
        description: "A flexible tool for interacting with objects from RERUM, allowing users to experiment with data."
    },
    {
        label: "Geolocating Web Annotation Tool",
        icon: "./images/rerum_logo.png",
        view: "https://geo.rerum.io/",
        description: "Helps users annotate data with geolocation coordinates by selecting points on a map."
    },
    {
        label: "navPlace Object Tool",
        icon: "./images/rerum_logo.png",
        view: "https://geo.rerum.io/",
        description: "Allows interaction with place-based objects in a spatial context."
    },
    {
        label: "TPEN",
        icon: "./images/T-PEN_logo.png",
        view: "https://t-pen.org/TPEN/",
        description: "Allows users to transcribe manuscripts by aligning text with scanned images for research and accuracy."
    },
    {
        label: "Adno",
        icon: "./images/adno-logo.png",
        view: "https://w.adno.app/",
        description: "A tool for viewing and editing IIIF and static images within archives and heritage collections."
    },
    {
        label: "Universal Viewer",
        icon: "./images/uv-logo.png",
        view: "https://universalviewer.io/",
        description: "A viewer for web objects, allowing users to share their media with the world."
    }
];

const PLAYGROUND = {
    URLS: {
        //TODO Bring in internal TT.  Register as a new application for RERUM dev.
        CREATE: "http://tinydev.rerum.io/app/create",
        UPDATE: "http://tinydev.rerum.io/app/update",
        PATCH: "http://tinydev.rerum.io/app/patch",
        OVERWRITE: "http://tinydev.rerum.io/app/overwrite",
        QUERY: "http://tinydev.rerum.io/app/query",
        SINCE: "http://devstore.rerum.io/v1/since",
        HISTORY: "http://devstore.rerum.io/v1/history"
    },
    EVENTS: {
        CREATED: "created",
        UPDATED: "updated",
        LOADED: "completely_loaded",
        NEW_VIEW: "view_called",
        VIEW_RENDERED: "view_loaded",
        CLICKED: "clicked"
    },
    APPAGENT: "", //TODO register a new app with RERUM.
    /**
     * 0: OFF
     * 6: TRACE
     * 5: DEBUG
     * 4: INFO
     * 3: WARNING
     * 2: ERROR
     * 1: FATAL
     */
    LOGLEVEL: 3,
    VERSION: "0.0.1",
    TOOLS: {
        id: "tool_set",
        catalog: ToolsCatalog
    },

    INTERFACES: {
        id: "interface_set",
        catalog: []
    },
    TECHNOLOGIES: {
        id: "technology_set",
        catalog: []
    }
}


const logger = {
    fatal(msg) {
        if (PLAYGROUND.LOGLEVEL > 0) console.error(`%c☠ ${msg}`, `color:crimson;font-weight:bold;font-size:2rem;`)
    },
    error(msg) {
        if (PLAYGROUND.LOGLEVEL > 1) console.error(`💣 ${msg}`)
    },
    warn(msg) {
        if (PLAYGROUND.LOGLEVEL > 2) console.warn(`⚠ ${msg}`)
    },
    info(msg) {
        if (PLAYGROUND.LOGLEVEL > 3) console.info(`ℹ %c${msg}`, `color:#061615;background:#3acabb;`)
    },
    debug(msg) {
        if (PLAYGROUND.LOGLEVEL > 4) console.debug(`🐞 ${msg}`)
    },
    trace(msg) {
        if (PLAYGROUND.LOGLEVEL > 5) console.trace(msg)
    }
}

/**
 * Logs any errors
 * @param {HTTPResponse} response from `fetch()`
 * @returns Promise(JSON) || Error
 */
const handleHTTPError = (response, getAs = "json") => {
    if (response.ok) return response[getAs]();
    const errorMessages = {
        400: "Bad Request",
        401: "Request was unauthorized",
        403: "Forbidden to make request",
        404: "Not found",
        500: "Internal server error",
        503: "Server down time",
    };
    logger.warn(errorMessages[response.status] ?? `Unhandled HTTP Error ${response.status}`);
    throw Error("HTTP Error: " + response.statusText);
}

const API = {
    create: async (obj) => {
        return fetch(PLAYGROUND.URLS.CREATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
            .then(handleHTTPError)
            .catch(err => { return err });
    },
    update: async (obj) => {
        return fetch(PLAYGROUND.URLS.UPDATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
            .then(handleHTTPError)
            .catch(err => { return err });
    },
    overwrite: async (obj) => {
        return fetch(PLAYGROUND.URLS.OVERWRITE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
            .then(handleHTTPError)
            .catch(err => { return err });
    },
    delete: async (uri) => {
        return fetch(PLAYGROUND.URLS.DELETE, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: uri
        })
            .then(handleHTTPError)
            .catch(err => { return err });
    },
    query: async (obj) => {
        return fetch(PLAYGROUND.URLS.QUERY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
            .then(handleHTTPError)
            .catch(err => { return err });
    },
    resolveJSON: async (uri) => {
        return fetch(uri)
            .then(handleHTTPError)
            .catch(err => { return err });
    },
    resolveString: async (uri) => {
        return fetch(uri)
            .then(response => handleHTTPError(response, "text"))
            .catch(err => { return err });
    }
}

const UTILS = {
    handleHTTPError,
    logger,
    API,
    /**
     * Broadcast a message about PLAYGROUND
     */
    broadcast(event = {}, type = "message", element = document, obj = {}) {
        return element.dispatchEvent(new CustomEvent(type, { detail: Object.assign(obj, { target: event.target }), bubbles: true }));
    },

    /**
     * Behavior for when the user picks a tool. They may provide the data to take into that tool.
     * When the user picks a tool/interface/technology, we need to load up the view for the user to interact with.
     * We may want to handle internal views and external views separately.
     * What if the user had done some stuff and would like to take that data to the view?  It may not just be a URI.
     */
    useTool: function (tool, data) {
        return new Promise((res) => {
            // Make this the active tool for the user to interact with.
            document.location.href = tool.view;
        });
    },

    /**
    *  Behavior for when the user picks an interface. They may provide the data to take into that interface.
    */
    useInterface: function (inter, data) {
        return new Promise((res) => {
            // Make this the active interface for the user to interact with.
        });
    },

    /**
    *  Behavior for when the user picks a technology. They may provide the data to take into that technology.
    */
    useTechnology: function (tech, data) {
        return new Promise((res) => {
            // Make this the active technology for the user to interact with.
        });
    },

    /**
    * Generate a thumbnail that represents an entry from the set of tools, interfaces, or technologies.
    *
    * @param {Object} entry - each tool/interface/technology object with properties like label, icon, view, and description
    * @returns {String} HTML structure for the thumbnail
    */
    thumbnailGenerator: (entry) => {
        return `<a class="catalogEntry" href="${entry.view}">
        <figure class="thumb">
            <label>${entry.label}</label>
            <img src="${entry.icon}" />
            <figcaption>${entry.description}</figcaption>
        </figure>
        </a>`;
    },
}

const RECENTLY_USED_KEY = 'recentlyUsedTools';

/**
 * Retrieve recently used tools from local storage.
 */
function getRecentlyUsedTools() {
    const recentTools = localStorage.getItem(RECENTLY_USED_KEY);
    return recentTools ? JSON.parse(recentTools) : [];
}

/**
 * Save recently used tools to local storage.
 */
function saveRecentlyUsedTools(recentTools) {
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recentTools));
}

/**
 * Update recently used tools, move the clicked tool to the top.
 */
function updateRecentlyUsedTools(clickedTool) {
    const recentTools = getRecentlyUsedTools();
    const existingIndex = recentTools.findIndex(tool => tool.label.toLowerCase() === clickedTool.label.toLowerCase());

    if (existingIndex !== -1) {
        recentTools.splice(existingIndex, 1);
    }

    recentTools.unshift(clickedTool);

    const topThreeTools = recentTools.slice(0, 3);
    saveRecentlyUsedTools(topThreeTools);
}

/**
*  Landing behavior for interfaces.  This should populate the set of available interfaces to the DOM.
*/
function initializeInterfaces(config) {
    return new Promise((res) => {
        let setContainer = document.getElementById(config.id)
        Array.from(config.catalog).forEach(inter => {
            setContainer.innerHTML += UTILS.thumbnailGenerator(inter)
        })
        UTILS.broadcast(undefined, PLAYGROUND.EVENTS.LOADED, setContainer, {})
        /**
         * Really each render should be a promise and we should return a Promise.all() here of some kind.
         * That would only work if PlaygroundRender resulted in a Promise where we could return Promise.all(renderPromises).
         */
        setTimeout(res, 200) //A small hack to ensure all the HTML generated by processing the views enters the DOM before this says it has resolved.
    })
}

/**
*  Landing behavior for technologies.  This should populate the technologies to the DOM.
*/
function initializeTechnologies(config) {
    return new Promise((res) => {
        let setContainer = document.getElementById(config.id)
        Array.from(config.catalog).forEach(tech => {
            setContainer.innerHTML += UTILS.thumbnailGenerator(tech)
        })
        UTILS.broadcast(undefined, PLAYGROUND.EVENTS.LOADED, setContainer, {})
        /**
         * Really each render should be a promise and we should return a Promise.all() here of some kind.
         * That would only work if PlaygroundRender resulted in a Promise where we could return Promise.all(renderPromises).
         */
        setTimeout(res, 200) //A small hack to ensure all the HTML generated by processing the views enters the DOM before this says it has resolved.
    })
}

/**
 * Render tools, higlighting recently used ones.
 */
function renderTools() {
    const toolSetContainer = document.getElementById('tool_set');

    if (!toolSetContainer) {
        console.error("Tool set container not found.");
        return;
    }

    toolSetContainer.innerHTML = '';

    const recentTools = getRecentlyUsedTools();

    // Sort tools by their recent usage
    const sortedTools = [...ToolsCatalog].sort((a, b) => {
        const indexA = recentTools.findIndex(tool => tool.label.toLowerCase() === a.label.toLowerCase());
        const indexB = recentTools.findIndex(tool => tool.label.toLowerCase() === b.label.toLowerCase());
        return indexA === -1 ? 1 : indexB === -1 ? -1 : indexA - indexB;
    });

    const toolsWrapper = document.createElement('div');

    sortedTools.forEach((tool, index) => {
        const isRecentlyUsed = index < 3 ? `<span class="recent-badge">Recently used</span>` : '';
        const toolHTML = `
            <a href="${tool.view}" target="_blank" class="catalogEntry">
                <figure class="thumb">
                    ${isRecentlyUsed}
                    <label>${tool.label}</label>
                    <img src="${tool.icon}" alt="${tool.label}" />
                    <figcaption>${tool.description}</figcaption>
                </figure>
            </a>
        `;
        toolsWrapper.innerHTML += toolHTML;
    });

    toolSetContainer.appendChild(toolsWrapper);

    // Add event listeners after elements are created
    const toolLinks = toolSetContainer.querySelectorAll('a.catalogEntry');
    toolLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const toolLabel = this.querySelector('label').innerText;
            handleToolClick(toolLabel);
        });
    });
}

/**
 * Handle tool click event to manage recently used logic and allow default navigation
 */
function handleToolClick(toolLabel) {
    const clickedTool = ToolsCatalog.find(tool => tool.label === toolLabel);
    if (clickedTool) {
        updateRecentlyUsedTools(clickedTool);
        renderTools();
        setTimeout(() => {
            window.open(clickedTool.view, '_blank');
        }, 100);
    } else {
        console.error('Clicked tool not found:', toolLabel);
    }
}

/**
 * Update tool order when a tool is clicked.
 */
window.updateToolOrder = function(toolLabel) {
    const clickedTool = ToolsCatalog.find(tool => tool.label === toolLabel);
    if (clickedTool) {
        updateRecentlyUsedTools(clickedTool);
        renderTools();
    }
}

document.addEventListener('DOMContentLoaded', () => {
/**
*  These are promises so we can control the chaining how we like, if necessary.
*/
    try {
        initializeInterfaces(PLAYGROUND.INTERFACES)
        initializeTechnologies(PLAYGROUND.TECHNOLOGIES)
        renderTools();
    } catch (err) {
        console.error("Error initializing the playground: ", err);
    }
});

window.openCloseMenu = function () {
    var toolBar = document.getElementById("toolBar");
    if (toolBar.style.width === "0px") {
        toolBar.style.width = "250px";
    } else {
        toolBar.style.width = "0";
    }
}




