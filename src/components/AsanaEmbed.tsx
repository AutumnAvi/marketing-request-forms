export const ASANA_EMBED_STYLESHEET = "https://form.asana.com/static/asana-form-embed-style.css";

/**
 * Official Asana form embed: stylesheet + `.asana-embed-container` with the
 * iframe and "Form powered by Asana" footer. The form itself is never
 * re-implemented here — the iframe is the product.
 */
export function AsanaEmbed({ src, title }: { src: string; title: string }) {
  return (
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
            <span>Form powered by</span>
            {/* eslint-disable-next-line @next/next/no-img-element -- Asana-hosted brand asset from the official snippet */}
            <img src="https://asana.com/assets/img/brand/asana-logo-horizontal-color.svg" alt="Asana" />
          </a>
        </div>
      </div>
    </div>
  );
}
