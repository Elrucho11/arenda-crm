import { NavLink, Outlet, Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

// Пункты меню — один в один с боевым сайтом
const NAV = [
  { to: "/", label: "Панель", end: true },
  { to: "/calls", label: "Вызовы" },
  { to: "/attributes", label: "Атрибуты звонков" },
  { to: "/clients", label: "Клиентская база" },
  { to: "/blacklist", label: "Черный список" },
  { to: "/calculations", label: "Расчеты" },
  { to: "/delivery", label: "Доставка" },
  { to: "/settings", label: "Настройки" },
];

export default function Layout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="topbar">
        <Link to="/" className="brand" aria-label="АрендаСтройТюмень">
          <Logo height={30} />
        </Link>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => (isActive ? "active" : "")}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="row gap-16" style={{ flex: "none" }}>
          <ThemeToggle />
          <div className="topbar-user">
            <i className="ti ti-user-circle" aria-hidden="true" style={{ fontSize: 20 }} />
            Pavel
            <i className="ti ti-chevron-down" aria-hidden="true" style={{ fontSize: 14 }} />
          </div>
        </div>
      </header>

      <main className="page" style={{ flex: 1, width: "100%" }}>
        <Outlet />
      </main>

      {/* Подвал — как на проде */}
      <footer className="ds-dark" style={{ marginTop: 40 }}>
        <div className="page row between wrap gap-16" style={{ paddingTop: 22, paddingBottom: 22, alignItems: "center" }}>
          <span className="brand-logo" style={{ flex: "none" }}><i className="ti ti-building-skyscraper" aria-hidden="true" /></span>
          <div style={{ textAlign: "center", flex: 1, minWidth: 200 }}>
            <div className="fw8" style={{ color: "#fff" }}>Телефония · АрендаСтройТюмень</div>
            <div className="f12" style={{ color: "#aeb2bd" }}>Внутренняя система ©</div>
          </div>
          <div className="row gap-8" style={{ flex: "none" }}>
            <a className="btn btn--ghost btn--sm" href="https://plntr.store" target="_blank" rel="noopener">САЙТ</a>
            <a className="btn btn--ghost btn--sm" href="https://plntr.store" target="_blank" rel="noopener">CRM</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
