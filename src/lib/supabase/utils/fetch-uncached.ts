// The tagged query cache is the sole owner of database caching.
export const fetchUncached: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });
