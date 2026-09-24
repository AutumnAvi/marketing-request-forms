import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty" role="status">
      <span className="empty__glyph">{icon}</span>
      <h3 className="title-3">{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
