import { Link } from "react-router-dom";
import { calls, clients, deals, deliveries, dashboardStats } from "../data/mock";
import { PageHeader, Stat, Badge, IconCircle } from "../components/ui";
import { timeHM, dateShort, money, phoneFmt } from "../lib/format";

export default function Dashboard() {
  const recent = [...calls].sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt)).slice(0, 6);
  const today = deliveries.filter((d) => d.date === "2026-06-26");
  const overdue = deals.filter((d) => d.status === "overdue");
  const debtors = deals.filter((d) => d.debt > 0);

  return (
    <div>
      <PageHeader eyebrow="Сводка дня" title="Панель" accent="управления" />

      {/* Быстрые действия */}
      <div className="card card--pad mb-16">
        <span className="section-label">Быстрые действия</span>
        <div className="grid grid-2 mt-12">
          <QuickAction to="/calls" icon="phone-off" tone="red" label="Пропущенные и без ответа" value="19" />
          <QuickAction to="/calls" icon="star" tone="orange" label="Важные звонки" value="13" />
          <QuickAction to="/calls" icon="clock-hour-4" tone="amber" label="Требуют перезвона" value="2" />
          <QuickAction to="/deals" icon="shopping-bag" tone="green" label="Заказы" value="24" />
        </div>
      </div>

      <div className="grid grid-4 mb-20">
        <Stat tone="orange" icon="users" label="Клиентов в базе" value={dashboardStats.totalClients} />
        <Stat tone="green" icon="truck-loading" label="Активных аренд" value={dashboardStats.activeDeals} />
        <Stat tone="red" icon="alert-triangle" label="Просрочек" value={dashboardStats.overdue} />
        <Stat tone="amber" icon="cash" label="Сумма долгов" value={money(dashboardStats.totalDebt)} />
      </div>

      <div className="split split--dash">
        {/* Последние звонки */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="card--pad row between" style={{ borderBottom: "1px solid var(--line)" }}>
            <span className="fw8 f15">Последние звонки</span>
            <Link to="/calls" className="f13" style={{ color: "var(--orange)", fontWeight: 700 }}>Все вызовы →</Link>
          </div>
          <table className="tbl">
            <tbody>
              {recent.map((c) => {
                const cl = clients.find((x) => x.id === c.clientId);
                const ok = c.status === "answered";
                return (
                  <tr key={c.id}>
                    <td style={{ width: 70 }}><div className="fw7">{timeHM(c.startedAt)}</div><span className="text-dim f12">{dateShort(c.startedAt).slice(0, 5)}</span></td>
                    <td><div className="fw7">{cl ? cl.name : phoneFmt(c.phone)}</div>{c.wantedItem && <span className="badge badge--orange mt-8">{c.wantedItem}</span>}</td>
                    <td style={{ textAlign: "right" }}>
                      {ok ? <Badge tone="green" dot>отвечен</Badge> : <Badge tone="red" dot>пропущен</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Требует внимания */}
        <div className="grid" style={{ gap: 16 }}>
          <div className="card card--pad">
            <div className="row gap-10 mb-12"><IconCircle icon="truck-delivery" /> <span className="fw8 f15">Доставки сегодня</span> <span className="badge badge--gray" style={{ marginLeft: "auto" }}>{today.length}</span></div>
            {today.map((d) => (
              <div key={d.id} className="row between" style={{ padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <div><div className="fw7 f13">{d.clientName}</div><div className="text-dim f12">{d.timeSlot} · {d.driver}</div></div>
                {d.type === "pickup" ? <Badge tone="amber">Забор</Badge> : <Badge tone="blue">Доставка</Badge>}
              </div>
            ))}
          </div>

          <div className="card card--pad">
            <div className="row gap-10 mb-12"><IconCircle icon="alert-triangle" tone="red" /> <span className="fw8 f15">Просрочки и долги</span></div>
            {[...overdue, ...debtors.filter((d) => d.status !== "overdue")].map((d) => (
              <div key={d.id} className="row between" style={{ padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <div><div className="fw7 f13">{d.clientName}</div><div className="text-dim f12">до {dateShort(d.endDate)}</div></div>
                <span style={{ color: "var(--red)", fontWeight: 700 }}>{d.debt > 0 ? money(d.debt) : "просрочка"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ to, icon, tone, label, value }: { to: string; icon: string; tone: string; label: string; value: string }) {
  return (
    <Link to={to} className="qa card-hover" data-tone={tone}>
      <span className="row gap-10" style={{ fontWeight: 700 }}>
        <i className={`ti ti-${icon}`} aria-hidden="true" style={{ fontSize: 20 }} /> {label}
      </span>
      <span className="fw8" style={{ fontSize: 22 }}>{value}</span>
    </Link>
  );
}
