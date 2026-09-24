import Link from "next/link";
import { isAdminSession } from "@/lib/admin-gate";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { ArrowLeft } from "@/components/Icons";
import { createSectionAction } from "@/app/admin/actions";
import styles from "@/components/admin/admin.module.css";

export const dynamic = "force-dynamic";

export default async function NewSectionPage() {
  if (!(await isAdminSession())) return null;
  return (
    <div className={styles.shell}>
      <Link href="/admin" className="back-link">
        <ArrowLeft /> Overview
      </Link>
      <div>
        <span className="eyebrow">New section</span>
        <h2 className="title-2" style={{ marginTop: 8 }}>
          Add a section
        </h2>
      </div>
      <div className={styles.editor}>
        <SectionEditor action={createSectionAction} submitLabel="Create section" />
        <aside className={styles.editorAside}>
          <div className="card">
            <h2>Tips</h2>
            <p>Name sections after the team or workflow that owns the requests: Creative, Events, Web, Paid Media.</p>
            <p>You can hide a section while you gather its forms, then flip it visible when it is ready.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
