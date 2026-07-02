import type { ProdCall } from "../data/mock";
import { employees, attrById } from "../data/mock";
import { timeHM, dateShort } from "../lib/format";

// Таблица звонков — колонки один в один с продом:
// ДАТА/ВРЕМЯ | КТО | КОМУ | СТАТУС/НАПРАВЛЕНИЕ | ДЛИТЕЛЬНОСТЬ | АТРИБУТЫ

function durText(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return m > 0 ? `${m}м ${s}сек.` : `${s}сек.`;
}

// Цвет кружка-счётчика: красный — пропущен, жёлтый — короткий разговор (<10с),
// зелёный — первый звонок, тёмный — обычный
function badgeColor(c: ProdCall): string {
  if (c.status !== "Отвечен") return "var(--red)";
  if (c.talkSec > 0 && c.talkSec < 10) return "#e3c000";
  if (c.count === 1) return "var(--green)";
  return "var(--dark)";
}

function EmployeeCell({ call }: { call: ProdCall }) {
  const emp = employees.find((e) => e.name === call.operator)!;
  const num = call.ourNumberOverride ?? emp.number;
  return (
    <div>
      {call.toExtension
        ? <div className="fw7">{call.toExtension}</div>
        : <div className="fw7">{emp.fullName}</div>}
      <div className="text-dim f12">{num}</div>
    </div>
  );
}

function ClientCell({ call }: { call: ProdCall }) {
  return (
    <div style={{ maxWidth: 260 }}>
      {call.clientLabel && <div className="fw7" style={{ lineHeight: 1.35 }}>{call.clientLabel}</div>}
      <div className={call.clientLabel ? "text-dim f12" : "fw7"}>{call.clientPhone}</div>
      {call.transferNumber && (
        <div className="row gap-6 f12" style={{ color: "var(--green)", marginTop: 2 }}>
          <i className="ti ti-arrows-transfer-up" aria-hidden="true" style={{ fontSize: 13 }} />
          {call.transferNumber}
        </div>
      )}
    </div>
  );
}

export function CallRow({ call }: { call: ProdCall }) {
  const incoming = call.direction === "incoming";
  const statusColor = call.status === "Отвечен" ? "var(--green)" : "var(--red)";
  const tags = call.attributeIds.map((a) => attrById(a)).filter(Boolean);
  return (
    <tr>
      <td style={{ whiteSpace: "nowrap" }}>
        <div className="fw7">{timeHM(call.dateTime)}</div>
        <div className="text-dim f12">{dateShort(call.dateTime)}</div>
      </td>
      <td>{incoming ? <ClientCell call={call} /> : <EmployeeCell call={call} />}</td>
      <td>{incoming ? <EmployeeCell call={call} /> : <ClientCell call={call} />}</td>
      <td>
        <div className="row gap-10">
          <div>
            <div style={{ color: statusColor, fontWeight: 700, fontSize: 13 }}>{call.status}</div>
            <div className="row gap-6 text-dim f12" style={{ marginTop: 2 }}>
              <i className={`ti ti-phone-${incoming ? "incoming" : "outgoing"}`} aria-hidden="true" style={{ fontSize: 13 }} />
              {incoming ? "Входящий" : "Исходящий"}
            </div>
          </div>
          <span className="count-badge" style={{ background: badgeColor(call), color: "#fff" }}
            title="Всего звонков с контактом">{call.count}</span>
        </div>
      </td>
      <td style={{ whiteSpace: "nowrap" }}>
        {call.talkSec > 0 && <div className="fw7 f13">Разговор: {durText(call.talkSec)}</div>}
        <div className="text-dim f12" style={{ marginTop: 2 }}>Ожидание: {call.waitSec}с</div>
      </td>
      <td>
        {tags.length ? (
          <div className="row gap-6 wrap">
            {tags.map((a) => (
              <span key={a!.id} className="badge" style={{ background: a!.color, color: "#fff" }}>{a!.name}</span>
            ))}
          </div>
        ) : <span className="text-dim f12">Нет атрибутов</span>}
      </td>
    </tr>
  );
}

export default function CallsTable({ rows }: { rows: ProdCall[] }) {
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th style={{ width: 100 }}>Дата/время</th>
          <th>Кто</th>
          <th>Кому</th>
          <th style={{ width: 170 }}>Статус/направление</th>
          <th style={{ width: 150 }}>Длительность</th>
          <th style={{ width: 130 }}>Атрибуты</th>
        </tr>
      </thead>
      <tbody>
        {rows.length ? rows.map((c) => <CallRow key={c.id} call={c} />) : (
          <tr><td colSpan={6} className="text-dim" style={{ textAlign: "center", padding: 36 }}>Звонков не найдено</td></tr>
        )}
      </tbody>
    </table>
  );
}
