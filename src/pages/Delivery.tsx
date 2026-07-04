import { useState } from "react";
import { PageHeader, Modal, Badge, Empty } from "../components/ui";
import { deliveries as seedDeliveries } from "../data/mock";
import type { Delivery, DeliveryStatus } from "../types";
import { dateShort, phoneFmt } from "../lib/format";

const STATUS: Record<DeliveryStatus, { label: string; tone: "amber" | "blue" | "green" | "gray" }> = {
  "planned": { label: "Запланирована", tone: "amber" },
  "on-the-way": { label: "В пути", tone: "blue" },
  "delivered": { label: "Доставлено", tone: "green" },
  "pickup": { label: "Ожидает забора", tone: "gray" },
  "returned": { label: "Возвращено", tone: "green" },
};

const empty: Delivery = {
  id: "", clientName: "", phone: "", address: "", date: "2026-06-27", timeSlot: "09:00–12:00",
  driver: "", type: "delivery", status: "planned", comment: "",
};

// ===== Зоны доставки (калькулятор) =====
function detectZone(query: string): { zone: string; price: number } {
  const q = query.toLowerCase();
  if (q.includes("кулаков")) return { zone: "Красная — Кулаково", price: 1200 };
  if (q.includes("лугов")) return { zone: "Оливковая — Луговое", price: 900 };
  return { zone: "Фиолетовая — Тюмень (центр)", price: 500 };
}
const LEGEND = [
  { color: "#7c5cd6", label: "Фиолетовая — 500 ₽" },
  { color: "#e07bb0", label: "Розовая — 900 ₽" },
  { color: "#d85a30", label: "Красная (Кулаково) — 1200 ₽" },
  { color: "#7a9b3a", label: "Оливковая (Луговое) — 900 ₽" },
];

