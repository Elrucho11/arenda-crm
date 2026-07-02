import { useState } from "react";
import { Link } from "react-router-dom";
import { calls, operators } from "../data/mock";
import { PageHeader } from "../components/ui";
import QuickActions from "../components/QuickActions";
import CallsTable from "../components/CallsTable";

// Прод-страница «Панель»: быстрые действия + группированные звонки за сутки
export default function Dashboard() {
  const [op, setOp] = useState<string>("Все");

  const daily = calls.filter((c) => c.dateTime.startsWith("2026-06-26"));
  const rows = op === "Все" ? daily : daily.filter((c) => c.operator === op);

  return (
    <div>
      <PageHeader eyebrow="Сводка" title="Панель" />

      <QuickActions />

      {/* Табы операторов + группированные звонки за сутки */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card--pad" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="row gap-8 wrap">
            {["Все", ...operators].map((o) => (
              <button key={o} className={`chip ${op === o ? "is-active" : ""}`} onClick={() => setOp(o)}>{o}</button>
            ))}
          </div>
          <div className="row between mt-12" style={{ alignItems: "center" }}>
            <div className="row gap-8" style={{ alignItems: "center" }}>
              <span className="fw8 f15">Группированные звонки за сутки</span>
              <span className="badge badge--gray">{rows.length}</span>
            </div>
            <Link to="/calls" className="f13" style={{ color: "var(--orange)", fontWeight: 700 }}>Смотреть все</Link>
          </div>
        </div>
        <CallsTable rows={rows} />
      </div>
    </div>
  );
}
