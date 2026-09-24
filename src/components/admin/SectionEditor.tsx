"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ActionState } from "@/app/admin/action-state";
import { idleState } from "@/app/admin/action-state";
import type { Section } from "@/lib/catalog/types";
import { CheckField, Field, describedBy } from "./fields";
import styles from "./admin.module.css";

type Props = {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  section?: Section;
  submitLabel: string;
};

export function SectionEditor({ action, section, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, idleState);
  const v = (key: string, fallback = "") => state.values?.[key] ?? fallback;
  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className={`card ${styles.editorForm}`} noValidate>
      {state.message && !state.ok && (
        <p className="notice notice--danger" role="alert">
          {state.message}
        </p>
      )}

      <Field id="name" label="Name" error={err.name} hint="Shown as the section heading on the hub.">
        <input
          id="name"
          name="name"
          className="input"
          required
          maxLength={80}
          defaultValue={v("name", section?.name)}
          placeholder="e.g. Creative"
          aria-invalid={err.name ? "true" : undefined}
          aria-describedby={describedBy("name", err.name, true)}
        />
      </Field>

      <Field
        id="description"
        label="Description"
        error={err.description}
        hint="One sentence on what kind of requests belong here. Optional."
      >
        <textarea
          id="description"
          name="description"
          className="textarea"
          maxLength={280}
          defaultValue={v("description", section?.description)}
          aria-invalid={err.description ? "true" : undefined}
          aria-describedby={describedBy("description", err.description, true)}
        />
      </Field>

      <div className="form-grid form-grid--2">
        <Field id="order" label="Order" error={err.order} hint="Lower numbers appear first. Leave blank to add at the end.">
          <input
            id="order"
            name="order"
            className="input input--mono"
            inputMode="numeric"
            pattern="[0-9]*"
            defaultValue={v("order", section ? String(section.order) : "")}
            aria-invalid={err.order ? "true" : undefined}
            aria-describedby={describedBy("order", err.order, true)}
          />
        </Field>
        <Field id="slug" label="URL slug" error={err.slug} hint="Auto-generated from the name if left blank.">
          <input
            id="slug"
            name="slug"
            className="input input--mono"
            defaultValue={v("slug", section?.slug)}
            placeholder="creative"
            aria-describedby={describedBy("slug", err.slug, true)}
          />
        </Field>
      </div>

      <CheckField
        id="visible"
        name="visible"
        title="Visible on the hub"
        hint="Hidden sections (and their forms) stay in admin but are not shown to staff."
        defaultChecked={state.values ? state.values.visible === "true" : section?.visible ?? true}
      />

      <div className="form-actions">
        <button type="submit" className="btn btn--accent" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/admin" className="btn btn--ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
