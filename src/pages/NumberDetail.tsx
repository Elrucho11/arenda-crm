import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ProdCall } from "../data/mock";
import { callsForNumber, employees, attributes, attrById, blacklistReasons } from "../data/mock";
import { phoneHeader, phoneFmt, timeHM, dateShort } from "../lib/format";
import { Modal } from "../components/ui";

// Длительность как на проде: «1м 57сек.» / «5сек.»
function durText(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return m > 0 ? `${m}м ${s}сек.` : `${s}сек.`;
}

// Формат mm:ss для плеера
function clock(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Цвет кружка-счётчика (как в общей ленте)
function badgeColor(c: ProdCall): string {
  if (c.status !== "Отвечен") return "var(--red)";
  if (c.talkSec > 0 && c.talkSec < 10) return "#e3c000";
  if (c.count === 1) return "var(--green)";
  return "var(--dark)";
}

const SPEEDS = [1, 1.25, 1.5, 1.75, 2] as const;

// Ремоунт на смену номера — сбрасывает локальное состояние (атрибуты/раскрытия/модалки)
export default function NumberDetail() {
  const { phone = "" } = useParams();
  return <NumberDetailInner key={phone} phone={phone} />;
}

function NumberDetailInner({ phone }: { phone: string }) {
  const navigate = useNavigate();

  const rows = useMemo(() => callsForNumber(phone), [phone]);
  const label = useMemo(() => rows.find((c) => c.clientLabel)?.clientLabel, [rows]);

  // Атрибуты номера — объединение атрибутов всех звонков + правки локально
  const initialAttrs = useMemo(
    () => Array.from(new Set(rows.flatMap((c) => c.attributeIds))),
    [rows],
  );
  const [numAttrs, setNumAttrs] = useState<string[]>(initialAttrs);
  const [attrPicker, setAttrPicker] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showBlock, setShowBlock] = useState(false);

  // Исходный номер как в данных (сохраняет символы вроде «*» у нестандартных),
  // чтобы шапка, строки и действия показывали один и тот же номер.
  const rawPhone = rows[0]?.clientPhone ?? phone;
  const display = phoneHeader(rawPhone);
  const q = encodeURIComponent(display);

  // Назад: если это первый экран в истории (прямая ссылка/обновление) — на список.
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1); else navigate("/calls");
  };

  return (
    <div>
      {/* Шапка: назад + номер + действия */}
      <div className="page-head">
        <div>
          <span className="eyebrow">История номера</span>
          <h1 className="page-title">Звонки номера: <span>{display}</span></h1>
          {label && <div className="text-dim f13 mt-8" style={{ maxWidth: 560 }}>{label}</div>}
        </div>
        <div className="row gap-8 wrap">
          <button className="btn btn--outline btn--sm" onClick={goBack}>
            <i className="ti ti-arrow-left" aria-hidden="true" /> Назад
          </button>
          <a className="btn btn--outline btn--sm" href={`https://www.google.com/search?q=${q}`} target="_blank" rel="noreferrer">
            <i className="ti ti-brand-google" aria-hidden="true" /> Google
          </a>
          <a className="btn btn--outline btn--sm" href={`https://yandex.ru/search/?text=${q}`} target="_blank" rel="noreferrer">
            <i className="ti ti-search" aria-hidden="true" /> Yandex
          </a>
          <button className="btn btn--primary btn--sm" onClick={() => setShowCreate(true)}>
            <i className="ti ti-user-plus" aria-hidden="true" /> Создать клиента
          </button>
          <button className="btn btn--danger btn--sm" onClick={() => setShowBlock(true)}>
            <i className="ti ti-ban" aria-hidden="true" /> В черный список
          </button>
        </div>
      </div>

      {/* Атрибуты номера */}
      <div className="card card--pad mb-16">
        <div className="row between" style={{ alignItems: "center" }}>
          <span className="fw8 f15">Атрибуты номеров</span>
          <button className="icon-btn" aria-label="Добавить атрибут" title="Добавить атрибут" onClick={() => setAttrPicker(true)}>
            <i className="ti ti-plus" aria-hidden="true" />
          </button>
        </div>
        <div className="row gap-6 wrap mt-12">
          {numAttrs.length ? numAttrs.map((id) => {
            const a = attrById(id);
            if (!a) return null;
            return (
              <span key={id} className="badge" style={{ background: a.color, color: "#fff" }}>
                {a.name}
                <button
                  onClick={() => setNumAttrs((s) => s.filter((x) => x !== id))}
                  aria-label={`Убрать ${a.name}`}
                  style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, marginLeft: 2, display: "grid", placeItems: "center" }}
                >
                  <i className="ti ti-x" aria-hidden="true" style={{ fontSize: 12 }} />
                </button>
              </span>
            );
          }) : <span className="text-dim f13">Атрибуты не назначены</span>}
        </div>
      </div>

      {/* История звонков по номеру */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card--pad" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="row gap-8" style={{ alignItems: "center" }}>
            <span className="fw8 f15">Звонки по номеру</span>
            <span className="badge badge--gray">{rows.length}</span>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 110 }}>Дата/время</th>
              <th>Номер</th>
              <th>Кому</th>
              <th style={{ width: 180 }}>Статус/направление</th>
              <th style={{ width: 160 }}>Длительность</th>
              <th style={{ width: 44 }} aria-label="Развернуть" />
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((c) => <HistoryRow key={c.id} call={c} />) : (
              <tr><td colSpan={6} className="text-dim" style={{ textAlign: "center", padding: 36 }}>Звонков по этому номеру не найдено</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Модалка выбора атрибутов */}
      {attrPicker && (
        <Modal title="Атрибуты номера" onClose={() => setAttrPicker(false)}
          footer={<button className="btn btn--primary" onClick={() => setAttrPicker(false)}>Готово</button>}>
          <div className="row gap-8 wrap">
            {attributes.map((a) => {
              const on = numAttrs.includes(a.id);
              return (
                <button key={a.id} className="chip" onClick={() => setNumAttrs((s) => on ? s.filter((x) => x !== a.id) : [...s, a.id])}
                  style={on ? { background: a.color, borderColor: a.color, color: "#fff" } : undefined}>
                  {a.name}
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {/* Модалка создания клиента */}
      {showCreate && <CreateClientModal phone={rawPhone} onClose={() => setShowCreate(false)} />}

      {/* Модалка добавления в чёрный список */}
      {showBlock && <BlockModal phone={rawPhone} onClose={() => setShowBlock(false)} />}
    </div>
  );
}

// ===== Строка истории с раскрытием (запись, действия, комментарий) =====
function HistoryRow({ call }: { call: ProdCall }) {
  const [open, setOpen] = useState(false);
  const emp = employees.find((e) => e.name === call.operator);
  const ourNumber = call.ourNumberOverride ?? emp?.number;
  const incoming = call.direction === "incoming";
  const statusColor = call.status === "Отвечен" ? "var(--green)" : "var(--red)";

  return (
    <>
      <tr onClick={() => setOpen((o) => !o)} style={{ cursor: "pointer" }}
        className={open ? "is-selected" : ""}
        role="button" tabIndex={0} aria-expanded={open}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); } }}>
        <td style={{ whiteSpace: "nowrap" }}>
          <div className="fw7">{timeHM(call.dateTime)}</div>
          <div className="text-dim f12">{dateShort(call.dateTime)}</div>
        </td>
        <td>
          <div className="fw7">{phoneFmt(call.clientPhone)}</div>
          {call.transferNumber && (
            <div className="row gap-6 f12" style={{ color: "var(--green)", marginTop: 2 }}>
              <i className="ti ti-arrows-transfer-up" aria-hidden="true" style={{ fontSize: 13 }} />{call.transferNumber}
            </div>
          )}
        </td>
        <td>
          {call.toExtension ? <div className="fw7">Доб. {call.toExtension}</div> : <div className="fw7">{emp?.fullName ?? call.operator}</div>}
          {ourNumber && <div className="text-dim f12">{ourNumber}</div>}
        </td>
        <td>
          <div className="row gap-10">
            <div>
              <div style={{ color: statusColor, fontWeight: 700, fontSize: 13 }}>{call.status}</div>
              <div className="row gap-6 text-dim f12" style={{ marginTop: 2 }}>
                <i className={`ti ti-phone-${incoming ? "incoming" : "outgoing"}`} aria-hidden="true" style={{ fontSize: 13 }} />
                {incoming ? "Входящий" : "Исходящий"}
              </div>
            </div>
            <span className="count-badge" style={{ background: badgeColor(call), color: "#fff" }} title="Всего звонков с контактом">{call.count}</span>
          </div>
        </td>
        <td style={{ whiteSpace: "nowrap" }}>
          {call.talkSec > 0 && <div className="fw7 f13">Разговор: {durText(call.talkSec)}</div>}
          <div className="text-dim f12" style={{ marginTop: 2 }}>Ожидание: {call.waitSec}с</div>
        </td>
        <td style={{ textAlign: "center", color: "var(--text-dim)" }}>
          <i className={`ti ti-chevron-${open ? "up" : "down"}`} aria-hidden="true" />
        </td>
      </tr>
      {open && (
        <tr className="is-selected">
          <td colSpan={6} style={{ padding: 0 }}>
            <CallDetailPanel call={call} />
          </td>
        </tr>
      )}
    </>
  );
}

