import Link from "next/link";
import { isAdminSession } from "@/lib/admin-gate";
import { listSections } from "@/lib/catalog/store";
import { FormEditor } from "@/components/admin/FormEditor";
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeft, Folder } from "@/components/Icons";
import { createFormAction } from "@/app/admin/actions";
import styles from "@/components/admin/admin.module.css";

export const dynamic = "force-dynamic";

export default async function NewFormPage({ searchParams }: PageProps<"/admin/forms/new">) {
  if (!(await isAdminSession())) return null;
  const { section } = await searchParams;
  const sections = await listSections();

  return (
    <div className={styles.shell}>
      <Link href="/admin" className="back-link">
        <ArrowLeft /> Overview
      </Link>
      <div>
        <span className="eyebrow">New form</span>
        <h2 className="title-2" style={{ marginTop: 8 }}>
          Add an Asana form
        </h2>
      </div>

      {sections.length === 0 ? (
        <EmptyState
          icon={<Folder />}
          title="Create a section first"
          action={
            <Link href="/admin/sections/new" className="btn btn--accent">
              New section
            </Link>
          }
        >
          Every form lives inside a section. Add one, then come back to attach the form.
        </EmptyState>
      ) : (
        <div className={styles.editor}>
          <FormEditor
            action={createFormAction}
            sections={sections}
            defaultSectionId={typeof section === "string" ? section : undefined}
            submitLabel="Create form"
          />
          <aside className={styles.editorAside}>
            <div className="card">
              <h2>Getting the embed URL</h2>
              <p>
                In Asana open the form, choose <strong>Share</strong> → <strong>Embed</strong>, and copy the{" "}
                <code>src</code> attribute of the <code>&lt;iframe&gt;</code>. It looks like{" "}
                <code>https://form.asana.com/?k=…&amp;d=…&amp;embed=true</code>.
              </p>
              <p>
                The hub renders it with Asana&rsquo;s official embed container and stylesheet — the form itself is never
                rebuilt here.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
