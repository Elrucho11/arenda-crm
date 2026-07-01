import { useMemo, useState } from "react";
import { calls, clients, operators, attrById } from "../data/mock";
import type { Call } from "../types";
import { PageHeader, Stat } from "../components/ui";
import CallDetail from "../components/CallDetail";
import { timeHM, dateShort, phoneFmt } from "../lib/format";

const STATUS_META: Record<string, { color: string; label: string }> = {
  answered: { color: "#1f7a3d", label: "Отвечен" },
  missed: { color: "#b3261e", label: "Пропущен" },
  "no-answer": { color: "#b3261e", label: "Без ответа" },
};

const OUR_LINE = "+7 (3452) 49-25-25";
const TODAY = "2026-06-26";
const PAGE_SIZE = 10;

type Party = { name: string; phone: string; isUs: boolean };

function parties(call: Call): { from: Party; to: Party } {
  const client = clients.find((c) => c.id === call.clientId);
  const them: Party = { name: client ? client.name : "Новый номер", phone: phoneFmt(call.phone), isUs: false };
  const us: Party = { name: call.operator, phone: OUR_LINE, isUs: true };
  return call.direction === "incoming" ? { from: them, to: us } : { from: us, to: them };
}

function durTalk(sec: number): string {
  if (sec <= 0) return "—";
  if (sec < 60) return `${sec}сек.`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m}м ${s}сек.` : `${m}м`;
}

function dayDiff(iso: string): number {
  const d = new Date(iso.slice(0, 10)).getTime();
  const t = new Date(TODAY).getTime();
  return Math.round((t - d) / 86400000);
}

export default function Calls() {
  const [op, setOp] = useState<string>("Все");
  const [showFilters, setShowFilters] = useState(false);
  const [quickMissed, setQuickMissed] = useState(false);
  const [phone, setPhone] = useState("");
  const [period, setPeriod] = useState<"all" | "today" | "yesterday" | "3d" | "week">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [openCall, setOpenCall] = useState<string | null>(null);
  const [attrOverrides, setAttrOverrides] = useState<Record<string, string[]>>({});
  const [blacklisted, setBlacklisted] = useState<Set<string>>(new Set());

  const effAttrs = (c: Call) => attrOverrides[c.id] ?? c.attributeIds;
  function toggleAttr(callId: string, attrId: string) {
    setAttrOverrides((o) => {
      const cur = o[callId] ?? calls.find((c) => c.id === callId)?.attributeIds ?? [];
      const next = cur.includes(attrId) ? cur.filter((x) => x !== attrId) : [...cur, attrId];
      return { ...o, [callId]: next };
    });
  }

  const filtered = useMemo(() => {
    return calls.filter((c) => {
      if (op !== "Все" && c.operator !== op) return false;
      if (quickMissed && c.status === "answered") return false;
      if (phone && !c.phone.replace(/\D/g, "").includes(phone.replace(/\D/g, ""))) return false;
      const diff = dayDiff(c.startedAt);
      if (period === "today" && diff !== 0) return false;
      if (period === "yesterday" && diff !== 1) return false;
      if (period === "3d" && (diff < 0 || diff > 2)) return false;
      if (period === "week" && (diff < 0 || diff > 6)) return false;
      const d = c.startedAt.slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [op, quickMissed, phone, period, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  function resetFilters() { setPhone(""); setPeriod("all"); setFrom(""); setTo(""); setQuickMissed(false); setPage(1); }

  return (
    <div>
      <PageHeader eyebrow="Лента звонков" title="Вызовы">
        <button className="btn btn--outline" onClick={() => setShowFilters((s) => !s)}><i className="ti ti-filter" aria-hidden="true" /> Фильтры</button>
        <button className="btn btn--primary pulse"><i className="ti ti-phone-plus" aria-hidden="true" /> Позвонить</button>
      </PageHeader>

      <div className="grid grid-4 mb-20">
        <button className={`stat stat--red ${quickMissed ? "stat-on" : ""}`} style={{ cursor: "pointer", textAlign: "left" }}
          onClick={() => { setQuickMissed((v) => !v); setPage(1); }}>
          <div className="stat-label"><i className="ti ti-phone-off" aria-hidden="true" style={{ fontSize: 16 }} /> Пропущенные и без ответа</div>
          <div className="stat-value">19</div>
        </button>
        <Stat tone="orange" icon="star" label="Важные звонки" value="13" />
        <Stat tone="amber" icon="clock-hour-4" label="Требуют перезвона" value="2" />
        <Stat tone="green" icon="shopping-bag" label="Заказы" value="24" />
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="card card--pad mb-16">
          <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr 1fr", gap: 12, alignItems: "end" }}>
            <div><label className="field-label">Номер телефона</label><input className="input" placeholder="+7 ___ ___-__-__" value={phone} onChange={(e) => { setPhone(e.target.value); setPage(1); }} /></div>
            <div><label className="field-label">Дата от</label><input className="input" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} /></div>
            <div><label className="field-label">Дата до</label><input className="input" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} /></div>
          </div>
          <div className="row gap-8 wrap mt-12" style={{ alignItems: "center" }}>
            <span className="field-label" style={{ marginBottom: 0 }}>Период:</span>
            {([["all", "Всё"], ["today", "Сегодня"], ["yesterday", "Вчера"], ["3d", "3 дня"], ["week", "Неделя"]] as const).map(([k, l]) => (
              <button key={k} className={`chip ${period === k ? "is-active" : ""}`} onClick={() => { setPeriod(k); setPage(1); }}>{l}</button>
            ))}
            <button className="btn btn--outline btn--sm" style={{ marginLeft: "auto" }} onClick={resetFilters}><i className="ti ti-x" aria-hidden="true" /> Сбросить</button>
          </div>
        </div>
      )}

      {/* Операторы */}
      <div className="row gap-8 wrap mb-12">
        {["Все", ...operators].map((o) => (
          <button key={o} className={`chip ${op === o ? "is-active" : ""}`} onClick={() => { setOp(o); setPage(1); }}>{o}</button>
        ))}
        <span className="text-dim f13" style={{ marginLeft: "auto", alignSelf: "center" }}>
          Группированные звонки <b style={{ color: "var(--text)" }}>{filtered.length}</b>
        </span>
      </div>

      <div>
        <div>
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 96 }}>Дата / время</th>
                  <th>Кто</th>
                  <th>Кому</th>
                  <th>Статус / направление</th>
                  <th>Длительность</th>
                  <th>Атрибуты</th>
                  <th style={{ width: 110, textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length ? pageRows.map((c) => (
                  <CallRow key={c.id} call={c} attrs={effAttrs(c)} onOpen={() => setOpenCall(c.id)} />
                )) : (
                  <tr><td colSpan={7} className="text-dim" style={{ textAlign: "center", padding: 36 }}>Звонков по фильтру не найдено</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {filtered.length > 0 && (
            <div className="row between wrap mt-12" style={{ alignItems: "center" }}>
              <span className="text-dim f13">
                Показано {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} из {filtered.length}
              </span>
              {totalPages > 1 && (
                <div className="row gap-6">
                  <button className="btn btn--outline btn--sm" disabled={pageSafe === 1} onClick={() => setPage((p) => p - 1)}><i className="ti ti-chevron-left" aria-hidden="true" /></button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} className={`chip ${pageSafe === i + 1 ? "is-active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="btn btn--outline btn--sm" disabled={pageSafe === totalPages} onClick={() => setPage((p) => p + 1)}><i className="ti ti-chevron-right" aria-hidden="true" /></button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {openCall && (() => {
        const c = calls.find((x) => x.id === openCall)!;
        const cl = clients.find((x) => x.id === c.clientId);
        return (
          <CallDetail
            call={c}
            client={cl}
            attrs={effAttrs(c)}
            onToggleAttr={(id) => toggleAttr(c.id, id)}
            isBlacklisted={cl ? blacklisted.has(cl.id) : false}
            onBlacklist={() => cl && setBlacklisted((s) => new Set(s).add(cl.id))}
            onClose={() => setOpenCall(null)}
          />
        );
      })()}
    </div>
  );
}

