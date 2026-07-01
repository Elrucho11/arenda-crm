import type { ReactNode } from "react";
import { initials } from "../lib/format";

// ===== Заголовок страницы (бейдж-«глазок» + двухцветный заголовок) =====
export function PageHeader({
  eyebrow, title, accent, children,
}: { eyebrow: string; title: string; accent?: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="page-title">
          {title} {accent && <span>{accent}</span>}
        </h1>
      </div>
      {children && <div className="row gap-10 wrap">{children}</div>}
    </div>
  );
}

// ===== Метрика =====
export function Stat({
  label, value, icon, tone = "accent",
}: { label: string; value: ReactNode; icon?: string; tone?: "accent" | "red" | "green" | "amber" | "orange" }) {
  return (
    <div className={`stat stat--${tone}`}>
      <div className="stat-label">
        {icon && <i className={`ti ti-${icon}`} aria-hidden="true" style={{ fontSize: 16 }} />}
        {label}
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

// ===== Бейдж =====
export function Badge({
  tone = "gray", children, dot,
}: { tone?: "orange" | "green" | "red" | "amber" | "blue" | "gray"; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`badge badge--${tone}`}>
      {dot && <span className="dot" style={{ background: "currentColor" }} />}
      {children}
    </span>
  );
}

// ===== Аватар с инициалами =====
export function Avatar({ name, size = 42, bg }: { name: string; size?: number; bg?: string }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: bg }}>
      {initials(name)}
    </div>
  );
}

// ===== Рейтинг звёздами =====
export function Stars({ value }: { value: number }) {
  return (
    <span style={{ whiteSpace: "nowrap", letterSpacing: 1 }} aria-label={`Рейтинг ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={`ti ti-star${n <= value ? "-filled" : ""}`} aria-hidden="true"
          style={{ fontSize: 13, color: n <= value ? "#ffb02e" : "#d0d3d9" }} />
      ))}
    </span>
  );
}

// ===== Модалка =====
export function Modal({
  title, onClose, children, footer, wide,
}: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${wide ? "modal--wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="f18 fw8">{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ===== Пустое состояние =====
export function Empty({ icon = "inbox", text }: { icon?: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-dim)" }}>
      <i className={`ti ti-${icon}`} aria-hidden="true" style={{ fontSize: 36, opacity: .5 }} />
      <div className="mt-12 f14">{text}</div>
    </div>
  );
}

// ===== Иконка-метка в кружке =====
export function IconCircle({ icon, tone = "orange" }: { icon: string; tone?: string }) {
  const map: Record<string, [string, string]> = {
    orange: ["#fff1e8", "#c2510a"],
    green: ["#e7f6ec", "#1f7a3d"],
    red: ["#fdecec", "#b3261e"],
    blue: ["#e9f1fb", "#1f5fae"],
    gray: ["#f0f1f3", "#4b5563"],
  };
  const [bg, fg] = map[tone] || map.orange;
  return (
    <span style={{ width: 34, height: 34, borderRadius: 9, background: bg, color: fg, display: "grid", placeItems: "center", flex: "none" }}>
      <i className={`ti ti-${icon}`} aria-hidden="true" style={{ fontSize: 18 }} />
    </span>
  );
}
