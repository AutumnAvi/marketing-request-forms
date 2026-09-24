/**
 * The catalog stores Asana's embed src (`…&embed=true`). The verify-friendly
 * URL staff open in a new tab is the same form without embed-only params, so
 * Asana can run its sign-in / email-verify flow at the top level.
 */
export function asanaOpenUrl(embedSrc: string): string {
  const url = new URL(embedSrc);
  url.searchParams.delete("embed");
  return url.toString();
}
