"use client";

import type { ReactNode } from "react";

type BaseProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
};

export function Field({ id, label, hint, error, children }: BaseProps & { children: ReactNode }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <span id={`${id}-error`} className="field__error" role="alert">
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${id}-hint`} className="field__hint">
            {hint}
          </span>
        )
      )}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: ReactNode): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function CheckField({
  id,
  name,
  title,
  hint,
  defaultChecked,
}: {
  id: string;
  name: string;
  title: string;
  hint: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="check" htmlFor={id}>
      <input id={id} name={name} type="checkbox" value="true" defaultChecked={defaultChecked} />
      <span>
        <span className="check__title">{title}</span>
        <br />
        <span className="check__hint">{hint}</span>
      </span>
    </label>
  );
}
