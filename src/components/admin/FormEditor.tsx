"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ActionState } from "@/app/admin/action-state";
import { idleState } from "@/app/admin/action-state";
import type { RequestForm, Section } from "@/lib/catalog/types";
import { CheckField, Field, describedBy } from "./fields";
import styles from "./admin.module.css";

type Props = {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  sections: Section[];
  form?: RequestForm;
  defaultSectionId?: string;
  submitLabel: string;
};

export function FormEditor({ action, sections, form, defaultSectionId, submitLabel }: Props) {
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

      <Field id="title" label="Title" error={err.title} hint="Shown on the form card and page heading.">
        <input
          id="title"
          name="title"
          className="input"
          required
          maxLength={120}
          defaultValue={v("title", form?.title)}
          placeholder="e.g. Creative Request Form"
          aria-invalid={err.title ? "true" : undefined}
          aria-describedby={describedBy("title", err.title, true)}
        />
      </Field>

      <Field id="sectionId" label="Section" error={err.sectionId}>
        <select
          id="sectionId"
          name="sectionId"
          className="select"
          required
          defaultValue={v("sectionId", form?.sectionId ?? defaultSectionId ?? sections[0]?.id ?? "")}
          aria-invalid={err.sectionId ? "true" : undefined}
          aria-describedby={describedBy("sectionId", err.sectionId)}
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.visible ? "" : " (hidden)"}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id="asanaEmbedUrl"
        label="Asana embed URL"
        error={err.asanaEmbedUrl}
        hint={
          <>
            In Asana: Form → Share → Embed. Paste the <code className="mono">src</code> of the iframe, e.g.{" "}
            <code className="mono">https://form.asana.com/?k=…&amp;d=…&amp;embed=true</code>
          </>
        }
      >
        <input
          id="asanaEmbedUrl"
          name="asanaEmbedUrl"
          className="input input--mono"
          type="url"
          required
          inputMode="url"
          spellCheck={false}
          defaultValue={v("asanaEmbedUrl", form?.asanaEmbedUrl)}
          placeholder="https://form.asana.com/?k=…&d=…&embed=true"
          aria-invalid={err.asanaEmbedUrl ? "true" : undefined}
          aria-describedby={describedBy("asanaEmbedUrl", err.asanaEmbedUrl, true)}
        />
      </Field>

      <Field
        id="description"
        label="Description"
        error={err.description}
        hint="What this form is for, in one or two sentences. Optional."
      >
        <textarea
          id="description"
          name="description"
          className="textarea"
          maxLength={280}
          defaultValue={v("description", form?.description)}
          aria-invalid={err.description ? "true" : undefined}
          aria-describedby={describedBy("description", err.description, true)}
        />
      </Field>

      <div className="form-grid form-grid--2">
        <Field id="order" label="Order" error={err.order} hint="Position within the section. Blank adds at the end.">
          <input
            id="order"
            name="order"
            className="input input--mono"
            inputMode="numeric"
            pattern="[0-9]*"
            defaultValue={v("order", form ? String(form.order) : "")}
            aria-invalid={err.order ? "true" : undefined}
            aria-describedby={describedBy("order", err.order, true)}
          />
        </Field>
        <Field id="slug" label="URL slug" error={err.slug} hint="Auto-generated from the title if left blank.">
          <input
            id="slug"
            name="slug"
            className="input input--mono"
            defaultValue={v("slug", form?.slug)}
            placeholder="creative-request-form"
            aria-describedby={describedBy("slug", err.slug, true)}
          />
        </Field>
      </div>

      <CheckField
        id="active"
        name="active"
        title="Active"
        hint="Inactive forms are kept in admin but removed from the hub and return 404."
        defaultChecked={state.values ? state.values.active === "true" : form?.active ?? true}
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
