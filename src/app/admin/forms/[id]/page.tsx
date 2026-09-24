import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdminSession } from "@/lib/admin-gate";
import { getFormById, listSections } from "@/lib/catalog/store";
import { FormEditor } from "@/components/admin/FormEditor";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ArrowLeft } from "@/components/Icons";
import { deleteFormAction, updateFormAction } from "@/app/admin/actions";
import styles from "@/components/admin/admin.module.css";

export const dynamic = "force-dynamic";

export default async function EditFormPage({ params }: PageProps<"/admin/forms/[id]">) {
  if (!(await isAdminSession())) return null;
  const { id } = await params;
  const [form, sections] = await Promise.all([getFormById(id), listSections()]);
  if (!form) notFound();

  return (
    <div className={styles.shell}>
      <Link href="/admin" className="back-link">
        <ArrowLeft /> Overview
      </Link>
      <div>
        <span className="eyebrow">Edit form</span>
        <h2 className="title-2" style={{ marginTop: 8 }}>
          {form.title}
        </h2>
      </div>
      <div className={styles.editor}>
        <FormEditor
          action={updateFormAction.bind(null, form.id)}
          sections={sections}
          form={form}
          submitLabel="Save changes"
        />
        <aside className={styles.editorAside}>
          <div className="card">
            <h2>On the hub</h2>
            <p>
              <Link href={`/forms/${form.slug}`} className="link" target="_blank" rel="noopener">
                /forms/{form.slug}
              </Link>
            </p>
            <p className="small muted">
              id <code>{form.id}</code>
            </p>
          </div>
          <div className={`card ${styles.dangerZone}`}>
            <h2>Delete</h2>
            <p className="small">Removes this form from the hub and admin. The Asana form itself is untouched.</p>
            <DeleteButton
              action={deleteFormAction.bind(null, form.id)}
              label="Delete form"
              confirmText={`Delete “${form.title}”? This cannot be undone.`}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
