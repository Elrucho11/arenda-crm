import { useMemo, useState } from "react";
import { PageHeader, Stat, Badge, IconCircle, Modal, Empty } from "../components/ui";
import { money, dateShort, phoneFmt } from "../lib/format";

const TODAY = "2026-06-26";
const TOMORROW = "2026-06-27";

type Tone = "orange" | "green" | "red" | "amber" | "blue" | "gray";

type DriverSel = "Сергей" | "Игорь";
const DRIVERS: DriverSel[] = ["Сергей", "Игорь"];

// ===== Зоны доставки вокруг Тюмени =====
interface Zone {
  id: number;
  name: string;
  desc: string;
  price: number;
  color: string;   // полупрозрачная заливка (работает на обеих темах)
  dotColor: string;
}

const zones: Zone[] = [
  { id: 1, name: "В черте города", desc: "внутри объездной", price: 500, color: "rgba(31,122,61,.18)", dotColor: "#1f7a3d" },
  { id: 2, name: "Ближний пригород", desc: "до 10 км (Антипино, Букино)", price: 800, color: "rgba(255,106,0,.16)", dotColor: "#ff6a00" },
  { id: 3, name: "Кулаково / Луговое", desc: "10–25 км", price: 1200, color: "rgba(184,119,10,.2)", dotColor: "#b8770a" },
  { id: 4, name: "За городом", desc: "свыше 25 км, по согласованию", price: 1800, color: "rgba(205,44,4,.16)", dotColor: "#cd2c04" },
];

// ===== Доставки и заборы =====
type DeliveryType = "delivery" | "pickup";
type DeliveryStatus = "planned" | "on-the-way" | "delivered" | "pickup" | "returned";

interface DeliveryItem {
  id: string;
  clientName: string;
  phone: string;
  address: string;
  date: string;
  timeSlot: string;
  driver: DriverSel;
  type: DeliveryType;
  status: DeliveryStatus;
  comment?: string;
}

const deliveries: DeliveryItem[] = [
  { id: "dl1", clientName: "Морозов А.", phone: "+79091112233", address: "ДНТ Берёзка, уч. 14", date: "2026-06-26", timeSlot: "09:00–11:00", driver: "Сергей", type: "delivery", status: "on-the-way" },
  { id: "dl2", clientName: "СтройМонтаж ООО", phone: "+73452556677", address: "ул. Республики 200", date: "2026-06-26", timeSlot: "12:00–14:00", driver: "Сергей", type: "delivery", status: "planned" },
  { id: "dl3", clientName: "Падерин", phone: "+79058264734", address: "ул. Падерина 8", date: "2026-06-26", timeSlot: "15:00–17:00", driver: "Игорь", type: "pickup", status: "planned", comment: "Забрать леса + долг" },
  { id: "dl4", clientName: "Гусев", phone: "+79324567890", address: "пос. Молодёжный", date: "2026-06-25", timeSlot: "16:00–18:00", driver: "Сергей", type: "delivery", status: "delivered" },
];

const STATUS_META: Record<DeliveryStatus, { label: string; tone: Tone }> = {
  planned: { label: "Запланирована", tone: "amber" },
  "on-the-way": { label: "В пути", tone: "blue" },
  delivered: { label: "Доставлено", tone: "green" },
  pickup: { label: "Забор", tone: "amber" },
  returned: { label: "Возвращено", tone: "gray" },
};

const TYPE_META: Record<DeliveryType, { label: string; icon: string; tone: Tone }> = {
  delivery: { label: "Доставка", icon: "truck-delivery", tone: "blue" },
  pickup: { label: "Забор", icon: "package-import", tone: "amber" },
};

// ===== Наивное определение зоны по адресу =====
function pickZone(raw: string): Zone {
  const s = raw.trim().toLowerCase();
  if (!s) return zones[0];
  if (s.includes("кулаково") || s.includes("луговое")) return zones[2];
  if (/(за\s*город|свыше|днт|пос\.|посёлок|поселок|снт)/.test(s)) return zones[3];
  if (s.includes("центр") || s.includes("республики") || s.includes("ленина")) return zones[0];
  if (s.includes("антипино") || s.includes("букино") || s.includes("пригород")) return zones[1];
  // запасной вариант — по длине строки
  if (s.length > 28) return zones[3];
  if (s.length > 18) return zones[2];
  if (s.length > 10) return zones[1];
  return zones[0];
}

