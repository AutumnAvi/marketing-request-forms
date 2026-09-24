import type { Metadata } from "next";
import Link from "next/link";
import { isAdminSession, isGateEnabled } from "@/lib/admin-gate";
import { isEphemeralStorage } from "@/lib/catalog/store";
import { GateForm } from "@/components/admin/GateForm";
import { Info } from "@/components/Icons";
import { signOutAction } from "./actions";
import styles from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const gateEnabled = isGateEnabled();
  if (!(await isAdminSession())) {
    return (
      <div className="container">
        <GateForm />
      </div>
    );
  }

  return (
    <div className={`container ${styles.shell}`}>
      <div className={styles.top}>
        <div className={styles.topTitle}>
          <span className="eyebrow">Admin</span>
          <h1 className="title-1">Catalog</h1>
          <p>Sections and forms shown on the request hub. Changes publish immediately.</p>
        </div>
        <nav className={styles.subnav} aria-label="Admin">
          <Link href="/admin">Overview</Link>
          <Link href="/admin/sections/new">New section</Link>
          <Link href="/admin/forms/new">New form</Link>
          <Link href="/" target="_blank" rel="noopener">
            View hub ↗
          </Link>
          {gateEnabled && (
            <form action={signOutAction}>
              <button type="submit">Sign out</button>
            </form>
          )}
        </nav>
      </div>

      {(!gateEnabled || isEphemeralStorage()) && (
        <div className={styles.notices}>
          {!gateEnabled && (
            <p className="notice notice--warn">
              <Info />
              <span>
                <strong>Admin gate is off.</strong> Set <code className="mono">ADMIN_GATE</code> in the environment to
                require a passphrase before anyone can edit the catalog.
              </span>
            </p>
          )}
          {isEphemeralStorage() && (
            <p className="notice notice--warn">
              <Info />
              <span>
                <strong>Ephemeral storage.</strong> This deployment writes to <code className="mono">/tmp</code>, so
                edits reset on redeploy or cold start. Commit <code className="mono">data/catalog.json</code> or move to
                the Supabase store (see README).
              </span>
            </p>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
