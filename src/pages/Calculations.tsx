import { useMemo, useState } from "react";
import { calculations as seed } from "../data/mock";
import type { Calculation, CalcKind, EquipmentCategory } from "../types";
import { PageHeader, Badge, Empty } from "../components/ui";
import { money, money0, dateShort, timeHM } from "../lib/format";

// ===== Параметры ценообразования (леса) =====
const LESA_PARTS = [
  { name: "Рама с лестницей", perKit: 1, weight: 18, rate: 9 },
  { name: "Рама проходная", perKit: 1, weight: 16, rate: 8 },
  { name: "Диагональная связь", perKit: 1, weight: 5, rate: 3 },
  { name: "Горизонтальная связь", perKit: 2, weight: 4, rate: 2 },
];
const DECKS: Record<string, { weight: number; rate: number }> = {
  "Без настила": { weight: 0, rate: 0 },
  "Деревянный": { weight: 12, rate: 7 },
  "Ригельный": { weight: 14, rate: 9 },
  "Металлический": { weight: 18, rate: 11 },
};
const EXTRAS: Record<string, { weight: number; rate: number }> = {
  "Пятка": { weight: 2, rate: 1 },
  "Кронштейн": { weight: 1.5, rate: 1 },
  "Винтовая опора 350": { weight: 6, rate: 4 },
};
const MIN_ORDER = 1500;

// Высоты вышек-тур: тариф/сутки и вес
const TOWERS: Record<string, { rate: number; weight: number }> = {
  "4 м": { rate: 760, weight: 95 },
  "6 м": { rate: 950, weight: 140 },
  "8 м": { rate: 1100, weight: 180 },
  "10 м": { rate: 1300, weight: 230 },
  "12 м": { rate: 1500, weight: 280 },
};

type Line = { name: string; qty: number; unit: string; weight: number };

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + Math.max(1, days));
  return d.toISOString().slice(0, 10);
}