export default function Delivery() {
  const [list, setList] = useState<Delivery[]>(seedDeliveries);
  const [form, setForm] = useState<Delivery | null>(null);
  const [editing, setEditing] = useState(false);

  // калькулятор зон
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState<{ zone: string; price: number } | null>(null);

  function openNew() { setForm({ ...empty, id: `d-${Date.now()}` }); setEditing(false); }
  function openEdit(d: Delivery) { setForm({ ...d }); setEditing(true); }
  function save() {
    if (!form) return;
    setList((prev) => editing ? prev.map((d) => (d.id === form.id ? form : d)) : [form, ...prev]);
    setForm(null);
  }
  function remove(id: string) { setList((prev) => prev.filter((d) => d.id !== id)); }
  const set = (patch: Partial<Delivery>) => setForm((f) => (f ? { ...f, ...patch } : f));

  return (
    <div>
      <PageHeader eyebrow="Логистика" title="Доставка">
        <button className="btn btn--primary" onClick={openNew}><i className="ti ti-plus" aria-hidden="true" /> Новая доставка</button>
      </PageHeader>

      <div className="card" style={{ overflow: "hidden" }}>
        {list.length === 0 ? <Empty icon="truck-delivery" text="Доставок пока нет" /> : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 150 }}>Дата / слот</th>
                <th>Клиент</th>
                <th>Адрес</th>
                <th style={{ width: 110 }}>Тип</th>
                <th style={{ width: 120 }}>Водитель</th>
                <th style={{ width: 150 }}>Статус</th>
                <th style={{ width: 130, textAlign: "right" }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="fw7 f13">{dateShort(d.date)}</div>
                    <div className="text-dim f12">{d.timeSlot}</div>
                  </td>
                  <td>
                    <div className="fw7 f13" style={{ maxWidth: 220 }}>{d.clientName}</div>
                    <div className="text-dim f12">{phoneFmt(d.phone)}</div>
                  </td>
                  <td className="f13" style={{ maxWidth: 220 }}>{d.address}</td>
                  <td>{d.type === "delivery" ? <Badge tone="orange">Доставка</Badge> : <Badge tone="gray">Забор</Badge>}</td>
                  <td className="f13">{d.driver || <span className="text-dim">—</span>}</td>
                  <td><Badge tone={STATUS[d.status].tone}>{STATUS[d.status].label}</Badge></td>
                  <td style={{ textAlign: "right" }}>
                    <span className="row gap-12" style={{ display: "inline-flex", justifyContent: "flex-end" }}>
                      <button className="open-link" style={{ color: "var(--orange)", padding: 0 }} onClick={() => openEdit(d)}>Изменить</button>
                      <button className="open-link" style={{ color: "var(--red)", padding: 0 }} onClick={() => remove(d.id)}>Удалить</button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Калькулятор зон */}
      <div className="card card--pad mt-16">
        <div className="row gap-8"><i className="ti ti-map-pin" style={{ color: "var(--orange)", fontSize: 18 }} aria-hidden="true" /><span className="fw8">Калькулятор доставки по зонам · Тюмень</span></div>
        <div className="row gap-8 mt-12">
          <input className="input" placeholder="Введите адрес или место" value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setZone(query.trim() ? detectZone(query) : null); }} />
          <button className="btn btn--primary" onClick={() => setZone(query.trim() ? detectZone(query) : null)}>Найти</button>
        </div>
        {zone && (
          <div className="mt-12 f14" style={{ background: "var(--gray-light)", borderRadius: 10, padding: 12 }}>
            <span className="fw7">Зона: {zone.zone}</span> · Доставка {zone.price.toLocaleString("ru-RU")} ₽
          </div>
        )}
        <div className="row gap-16 wrap mt-12">
          {LEGEND.map((z) => (
            <div key={z.label} className="row gap-8">
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: z.color, display: "inline-block", flexShrink: 0 }} />
              <span className="f13 text-dim">{z.label}</span>
            </div>
          ))}
        </div>
      </div>

      {form && (
        <Modal title={editing ? "Изменить доставку" : "Новая доставка"} onClose={() => setForm(null)}
          footer={<>
            <button className="btn btn--outline" onClick={() => setForm(null)}>Отмена</button>
            <button className="btn btn--primary" onClick={save}>{editing ? "Сохранить" : "Создать"}</button>
          </>}>
          <div className="grid" style={{ gap: 12 }}>
            <div className="grid grid-2" style={{ gap: 12 }}>
              <div><label className="field-label">Клиент</label><input className="input" value={form.clientName} onChange={(e) => set({ clientName: e.target.value })} /></div>
              <div><label className="field-label">Телефон</label><input className="input" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+7 ___ ___-__-__" /></div>
            </div>
            <div><label className="field-label">Адрес</label><input className="input" value={form.address} onChange={(e) => set({ address: e.target.value })} /></div>
            <div className="grid grid-2" style={{ gap: 12 }}>
              <div><label className="field-label">Дата</label><input className="input" type="date" value={form.date} onChange={(e) => set({ date: e.target.value })} /></div>
              <div><label className="field-label">Время</label><input className="input" value={form.timeSlot} onChange={(e) => set({ timeSlot: e.target.value })} placeholder="09:00–12:00" /></div>
            </div>
            <div className="grid grid-2" style={{ gap: 12 }}>
              <div>
                <label className="field-label">Тип</label>
                <select className="input" value={form.type} onChange={(e) => set({ type: e.target.value as Delivery["type"] })}>
                  <option value="delivery">Доставка</option>
                  <option value="pickup">Забор</option>
                </select>
              </div>
              <div>
                <label className="field-label">Статус</label>
                <select className="input" value={form.status} onChange={(e) => set({ status: e.target.value as DeliveryStatus })}>
                  {(Object.keys(STATUS) as DeliveryStatus[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
                </select>
              </div>
            </div>
            <div><label className="field-label">Водитель</label><input className="input" value={form.driver ?? ""} onChange={(e) => set({ driver: e.target.value })} /></div>
            <div><label className="field-label">Комментарий</label><textarea className="input" rows={2} value={form.comment ?? ""} onChange={(e) => set({ comment: e.target.value })} style={{ resize: "vertical" }} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
