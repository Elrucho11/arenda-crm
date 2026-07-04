import { useState } from "react";
import { PageHeader, IconCircle } from "../components/ui";
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

interface Template {
  id: string;
  name: string;
  text: string;
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

  // Чат: приветствие Telegram
  const [greeting, setGreeting] = useState(
    "Здравствуйте! Спасибо, что написали — мы на связи и скоро ответим."
  );

  // Сохранение настроек
  const [saved, setSaved] = useState(false);
  const saveSettings = () => {
    if (saved) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Шаблоны быстрых ответов
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tplName, setTplName] = useState("");
  const [tplText, setTplText] = useState("");
  const addTemplate = () => {
    if (!tplName.trim() || !tplText.trim()) return;
    setTemplates((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: tplName.trim(), text: tplText.trim() },
    ]);
    setTplName("");
    setTplText("");
  };
  const removeTemplate = (id: string) =>
    setTemplates((prev) => prev.filter((t) => t.id !== id));

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
        <CardTitle icon="phone" text="Синхронизация контактов" />
        <div className="mt-12">
          <button className="btn btn--primary" onClick={startSync} disabled={syncing}>
            <i className="ti ti-refresh" aria-hidden="true" />{" "}
            {syncing ? "Синхронизация..." : "Синхронизировать"}
          </button>
        </div>
      </div>

      {/* Настройки звонков + Чат: приветствие Telegram */}
      <div className="grid grid-2 mt-16">
        <div className="card card--pad">
          <CardTitle icon="phone" text="Настройки звонков" />
          <div className="mt-12">
            <label className="field-label">Желтый статус звонка (сек)</label>
            <input className="input" type="number" defaultValue={10} />
          </div>
        </div>

        <div className="card card--pad">
          <CardTitle icon="brand-telegram" text="Чат: приветствие Telegram" />
          <div className="mt-12">
            <label className="field-label">Текст приветствия на /start</label>
            <textarea
              className="input"
              rows={3}
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              style={{ resize: "vertical" }}
            />
            <div className="text-dim f12 mt-8">
              Отправляется клиенту при первом запуске бота.
            </div>
          </div>
        </div>
      </div>

      {/* Интеграция с CRM + Настройка расчетов */}
      <div className="grid grid-2 mt-16">
        <div className="card card--pad">
          <CardTitle icon="link" text="Интеграция с CRM" />
          <div className="row between mt-12" style={{ alignItems: "center" }}>
            <span className="text-dim">Включить интеграцию</span>
            <Toggle on={crmEnabled} onChange={setCrmEnabled} />
          </div>
          <div className="mt-12">
            <label className="field-label">API ключ CRM</label>
            <input className="input" type="text" autoComplete="off" placeholder="Введите API ключ" disabled={!crmEnabled} />
          </div>
          <div className="mt-12">
            <label className="field-label">Базовый URL CRM</label>
            <input className="input" type="text" defaultValue="https://plntr.store" disabled={!crmEnabled} />
          </div>
        </div>

        <div className="card card--pad">
          <CardTitle icon="calculator" text="Настройка расчетов" />
          <div className="mt-12">
            <label className="field-label">Диапазон скидки строительных лесов (%)</label>
            <input className="input" type="number" defaultValue={0} />
          </div>
          <div className="mt-12">
            <label className="field-label">Диапазон скидки вышек-тур (%)</label>
            <input className="input" type="number" defaultValue={0} />
          </div>
        </div>
      </div>

      {/* Сохранить настройки */}
      <div className="row mt-16" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn--primary" onClick={saveSettings}>
          <i className={`ti ti-${saved ? "check" : "device-floppy"}`} aria-hidden="true" />{" "}
          {saved ? "Сохранено" : "Сохранить настройки"}
        </button>
      </div>

      {/* Шаблоны быстрых ответов */}
      <div className="card card--pad mt-16">
        <span className="fw8 f15">Шаблоны быстрых ответов</span>
        <div className="text-dim f13 mt-8">
          Доступны всем операторам в чате. Переменная <code>{"{имя}"}</code> подставит имя клиента.
        </div>

        {templates.length === 0 ? (
          <div className="text-dim f13 mt-12">Шаблонов пока нет.</div>
        ) : (
          <div className="grid mt-12" style={{ gap: 8 }}>
            {templates.map((t) => (
              <div key={t.id} className="row between" style={{
                alignItems: "flex-start", gap: 12,
                border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "10px 12px",
              }}>
                <div style={{ minWidth: 0 }}>
                  <div className="fw7 f13">{t.name}</div>
                  <div className="text-dim f13" style={{ overflowWrap: "anywhere" }}>{t.text}</div>
                </div>
                <button className="icon-btn" aria-label="Удалить шаблон" onClick={() => removeTemplate(t.id)}>
                  <i className="ti ti-trash" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="row gap-10 mt-12 wrap" style={{ alignItems: "stretch" }}>
          <input
            className="input"
            style={{ flex: "0 0 220px" }}
            placeholder="Название"
            value={tplName}
            onChange={(e) => setTplName(e.target.value)}
          />
          <input
            className="input"
            style={{ flex: "1 1 260px" }}
            placeholder="Текст шаблона (можно {имя})"
            value={tplText}
            onChange={(e) => setTplText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addTemplate(); }}
          />
          <button className="btn btn--primary" onClick={addTemplate}>
            <i className="ti ti-plus" aria-hidden="true" /> Добавить
          </button>
        </div>
      </div>

      {/* Управление правами пользователей */}
      <div className="card card--pad mt-16">
        <CardTitle icon="users-group" text="Управление правами пользователей" />
        <div className="mt-12">
          <label className="field-label">Поиск пользователя</label>
          <input
            className="input"
            type="text"
            placeholder="Введите имя или email пользователя"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mt-12" style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Email</th>
                <th style={{ width: 150, textAlign: "right" }}>Полный доступ</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="fw7" style={{ maxWidth: 320, overflowWrap: "anywhere" }}>
                      {u.name}
                    </div>
                  </td>
                  <td>
                    <span className="f13 text-dim">{u.email}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {u.self ? (
                      <span className="text-dim f13">Недоступно</span>
                    ) : (
                      <Toggle on={u.fullAccess} onChange={(next) => toggleAccess(u.id, next)} />
                    )}
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={3}>
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
