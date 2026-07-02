import { useState } from "react";
import { PageHeader } from "../components/ui";

interface ZoneResult {
  zone: string;
  price: number;
}

function detectZone(query: string): ZoneResult {
  const q = query.toLowerCase();
  if (q.includes("кулаков")) return { zone: "Красная — Кулаково", price: 1200 };
  if (q.includes("лугов")) return { zone: "Розовая — Луговое", price: 900 };
  return { zone: "Фиолетовая — Тюмень (центр)", price: 500 };
}

const LEGEND: { color: string; label: string }[] = [
  { color: "#7c5cd6", label: "Фиолетовая — 500 ₽" },
  { color: "#e07bb0", label: "Розовая — 900 ₽" },
  { color: "#d85a30", label: "Красная (Кулаково) — 1200 ₽" },
  { color: "#7a9b3a", label: "Оливковая (Луговое) — 900 ₽" },
];

export default function Delivery() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ZoneResult | null>(null);

  const search = () => {
    if (!query.trim()) {
      setResult(null);
      return;
    }
    setResult(detectZone(query));
  };

  return (
    <div>
      <PageHeader eyebrow="Логистика" title="Доставка" />

      {/* Поиск адреса */}
      <div className="card card--pad">
        <div className="row gap-8">
          <i className="ti ti-map-pin" style={{ color: "var(--orange)", fontSize: 18 }} aria-hidden="true" />
          <span className="fw8">Тюмень</span>
        </div>
        <div className="row gap-8 mt-12">
          <input
            className="input"
            placeholder="Введите адрес или место"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") search();
            }}
            style={{ background: "var(--dark)", color: "#fff", border: "1px solid var(--line-dark)" }}
          />
          <button className="btn btn--primary" onClick={search}>
            Найти
          </button>
        </div>
        {result && (
          <div
            className="mt-12 f14"
            style={{ background: "var(--gray-light)", borderRadius: 10, padding: 12 }}
          >
            <span className="fw7">Зона: {result.zone}</span>
            {" · "}
            Доставка {result.price.toLocaleString("ru-RU")} ₽
          </div>
        )}
        <div className="f12 text-dim mt-8">Стоимость рассчитывается по зоне на карте</div>
      </div>

      {/* Карта зон */}
      <div className="card mt-16" style={{ overflow: "hidden", padding: 0 }}>
        <svg
          viewBox="0 0 1200 460"
          preserveAspectRatio="xMidYMid slice"
          style={{ width: "100%", height: 460, display: "block" }}
          role="img"
          aria-label="Карта зон доставки Тюмени"
        >
          {/* фон */}
          <rect x="0" y="0" width="1200" height="460" fill="var(--gray-light)" />

          {/* река Тура */}
          <path
            d="M -20 90 C 150 40, 320 130, 480 80 C 640 30, 820 110, 1000 60 C 1100 35, 1180 70, 1230 50"
            stroke="#7fb0ec"
            strokeWidth={8}
            opacity={0.5}
            fill="none"
          />

          {/* Фиолетовая зона — большая слева/сверху */}
          <polygon
            points="40,30 520,20 590,140 540,300 380,380 150,340 60,220"
            fill="#7c5cd6"
            fillOpacity={0.35}
            stroke="#5a3fb0"
            strokeWidth={2}
          />

          {/* Розовая зона — широкая центральная */}
          <polygon
            points="300,150 900,120 1020,240 880,400 480,430 340,330"
            fill="#e07bb0"
            fillOpacity={0.35}
            stroke="#b8548a"
            strokeWidth={2}
          />

          {/* Красная зона — в центре вокруг Кулаково */}
          <polygon
            points="520,190 700,175 760,260 690,340 545,335 490,260"
            fill="#d85a30"
            fillOpacity={0.35}
            stroke="#a63e1d"
            strokeWidth={2}
          />

          {/* Зелёно-оливковая зона — справа снизу */}
          <polygon
            points="880,250 1160,220 1200,340 1150,450 920,450 850,360"
            fill="#7a9b3a"
            fillOpacity={0.35}
            stroke="#5a742a"
            strokeWidth={2}
          />

          {/* Подписи */}
          <text x="625" y="265" fontSize={20} fontWeight={700} fill="var(--text)">
            Кулаково
          </text>
          <text x="985" y="345" fontSize={20} fontWeight={700} fill="var(--text)">
            Луговое
          </text>
          <text x="180" y="75" fontSize={16} fill="var(--text-dim)">
            р. Тура
          </text>
          <text x="420" y="415" fontSize={16} fill="var(--text-dim)">
            Ирбитский тракт
          </text>

          <text x="1085" y="440" fontSize={13} fill="var(--text-dim)">
            Яндекс Карты
          </text>
        </svg>
      </div>

      {/* Легенда */}
      <div className="card card--pad mt-16">
        <div className="row gap-16 wrap">
          {LEGEND.map((z) => (
            <div key={z.label} className="row gap-8">
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: z.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span className="f13 text-dim">{z.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
