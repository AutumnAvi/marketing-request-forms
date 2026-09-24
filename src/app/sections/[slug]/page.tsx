import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectionBySlug, listPublishedSections } from "@/lib/catalog/store";
import { FormCard } from "@/components/hub/FormCard";
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeft, Document } from "@/components/Icons";
import styles from "@/components/hub/hub.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/sections/[slug]">): Promise<Metadata> {
  const section = await getSectionBySlug((await params).slug);
  return { title: section ? section.name : "Section" };
}

export default async function SectionPage({ params }: PageProps<"/sections/[slug]">) {
  const { slug } = await params;
  const section = (await listPublishedSections()).find((s) => s.slug === slug);
  if (!section) notFound();

  return (
    <div className="container">
      <header className={styles.sectionHead}>
        <Link href="/" className="back-link">
          <ArrowLeft /> All sections
        </Link>
        <div>
          <span className="eyebrow">Section</span>
          <h1 className="title-1" style={{ marginTop: 10 }}>
            {section.name}
          </h1>
        </div>
        {section.description && <p className="lede">{section.description}</p>}
      </header>

      {section.forms.length === 0 ? (
        <EmptyState icon={<Document />} title="No forms in this section yet">
          Forms added to {section.name} in Admin will appear here for staff to open.
        </EmptyState>
      ) : (
        <div className={styles.sectionGrid}>
          {section.forms.map((form, i) => (
            <FormCard key={form.id} form={form} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
