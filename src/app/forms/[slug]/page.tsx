import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormBySlug, getSectionById } from "@/lib/catalog/store";
import { AsanaEmbed } from "@/components/AsanaEmbed";
import { ArrowUpRight } from "@/components/Icons";
import styles from "@/components/hub/hub.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/forms/[slug]">): Promise<Metadata> {
  const form = await getFormBySlug((await params).slug);
  return { title: form ? form.title : "Form" };
}

export default async function FormPage({ params }: PageProps<"/forms/[slug]">) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);
  if (!form || !form.active) notFound();
  const section = await getSectionById(form.sectionId);
  if (!section || !section.visible) notFound();

  const openInAsana = new URL(form.asanaEmbedUrl);
  openInAsana.searchParams.delete("embed");

  return (
    <div className="container">
      <header className={styles.formHead}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/">Request hub</Link>
          <span className={styles.crumbSep} aria-hidden="true">
            /
          </span>
          <Link href={`/sections/${section.slug}`}>{section.name}</Link>
          <span className={styles.crumbSep} aria-hidden="true">
            /
          </span>
          <span aria-current="page">{form.title}</span>
        </nav>
        <div className={styles.formHeadRow}>
          <div>
            <h1 className="title-1">{form.title}</h1>
            {form.description && (
              <p className="lede" style={{ marginTop: 14 }}>
                {form.description}
              </p>
            )}
          </div>
          <a href={openInAsana.toString()} target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
            Open in Asana <ArrowUpRight />
          </a>
        </div>
      </header>

      <div className={styles.formLayout}>
        <AsanaEmbed src={form.asanaEmbedUrl} title={form.title} />

        <aside className={styles.formAside} aria-label="About this form">
          <div className={`card ${styles.asideCard}`}>
            <h2>Details</h2>
            <dl>
              <div>
                <dt>Section</dt>
                <dd>
                  <Link href={`/sections/${section.slug}`} className="link">
                    {section.name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>Submits to</dt>
                <dd>Asana — Marketing intake</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{formatDate(form.updatedAt)}</dd>
              </div>
            </dl>
          </div>
          <div className={`card ${styles.asideCard}`}>
            <h2>What happens next</h2>
            <ol className={styles.asideSteps}>
              <li>Fill in the form below. Attach references or files where the form allows.</li>
              <li>Submitting creates a task in the team&rsquo;s Asana project.</li>
              <li>The owning team triages it and follows up in the Asana task.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(iso));
}
