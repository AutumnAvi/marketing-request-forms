import { ArrowUpRight } from "@/components/Icons";

export const ASANA_EMBED_STYLESHEET = "https://form.asana.com/static/asana-form-embed-style.css";

/**
 * Official Asana form embed: stylesheet + `.asana-embed-container` with the
 * iframe and "Form powered by Asana" footer (the logo is a background image
 * defined by Asana's stylesheet). The form itself is never re-implemented
 * here — the iframe is the product.
 */
export function AsanaEmbed({ src, title, openUrl }: { src: string; title: string; openUrl: string }) {
  return (
    <div className="asana-embed">
      <p className="asana-embed-help">
        Forms restricted to our organisation ask you to sign in to Asana first. If the form does not appear below,{" "}
        <a href={openUrl} target="_blank" rel="noopener noreferrer" className="link">
          open it in Asana
          <ArrowUpRight />
        </a>
        .
      </p>
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
