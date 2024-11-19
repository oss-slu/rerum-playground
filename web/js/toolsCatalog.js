// This is the catalog of tools that will be used in the playground.
// Each tool contains a label, icon, description, and a view (URL) for redirection.

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

// export the tools catalog to be used in config.js
export default ToolsCatalog;