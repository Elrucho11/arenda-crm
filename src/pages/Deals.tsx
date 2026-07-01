import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, Stat, Badge, Avatar, Modal } from "../components/ui";
import { money, dateShort, daysLeft } from "../lib/format";
import { deals } from "../data/mock";
import type { Deal, DealStatus } from "../types";

type Tone = "orange" | "green" | "red" | "amber" | "blue" | "gray";

const STATUS_META: Record<DealStatus, { label: string; tone: Tone }> = {
  booked: { label: "Бронь", tone: "amber" },
  active: { label: "В аренде", tone: "green" },
  overdue: { label: "Просрочка", tone: "red" },
  closed: { label: "Закрыта", tone: "gray" },
  debt: { label: "Долг", tone: "red" },
};

const FILTERS: { label: string; status: DealStatus | "all" }[] = [
  { label: "Все", status: "all" },
  { label: "Бронь", status: "booked" },
  { label: "В аренде", status: "active" },
  { label: "Просрочка", status: "overdue" },
  { label: "Долг", status: "debt" },
  { label: "Закрыта", status: "closed" },
];

export default function Deals() {
  const [filter, setFilter] = useState<DealStatus | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const rows: Deal[] = filter === "all" ? deals : deals.filter((d) => d.status === filter);

  const activeCount = deals.filter((d) => d.status === "active").length;
  const overdueCount = deals.filter((d) => d.status === "overdue").length;
  const totalDebt = deals.reduce((s, d) => s + d.debt, 0);
  const bookedCount = deals.filter((d) => d.status === "booked").length;
  const closedCount = deals.filter((d) => d.status === "closed").length;

  return (
    <div>
      <PageHeader eyebrow="Аренды" title="Сделки">
        <button className="btn btn--primary" onClick={() => setShowNew(true)}>
          <i className="ti ti-plus" aria-hidden="true" /> Новая сделка
        </button>
      </PageHeader>

      <div className="grid grid-4 mt-16">
        <Stat label="В аренде" value={activeCount} icon="truck-loading" tone="green" />
        <Stat label="Просрочки" value={overdueCount} icon="alert-triangle" tone="red" />
        <Stat label="Долги" value={money(totalDebt)} icon="cash" tone="amber" />
        <Stat label="Бронь" value={bookedCount || closedCount} icon="calendar-check" tone="orange" />
      </div>

      <div className="row gap-8 wrap mt-16 mb-12">
        {FILTERS.map((f) => (
          <button
            key={f.status}
            className={`chip ${filter === f.status ? "is-active" : ""}`}
            onClick={() => setFilter(f.status)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Клиент</th>
              <th>Техника</th>
              <th>Период</th>
              <th>Сумма</th>
              <th>Залог</th>
              <th>Долг</th>
              <th>Статус</th>
              <th>Дост.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => {
              const meta = STATUS_META[d.status];
              const left = daysLeft(d.endDate);
              return (
                <tr
                  key={d.id}
                  className={selected === d.id ? "is-selected" : ""}
                  onClick={() => setSelected(d.id)}
                >
                  <td>
                    <div className="row gap-10">
                      <Avatar name={d.clientName} size={32} />
                      <div>
                        <Link
                          to={`/clients/${d.clientId}`}
                          className="fw7"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {d.clientName}
                        </Link>
                        <div className="text-dim f12">{d.operator}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {d.items.map((it) => `${it.equipmentName} ×${it.qty}`).join(", ")}
                  </td>
                  <td>
                    <div>
                      {dateShort(d.startDate).slice(0, 5)}–{dateShort(d.endDate).slice(0, 5)}
                    </div>
                    <div className="text-dim f12">{d.days} дн.</div>
                    {d.status === "overdue" && (
                      <div className="f12" style={{ color: "var(--red)" }}>
                        просрочено {Math.abs(left)} дн.
                      </div>
                    )}
                    {d.status === "active" && (
                      <div className="f12 text-dim">ещё {left} дн.</div>
                    )}
                  </td>
                  <td className="fw7">{money(d.total)}</td>
                  <td>
                    {d.deposit ? (
                      <div>
                        {money(d.deposit)}
                        <div
                          className="f12"
                          style={{ color: d.depositReturned ? "var(--green)" : "var(--amber)" }}
                        >
                          {d.depositReturned ? "возвращён" : "удержан"}
                        </div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {d.debt > 0 ? (
                      <span className="fw7" style={{ color: "var(--red)" }}>
                        {money(d.debt)}
                      </span>
                    ) : (
                      <span className="text-dim">—</span>
                    )}
                  </td>
                  <td>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </td>
                  <td>
                    {d.delivery ? (
                      <i
                        className="ti ti-truck-delivery"
                        aria-hidden="true"
                        title="С доставкой"
                        style={{ color: "var(--orange)" }}
                      />
                    ) : (
                      <i
                        className="ti ti-package text-dim"
                        aria-hidden="true"
                        title="Самовывоз"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showNew && (
        <Modal
          title="Новая сделка"
          onClose={() => setShowNew(false)}
          footer={
            <>
              <button className="btn btn--outline" onClick={() => setShowNew(false)}>
                Отмена
              </button>
              <button className="btn btn--primary" onClick={() => setShowNew(false)}>
                Создать
              </button>
            </>
          }
        >
          <p className="text-dim f14">
            Здесь будет форма создания сделки: клиент, техника, период, залог и доставка.
          </p>
        </Modal>
      )}
    </div>
  );
}
