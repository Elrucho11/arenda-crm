import { useState } from "react";
import { PageHeader, Badge, IconCircle } from "../components/ui";
import { operators, equipment } from "../data/mock";
import { money } from "../lib/format";

// ===== Кастомный переключатель =====
function Toggle({
  label, hint, defaultOn = false, on, onChange,
}: {
  label?: string;
  hint?: string;
  defaultOn?: boolean;
  on?: boolean;
  onChange?: (next: boolean) => void;
}) {
  const [innerOn, setInnerOn] = useState(defaultOn);
  const isControlled = on !== undefined;
  const value = isControlled ? on : innerOn;

  const toggle = () => {
    const next = !value;
    if (!isControlled) setInnerOn(next);
    onChange?.(next);
  };

  const pill = (
    <span
      role="switch"
      aria-checked={value}
      onClick={(e) => {
        // когда переключатель внутри <label>, клик по самому label уже сработает — не дублируем
        if ((e.currentTarget.parentElement as HTMLElement | null)?.tagName !== "LABEL") {
          e.stopPropagation();
          toggle();
        }
      }}
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        background: value ? "var(--orange)" : "#cfd2d8",
        flex: "none",
        position: "relative",
        transition: "background .18s ease",
        marginTop: 1,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: value ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "var(--white)",
          boxShadow: "0 1px 3px rgba(0,0,0,.25)",
          transition: "left .18s ease",
        }}
      />
    </span>
  );

  // Без подписи — просто переключатель (для таблицы)
  if (!label) {
    return (
      <span
        role="switch"
        aria-checked={value}
        onClick={toggle}
        style={{
          width: 40,
          height: 22,
          borderRadius: 999,
          background: value ? "var(--orange)" : "#cfd2d8",
          flex: "none",
          position: "relative",
          display: "inline-block",
          transition: "background .18s ease",
          cursor: "pointer",
          verticalAlign: "middle",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: value ? 20 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "var(--white)",
            boxShadow: "0 1px 3px rgba(0,0,0,.25)",
            transition: "left .18s ease",
          }}
        />
      </span>
    );
  }

  return (
    <label
      className="row gap-12"
      onClick={toggle}
      style={{ alignItems: "flex-start", cursor: "pointer", padding: "8px 0" }}
    >
      {pill}
      <span>
        <span className="f14 fw7">{label}</span>
        {hint && (
          <span className="text-dim f13" style={{ display: "block", marginTop: 2 }}>
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}

// ===== Шапка секции =====
function SectionHead({
  icon, title, badge,
}: {
  icon: string;
  title: string;
  badge?: { tone: "orange" | "green" | "red" | "amber" | "blue" | "gray"; text: string };
}) {
  return (
    <div className="row between mb-16">
      <div className="row gap-12">
        <IconCircle icon={icon} tone="orange" />
        <span className="f15 fw8">{title}</span>
      </div>
      {badge && <Badge tone={badge.tone}>{badge.text}</Badge>}
    </div>
  );
}

// ===== Пользователи (локальные данные) =====
type UserStatus = "Активен" | "Ожидание" | "Недоступно";
interface UserRow {
  name: string;
  email: string;
  full: boolean;
  status: UserStatus;
}

const SEED_USERS: UserRow[] = [
  { name: "Александр", email: "arendastroytyumen@gmail.com", full: true, status: "Активен" },
  { name: "Павел", email: "batalovpavel009@gmail.com", full: true, status: "Активен" },
  { name: "Алексей", email: "batalov2509@gmail.com", full: true, status: "Активен" },
  { name: "Лёха", email: "batalov25509@gmail.com", full: false, status: "Ожидание" },
  { name: "Valery Valeryevich", email: "lolx32@mail.ru", full: false, status: "Ожидание" },
];

function statusTone(s: UserStatus): "green" | "amber" | "gray" {
  if (s === "Активен") return "green";
  if (s === "Ожидание") return "amber";
  return "gray";
}

export default function Settings() {
  // --- Интеграция с основным CRM ---
  const [crmOn, setCrmOn] = useState(false);

  // --- Управление правами пользователей ---
  const [users, setUsers] = useState<UserRow[]>(SEED_USERS);
  const [userQuery, setUserQuery] = useState("");

  const toggleFull = (email: string) =>
    setUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, full: !u.full } : u)),
    );

  const approveUser = (email: string) =>
    setUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, status: "Активен" } : u)),
    );

  const q = userQuery.trim().toLowerCase();
  const visibleUsers = q
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      )
    : users;

  return (
    <div>
      <PageHeader eyebrow="Конфигурация" title="Настройки" />

      <div className="grid grid-2 gap-16 mt-20">
        {/* 1. Синхронизация контактов */}
        <div className="card card--pad">
          <SectionHead icon="address-book" title="Синхронизация контактов" />
          <button className="btn btn--primary">
            <i className="ti ti-refresh" aria-hidden="true" /> Синхронизировать
          </button>
          <div className="text-dim f13 mt-12">
            Подтянуть контакты и номера из Телфин в базу клиентов.
          </div>
        </div>

        {/* 2. Настройки звонков */}
        <div className="card card--pad">
          <SectionHead icon="phone-check" title="Настройки звонков" />
          <div className="field-label">Жёлтый статус звонка (сек)</div>
          <input className="input" type="number" defaultValue={10} style={{ maxWidth: 160 }} />
          <div className="text-dim f13 mt-12">
            Звонки, обработанные дольше этого времени, помечаются жёлтым (требуют внимания).
          </div>
        </div>

        {/* 3. Интеграция с основным CRM */}
        <div className="card card--pad">
          <SectionHead
            icon="plug-connected"
            title="Интеграция с основным CRM"
            badge={{ tone: "gray", text: "Выкл" }}
          />
          <Toggle label="Включить интеграцию" on={crmOn} onChange={setCrmOn} />
          <div className="mt-12">
            <div className="field-label">API-ключ CRM</div>
            <input className="input" type="password" placeholder="Введите API-ключ" />
          </div>
          <div className="mt-12">
            <div className="field-label">Базовый URL CRM</div>
            <input className="input" defaultValue="https://plntr.store" />
          </div>
        </div>

        {/* 4. Настройка расчётов */}
        <div className="card card--pad">
          <SectionHead icon="discount" title="Настройка расчётов" />
          <div className="grid grid-2 gap-12">
            <div>
              <div className="field-label">Диапазон скидки строительных лесов (%)</div>
              <input className="input" type="number" defaultValue={0} />
            </div>
            <div>
              <div className="field-label">Диапазон скидки вышек-тур (%)</div>
              <input className="input" type="number" defaultValue={0} />
            </div>
          </div>
          <div className="text-dim f13 mt-12">
            Максимальная скидка, доступная в калькуляторе.
          </div>
        </div>
      </div>

      {/* 5. Сохранить настройки */}
      <div className="row mt-20">
        <button className="btn btn--primary">
          <i className="ti ti-device-floppy" aria-hidden="true" /> Сохранить настройки
        </button>
      </div>

      {/* 6. Управление правами пользователей */}
      <div className="card card--pad mt-20">
        <SectionHead icon="users-group" title="Управление правами пользователей" />
        <input
          className="input mb-16"
          placeholder="Поиск пользователя"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <table className="tbl">
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Email</th>
              <th>Полный доступ</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((u) => (
              <tr key={u.email}>
                <td className="fw7">{u.name}</td>
                <td className="text-dim">{u.email}</td>
                <td>
                  <Toggle on={u.full} onChange={() => toggleFull(u.email)} />
                </td>
                <td>
                  <div className="row gap-8 wrap" style={{ alignItems: "center" }}>
                    <Badge tone={statusTone(u.status)}>{u.status}</Badge>
                    {u.status === "Ожидание" && (
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => approveUser(u.email)}
                      >
                        Одобрить
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Наши интеграции ===== */}
      <div className="grid grid-2 gap-16 mt-20">
        {/* 7. Интеграция Телфин */}
        <div className="card card--pad">
          <SectionHead
            icon="phone"
            title="Интеграция Телфин"
            badge={{ tone: "green", text: "Подключено" }}
          />
          <div className="grid grid-2 gap-12">
            <div>
              <div className="field-label">Client ID</div>
              <input className="input" defaultValue="telphin_8842" />
            </div>
            <div>
              <div className="field-label">API-ключ</div>
              <input className="input" type="password" defaultValue="••••••••••" />
            </div>
            <div>
              <div className="field-label">SIP / номер</div>
              <input className="input" defaultValue="+7 (3452) 49-25-25" />
            </div>
            <div>
              <div className="field-label">Webhook URL</div>
              <input
                className="input"
                readOnly
                value="https://calls.plntr.store/api/telphin/webhook"
              />
            </div>
          </div>
          <button className="btn btn--primary btn--sm mt-16">
            <i className="ti ti-refresh" aria-hidden="true" /> Проверить соединение
          </button>
        </div>

        {/* 8. Речевая аналитика */}
        <div className="card card--pad">
          <SectionHead
            icon="microphone-2"
            title="Речевая аналитика"
            badge={{ tone: "amber", text: "Скоро" }}
          />
          <Toggle label="Авто-расшифровка разговоров" defaultOn={false} />
          <Toggle label="Авто-теги из речи" defaultOn={false} />
          <Toggle label="Резюме звонка" defaultOn={false} />
          <div className="text-dim f13 mt-12">
            Подключается отдельной услугой в Телфин. Поля под расшифровку уже заложены в карточке
            клиента.
          </div>
        </div>

        {/* 9. Операторы */}
        <div className="card card--pad">
          <SectionHead icon="headset" title="Операторы" />
          <table className="tbl">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Внутр. номер</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {operators.map((name, i) => (
                <tr key={name}>
                  <td className="fw7">{name}</td>
                  <td>
                    <input
                      className="input"
                      defaultValue={String(101 + i)}
                      style={{ maxWidth: 90 }}
                    />
                  </td>
                  <td>
                    <Badge tone="green">Активен</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 10. Тарифы и номенклатура */}
        <div className="card card--pad">
          <SectionHead icon="tags" title="Тарифы и номенклатура" />
          <table className="tbl">
            <thead>
              <tr>
                <th>Позиция</th>
                <th>Категория</th>
                <th>Цена/сутки</th>
                <th>Залог</th>
                <th>Склад</th>
              </tr>
            </thead>
            <tbody>
              {equipment.slice(0, 8).map((e) => (
                <tr key={e.id}>
                  <td className="fw7">{e.name}</td>
                  <td>
                    <Badge tone="gray">{e.category}</Badge>
                  </td>
                  <td>{money(e.pricePerDay)}</td>
                  <td>{money(e.deposit)}</td>
                  <td>
                    {e.stockAvailable}/{e.stockTotal} {e.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
