import { Link, useParams } from "react-router-dom";
import { clients, callsByClient, dealsByClient } from "../data/mock";
import Client360 from "../components/Client360";
import { Badge } from "../components/ui";
import { timeHM, dateShort, dur, money, phoneFmt } from "../lib/format";
import type { Call } from "../types";

const CALL_COLOR: Record<string, string> = { answered: "#1f7a3d", missed: "#b3261e", "no-answer": "#b3261e" };

export default function ClientDetail() {
  const { id } = useParams();
  const client = clients.find((c) => c.id === id);
  if (!client) return <div className="card card--pad">Клиент не найден. <Link to="/clients" style={{ color: "var(--orange)" }}>К списку</Link></div>;

  const cCalls = callsByClient(client.id);
  const cDeals = dealsByClient(client.id);

  return (
    <div>
      <div className="row gap-12 mb-16">
        <Link to="/clients" className="btn btn--outline btn--sm"><i className="ti ti-arrow-left" aria-hidden="true" /> Назад</Link>
        <span className="eyebrow">Профиль клиента</span>
      </div>

      <div className="split split--detail">
        <Client360 client={client} />

        <div className="grid" style={{ gap: 16 }}>
          {/* Звонки */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="card--pad row between" style={{ borderBottom: "1px solid var(--line)" }}>
              <span className="fw8 f15">История звонков</span>
              <Badge tone="gray">{cCalls.length}</Badge>
            </div>
            <table className="tbl">
              <thead><tr><th>Дата</th><th>Направление</th><th>Что хотел</th><th style={{ textAlign: "right" }}>Длит.</th></tr></thead>
              <tbody>
                {cCalls.length ? cCalls.map((c: Call) => (
                  <tr key={c.id}>
                    <td><div className="fw7">{timeHM(c.startedAt)}</div><span className="text-dim f12">{dateShort(c.startedAt)}</span></td>
                    <td><span style={{ color: CALL_COLOR[c.status], fontWeight: 700, fontSize: 12.5 }}>{c.direction === "incoming" ? "Входящий" : "Исходящий"} · {c.status === "answered" ? "отвечен" : "пропущен"}</span></td>
                    <td>{c.wantedItem ? <span className="badge badge--orange">{c.wantedItem}</span> : <span className="text-dim">—</span>}</td>
                    <td style={{ textAlign: "right" }}>{dur(c.talkSec)}</td>
                  </tr>
                )) : <tr><td colSpan={4} className="text-dim" style={{ textAlign: "center", padding: 24 }}>Звонков нет</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Сделки */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="card--pad row between" style={{ borderBottom: "1px solid var(--line)" }}>
              <span className="fw8 f15">Аренды / сделки</span>
              <Badge tone="gray">{cDeals.length}</Badge>
            </div>
            <table className="tbl">
              <thead><tr><th>Техника</th><th>Период</th><th>Сумма</th><th>Залог</th><th>Статус</th></tr></thead>
              <tbody>
                {cDeals.length ? cDeals.map((d) => (
                  <tr key={d.id}>
                    <td className="fw7">{d.items.map((i) => `${i.equipmentName} ×${i.qty}`).join(", ")}</td>
                    <td className="f13">{dateShort(d.startDate).slice(0, 5)}–{dateShort(d.endDate).slice(0, 5)}<div className="text-dim f12">{d.days} дн.</div></td>
                    <td className="fw7">{money(d.total)}</td>
                    <td className="f13">{d.deposit ? money(d.deposit) : "—"}</td>
                    <td>{d.debt > 0 ? <Badge tone="red">Долг {money(d.debt)}</Badge> : d.status === "active" ? <Badge tone="green">В аренде</Badge> : d.status === "overdue" ? <Badge tone="red">Просрочка</Badge> : <Badge tone="gray">Закрыта</Badge>}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="text-dim" style={{ textAlign: "center", padding: 24 }}>Сделок нет</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Контакты / реквизиты */}
          <div className="card card--pad">
            <span className="section-label">Контакты и реквизиты</span>
            <div className="grid grid-2 mt-12">
              <Field label="Телефон" value={phoneFmt(client.phone)} />
              <Field label="Город" value={client.city ?? "—"} />
              <Field label="Адрес" value={client.address ?? "—"} />
              <Field label="Источник" value={client.source ?? "—"} />
              <Field label="Клиент с" value={dateShort(client.createdAt)} />
              <Field label="Последний контакт" value={dateShort(client.lastContactAt)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="row between f13" style={{ padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
      <span className="text-dim">{label}</span><span className="fw7">{value}</span>
    </div>
  );
}
