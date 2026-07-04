import { useRef, useState } from "react";
import { blacklist, blacklistAttempts } from "../data/mock";
import type { BlacklistEntry, BlacklistAttempt } from "../data/mock";
import { PageHeader, Modal, Empty } from "../components/ui";
import { dateShort, timeHM, phoneFmt } from "../lib/format";

const REASONS = ["Не указана", "Спам", "Иногородний", "Неадекват"] as const;
type Reason = (typeof REASONS)[number];

const TERMS = ["1 неделя", "1 месяц", "Навсегда"] as const;
type Term = (typeof TERMS)[number];

export default function Blacklist() {
  const [tab, setTab] = useState<"blocked" | "attempts">("blocked");
  const [entries, setEntries] = useState<BlacklistEntry[]>(blacklist);
  const [attempts, setAttempts] = useState<BlacklistAttempt[]>(blacklistAttempts);
  const [showAdd, setShowAdd] = useState(false);
  const [synced, setSynced] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TODAY = "2026-06-26";
  const expiredCount = entries.filter((e) => e.until !== "permanent" && e.until.slice(0, 10) < TODAY).length;
  function cleanupExpired() {
    setEntries((prev) => prev.filter((e) => e.until === "permanent" || e.until.slice(0, 10) >= TODAY));
  }
  function unblockAttempt(id: string) {
    setAttempts((prev) => prev.filter((a) => a.id !== id));
  }

  // Поля формы добавления
  const [fPhone, setFPhone] = useState("");
  const [fLabel, setFLabel] = useState("");
  const [fReason, setFReason] = useState<Reason>("Не указана");
  const [fTerm, setFTerm] = useState<Term>("Навсегда");

  function checkTelphin() {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    setSynced(true);
    syncTimer.current = setTimeout(() => setSynced(false), 2000);
  }

  function unblock(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function resetForm() {
    setFPhone("");
    setFLabel("");
    setFReason("Не указана");
    setFTerm("Навсегда");
  }

  function submitAdd() {
    let until: string = "permanent";
    let remains: string | undefined;
    if (fTerm === "1 неделя") {
      until = "2026-07-03T12:00:00";
      remains = "через неделю";
    } else if (fTerm === "1 месяц") {
      until = "2026-07-26T12:00:00";
      remains = "через месяц";
    }
    const entry: BlacklistEntry = {
      id: `b-${Date.now()}`,
      when: "2026-06-26T12:00:00",
      label: fLabel.trim() || "Без подписи",
      phone: fPhone.trim() || "+70000000000",
      by: "Pavel",
      reason: fReason,
      until,
      ...(remains ? { remains } : {}),
    };
    setEntries((prev) => [entry, ...prev]);
    resetForm();
    setShowAdd(false);
  }

  return (
    <div>
      <PageHeader eyebrow="Антиспам" title="Черный" accent="список">
        {tab === "blocked" && expiredCount > 0 && (
          <button className="btn btn--outline" onClick={cleanupExpired}>
            <i className="ti ti-trash" aria-hidden="true" /> Очистить истёкшие ({expiredCount})
          </button>
        )}
        <button className="btn btn--dark" onClick={() => setShowAdd(true)}>
          <i className="ti ti-ban" aria-hidden="true" /> Добавить в черный список
        </button>
        <button className="btn btn--primary" onClick={checkTelphin}>
          <i className={`ti ti-${synced ? "check" : "refresh"}`} aria-hidden="true" />{" "}
          {synced ? "Синхронизировано ✓" : "Проверка Telphin"}
        </button>
      </PageHeader>

      {/* Вкладки */}
      <div className="row gap-8 mb-16">
        <button className={`chip ${tab === "blocked" ? "is-active" : ""}`} onClick={() => setTab("blocked")}>
          Заблокированные <span className="badge badge--gray" style={{ marginLeft: 4 }}>{entries.length}</span>
        </button>
        <button className={`chip ${tab === "attempts" ? "is-active" : ""}`} onClick={() => setTab("attempts")}>
          Попытки дозвона <span className="badge badge--red" style={{ marginLeft: 4 }}>{attempts.length}</span>
        </button>
      </div>

      {tab === "attempts" && (
        <div className="card" style={{ overflow: "hidden" }}>
          {attempts.length === 0 ? <Empty icon="phone-off" text="Попыток дозвона нет" /> : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 130 }}>Последняя попытка</th>
                  <th>Кого</th>
                  <th style={{ width: 110, textAlign: "center" }}>Попыток</th>
                  <th style={{ width: 240 }}>Блокировка</th>
                  <th style={{ width: 160, textAlign: "right" }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="fw7">{timeHM(a.lastAttemptAt)}</div>
                      <div className="text-dim f12">{dateShort(a.lastAttemptAt)}</div>
                    </td>
                    <td>
                      <div className="fw7" style={{ lineHeight: 1.35 }}>{a.label}</div>
                      <div className="text-dim f12">{phoneFmt(a.phone)}</div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="count-badge" style={{ background: "var(--red)" }}>{a.attempts}</span>
                    </td>
                    <td>
                      {a.blockedUntil === "permanent"
                        ? <span className="f13" style={{ color: "var(--orange)", fontWeight: 700 }}>Заблокирован навсегда</span>
                        : <span className="f13" style={{ color: "var(--orange)", fontWeight: 700 }}>До: {dateShort(a.blockedUntil)}</span>}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn--dark btn--sm" onClick={() => unblockAttempt(a.id)}>Разблокировать</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "blocked" && (
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 100 }}>Когда</th>
              <th>Кого</th>
              <th style={{ width: 120 }}>Кем</th>
              <th style={{ width: 130 }}>Причина</th>
              <th style={{ width: 240 }}>Длительность</th>
              <th style={{ width: 160, textAlign: "right" }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td>
                  <div className="fw7">{timeHM(e.when)}</div>
                  <div className="text-dim f12">{dateShort(e.when)}</div>
                </td>
                <td>
                  <div className="fw7" style={{ lineHeight: 1.35 }}>{e.label}</div>
                  <div className="text-dim f12">{e.phone}</div>
                </td>
                <td className="f13">{e.by}</td>
                <td className="f13 fw7">{e.reason}</td>
                <td>
                  {e.until === "permanent" ? (
                    <span className="f13" style={{ color: "var(--orange)", fontWeight: 700 }}>
                      Заблокирован навсегда
                    </span>
                  ) : (
                    <div>
                      <span className="f13" style={{ color: "var(--orange)", fontWeight: 700 }}>
                        Заблокирован до: {timeHM(e.until)} {dateShort(e.until)}
                      </span>
                      {e.remains && (
                        <div className="text-dim f12">(осталось: {e.remains})</div>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn--dark btn--sm" onClick={() => unblock(e.id)}>
                    Разблокировать
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {showAdd && (
        <Modal
          title="Добавить в черный список"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <button className="btn btn--ghost" onClick={() => setShowAdd(false)}>
                Отмена
              </button>
              <button className="btn btn--primary" onClick={submitAdd}>
                Добавить
              </button>
            </>
          }
        >
          <div>
            <label className="field-label">Номер телефона</label>
            <input
              className="input"
              placeholder="+7 900 000-00-00"
              value={fPhone}
              onChange={(ev) => setFPhone(ev.target.value)}
            />
          </div>
          <div className="mt-12">
            <label className="field-label">Подпись / кто</label>
            <input
              className="input"
              placeholder="Кто это и что было"
              value={fLabel}
              onChange={(ev) => setFLabel(ev.target.value)}
            />
          </div>
          <div className="mt-12">
            <label className="field-label">Причина</label>
            <select
              className="input"
              value={fReason}
              onChange={(ev) => setFReason(ev.target.value as Reason)}
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="mt-12">
            <label className="field-label">Срок</label>
            <select
              className="input"
              value={fTerm}
              onChange={(ev) => setFTerm(ev.target.value as Term)}
            >
              {TERMS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
