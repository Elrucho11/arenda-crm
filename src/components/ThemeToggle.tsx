import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitial(): Theme {
  try {
    const saved = localStorage.getItem("crm-theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch { /* ignore */ }
  return "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("crm-theme", theme); } catch { /* ignore */ }
  }, [theme]);

  const dark = theme === "dark";
  return (
    <button
      className="theme-toggle"
      role="switch"
      aria-checked={dark}
      aria-label="Переключить тему"
      title={dark ? "Светлая тема" : "Тёмная тема"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <i className="ti ti-sun" aria-hidden="true" />
      <i className="ti ti-moon" aria-hidden="true" />
      <span className="theme-toggle__knob">
        <i className={dark ? "ti ti-moon" : "ti ti-sun"} aria-hidden="true" />
      </span>
    </button>
  );
}
