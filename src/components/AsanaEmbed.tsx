"use client";

import { useId, useRef, useState } from "react";
import { ArrowUpRight, Lock, Reload } from "@/components/Icons";

export const ASANA_EMBED_STYLESHEET = "https://form.asana.com/static/asana-form-embed-style.css";

/**
 * Official Asana form embed: stylesheet + `.asana-embed-container` with the
 * iframe and "Form powered by Asana" footer (the logo is a background image
 * defined by Asana's stylesheet). The form itself is never re-implemented
 * here — the iframe is the product.
 *
 * Guided verify: the forms are restricted to Autumn Lake work emails. Asana's
 * sign-in / email-verify flow cannot run inside a frame, so staff without an
 * Asana session complete it in a new tab (non-embed URL), then reload the
 * frame to pick up the cookie. The iframe stays mounted throughout so anyone
 * already signed in sees the form straight away.
 */
export function AsanaEmbed({ src, title, openUrl }: { src: string; title: string; openUrl: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<"idle" | "reloading" | "reloaded">("idle");
  const headingId = useId();

  function reloadForm() {
    const frame = frameRef.current;
    if (!frame) return;
    setStatus("reloading");
    // Re-assigning src forces a fresh navigation (a cache-busting param would
    // change the URL Asana sees, so we avoid it).
    frame.src = src;
    frame.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="asana-embed">
      <section className="asana-verify" aria-labelledby={headingId}>
        <div className="asana-verify__glyph" aria-hidden="true">
          <Lock />
        </div>
        <div className="asana-verify__body">
          <p className="eyebrow">Autumn Lake staff only</p>
          <h2 id={headingId} className="asana-verify__title">
            Verify your work email once in this browser
          </h2>
          <p className="asana-verify__lede">
            This form accepts Autumn Lake email addresses only. Asana cannot run its sign-in inside the frame below, so
            the first time you use a request form in this browser:
          </p>
          <ol className="asana-verify__steps">
            <li>Open the form in a new tab and enter your Autumn Lake email.</li>
            <li>Click the verification link Asana emails you — in this same browser.</li>
            <li>Come back to this page and reload the form.</li>
          </ol>
          <div className="asana-verify__actions">
            <a href={openUrl} target="_blank" rel="noopener noreferrer" className="btn btn--accent">
              Verify in Asana <ArrowUpRight />
            </a>
            <button type="button" className="btn btn--secondary" onClick={reloadForm}>
              <Reload /> I&rsquo;ve verified — reload form
            </button>
            <span className="asana-verify__status" role="status" aria-live="polite">
              {status === "reloading" && "Reloading form…"}
              {status === "reloaded" && "Form reloaded."}
            </span>
          </div>
          <p className="asana-verify__note">
            Already signed in to Asana in this browser? Skip this — the form below is ready to use.
          </p>
        </div>
      </section>

      <div className="asana-embed-frame">
        <link rel="stylesheet" href={ASANA_EMBED_STYLESHEET} precedence="default" />
        <div className="asana-embed-container">
          <iframe
            ref={frameRef}
            className="asana-embed-iframe"
            src={src}
            title={`${title} — Asana form`}
            width="100%"
            height="900"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="clipboard-write"
            onLoad={() => setStatus((s) => (s === "reloading" ? "reloaded" : s))}
          />
          <div className="asana-embed-footer">
            <a
              rel="nofollow noopener noreferrer"
              target="_blank"
              className="asana-embed-footer-link"
              href="https://asana.com/?utm_source=embedded_form"
            >
              <span className="asana-embed-footer-text">Form powered by</span>
              <span className="asana-embed-footer-logo" role="img" aria-label="Asana" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
