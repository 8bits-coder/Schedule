import React from "react";
import { X } from "lucide-react";

export const RoleTab = React.memo(function RoleTab({
  id,
  active,
  onClick,
  icon,
  label,
}: {
  id: string;
  active: string;
  onClick: (id: string) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active === id}
      className={`sa-tab ${active === id ? "sa-tab--active" : ""}`}
      onClick={() => onClick(id)}>
      {icon}
      {label}
    </button>
  );
});

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sa-modal-backdrop" onClick={onClose}>
      <div className="sa-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sa-modal-head">
          <h3>{title}</h3>
          <button className="sa-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="sa-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function PageIntro({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="sa-intro">
      <span className="sa-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{sub}</p>
    </div>
  );
}

export function Card({
  icon,
  title,
  children,
  wide,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className={`sa-card ${wide ? "sa-card--wide" : ""}`}>
      <header className="sa-card-head">
        <span className="sa-card-icon">{icon}</span>
        <h2>{title}</h2>
      </header>
      <div className="sa-card-body">{children}</div>
    </section>
  );
}