function CallRow({ call, attrs, onOpen }: { call: Call; attrs: string[]; onOpen: () => void }) {
  const meta = STATUS_META[call.status];
  const { from, to } = parties(call);
  const client = clients.find((c) => c.id === call.clientId);
  const count = client?.callsCount ?? 1;
  const dirIcon = call.direction === "incoming" ? "arrow-down-left" : "arrow-up-right";
  const tags = attrs.map((a) => attrById(a)).filter(Boolean);
  const hasAttrs = Boolean(call.wantedItem) || tags.length > 0;

  return (
    <tr>
      <td className="text-dim">
        <div className="fw7" style={{ color: "var(--text)" }}>{timeHM(call.startedAt)}</div>
        {dateShort(call.startedAt)}
      </td>
      <td style={{ maxWidth: 230 }}><PartyCell party={from} /></td>
      <td style={{ maxWidth: 230 }}><PartyCell party={to} /></td>
      <td>
        <div className="row between gap-10">
          <div>
            <div style={{ color: meta.color, fontWeight: 700, fontSize: 13 }}>{meta.label}</div>
            <div className="row gap-6 text-dim f12" style={{ marginTop: 2 }}>
              <i className={`ti ti-${dirIcon}`} aria-hidden="true" style={{ fontSize: 13 }} />
              {call.direction === "incoming" ? "Входящий" : "Исходящий"}
            </div>
          </div>
          <span className="count-badge" title="Всего звонков с контактом">{count}</span>
        </div>
      </td>
      <td>
        {call.talkSec > 0
          ? <div className="fw7 f13">Разговор: {durTalk(call.talkSec)}</div>
          : <div className="text-dim f13">Не состоялся</div>}
        <div className="text-dim f12" style={{ marginTop: 2 }}>Ожидание: {call.waitSec}с</div>
      </td>
      <td>
        {hasAttrs ? (
          <div className="row gap-6 wrap">
            {call.wantedItem && <span className="badge badge--orange">{call.wantedItem}</span>}
            {tags.map((at) => <span key={at!.id} className="badge badge--gray">{at!.name}</span>)}
          </div>
        ) : <span className="text-dim f12">Нет атрибутов</span>}
      </td>
      <td style={{ textAlign: "right" }}>
        <button className="open-link" title="Открыть разговор" onClick={onOpen}>
          Открыть <i className="ti ti-chevron-right" aria-hidden="true" style={{ fontSize: 14 }} />
        </button>
      </td>
    </tr>
  );
}

function PartyCell({ party }: { party: Party }) {
  return (
    <div>
      <div className="row gap-6" style={{ minWidth: 0 }}>
        <i className={`ti ti-${party.isUs ? "headset" : "user"}`} aria-hidden="true"
          style={{ fontSize: 13, color: party.isUs ? "var(--orange)" : "var(--text-dim)" }} />
        <span className="fw7" style={{ lineHeight: 1.3 }}>{party.name}</span>
        {party.isUs && <span className="badge badge--gray" style={{ padding: "1px 7px", fontSize: 10 }}>мы</span>}
      </div>
      <div className="text-dim f12" style={{ marginLeft: 19 }}>{party.phone}</div>
    </div>
  );
}
