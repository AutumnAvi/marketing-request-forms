/**
 * Derives the "open in Asana" URL from a catalog embed `src`.
 *
 * The embed src always carries `embed=true`, which serves the iframe-only
 * chrome. Asana's email-verify / sign-in flow refuses to run inside a frame,
 * so staff who need to verify must open the same form as a full page. Only
 * the embed flag is removed; `k` and `d` (the form identity) are untouched.
 */
export function asanaOpenUrl(embedSrc: string): string {
  const url = new URL(embedSrc);
  url.searchParams.delete("embed");
  return url.toString();
}