function CallDetailPanel({ call }: { call: ProdCall }) {
  const [speed, setSpeed] = useState(1);
  const [comment, setComment] = useState("");
  const [callback, setCallback] = useState(false);
  const [important, setImportant] = useState(false);
  const [order, setOrder] = useState(false);
  const [addedCalc, setAddedCalc] = useState(false);
  const [saved, setSaved] = useState(false);

  const noRecording = call.talkSec === 0;

  return (
    <div style={{ padding: "18px 16px", display: "grid", gap: 18, gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr)" }}>
      {/* Запись разговора */}
      <div>
        <div className="section-label mb-8">Запись разговора</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--gray-light)", border: "1px solid var(--line)", borderRadius: 999, padding: "8px 14px" }}>
          <button type="button" disabled aria-label="Воспроизвести запись"
            title="Запись подтянется после подключения Telphin"
            style={{ background: "none", border: "none", padding: 0, cursor: "not-allowed", display: "grid", placeItems: "center" }}>
            <i className="ti ti-player-play-filled" aria-hidden="true" style={{ fontSize: 18, color: "var(--text-dim)" }} />
          </button>
          <span className="text-dim f12" style={{ minWidth: 74 }}>0:00 / {clock(call.talkSec)}</span>
          <div style={{ flex: 1, height: 4, borderRadius: 4, background: "var(--line)" }} />
          <i className="ti ti-volume" aria-hidden="true" style={{ fontSize: 16, color: "var(--text-dim)" }} />
        </div>
        <div className="row gap-6 wrap mt-12" style={{ alignItems: "center" }}>
          <span className="text-dim f12">Скорость:</span>
          {SPEEDS.map((s) => (
            <button key={s} className={`chip ${speed === s ? "is-active" : ""}`} style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setSpeed(s)}>{s}×</button>
          ))}
          <button className="btn btn--outline btn--sm" style={{ marginLeft: "auto" }} disabled={noRecording}>
            <i className="ti ti-download" aria-hidden="true" /> Скачать запись
          </button>
        </div>
        <div className="text-dim f12 mt-8">
          {noRecording ? "Разговора не было — записи нет." : "Запись подтянется из телефонии Telphin после подключения."}
        </div>
      </div>

      {/* Действия */}
      <div>
        <div className="section-label mb-8">Действия</div>
        <div className="grid" style={{ gap: 8 }}>
          <button className={`btn btn--sm ${callback ? "btn--primary" : "btn--outline"}`} style={{ justifyContent: "flex-start" }} onClick={() => setCallback((v) => !v)}>
            <i className="ti ti-phone-plus" aria-hidden="true" /> Отметить для перезвона
          </button>
          <button className={`btn btn--sm ${important ? "btn--primary" : "btn--outline"}`} style={{ justifyContent: "flex-start" }} onClick={() => setImportant((v) => !v)}>
            <i className={`ti ti-star${important ? "-filled" : ""}`} aria-hidden="true" /> Важный
          </button>
          <button className={`btn btn--sm ${order ? "btn--primary" : "btn--outline"}`} style={{ justifyContent: "flex-start" }} onClick={() => setOrder((v) => !v)}>
            <i className="ti ti-shopping-bag" aria-hidden="true" /> Заказ
          </button>
          <button className={`btn btn--sm ${addedCalc ? "btn--primary" : "btn--outline"}`} style={{ justifyContent: "flex-start" }} onClick={() => setAddedCalc((v) => !v)}>
            <i className={`ti ti-${addedCalc ? "check" : "file-plus"}`} aria-hidden="true" /> {addedCalc ? "Добавлено к расчёту" : "Добавить к расчету"}
          </button>
        </div>
      </div>

      {/* Комментарий */}
      <div>
        <div className="section-label mb-8">Комментарий</div>
        <textarea className="input" rows={4} placeholder="Заметка по звонку…" value={comment}
          onChange={(e) => { setComment(e.target.value); setSaved(false); }} style={{ resize: "vertical" }} />
        <button className="btn btn--primary btn--sm btn--block mt-8" onClick={() => setSaved(true)}>
          <i className={`ti ti-${saved ? "check" : "device-floppy"}`} aria-hidden="true" /> {saved ? "Сохранено" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}

// ===== Модалка «Создать клиента» (mock) =====
function CreateClientModal({ phone, onClose }: { phone: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  return (
    <Modal title="Создать клиента" onClose={onClose}
      footer={done ? <button className="btn btn--primary" onClick={onClose}>Закрыть</button> : (
        <>
          <button className="btn btn--outline" onClick={onClose}>Отмена</button>
          <button className="btn btn--primary" onClick={() => setDone(true)}>Создать</button>
        </>
      )}>
      {done ? (
        <div className="row gap-10" style={{ color: "var(--green)" }}>
          <i className="ti ti-circle-check" aria-hidden="true" style={{ fontSize: 22 }} />
          <span>Клиент создан (демо). Подключим базу — будет сохраняться.</span>
        </div>
      ) : (
        <div className="grid" style={{ gap: 12 }}>
          <div>
            <label className="field-label">Телефон</label>
            <input className="input" value={phoneFmt(phone)} readOnly />
          </div>
          <div>
            <label className="field-label">Имя / компания</label>
            <input className="input" autoFocus placeholder="Напр. Денис, ИП Попов" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
      )}
    </Modal>
  );
}

// ===== Модалка «В чёрный список» (mock) =====
function BlockModal({ phone, onClose }: { phone: string; onClose: () => void }) {
  const [reason, setReason] = useState<string>(blacklistReasons[0]);
  const [perm, setPerm] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <Modal title="В чёрный список" onClose={onClose}
      footer={done ? <button className="btn btn--primary" onClick={onClose}>Закрыть</button> : (
        <>
          <button className="btn btn--outline" onClick={onClose}>Отмена</button>
          <button className="btn btn--danger" onClick={() => setDone(true)}><i className="ti ti-ban" aria-hidden="true" /> Заблокировать</button>
        </>
      )}>
      {done ? (
        <div className="row gap-10" style={{ color: "var(--red)" }}>
          <i className="ti ti-ban" aria-hidden="true" style={{ fontSize: 22 }} />
          <span>{phoneHeader(phone)} добавлен в ЧС (демо). Синхронизация с Telphin — после подключения.</span>
        </div>
      ) : (
        <div className="grid" style={{ gap: 12 }}>
          <div>
            <label className="field-label">Номер</label>
            <input className="input" value={phoneHeader(phone)} readOnly />
          </div>
          <div>
            <label className="field-label">Причина</label>
            <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
              {blacklistReasons.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <label className="row gap-8" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={perm} onChange={(e) => setPerm(e.target.checked)} />
            <span className="f13">Блокировать навсегда (иначе на 30 дней)</span>
          </label>
        </div>
      )}
    </Modal>
  );
}
