import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdminSession } from "@/lib/admin-gate";
import { getSectionById, listForms } from "@/lib/catalog/store";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ArrowLeft } from "@/components/Icons";
import { deleteSectionAction, updateSectionAction } from "@/app/admin/actions";
import styles from "@/components/admin/admin.module.css";

export const dynamic = "force-dynamic";

export default async function EditSectionPage({ params }: PageProps<"/admin/sections/[id]">) {
  if (!(await isAdminSession())) return null;
  const { id } = await params;
  const section = await getSectionById(id);
  if (!section) notFound();
  const formCount = (await listForms()).filter((f) => f.sectionId === id).length;

  return (
    <div className={styles.shell}>
      <Link href="/admin" className="back-link">
        <ArrowLeft /> Overview
      </Link>
      <div>
        <span className="eyebrow">Edit section</span>
        <h2 className="title-2" style={{ marginTop: 8 }}>
          {section.name}
        </h2>
      </div>
      <div className={styles.editor}>
        <SectionEditor action={updateSectionAction.bind(null, section.id)} section={section} submitLabel="Save changes" />
        <aside className={styles.editorAside}>
          <div className="card">
            <h2>On the hub</h2>
            <p>
              <Link href={`/sections/${section.slug}`} className="link" target="_blank" rel="noopener">
                /sections/{section.slug}
              </Link>
            </p>
            <p className="small muted">
              {formCount} {formCount === 1 ? "form" : "forms"} · id <code>{section.id}</code>
            </p>
          </div>
          <div className={`card ${styles.dangerZone}`}>
            <h2>Delete</h2>
            <p className="small">
              Removes the section and {formCount === 1 ? "its form" : `all ${formCount} forms`} inside it. This cannot be
              undone.
            </p>
            <DeleteButton
              action={deleteSectionAction.bind(null, section.id)}
              label="Delete section"
              confirmText={`Delete “${section.name}” and ${formCount} form(s)? This cannot be undone.`}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
