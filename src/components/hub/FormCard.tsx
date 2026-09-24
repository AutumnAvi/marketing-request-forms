import Link from "next/link";
import type { RequestForm } from "@/lib/catalog/types";
import { ArrowRight } from "@/components/Icons";
import styles from "./hub.module.css";

export function FormCard({ form, index }: { form: RequestForm; index?: number }) {
  return (
    <Link href={`/forms/${form.slug}`} className={styles.formCard}>
      <div className={styles.formCardHead}>
        {index !== undefined && <span className={`mono ${styles.formCardIndex}`}>{String(index).padStart(2, "0")}</span>}
        <h3 className={`title-3 ${styles.formCardTitle}`}>{form.title}</h3>
        <span className={styles.formCardArrow} aria-hidden="true">
          <ArrowRight />
        </span>
      </div>
      {form.description && <p className={styles.formCardDesc}>{form.description}</p>}
      <span className={`eyebrow ${styles.formCardMeta}`}>Asana form · Open</span>
    </Link>
  );
}
