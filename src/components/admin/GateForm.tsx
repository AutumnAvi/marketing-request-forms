"use client";

import { useActionState } from "react";
import { signInAction } from "@/app/admin/actions";
import { idleState } from "@/app/admin/action-state";
import { Lock } from "@/components/Icons";
import styles from "./admin.module.css";

export function GateForm() {
  const [state, action, pending] = useActionState(signInAction, idleState);
  return (
    <div className={styles.gate}>
      <form action={action} className={`card ${styles.gateCard}`}>
        <div className={styles.gateHead}>
          <span className={styles.gateGlyph}>
            <Lock />
          </span>
          <span className="eyebrow">Admin</span>
          <h1 className="title-2">Enter the admin passphrase</h1>
          <p className="muted small">
            The admin area is behind a shared passphrase for now (<code className="mono">ADMIN_GATE</code>). Real
            sign-in arrives in a later wave.
          </p>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="passphrase">
            Passphrase
          </label>
          <input
            id="passphrase"
            name="passphrase"
            type="password"
            className="input"
            autoComplete="current-password"
            required
            autoFocus
            aria-invalid={state.fieldErrors?.passphrase ? "true" : undefined}
            aria-describedby={state.fieldErrors?.passphrase ? "passphrase-error" : undefined}
          />
          {state.fieldErrors?.passphrase && (
            <span id="passphrase-error" className="field__error" role="alert">
              {state.fieldErrors.passphrase}
            </span>
          )}
        </div>
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
