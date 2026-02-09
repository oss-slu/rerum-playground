// Service module to centralize fetch() calls for the app.
// Exports named functions so other modules can call them for unit testing.

import PLAYGROUND from '../config.js';

// Minimal local HTTP error handler that mirrors previous behavior.
const handleHTTPError = (response, getAs = "json") => {
    if (response.ok) return response[getAs]()
    const errorMessages = {
        400: "Bad Request",
        401: "Request was unauthorized",
        403: "Forbidden to make request",
        404: "Not found",
        500: "Internal server error",
        503: "Server down time",
    }
    logger.warn(errorMessages[response.status] ?? `Unhandled HTTP Error ${response.status}`)
    throw Error("HTTP Error: " + response.statusText)
}

/**
 * Fetches footer HTML and returns text content.
 */
export async function fetchFooter() {
  const res = await fetch('footer.html');
  if (!res.ok) {
    throw new Error(`Failed to fetch footer: ${res.status}`);
  }
  return res.text();
}

/**
 * Fetches menu HTML and returns text content.
 */
export async function fetchMenu() {
  const res = await fetch('menu.html');
  if (!res.ok) {
    throw new Error(`Failed to fetch menu: ${res.status}`);
  }
  return res.text();
}

/**
 * Fetches a manifest from a given URL and returns parsed JSON.
 * Throws on non-OK HTTP responses or JSON parsing errors.
 */
export async function fetchManifest(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

// RERUM CRUD + query functions
export async function create(obj) {
  const res = await fetch(PLAYGROUND.URLS.CREATE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj)
  });
  return handleHTTPError(res).catch(err => err);
}

export async function update(obj) {
  const res = await fetch(PLAYGROUND.URLS.UPDATE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj)
  });
  return handleHTTPError(res).catch(err => err);
}

export async function overwrite(obj) {
  const res = await fetch(PLAYGROUND.URLS.OVERWRITE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj)
  });
  return handleHTTPError(res).catch(err => err);
}

export async function deleteObject(uri) {
  const res = await fetch(PLAYGROUND.URLS.DELETE, {
    method: 'DELETE',
    headers: { 'Content-Type': 'text/plain' },
    body: uri
  });
  return handleHTTPError(res).catch(err => err);
}

export async function query(obj) {
  const res = await fetch(PLAYGROUND.URLS.QUERY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj)
  });
  return handleHTTPError(res).catch(err => err);
}

export async function resolveJSON(uri) {
  const res = await fetch(uri);
  return handleHTTPError(res).catch(err => err);
}

export async function resolveString(uri) {
  const res = await fetch(uri);
  return handleHTTPError(res, 'text').catch(err => err);
<<<<<<< HEAD
}

=======
}
>>>>>>> dev_luis
