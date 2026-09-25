/* --- a markup file, as text ------------------------------------------------
   The landing page's build inlines each feature's markup (Vite's `?raw`
   import). With no build here, a module fetches it instead, beside itself,
   and awaits it at the top level, so the markup is in hand before anything
   mounts, just as it is there. */
export function loadText(path, from) {
  return fetch(new URL(path, from)).then(function (res) {
    if (!res.ok) throw new Error('Could not load ' + path + ' (' + res.status + ')');
    return res.text();
  });
}
