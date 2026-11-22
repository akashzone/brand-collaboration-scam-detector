/**
 * Make a URL non-clickable and visually "inert", using the convention common
 * in threat reports: hxxps://example[.]com/path
 * Only the scheme and hostname are changed; the path stays readable.
 */
export function defangUrl(url) {
  if (typeof url !== "string") return "";
  const match = url.match(/^([a-z][a-z0-9+.-]*:\/\/)?([^/?#]*)(.*)$/i);
  if (!match) return url;
  const [, scheme = "", host, rest] = match;
  return scheme.replace(/^http/i, "hxxp") + defangHost(host) + rest;
}

export const defangHost = (host) => (typeof host === "string" ? host.replace(/\./g, "[.]") : "");
