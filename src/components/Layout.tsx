import { NavLink, Outlet, Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const NAV = [
  { to: "/", label: "Панель", end: true },
  { to: "/calls", label: "Вызовы" },
  { to: "/clients", label: "Клиенты" },
  { to: "/deals", label: "Сделки" },
  { to: "/calculations", label: "Расчёты" },
  { to: "/delivery", label: "Доставка" },
  { to: "/blacklist", label: "Чёрный список" },
  { to: "/attributes", label: "Атрибуты" },
  { to: "/settings", label: "Настройки" },
];

export default function Layout() {
  return (
    <div>
      <header className="topbar">
        <Link to="/" className="brand" aria-label="АрендаСтрой CRM">
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
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
