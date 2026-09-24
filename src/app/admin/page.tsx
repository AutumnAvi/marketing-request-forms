import Link from "next/link";
import { isAdminSession } from "@/lib/admin-gate";
import { listOrphanForms, listSectionsWithForms } from "@/lib/catalog/store";
import type { RequestForm } from "@/lib/catalog/types";
import { EmptyState } from "@/components/EmptyState";
import { Folder, Plus } from "@/components/Icons";
import { toggleFormActiveAction, toggleSectionVisibilityAction } from "./actions";
import styles from "@/components/admin/admin.module.css";

export const dynamic = "force-dynamic";

const FLASH: Record<string, string> = {
  "section-created": "Section added. It is live on the hub.",
  "section-saved": "Section saved.",
  "section-deleted": "Section and its forms deleted.",
  "form-created": "Form added. Staff can open it from the hub now.",
  "form-saved": "Form saved.",
  "form-deleted": "Form deleted.",
};

export default async function AdminOverview({ searchParams }: PageProps<"/admin">) {
  if (!(await isAdminSession())) return null;
  const { flash } = await searchParams;
  const flashText = typeof flash === "string" ? FLASH[flash] : undefined;
  const [sections, orphans] = await Promise.all([listSectionsWithForms(), listOrphanForms()]);
  const formCount = sections.reduce((n, s) => n + s.forms.length, 0);

  return (
    <div className={styles.shell}>
      {flashText && (
        <p className="notice notice--ok" role="status">
          {flashText}
        </p>
      )}

      <div className={styles.overviewHead}>
        <p className="muted">
          {sections.length} {sections.length === 1 ? "section" : "sections"} · {formCount}{" "}
          {formCount === 1 ? "form" : "forms"}
        </p>
        <div className={styles.actions}>
          <Link href="/admin/sections/new" className="btn btn--secondary">
            <Plus /> New section
          </Link>
          <Link href="/admin/forms/new" className="btn btn--accent">
            <Plus /> New form
          </Link>
        </div>
      </div>

      {sections.length === 0 ? (
        <EmptyState
          icon={<Folder />}
          title="Start with a section"
          action={
            <Link href="/admin/sections/new" className="btn btn--accent">
              <Plus /> Add your first section
            </Link>
          }
        >
          Sections are how staff find forms — think Creative, Events, Web, Paid Media. Create one, then attach Asana
          forms to it.
        </EmptyState>
      ) : (
        <div className={styles.sections}>
          {sections.map((section) => (
            <section key={section.id} className={`card ${styles.sectionCard}`} aria-labelledby={`sec-${section.id}`}>
              <header className={styles.sectionCardHead}>
                <div>
                  <div className={styles.sectionCardTitle}>
                    <h2 id={`sec-${section.id}`}>{section.name}</h2>
                    <span className={`pill ${section.visible ? "pill--on" : "pill--off"}`}>
                      {section.visible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <div className={styles.sectionCardMeta}>
                    <span className="mono">/sections/{section.slug}</span>
                    <span>Order {section.order}</span>
                    <span>
                      {section.forms.length} {section.forms.length === 1 ? "form" : "forms"}
                    </span>
                  </div>
                </div>
                <div className={styles.sectionCardActions}>
                  <form action={toggleSectionVisibilityAction.bind(null, section.id, !section.visible)}>
                    <button type="submit" className="btn btn--ghost btn--sm">
                      {section.visible ? "Hide" : "Show"}
                    </button>
                  </form>
                  <Link href={`/admin/sections/${section.id}`} className="btn btn--secondary btn--sm">
                    Edit
                  </Link>
                </div>
              </header>

              {section.forms.length === 0 ? (
                <div className={styles.emptyRow}>
                  <span>No forms in this section yet.</span>
                  <Link href={`/admin/forms/new?section=${section.id}`} className="btn btn--ghost btn--sm">
                    <Plus /> Add a form
                  </Link>
                </div>
              ) : (
                <>
                  <FormsTable forms={section.forms} />
                  <div className={styles.sectionCardFoot}>
                    <span className="small muted">
                      Order controls where a form sits inside {section.name}. Inactive forms stay here but leave the hub.
                    </span>
                    <Link href={`/admin/forms/new?section=${section.id}`} className="btn btn--ghost btn--sm">
                      <Plus /> Add a form
                    </Link>
                  </div>
                </>
              )}
            </section>
          ))}
        </div>
      )}

      {orphans.length > 0 && (
        <section className={`card ${styles.sectionCard} ${styles.dangerZone}`} aria-labelledby="orphans">
          <header className={styles.sectionCardHead}>
            <div>
              <div className={styles.sectionCardTitle}>
                <h2 id="orphans">Forms without a section</h2>
                <span className="pill pill--warn">Not shown on hub</span>
              </div>
              <div className={styles.sectionCardMeta}>
                <span>Edit each form and choose a section to bring it back.</span>
              </div>
            </div>
          </header>
          <FormsTable forms={orphans} />
        </section>
      )}
    </div>
  );
}

function FormsTable({ forms }: { forms: RequestForm[] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Form</th>
          <th scope="col" className={styles.hideSm}>
            Asana embed
          </th>
          <th scope="col" className={styles.tdNum}>
            Order
          </th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {forms.map((form) => (
          <tr key={form.id}>
            <td className={styles.tdTitle}>
              <Link href={`/admin/forms/${form.id}`}>{form.title}</Link>
              <div className="small muted mono">/forms/{form.slug}</div>
            </td>
            <td className={`${styles.tdUrl} ${styles.hideSm} mono`} title={form.asanaEmbedUrl}>
              {form.asanaEmbedUrl.replace("https://", "")}
            </td>
            <td className={styles.tdNum}>{form.order}</td>
            <td>
              <span className={`pill ${form.active ? "pill--on" : "pill--off"}`}>
                {form.active ? "Active" : "Inactive"}
              </span>
            </td>
            <td className={styles.tdActions}>
              <form action={toggleFormActiveAction.bind(null, form.id, !form.active)} style={{ display: "inline" }}>
                <button type="submit" className="btn btn--ghost btn--sm">
                  {form.active ? "Deactivate" : "Activate"}
                </button>
              </form>
              <Link href={`/admin/forms/${form.id}`} className="btn btn--secondary btn--sm">
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
