import { Link } from "react-router-dom";
import type { Client } from "../types";
import { dealsByClient, callsByClient, attrById } from "../data/mock";
import { money, dateShort, phoneFmt, daysLeft } from "../lib/format";
import { Avatar, Badge, Stars } from "./ui";

const DEAL_STATUS: Record<string, { tone: "orange" | "green" | "red" | "amber" | "gray" | "blue"; label: string }> = {
  booked: { tone: "amber", label: "Бронь" },
  active: { tone: "green", label: "В аренде" },
  overdue: { tone: "red", label: "Просрочка" },
  closed: { tone: "gray", label: "Закрыта" },
  debt: { tone: "red", label: "Долг" },
};

export default function Client360({ client, compact }: { client: Client; compact?: boolean }) {
  const cDeals = dealsByClient(client.id);
  const cCalls = callsByClient(client.id);
  const active = cDeals.find((d) => d.status === "active" || d.status === "overdue" || d.status === "booked");
  const history = cDeals.filter((d) => d !== active);

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Шапка карточки — тёмная */}
      <div className="ds-dark" style={{ padding: "16px 18px" }}>
        <div className="row gap-12 wrap">
          <Avatar name={client.name} size={46} />
          <div style={{ flex: 1, minWidth: 130 }}>
            <div className="fw8 f15" style={{ color: "#fff" }}>{client.name}</div>
            <div className="f13" style={{ color: "#aeb2bd" }}>
              {phoneFmt(client.phone)}{client.city ? ` · ${client.city}` : ""}
            </div>
          </div>
          <Stars value={client.rating} />
        </div>
        <div className="row gap-8 wrap mt-12">
          {client.debt > 0 && <Badge tone="red">Должник · {money(client.debt)}</Badge>}
          {client.dealsCount > 2 && <Badge tone="orange">Повторный</Badge>}
          {client.tags.map((t) => {
            const a = attrById(t);
            return a ? <span key={t} className="badge badge--gray">{a.name}</span> : null;
          })}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Текущая сделка */}
        {active ? (
          <div className="card card--pad mb-12" style={{ background: "var(--gray-light)", border: "none" }}>
            <div className="row between mb-8">
              <span className="section-label">Текущая сделка</span>
              <Badge tone={DEAL_STATUS[active.status].tone}>{DEAL_STATUS[active.status].label}</Badge>
            </div>
            <div className="fw7 f14 mb-8">{active.items.map((i) => `${i.equipmentName} · ${i.qty} ${i.unit}`).join(", ")}</div>
            <Row label="Срок" value={`${active.days} дней (до ${dateShort(active.endDate)})`} warn={active.status === "overdue"} />
            <Row label="Сумма" value={money(active.total)} />
            <Row label="Залог" value={`${money(active.deposit)} ${active.depositReturned ? "(возвращён)" : ""}`} />
            {active.address && <Row label="Адрес" value={active.address} />}
            {active.debt > 0 && <Row label="Долг" value={money(active.debt)} warn />}
          </div>
        ) : (
          <div className="card card--pad mb-12 text-dim f13" style={{ background: "var(--gray-light)", border: "none" }}>
            Активных сделок нет
          </div>
        )}

        {/* История аренд */}
        {!compact && (
          <div className="mb-12">
            <div className="section-label mb-8">История аренд ({client.dealsCount})</div>
            {history.length ? history.slice(0, 4).map((d) => (
              <div key={d.id} className="row between f13" style={{ padding: "7px 0", borderBottom: "1px solid var(--line)" }}>
                <span>{d.items[0]?.equipmentName} · {d.days} дн.</span>
                <Badge tone={DEAL_STATUS[d.status].tone}>{DEAL_STATUS[d.status].label}</Badge>
              </div>
            )) : <div className="text-dim f13">Прошлых аренд нет</div>}
            <div className="text-dim f12 mt-8">С нами с {dateShort(client.createdAt)} · звонков: {cCalls.length || client.callsCount}</div>
          </div>
        )}

        {/* Речевая аналитика — поле-заглушка */}
        <div className="card card--pad mb-12" style={{ border: "1px dashed rgba(255,106,0,.5)" }}>
          <div className="row between wrap mb-8" style={{ gap: 8 }}>
            <span className="row gap-6" style={{ color: "#c2510a", fontWeight: 700, fontSize: 12, letterSpacing: ".5px", textTransform: "uppercase" }}>
              <i className="ti ti-microphone-2" aria-hidden="true" /> Речевая аналитика
            </span>
            <Badge tone="orange">Скоро · поле заложено</Badge>
          </div>
          <div className="text-dim f13" style={{ lineHeight: 1.6 }}>
            Здесь появится авто-расшифровка разговора, краткое резюме и авто-теги из речи (техника, срок, адрес) — поля заполнятся сами.
          </div>
          <div className="row gap-6 wrap mt-12" style={{ opacity: .55 }}>
            <span className="badge badge--gray">авто-тег: {active?.items[0]?.equipmentName?.split(" ")[0] || "техника"}</span>
            <span className="badge badge--gray">авто-тег: срок</span>
            <span className="badge badge--gray">резюме звонка</span>
          </div>
        </div>

        {/* Действия */}
        <div className="row gap-8 wrap">
          <button className="btn btn--primary btn--sm pulse"><i className="ti ti-phone" aria-hidden="true" /> Позвонить</button>
          <button className="btn btn--outline btn--sm"><i className="ti ti-brand-whatsapp" aria-hidden="true" /> WhatsApp</button>
          <button className="btn btn--outline btn--sm"><i className="ti ti-calculator" aria-hidden="true" /> Расчёт</button>
          <Link to={`/clients/${client.id}`} className="btn btn--outline btn--sm"><i className="ti ti-external-link" aria-hidden="true" /> Профиль</Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="row between f13" style={{ padding: "3px 0" }}>
      <span className="text-dim">{label}</span>
      <span style={{ fontWeight: 600, color: warn ? "var(--red)" : "inherit" }}>{value}</span>
    </div>
  );
}
