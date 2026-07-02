import { useState } from "react";
import { PageHeader, Badge, IconCircle } from "../components/ui";
import { accessUsers } from "../data/mock";
import type { AccessUser } from "../data/mock";

// ===== Кастомный переключатель (pill 44x24, оранжевый при on) =====
function Toggle({ on, onChange }: { on: boolean; onChange: (next: boolean) => void }) {
  return (
    <span
      role="switch"
      aria-checked={on}
      tabIndex={0}
      onClick={() => onChange(!on)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange(!on);
        }
      }}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        background: on ? "var(--orange)" : "var(--line)",
        display: "inline-flex",
        alignItems: "center",
        padding: 3,
        cursor: "pointer",
        flex: "none",
        transition: "background .2s ease",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,.25)",
          transform: on ? "translateX(20px)" : "translateX(0)",
          transition: "transform .2s ease",
        }}
      />
    </span>
  );
}

// ===== Заголовок карточки-секции =====
function CardTitle({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="row gap-10" style={{ alignItems: "center" }}>
      <IconCircle icon={icon} />
      <span className="fw8 f15">{text}</span>
    </div>
  );
}

export default function Settings() {
  // Синхронизация контактов
  const [syncing, setSyncing] = useState(false);
  const startSync = () => {
    if (syncing) return;
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1500);
  };

  // Интеграция с CRM
  const [crmEnabled, setCrmEnabled] = useState(false);

  // Сохранение настроек
  const [saved, setSaved] = useState(false);
  const saveSettings = () => {
    if (saved) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Управление правами пользователей
  const [users, setUsers] = useState<AccessUser[]>(accessUsers);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = users.filter(
    (u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );
  const toggleAccess = (id: string, next: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, fullAccess: next } : u)));
  };

  return (
    <div>
      <PageHeader eyebrow="Система" title="Настройки" accent="системы">
        <button className="btn btn--dark" onClick={() => history.back()}>
          <i className="ti ti-arrow-left" aria-hidden="true" /> Назад
        </button>
      </PageHeader>

      {/* Синхронизация контактов */}
      <div className="card card--pad mt-16">
        <CardTitle icon="refresh" text="Синхронизация контактов" />
        <div className="mt-12">
          <button className="btn btn--primary" onClick={startSync} disabled={syncing}>
            <i className="ti ti-refresh" aria-hidden="true" />{" "}
            {syncing ? "Синхронизация..." : "Синхронизировать"}
          </button>
        </div>
      </div>

      {/* Настройки звонков + Интеграция с CRM */}
      <div className="grid grid-2 mt-16">
        <div className="card card--pad">
          <CardTitle icon="phone" text="Настройки звонков" />
          <div className="mt-12">
            <label className="field-label">Желтый статус звонка (сек)</label>
            <input className="input" type="number" defaultValue={10} />
          </div>
        </div>

        <div className="card card--pad">
          <CardTitle icon="plug-connected" text="Интеграция с CRM" />
          <div className="row between mt-12" style={{ alignItems: "center" }}>
            <span className="text-dim">Включить интеграцию</span>
            <Toggle on={crmEnabled} onChange={setCrmEnabled} />
          </div>
          <div className="mt-12">
            <label className="field-label">API ключ CRM</label>
            <input className="input" type="password" placeholder="Введите API ключ" />
          </div>
          <div className="mt-12">
            <label className="field-label">Базовый URL CRM</label>
            <input className="input" type="text" defaultValue="https://plntr.store" />
          </div>
        </div>
      </div>

      {/* Настройка расчетов */}
      <div className="card card--pad mt-16">
        <CardTitle icon="calculator" text="Настройка расчетов" />
        <div className="grid grid-2 mt-12">
          <div>
            <label className="field-label">Диапазон скидки строительных лесов (%)</label>
            <input className="input" type="number" defaultValue={0} />
          </div>
          <div>
            <label className="field-label">Диапазон скидки вышек-тур (%)</label>
            <input className="input" type="number" defaultValue={0} />
          </div>
        </div>
      </div>

      {/* Сохранить */}
      <div className="mt-16">
        <button className="btn btn--primary btn--block" onClick={saveSettings}>
          {saved ? "Сохранено ✓" : "СОХРАНИТЬ НАСТРОЙКИ"}
        </button>
      </div>

      {/* Управление правами пользователей */}
      <div className="card card--pad mt-16">
        <CardTitle icon="users-group" text="Управление правами пользователей" />
        <div className="mt-12">
          <input
            className="input"
            type="text"
            placeholder="Поиск пользователя"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mt-12" style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>ПОЛЬЗОВАТЕЛЬ</th>
                <th>EMAIL</th>
                <th>ПОЛНЫЙ ДОСТУП</th>
                <th>СТАТУС</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="fw7" style={{ maxWidth: 260, overflowWrap: "anywhere" }}>
                      {u.name}
                    </div>
                  </td>
                  <td>
                    <span className="f13 text-dim">{u.email}</span>
                  </td>
                  <td>
                    {u.self ? (
                      <span className="text-dim f13">Недоступно</span>
                    ) : (
                      <Toggle on={u.fullAccess} onChange={(next) => toggleAccess(u.id, next)} />
                    )}
                  </td>
                  <td>
                    {u.fullAccess ? (
                      <Badge tone="green">Активен</Badge>
                    ) : (
                      <Badge tone="amber">Ожидание</Badge>
                    )}
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <span className="text-dim f13">Пользователи не найдены</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
