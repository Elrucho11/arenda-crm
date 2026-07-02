import { Link } from "react-router-dom";
import { quickStats } from "../data/mock";

// Блок «Быстрые действия» — как на проде (2×2 плитки-счётчики)
export default function QuickActions() {
  return (
    <div className="card card--pad mb-16">
      <div className="fw8 f15 mb-12">Быстрые действия</div>
      <div className="grid grid-2">
        <Tile to="/calls?filter=missed" icon="phone-off" tone="red" label="Пропущенные и без ответа" value={quickStats.missed} />
        <Tile to="/calls?filter=important" icon="star" tone="orange" label="Важные звонки" value={quickStats.important} />
        <Tile to="/calls?filter=callback" icon="alert-triangle" tone="amber" label="Требуют перезвона" value={quickStats.callback} />
        <Tile to="/calls?filter=orders" icon="shopping-bag" tone="green" label="Заказы" value={quickStats.orders} />
      </div>
    </div>
  );
}

function Tile({ to, icon, tone, label, value }: { to: string; icon: string; tone: string; label: string; value: number }) {
  return (
    <Link to={to} className="qa card-hover" data-tone={tone}>
      <span className="row gap-10" style={{ fontWeight: 700 }}>
        <i className={`ti ti-${icon}`} aria-hidden="true" style={{ fontSize: 20 }} /> {label}
      </span>
      <span className="fw8" style={{ fontSize: 22 }}>{value}</span>
    </Link>
  );
}
