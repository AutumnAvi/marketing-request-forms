"use client";

export function DeleteButton({ action, label, confirmText }: { action: () => Promise<void>; label: string; confirmText: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <button type="submit" className="btn btn--danger">
        {label}
      </button>
    </form>
  );
}
