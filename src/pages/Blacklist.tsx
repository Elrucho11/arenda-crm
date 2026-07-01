import { useMemo, useState } from "react";
import { blacklist as blacklistMock, dashboardStats } from "../data/mock";
import type { BlacklistEntry, BlacklistReason, BlacklistDuration } from "../types";
import { PageHeader, Stat, Badge, Modal } from "../components/ui";
import { dateShort, timeHM, phoneFmt, daysLeft } from "../lib/format";

const REASONS: BlacklistReason[] = [
  "Не указана",
  "Иногородний",
  "Осмотр/кинокрю",
  "Спам",
  "Неадекват",
  "Разовый осмотр",
];

const FILTERS = ["Все", "Иногородний", "Осмотр/кинокрю", "Спам", "Неадекват"] as const;

type ReasonTone = "orange" | "green" | "red" | "amber" | "blue" | "gray";

function reasonTone(reason: BlacklistReason): ReasonTone {
  switch (reason) {
    case "Иногородний":
      return "amber";
    case "Спам":
    case "Неадекват":
      return "red";
    case "Осмотр/кинокрю":
      return "blue";
    case "Не указана":
      return "gray";
    default:
      return "gray";
  }
}

const DUR_OPTIONS = ["Навсегда", "На неделю", "На месяц"] as const;
type DurOption = (typeof DUR_OPTIONS)[number];

function untilFromOption(opt: DurOption): BlacklistDuration {
  if (opt === "Навсегда") return "permanent";
  const d = new Date("2026-06-26T00:00:00");
  d.setDate(d.getDate() + (opt === "На неделю" ? 7 : 30));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Blacklist() {
  const [entries, setEntries] = useState<BlacklistEntry[]>(blacklistMock);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Все");
  const [showAdd, setShowAdd] = useState(false);

  // Поля формы добавления
  const [fPhone, setFPhone] = useState("");
  const [fLabel, setFLabel] = useState("");
  const [fReason, setFReason] = useState<BlacklistReason>("Не указана");
  const [fDur, setFDur] = useState<DurOption>("Навсегда");
  const [fSync, setFSync] = useState(true);

  const syncedCount = useMemo(() => entries.filter((e) => e.syncedTelphin).length, [entries]);
  const permanentCount = useMemo(() => entries.filter((e) => e.until === "permanent").length, [entries]);
  const tempCount = useMemo(() => entries.filter((e) => e.until !== "permanent").length, [entries]);

  const filtered = useMemo(
    () => entries.filter((e) => filter === "Все" || e.reason === filter),
    [entries, filter]
  );

  function unblock(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function resetForm() {
    setFPhone("");
    setFLabel("");
    setFReason("Не указана");
    setFDur("Навсегда");
    setFSync(true);
  }

  function submitAdd() {
    const entry: BlacklistEntry = {
      id: `b-${Date.now()}`,
      phone: fPhone.trim() || "+70000000000",
      label: fLabel.trim() || "Без метки",
      addedBy: "Александр",
      addedAt: new Date().toISOString(),
      reason: fReason,
      until: untilFromOption(fDur),
      syncedTelphin: fSync,
    };
    setEntries((prev) => [entry, ...prev]);
    resetForm();
    setShowAdd(false);
  }

  return (
    <div>
      <PageHeader eyebrow="Антиспам" title="Чёрный" accent="список">
        <button className="btn btn--dark" onClick={() => setShowAdd(true)}>
          <i className="ti ti-ban" aria-hidden="true" /> Добавить в чёрный список
        </button>
        <button className="btn btn--primary">
          <i className="ti ti-refresh" aria-hidden="true" /> Проверка Telphin
        </button>
      </PageHeader>

      <div className="grid grid-4 mb-20">
        <Stat tone="red" icon="ban" label="Всего в чёрном списке" value={dashboardStats.blacklistCount} />
        <Stat tone="green" icon="cloud-check" label="Синхронизировано с Telphin" value={syncedCount} />
        <Stat tone="amber" icon="lock" label="Навсегда" value={permanentCount} />
        <Stat tone="orange" icon="clock" label="Временных" value={tempCount} />
      </div>

      <div className="row gap-8 wrap mb-12">
        {FILTERS.map((f) => (
          <button key={f} className={`chip ${filter === f ? "is-active" : ""}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
        <span className="text-dim f13" style={{ marginLeft: "auto", alignSelf: "center" }}>
          Показано <b style={{ color: "var(--text)" }}>{filtered.length}</b>
        </span>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 110 }}>Когда</th>
              <th>Кого</th>
              <th style={{ width: 130 }}>Кем</th>
              <th style={{ width: 160 }}>Причина</th>
              <th style={{ width: 230 }}>Блокировка</th>
              <th style={{ width: 90 }}>Telphin</th>
              <th style={{ width: 150, textAlign: "right" }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td>
                  <div className="fw7">{timeHM(e.addedAt)}</div>
                  <div className="text-dim f12">{dateShort(e.addedAt)}</div>
                </td>
                <td>
                  <div className="fw7">{e.label}</div>
                  <div className="text-dim f12">{phoneFmt(e.phone)}</div>
                </td>
                <td>{e.addedBy}</td>
                <td>
                  <Badge tone={reasonTone(e.reason)}>{e.reason}</Badge>
                </td>
                <td>
                  {e.until === "permanent" ? (
                    <Badge tone="red">навсегда</Badge>
                  ) : (
                    <div>
                      <div className="f13">Заблокирован до {dateShort(e.until)}</div>
                      <div className="text-dim f12">(осталось: {daysLeft(e.until)} дн.)</div>
                    </div>
                  )}
                </td>
                <td>
                  {e.syncedTelphin ? (
                    <Badge tone="green">
                      <i className="ti ti-cloud-check" aria-hidden="true" /> ✓
                    </Badge>
                  ) : (
                    <Badge tone="gray">—</Badge>
                  )}
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn--outline btn--sm" onClick={() => unblock(e.id)}>
                    <i className="ti ti-lock-open" aria-hidden="true" /> Разблокировать
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal
          title="Добавить в чёрный список"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <button className="btn btn--ghost" onClick={() => setShowAdd(false)}>
                Отмена
              </button>
              <button className="btn btn--primary" onClick={submitAdd}>
                <i className="ti ti-ban" aria-hidden="true" /> Заблокировать
              </button>
            </>
          }
        >
          <div className="grid grid-2 gap-12">
            <div>
              <label className="field-label">Телефон</label>
              <input
                className="input"
                placeholder="+7 900 000-00-00"
                value={fPhone}
                onChange={(ev) => setFPhone(ev.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Метка / что было</label>
              <input
                className="input"
                placeholder="Кратко о звонке"
                value={fLabel}
                onChange={(ev) => setFLabel(ev.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Причина</label>
              <select
                className="input"
                value={fReason}
                onChange={(ev) => setFReason(ev.target.value as BlacklistReason)}
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Срок</label>
              <select
                className="input"
                value={fDur}
                onChange={(ev) => setFDur(ev.target.value as DurOption)}
              >
                {DUR_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="row gap-8 mt-16 f13" style={{ cursor: "pointer", alignItems: "center" }}>
            <input type="checkbox" checked={fSync} onChange={(ev) => setFSync(ev.target.checked)} />
            <span>Синхронизировать с Telphin</span>
          </label>
        </Modal>
      )}
    </div>
  );
}
