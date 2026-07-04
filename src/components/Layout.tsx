import { NavLink, Outlet, Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { chatThreads } from "../data/chat";

const unreadTotal = chatThreads.reduce((s, t) => s + t.unread, 0);

// Боковое меню — сгруппировано, пункты один в один с боевым сайтом
const NAV_GROUPS = [
  {
    title: "Обзор",
    items: [
      { to: "/", label: "Панель", icon: "layout-dashboard", end: true },
      { to: "/calls", label: "Вызовы", icon: "phone-call" },
      { to: "/chats", label: "Чат", icon: "message-circle", badge: unreadTotal },
      { to: "/attributes", label: "Атрибуты звонков", icon: "tag" },
      { to: "/clients", label: "Клиентская база", icon: "users" },
      { to: "/blacklist", label: "Чёрный список", icon: "ban" },
    ],
  },
  {
    title: "Инструменты",
    items: [
      { to: "/calculations", label: "Расчёты", icon: "calculator" },
      { to: "/delivery", label: "Доставка", icon: "truck-delivery" },
    ],
  },
  {
    title: "Система",
    items: [{ to: "/settings", label: "Настройки", icon: "settings" }],
  },
];

export default function Layout() {
  return (
    <div className="app-shell">
      {/* ===== Сайдбар ===== */}
      <aside className="sidebar">
        <Link to="/" className="side-brand" aria-label="АрендаСтройТюмень">
          <span className="side-mark"><i className="ti ti-building-skyscraper" aria-hidden="true" /></span>
          <span className="side-brand-text">
            <b>АрендаСтрой</b>
            <small>Телефония · CRM</small>
          </span>
        </Link>

        <nav className="side-nav">
          {NAV_GROUPS.map((g) => (
            <div className="side-group" key={g.title}>
              <div className="side-group-title">{g.title}</div>
              {g.items.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) => "side-link" + (isActive ? " active" : "")}
                >
                  <span className="side-bar" aria-hidden="true" />
                  <i className={`ti ti-${n.icon}`} aria-hidden="true" />
                  <span>{n.label}</span>
                  {n.badge ? <span className="count-badge" style={{ marginLeft: "auto", minWidth: 18, height: 18, fontSize: 10, background: "var(--orange)" }}>{n.badge}</span> : null}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="side-user">
          <div className="side-user-inner">
            <span className="side-avatar">PB</span>
            <div className="side-user-text">
              <b>Pavel</b>
              <small>Полный доступ</small>
            </div>
            <i className="ti ti-dots-vertical" aria-hidden="true" style={{ color: "#7f8794", fontSize: 17 }} />
          </div>
        </div>
      </aside>

      {/* ===== Основная колонка ===== */}
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-search">
            <i className="ti ti-search" aria-hidden="true" />
            <input placeholder="Поиск по номеру, клиенту…" />
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <div className="topbar-user">
              <i className="ti ti-user-circle" aria-hidden="true" style={{ fontSize: 20 }} />
              Pavel
              <i className="ti ti-chevron-down" aria-hidden="true" style={{ fontSize: 14 }} />
            </div>
          </div>
        </header>

        <main className="page">
          <Outlet />
        </main>

        <footer className="ds-dark app-footer">
          <span className="side-mark" style={{ width: 34, height: 34, fontSize: 17 }}>
            <i className="ti ti-building-skyscraper" aria-hidden="true" />
          </span>
          <div style={{ textAlign: "center", flex: 1, minWidth: 200 }}>
            <div className="fw8" style={{ color: "#fff" }}>Телефония · АрендаСтройТюмень</div>
            <div className="f12" style={{ color: "#7f8794" }}>Внутренняя система ©</div>
          </div>
          <div className="row gap-8" style={{ flex: "none" }}>
            <a className="btn btn--ghost btn--sm" href="https://plntr.store" target="_blank" rel="noopener">САЙТ</a>
            <a className="btn btn--ghost btn--sm" href="https://plntr.store" target="_blank" rel="noopener">CRM</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
