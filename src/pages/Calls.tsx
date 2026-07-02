import { useMemo, useState } from "react";
import { calls, operators } from "../data/mock";
import { PageHeader } from "../components/ui";
import QuickActions from "../components/QuickActions";
import CallsTable from "../components/CallsTable";

const PAGE_SIZE = 30;
const TODAY = "2026-06-26";

type Period = "" | "today" | "yesterday" | "3d" | "week";

function dayDiff(iso: string): number {
  const d = new Date(iso.slice(0, 10)).getTime();
  return Math.round((new Date(TODAY).getTime() - d) / 86400000);
}

export default function Calls() {
  const [op, setOp] = useState<string>("Все");
  const [page, setPage] = useState(1);

  // Черновик фильтров (применяются по кнопке, как на проде)
  const [dPhone, setDPhone] = useState("");
  const [dFrom, setDFrom] = useState("");
  const [dTo, setDTo] = useState("");
  const [dPeriod, setDPeriod] = useState<Period>("");
  const [applied, setApplied] = useState<{ phone: string; from: string; to: string; period: Period }>({ phone: "", from: "", to: "", period: "" });

  function apply() { setApplied({ phone: dPhone, from: dFrom, to: dTo, period: dPeriod }); setPage(1); }
  function reset() { setDPhone(""); setDFrom(""); setDTo(""); setDPeriod(""); setApplied({ phone: "", from: "", to: "", period: "" }); setPage(1); }

  const filtered = useMemo(() => calls.filter((c) => {
    if (op !== "Все" && c.operator !== op) return false;
    if (applied.phone && !c.clientPhone.replace(/\D/g, "").includes(applied.phone.replace(/\D/g, ""))) return false;
    const d = c.dateTime.slice(0, 10);
    if (applied.from && d < applied.from) return false;
    if (applied.to && d > applied.to) return false;
    const diff = dayDiff(c.dateTime);
    if (applied.period === "today" && diff !== 0) return false;
    if (applied.period === "yesterday" && diff !== 1) return false;
    if (applied.period === "3d" && (diff < 0 || diff > 2)) return false;
    if (applied.period === "week" && (diff < 0 || diff > 6)) return false;
    return true;
  }), [op, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const rows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <div>
      <PageHeader eyebrow="Лента звонков" title="Вызовы" />

      <QuickActions />

      {/* Фильтры (как на проде: применяются по кнопке) */}
      <div className="card card--pad mb-16">
        <div className="fw8 f15 mb-12">Фильтры</div>
        <div className="filters-grid" style={{ alignItems: "end" }}>
          <div>
            <label className="field-label">Номер телефона</label>
            <input className="input" placeholder="+7 ___ ___-__-__" value={dPhone} onChange={(e) => setDPhone(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Дата от</label>
            <input className="input" type="date" value={dFrom} onChange={(e) => setDFrom(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Дата до</label>
            <input className="input" type="date" value={dTo} onChange={(e) => setDTo(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Период звонков</label>
            <div className="row gap-6 wrap">
              {([["today", "Сегодня"], ["yesterday", "Вчера"], ["3d", "3 дня"], ["week", "Неделя"]] as const).map(([k, l]) => (
                <button key={k} className={`chip ${dPeriod === k ? "is-active" : ""}`}
                  onClick={() => setDPeriod(dPeriod === k ? "" : k)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="row gap-10 mt-16">
          <button className="btn btn--primary" onClick={apply}>Применить фильтры</button>
          <button className="btn btn--dark" onClick={reset}>Сбросить</button>
        </div>
      </div>

      {/* Табы операторов + таблица */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card--pad" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="row gap-8 wrap">
            {["Все", ...operators].map((o) => (
              <button key={o} className={`chip ${op === o ? "is-active" : ""}`} onClick={() => { setOp(o); setPage(1); }}>{o}</button>
            ))}
          </div>
          <div className="row gap-8 mt-12" style={{ alignItems: "center" }}>
            <span className="fw8 f15">Группированные звонки</span>
            <span className="badge badge--gray">{filtered.length}</span>
          </div>
        </div>
        <CallsTable rows={rows} />
      </div>

      {/* Пагинация как на проде */}
      {filtered.length > 0 && (
        <div className="row between wrap mt-12" style={{ alignItems: "center" }}>
          <span className="text-dim f13">
            Показано с {(pageSafe - 1) * PAGE_SIZE + 1} по {Math.min(pageSafe * PAGE_SIZE, filtered.length)} из {filtered.length} результатов
          </span>
          {totalPages > 1 && (
            <div className="row gap-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`chip ${pageSafe === i + 1 ? "is-active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
