import Link from "next/link";
import { listPublishedSections } from "@/lib/catalog/store";
import { FormCard } from "@/components/hub/FormCard";
import { EmptyState } from "@/components/EmptyState";
import { ArrowRight, Document, Folder } from "@/components/Icons";
import styles from "@/components/hub/hub.module.css";

export const dynamic = "force-dynamic";

export default async function HubHome() {
  const sections = await listPublishedSections();
  const formCount = sections.reduce((n, s) => n + s.forms.length, 0);
  const latest = sections
    .flatMap((s) => s.forms.map((f) => f.updatedAt))
    .sort()
    .at(-1);

  return (
    <div className="container">
      <section className={styles.hero} aria-labelledby="hub-title">
        <div className={styles.heroTop}>
          <span className="eyebrow">Marketing Operations · Request hub</span>
        </div>
        <div className={styles.heroGrid}>
          <h1 id="hub-title" className="display">
            Send work to Marketing, <em>the right way.</em>
          </h1>
          <div className={styles.heroAside}>
            <p className="lede">
              Every request starts with a form. Pick a section below, open the form, and your request lands in the
              team&rsquo;s Asana queue with everything they need to start.
            </p>
            <dl className={styles.stats}>
              <div className={styles.stat}>
                <dt className="eyebrow">Sections</dt>
                <dd className={styles.statValue}>{sections.length}</dd>
              </div>
              <div className={styles.stat}>
                <dt className="eyebrow">Forms</dt>
                <dd className={styles.statValue}>{formCount}</dd>
              </div>
              <div className={styles.stat}>
                <dt className="eyebrow">Updated</dt>
                <dd className={styles.statValue}>{latest ? formatShortDate(latest) : "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {sections.length === 0 ? (
        <EmptyState
          icon={<Folder />}
          title="No sections are published yet"
          action={
            <Link href="/admin/sections/new" className="btn btn--accent">
              Add the first section
            </Link>
          }
        >
          Sections group related request forms — Creative, Events, Web, Paid Media. Add one in Admin and it will appear
          here immediately.
        </EmptyState>
      ) : (
        <div className={styles.body}>
          <aside className={styles.index} aria-label="Sections index">
            <span className="eyebrow">Browse by section</span>
            <nav className={styles.indexList}>
              {sections.map((s) => (
                <a key={s.id} href={`#section-${s.slug}`} className={styles.indexLink}>
                  <span>{s.name}</span>
                  <span className={styles.indexCount}>{s.forms.length}</span>
                </a>
              ))}
            </nav>
            <div className={styles.indexHelp}>
              <strong>Not sure which form?</strong>
              Start with the section closest to the work. The team will re-route anything that lands in the wrong
              queue.
            </div>
          </aside>

          <div className={styles.groups}>
            {sections.map((section, i) => (
              <section key={section.id} id={`section-${section.slug}`} className={styles.group}>
                <header className={styles.groupHead}>
                  <span className={styles.groupIndex}>{String(i + 1).padStart(2, "0")}</span>
                  <div className={styles.groupTitle}>
                    <h2 className="title-2">{section.name}</h2>
                    {section.description && <p>{section.description}</p>}
                  </div>
                  <Link href={`/sections/${section.slug}`} className={styles.groupLink}>
                    View section <ArrowRight />
                  </Link>
                </header>
                {section.forms.length === 0 ? (
                  <div className={styles.formGrid}>
                    <EmptyState icon={<Document />} title="No forms in this section yet">
                      Forms added to {section.name} in Admin will show up here.
                    </EmptyState>
                  </div>
                ) : (
                  <div className={styles.formGrid}>
                    {section.forms.map((form, j) => (
                      <FormCard key={form.id} form={form} index={j + 1} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(iso));
}
