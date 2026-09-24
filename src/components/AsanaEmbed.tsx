"use client";

import { useCallback, useId, useSyncExternalStore } from "react";
import { ArrowUpRight } from "@/components/Icons";

export const ASANA_EMBED_STYLESHEET = "https://form.asana.com/static/asana-form-embed-style.css";

const STORAGE_PREFIX = "mrf:asana-embed-revealed:";
const CHANGE_EVENT = "mrf:asana-embed-change";

function readRevealed(key: string): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_PREFIX + key) === "1";
  } catch {
    return false;
  }
}

function writeRevealed(key: string, value: boolean) {
  try {
    if (value) window.sessionStorage.setItem(STORAGE_PREFIX + key, "1");
    else window.sessionStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Storage may be unavailable (privacy mode); the choice then lasts until reload.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * Open-first, progressive Asana form embed.
 *
 * Autumn Lake forms are restricted to the organisation, and Asana's sign-in /
 * email-verify flow refuses to run inside a frame. So the default is an
 * instruction card whose primary action opens the verify-friendly URL in a new
 * tab. The official Asana embed (stylesheet + `.asana-embed-container` +
 * iframe + "Form powered by Asana" footer) is mounted only after staff opt in,
 * and that choice is remembered for the session in this browser.
 */
export function AsanaEmbed({ src, title, openUrl }: { src: string; title: string; openUrl: string }) {
  const revealed = useSyncExternalStore(
    subscribe,
    () => readRevealed(src),
    () => false,
  );
  const setRevealed = useCallback((value: boolean) => writeRevealed(src, value), [src]);
  const frameId = useId();

  if (!revealed) {
    return (
      <section className="asana-gate" aria-labelledby={`${frameId}-title`}>
        <div className="asana-gate__head">
          <p className="eyebrow">Autumn Lake staff · Asana form</p>
          <h2 id={`${frameId}-title`} className="title-2">
            Open the form in Asana to get started.
          </h2>
          <p className="asana-gate__lede">
            This form is restricted to Autumn Lake. Asana verifies your work email once per browser; after that the
            form works both in Asana and embedded here.
          </p>
        </div>

        <ol className="asana-gate__steps">
          <li>Open the form in a new tab.</li>
          <li>If Asana asks, enter your Autumn Lake work email and follow the link it sends you.</li>
          <li>Fill in and submit the form in Asana, or come back here and show the embedded form.</li>
        </ol>

        <div className="asana-gate__actions">
          <a href={openUrl} target="_blank" rel="noopener noreferrer" className="btn btn--accent">
            Open form in Asana <ArrowUpRight />
          </a>
          <button type="button" className="btn btn--secondary" onClick={() => setRevealed(true)}>
            Show embedded form
          </button>
        </div>
        <p className="asana-gate__note">
          The embedded form only loads once this browser has verified with Asana. Asana cannot run sign-in inside an
          embed, so an unverified frame stays blank.
        </p>
      </section>
    );
  }

  return (
    <div className="asana-embed">
      <div className="asana-embed-bar">
        <p className="asana-embed-help">
          Embedded form. If it appears blank, Asana still needs to verify this browser —{" "}
          <a href={openUrl} target="_blank" rel="noopener noreferrer" className="link">
            open it in Asana
            <ArrowUpRight />
          </a>
          .
        </p>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setRevealed(false)}>
          Hide embedded form
        </button>
      </div>
      <div className="asana-embed-frame">
        <link rel="stylesheet" href={ASANA_EMBED_STYLESHEET} precedence="default" />
        <div className="asana-embed-container">
          <iframe
            className="asana-embed-iframe"
            src={src}
            title={`${title} — Asana form`}
            width="100%"
            height="900"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="clipboard-write"
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