export default function Calculations() {
  const [list, setList] = useState<Calculation[]>(seed);
  const [view, setView] = useState<"list" | "pick" | "form">("list");
  const [category, setCategory] = useState<EquipmentCategory>("Леса");
  const [expanded, setExpanded] = useState<Set<number>>(new Set([seed[0]?.id]));

  function onSave(calc: Calculation) {
    setList((l) => [calc, ...l]);
    setExpanded((s) => new Set([calc.id, ...s]));
    setView("list");
  }
  function toggle(id: number) {
    setExpanded((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function remove(id: number) { setList((l) => l.filter((c) => c.id !== id)); }

  return (
    <div>
      <PageHeader eyebrow="Калькулятор аренды" title="Расчёты">
        {view === "list"
          ? <button className="btn btn--primary" onClick={() => setView("pick")}><i className="ti ti-calculator" aria-hidden="true" /> Добавить расчёт</button>
          : <button className="btn btn--dark" onClick={() => setView("list")}><i className="ti ti-arrow-left" aria-hidden="true" /> Назад</button>}
      </PageHeader>

      {view === "list" && (
        list.length ? (
          <div className="grid" style={{ gap: 16 }}>
            {list.map((c) => (
              <CalcCard key={c.id} calc={c} open={expanded.has(c.id)} onToggle={() => toggle(c.id)} onDelete={() => remove(c.id)} />
            ))}
          </div>
        ) : <Empty icon="calculator" text="Пока нет расчётов" />
      )}

      {view === "pick" && (
        <div className="grid grid-2">
          {(["Леса", "Вышки-туры"] as EquipmentCategory[]).map((cat) => (
            <div key={cat} className="card card--pad card-hover row between" style={{ alignItems: "center" }}>
              <div>
                <div className="fw8 f18">{cat === "Леса" ? "Строительные леса" : "Вышки-туры"}</div>
                <div className="text-dim f13 mt-8">{cat === "Леса" ? "Комплекты, метры, настилы, доп. элементы" : "По высоте и количеству"}</div>
              </div>
              <button className="btn btn--primary" onClick={() => { setCategory(cat); setView("form"); }}>Создать расчёт</button>
            </div>
          ))}
        </div>
      )}

      {view === "form" && (
        <CalcForm category={category} nextId={Math.max(0, ...list.map((c) => c.id)) + 1} onSave={onSave} onSwitch={setCategory} />
      )}
    </div>
  );
}

// ===== Карточка готового расчёта =====
function CalcCard({ calc, open, onToggle, onDelete }: { calc: Calculation; open: boolean; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="card card--pad">
      <div className="row between wrap gap-10">
        <div className="row gap-10 wrap" style={{ alignItems: "center" }}>
          <b className="f15">Расчёт #{calc.id}</b>
          <Badge tone="orange">{calc.category === "Леса" ? "Строительные леса" : calc.category}</Badge>
          <Badge tone="gray">{calc.kind}</Badge>
        </div>
        <div className="row gap-10" style={{ alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div className="text-dim f12">Стоимость</div>
            <div className="fw8 f18">{money(calc.total)}</div>
          </div>
          <button className="btn btn--dark btn--sm"><i className="ti ti-link" aria-hidden="true" /> Прикрепить</button>
          <button className="btn btn--outline btn--sm" onClick={onToggle}><i className={`ti ti-chevron-${open ? "up" : "down"}`} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="text-dim f13 mt-8">
        Создан: {timeHM(calc.createdAt)} {dateShort(calc.createdAt)} · Создал: <b style={{ color: "var(--text)" }}>{calc.author}</b>
      </div>
      <div className="f13 fw7 mt-8">Аренда: {dateShort(calc.startDate)} — {dateShort(calc.endDate)} ({calc.days} дней)</div>

      {open && (
        <div className="grid grid-2 mt-16" style={{ alignItems: "start" }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="tbl">
              <thead><tr><th>Наименование</th><th style={{ textAlign: "right" }}>Кол-во</th></tr></thead>
              <tbody>
                {calc.lines.map((l, i) => (
                  <tr key={i}><td>{l.name}</td><td style={{ textAlign: "right" }} className="fw7">{l.qty} {l.unit}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card card--pad">
            <SummaryRow label="Полная стоимость" value={money(calc.fullPrice)} />
            <SummaryRow label="Стоимость в сутки" value={money(calc.perDay)} />
            <SummaryRow label="Доставка" value={money(calc.deliveryPrice)} />
            <div style={{ borderTop: "1px solid var(--line)", margin: "8px 0" }} />
            <SummaryRow label="Итого" value={money(calc.total + calc.discount)} />
            <SummaryRow label="С учётом скидки" value={money(calc.total)} strong />
            <div className="row gap-8 mt-16">
              <button className="btn btn--primary btn--sm"><i className="ti ti-edit" aria-hidden="true" /> Редактировать</button>
              <button className="btn btn--danger btn--sm" onClick={onDelete}><i className="ti ti-trash" aria-hidden="true" /> Удалить расчёт</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="row between" style={{ padding: "5px 0" }}>
      <span className="text-dim f13">{label}:</span>
      <span className={strong ? "fw8 f15" : "fw7 f13"} style={strong ? { color: "var(--orange-dark)" } : undefined}>{value}</span>
    </div>
  );
}

// ===== Калькулятор =====
function CalcForm({ category, nextId, onSave, onSwitch }: {
  category: EquipmentCategory; nextId: number; onSave: (c: Calculation) => void; onSwitch: (c: EquipmentCategory) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [days, setDays] = useState(1);
  const end = addDays(start, days);

  // Леса
  const [kind, setKind] = useState<CalcKind>("Комплекты");
  const [kits, setKits] = useState(10);
  const [lenM, setLenM] = useState(12);
  const [heightM, setHeightM] = useState(4);
  const [deck, setDeck] = useState("Без настила");
  const [decks, setDecks] = useState(0);
  const [extras, setExtras] = useState<Record<string, boolean>>({});

  // Вышки
  const [towerH, setTowerH] = useState("4 м");
  const [towerQty, setTowerQty] = useState(1);

  // Скидка / доставка
  const [discountOn, setDiscountOn] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [deliveryOn, setDeliveryOn] = useState(false);
  const [delivery, setDelivery] = useState(0);

  const effKits = category === "Леса" && kind === "Метры"
    ? Math.max(1, Math.ceil(lenM / 3) * Math.ceil(heightM / 2))
    : kits;

  const calc = useMemo(() => {
    const lines: Line[] = [];
    let rentPerDay = 0;
    let weight = 0;

    if (category === "Леса") {
      for (const p of LESA_PARTS) {
        const qty = p.perKit * effKits;
        lines.push({ name: p.name, qty, unit: "шт", weight: p.weight * qty });
        rentPerDay += p.rate * qty;
        weight += p.weight * qty;
      }
      if (deck !== "Без настила" && decks > 0) {
        const d = DECKS[deck];
        lines.push({ name: `Настил (${deck.toLowerCase()})`, qty: decks, unit: "шт", weight: d.weight * decks });
        rentPerDay += d.rate * decks;
        weight += d.weight * decks;
      }
      for (const [name, on] of Object.entries(extras)) {
        if (!on) continue;
        const e = EXTRAS[name];
        lines.push({ name, qty: effKits, unit: "шт", weight: e.weight * effKits });
        rentPerDay += e.rate * effKits;
        weight += e.weight * effKits;
      }
    } else {
      const t = TOWERS[towerH];
      lines.push({ name: `Вышка-тура ${towerH}`, qty: towerQty, unit: "шт", weight: t.weight * towerQty });
      rentPerDay += t.rate * towerQty;
      weight += t.weight * towerQty;
    }

    const fullPrice = rentPerDay * days;
    const total = Math.max(fullPrice, MIN_ORDER);
    const perDay = total / days;
    const perKit = category === "Леса" ? total / Math.max(1, effKits) : total / Math.max(1, towerQty);
    const disc = discountOn ? Math.round(total * discount / 100) : 0;
    const deliveryPrice = deliveryOn ? delivery : 0;
    const withDiscount = total - disc + deliveryPrice;

    return { lines, weight, rentPerDay, fullPrice, total, perDay, perKit, disc, deliveryPrice, withDiscount };
  }, [category, effKits, deck, decks, extras, towerH, towerQty, days, discountOn, discount, deliveryOn, delivery]);

  function save() {
    onSave({
      id: nextId,
      category,
      kind: category === "Леса" ? kind : "Комплекты",
      createdAt: new Date().toISOString(),
      author: "Pavel",
      startDate: start, endDate: end, days,
      lines: calc.lines.map((l) => ({ name: l.name, qty: l.qty, unit: l.unit })),
      fullPrice: calc.fullPrice,
      perDay: Math.round(calc.perDay),
      deliveryPrice: calc.deliveryPrice,
      discount: calc.disc,
      total: calc.withDiscount,
      attached: false,
    });
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* Категория */}
      <div className="grid grid-2">
        {(["Леса", "Вышки-туры"] as EquipmentCategory[]).map((cat) => (
          <button key={cat} className={`card card--pad row between ${category === cat ? "" : "card-hover"}`}
            onClick={() => onSwitch(cat)}
            style={{ cursor: "pointer", border: category === cat ? "2px solid var(--orange)" : undefined, background: "var(--white)", textAlign: "left" }}>
            <span className="fw8 f15">{cat === "Леса" ? "Строительные леса" : "Вышки-туры"}</span>
            {category === cat ? <Badge tone="orange">Выбрано</Badge> : <span className="btn btn--outline btn--sm">Выбрать</span>}
          </button>
        ))}
      </div>

      {/* Даты */}
      <div className="card card--pad">
        <div className="row gap-16 wrap" style={{ alignItems: "flex-end" }}>
          <div><label className="field-label">Начало аренды</label><input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} style={{ width: 180 }} /></div>
          <div>
            <label className="field-label">Кол-во дней</label>
            <div className="row gap-8" style={{ alignItems: "center" }}>
              <button className="btn btn--outline btn--sm" onClick={() => setDays((d) => Math.max(1, d - 1))}>−</button>
              <b style={{ minWidth: 28, textAlign: "center" }}>{days}</b>
              <button className="btn btn--outline btn--sm" onClick={() => setDays((d) => d + 1)}>+</button>
            </div>
          </div>
          <div><label className="field-label">Конец аренды</label><input className="input" type="date" value={end} readOnly style={{ width: 180 }} /></div>
        </div>
      </div>

      {/* Форма категории */}
      <div className="card card--pad">
        {category === "Леса" ? (
          <>
            <div className="row between wrap mb-12">
              <span className="section-label">Строительные леса</span>
              <div className="row gap-6">
                {(["Комплекты", "Метры"] as CalcKind[]).map((k) => (
                  <button key={k} className={`chip ${kind === k ? "is-active" : ""}`} onClick={() => setKind(k)}>{k}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-3">
              {kind === "Комплекты" ? (
                <div><label className="field-label">Комплектов, шт</label><input className="input" type="number" min={1} value={kits} onChange={(e) => setKits(+e.target.value || 0)} /></div>
              ) : (
                <>
                  <div><label className="field-label">Длина, м</label><input className="input" type="number" min={1} value={lenM} onChange={(e) => setLenM(+e.target.value || 0)} /></div>
                  <div><label className="field-label">Высота, м</label><input className="input" type="number" min={1} value={heightM} onChange={(e) => setHeightM(+e.target.value || 0)} /></div>
                </>
              )}
              <div>
                <label className="field-label">Тип настила</label>
                <select className="input" value={deck} onChange={(e) => setDeck(e.target.value)}>
                  {Object.keys(DECKS).map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="field-label">Настилов, шт</label><input className="input" type="number" min={0} value={decks} onChange={(e) => setDecks(+e.target.value || 0)} disabled={deck === "Без настила"} /></div>
            </div>
            {kind === "Метры" && <div className="text-dim f12 mt-8">≈ {effKits} комплектов из расчёта длины и высоты</div>}
            <div className="row gap-16 wrap mt-16">
              {Object.keys(EXTRAS).map((name) => (
                <label key={name} className="row gap-6" style={{ cursor: "pointer" }}>
                  <input type="checkbox" checked={!!extras[name]} onChange={(e) => setExtras((x) => ({ ...x, [name]: e.target.checked }))} style={{ width: "auto" }} />
                  {name}
                </label>
              ))}
            </div>
          </>
        ) : (
          <>
            <span className="section-label">Вышки-туры</span>
            <div className="grid grid-3 mt-12">
              <div>
                <label className="field-label">Высота</label>
                <select className="input" value={towerH} onChange={(e) => setTowerH(e.target.value)}>
                  {Object.keys(TOWERS).map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div><label className="field-label">Количество, шт</label><input className="input" type="number" min={1} value={towerQty} onChange={(e) => setTowerQty(+e.target.value || 0)} /></div>
            </div>
          </>
        )}

        {/* Скидка / доставка */}
        <div className="row gap-16 wrap mt-16">
          <label className="row gap-6" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={discountOn} onChange={(e) => setDiscountOn(e.target.checked)} style={{ width: "auto" }} /> Добавить скидку
          </label>
          {discountOn && <input className="input" type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(+e.target.value || 0)} style={{ width: 110 }} placeholder="%" />}
          <label className="row gap-6" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={deliveryOn} onChange={(e) => setDeliveryOn(e.target.checked)} style={{ width: "auto" }} /> Добавить доставку
          </label>
          {deliveryOn && <input className="input" type="number" min={0} value={delivery} onChange={(e) => setDelivery(+e.target.value || 0)} style={{ width: 130 }} placeholder="₽" />}
        </div>
      </div>

      {/* Результат */}
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="card--pad" style={{ borderBottom: "1px solid var(--line)" }}><span className="section-label">В стоимость входит</span></div>
          <table className="tbl">
            <thead><tr><th>Наименование</th><th style={{ textAlign: "right" }}>Кол-во</th><th style={{ textAlign: "right" }}>Вес, кг</th></tr></thead>
            <tbody>
              {calc.lines.map((l, i) => (
                <tr key={i}><td>{l.name}</td><td style={{ textAlign: "right" }} className="fw7">{l.qty} {l.unit}</td><td style={{ textAlign: "right" }} className="text-dim">{Math.round(l.weight)}</td></tr>
              ))}
              <tr><td className="fw8">Итого вес</td><td></td><td style={{ textAlign: "right" }} className="fw8">{Math.round(calc.weight)} кг</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card card--pad">
          <SummaryRow label="Базовый расчёт (в сутки)" value={money(calc.rentPerDay)} />
          <SummaryRow label="Мин. стоимость заказа" value={money(MIN_ORDER)} />
          <SummaryRow label="Полная стоимость" value={money(calc.fullPrice)} />
          <div style={{ borderTop: "1px solid var(--line)", margin: "8px 0" }} />
          <SummaryRow label="Стоимость в сутки" value={money(calc.perDay)} />
          <SummaryRow label={category === "Леса" ? "Стоимость одного комплекта" : "Стоимость одной вышки"} value={money(calc.perKit)} />
          <SummaryRow label="Доставка" value={money(calc.deliveryPrice)} />
          {calc.disc > 0 && <SummaryRow label={`Скидка ${discount}%`} value={"−" + money0(calc.disc) + " ₽"} />}
          <div style={{ borderTop: "1px solid var(--line)", margin: "8px 0" }} />
          <SummaryRow label="Итого без скидки" value={money(calc.total + calc.deliveryPrice)} />
          <SummaryRow label="С учётом скидки" value={money(calc.withDiscount)} strong />
          <button className="btn btn--primary btn--block mt-16" onClick={save}><i className="ti ti-device-floppy" aria-hidden="true" /> Сохранить расчёт</button>
        </div>
      </div>
    </div>
  );
}