export default function Delivery() {
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState("");

  const result = useMemo(() => (address.trim() ? pickZone(address) : null), [address]);

  // ===== Метрики =====
  const stats = {
    today: deliveries.filter((d) => d.date === TODAY).length,
    onTheWay: deliveries.filter((d) => d.status === "on-the-way").length,
    pickups: deliveries.filter((d) => d.type === "pickup").length,
    done: deliveries.filter((d) => d.status === "delivered" || d.status === "returned").length,
  };

  // ===== Группировка по водителям =====
  const driverOrder: DriverSel[] = [];
  const byDriver = new Map<DriverSel, DeliveryItem[]>();
  for (const d of deliveries) {
    if (!byDriver.has(d.driver)) {
      byDriver.set(d.driver, []);
      driverOrder.push(d.driver);
    }
    byDriver.get(d.driver)!.push(d);
  }

  return (
    <div>
      <PageHeader eyebrow="Логистика" title="Доставка">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          <i className="ti ti-plus" aria-hidden="true" /> Запланировать
        </button>
      </PageHeader>

      {/* ===== Секция 1: Расчёт доставки по адресу ===== */}
      <div className="card card--pad mt-8">
        <div className="row between wrap gap-12">
          <div className="row gap-6 fw7 f15">
            <i className="ti ti-map-pin" aria-hidden="true" style={{ color: "var(--orange)" }} />
            Тюмень
          </div>
          <span className="text-dim f13">Расчёт стоимости доставки по адресу</span>
        </div>

        <div className="mt-12">
          <label className="field-label">Адрес</label>
          <input
            className="input"
            placeholder="Введите адрес или место"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {result && (
          <div
            className="row between wrap gap-12 mt-12"
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius)",
              background: result.color,
              border: "1px solid var(--line)",
            }}
          >
            <div className="row gap-8">
              <span
                className="dot"
                style={{ background: result.dotColor, width: 12, height: 12 }}
              />
              <span className="fw7 f14">Зона: {result.name}</span>
              <span className="text-dim f13">· Доставка: {money(result.price)}</span>
            </div>
            <Badge tone="orange">{money(result.price)}</Badge>
          </div>
        )}

        {/* Легенда зон */}
        <div className="grid grid-4 mt-16">
          {zones.map((z) => {
            const active = result?.id === z.id;
            return (
              <div
                key={z.id}
                className="card card--pad"
                style={{
                  background: z.color,
                  borderColor: active ? z.dotColor : "var(--line)",
                  borderWidth: active ? 2 : 1,
                  borderStyle: "solid",
                }}
              >
                <div className="row gap-8">
                  <span
                    className="dot"
                    style={{ background: z.dotColor, width: 12, height: 12, flex: "none" }}
                  />
                  <span className="fw7 f14">{z.name}</span>
                </div>
                <div className="f13 text-dim mt-8">{z.desc}</div>
                <div className="fw8 f15 mt-8">{money(z.price)}</div>
              </div>
            );
          })}
        </div>

        {/* Схематичная «карта» — стопка полупрозрачных полос зон */}
        <div
          className="mt-16"
          style={{
            borderRadius: "var(--radius)",
            overflow: "hidden",
            border: "1px solid var(--line)",
            background: "var(--gray-light)",
          }}
        >
          <div
            className="f12 fw7 text-dim row gap-6"
            style={{ padding: "8px 14px", borderBottom: "1px solid var(--line)" }}
          >
            <i className="ti ti-map-2" aria-hidden="true" style={{ color: "var(--orange)" }} />
            Схема зон доставки — Тюмень
          </div>
          <div style={{ padding: 14, display: "grid", gap: 8 }}>
            {zones.map((z, i) => {
              const active = result?.id === z.id;
              return (
                <div
                  key={z.id}
                  className="row between wrap gap-8"
                  style={{
                    background: z.color,
                    borderRadius: 10,
                    padding: "10px 14px",
                    // вложенный/концентрический вид: ближние зоны уже
                    marginInline: i * 18,
                    border: active ? `2px solid ${z.dotColor}` : "1px solid transparent",
                    transition: "border-color .15s",
                  }}
                >
                  <span className="row gap-8 fw7 f13">
                    <span
                      className="dot"
                      style={{ background: z.dotColor, width: 10, height: 10, flex: "none" }}
                    />
                    {z.name}
                  </span>
                  <span className="fw7 f13">{money(z.price)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== Секция 2: Доставки и заборы ===== */}
      <div className="section-label mt-16">
        <i className="ti ti-truck-delivery" aria-hidden="true" /> Доставки и заборы
      </div>

      <div className="grid grid-4 mt-8">
        <Stat label="На сегодня" value={stats.today} icon="calendar" tone="orange" />
        <Stat label="В пути" value={stats.onTheWay} icon="truck-delivery" tone="amber" />
        <Stat label="Заборы" value={stats.pickups} icon="package-import" tone="amber" />
        <Stat label="Доставлено" value={stats.done} icon="check" tone="green" />
      </div>

      {deliveries.length === 0 ? (
        <Empty icon="truck" text="Нет запланированных доставок" />
      ) : (
        driverOrder.map((driver) => {
          const items = byDriver.get(driver)!;
          if (!items.length) return null;
          return (
            <section key={driver} className="mt-16">
              <div className="section-label">
                <i className="ti ti-route" aria-hidden="true" /> Маршрут — {driver}
                <span className="text-dim f13 fw7">· {items.length}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map((d) => {
                  const tm = TYPE_META[d.type];
                  const sm = STATUS_META[d.status];
                  return (
                    <div key={d.id} className="card card--pad card-hover">
                      <div className="row between wrap gap-12" style={{ alignItems: "flex-start" }}>
                        <div className="row gap-12" style={{ alignItems: "flex-start" }}>
                          <IconCircle icon={tm.icon} tone={tm.tone} />
                          <div>
                            <div className="fw7 f15">{d.clientName}</div>
                            <div className="row gap-8 wrap mt-8 f13 text-dim">
                              <span className="row gap-6">
                                <i className="ti ti-map-pin" aria-hidden="true" /> {d.address}
                              </span>
                              <span className="row gap-6">
                                <i className="ti ti-clock-hour-4" aria-hidden="true" /> {d.timeSlot}
                              </span>
                            </div>
                            <div className="f12 text-dim mt-8">{phoneFmt(d.phone)}</div>
                          </div>
                        </div>

                        <div className="row gap-8 wrap" style={{ alignItems: "center", justifyContent: "flex-end" }}>
                          <Badge tone={tm.tone}>{tm.label}</Badge>
                          <Badge tone={sm.tone} dot>{sm.label}</Badge>
                          <span className="f12 text-dim">{dateShort(d.date)}</span>
                        </div>
                      </div>

                      {d.comment && (
                        <div className="mt-12 f13 text-dim" style={{ fontStyle: "italic" }}>
                          <i className="ti ti-message-2" aria-hidden="true" /> {d.comment}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      {/* ===== Модалка планирования ===== */}
      {showModal && (
        <Modal
          title="Запланировать доставку"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn--outline" onClick={() => setShowModal(false)}>
                Отмена
              </button>
              <button className="btn btn--primary" onClick={() => setShowModal(false)}>
                Запланировать
              </button>
            </>
          }
        >
          <div className="grid grid-2 gap-12">
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="field-label">Клиент</label>
              <input className="input" placeholder="Имя или компания" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="field-label">Адрес</label>
              <input className="input" placeholder="Адрес доставки" />
            </div>
            <div>
              <label className="field-label">Дата</label>
              <input className="input" type="date" defaultValue={TODAY} />
            </div>
            <div>
              <label className="field-label">Время</label>
              <input className="input" placeholder="09:00–11:00" />
            </div>
            <div>
              <label className="field-label">Водитель</label>
              <select className="input" defaultValue={DRIVERS[0]}>
                {DRIVERS.map((dr) => (
                  <option key={dr} value={dr}>
                    {dr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Тип</label>
              <select className="input" defaultValue="delivery">
                <option value="delivery">Доставка</option>
                <option value="pickup">Забор</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
