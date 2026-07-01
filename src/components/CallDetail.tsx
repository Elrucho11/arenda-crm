import { useEffect, useMemo, useRef, useState } from "react";
import type { Call, Client } from "../types";
import { attributes, attrById } from "../data/mock";
import type { AttributeCategory } from "../types";
import { Modal, Badge, Avatar } from "./ui";
import { phoneFmt, timeHM, dateShort } from "../lib/format";

const CAT_LABEL: Record<AttributeCategory, string> = {
  quality: "Качество клиента", type: "Тип звонка", source: "Источник", stage: "Этап сделки",
};

function mmss(sec: number): string {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ===== Лента прослушивания записи =====
function Player({ duration }: { duration: number }) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const ref = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!playing) return;
    ref.current = window.setInterval(() => {
      setT((p) => {
        if (p + 0.1 >= duration) { setPlaying(false); return duration; }
        return p + 0.1;
      });
    }, 100);
    return () => window.clearInterval(ref.current);
  }, [playing, duration]);

  const bars = useMemo(
    () => Array.from({ length: 56 }, (_, i) =>
      20 + Math.round(38 * Math.abs(Math.sin(i * 1.3)) + 26 * Math.abs(Math.sin(i * 0.47 + 1)))),
    []
  );
  const frac = duration ? t / duration : 0;

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setT(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration);
  }

  return (
    <div className="card card--pad" style={{ background: "var(--gray-light)", border: "none" }}>
      <div className="row gap-12" style={{ alignItems: "center" }}>
        <button className="btn btn--primary" style={{ width: 46, height: 46, borderRadius: "50%", padding: 0, flex: "none" }}
          onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Пауза" : "Играть"}>
          <i className={`ti ti-player-${playing ? "pause" : "play"}`} aria-hidden="true" style={{ fontSize: 20 }} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div onClick={seek} style={{ display: "flex", alignItems: "center", gap: 2, height: 46, cursor: "pointer" }}>
            {bars.map((h, i) => (
              <div key={i} style={{
                flex: 1, height: `${h}%`, borderRadius: 2,
                background: i / bars.length <= frac ? "var(--orange)" : "var(--line-dark)",
                opacity: i / bars.length <= frac ? 1 : .5,
              }} />
            ))}
          </div>
          <div className="row between text-dim f12 mt-8">
            <span>{mmss(t)}</span><span>{mmss(duration)}</span>
          </div>
        </div>
        <a className="btn btn--outline btn--sm" href="#" onClick={(e) => e.preventDefault()} title="Скачать запись">
          <i className="ti ti-download" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export default function CallDetail({
  call, client, attrs, onToggleAttr, onBlacklist, isBlacklisted, onClose,
}: {
  call: Call; client?: Client; attrs: string[];
  onToggleAttr: (id: string) => void; onBlacklist: () => void; isBlacklisted: boolean; onClose: () => void;
}) {
  const digits = call.phone.replace(/\D/g, "");
  const name = client ? client.name : "Новый номер";
  const answered = call.talkSec > 0;

  const links = [
    { label: "Google", icon: "brand-google", url: `https://www.google.com/search?q=${encodeURIComponent("+" + digits)}` },
    { label: "Яндекс", icon: "search", url: `https://yandex.ru/search/?text=${encodeURIComponent("+" + digits)}` },
    { label: "Спам-базы", icon: "shield-search", url: `https://www.google.com/search?q=${encodeURIComponent("+" + digits + " отзывы спам")}` },
  ];

  // доступные для добавления атрибуты, сгруппированные по категории
  const grouped = (["type", "quality", "source", "stage"] as AttributeCategory[]).map((cat) => ({
    cat, items: attributes.filter((a) => a.category === cat && a.active),
  }));

  return (
    <Modal title="Разговор" onClose={onClose} wide
      footer={
        <>
          <a className="btn btn--outline" href={`tel:${call.phone}`}><i className="ti ti-phone" aria-hidden="true" /> Позвонить</a>
          <a className="btn btn--outline" href={`https://wa.me/${digits}`} target="_blank" rel="noopener"><i className="ti ti-brand-whatsapp" aria-hidden="true" /> WhatsApp</a>
          {isBlacklisted
            ? <span className="btn btn--danger" style={{ pointerEvents: "none" }}><i className="ti ti-ban" aria-hidden="true" /> В чёрном списке</span>
            : <button className="btn btn--danger" onClick={onBlacklist}><i className="ti ti-ban" aria-hidden="true" /> В чёрный список</button>}
        </>
      }>
      {/* Шапка разговора */}
      <div className="row gap-12 wrap mb-16" style={{ alignItems: "center" }}>
        <Avatar name={name} size={44} />
        <div style={{ flex: 1, minWidth: 160 }}>
          <div className="fw8 f15">{name}</div>
          <div className="text-dim f13">{phoneFmt(call.phone)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="row gap-6" style={{ justifyContent: "flex-end" }}>
            <i className={`ti ti-arrow-${call.direction === "incoming" ? "down-left" : "up-right"}`} aria-hidden="true" style={{ color: "var(--text-dim)" }} />
            <span className="fw7 f13">{call.direction === "incoming" ? "Входящий" : "Исходящий"}</span>
            {answered ? <Badge tone="green">Отвечен</Badge> : <Badge tone="red">Пропущен</Badge>}
          </div>
          <div className="text-dim f12 mt-8">{timeHM(call.startedAt)} · {dateShort(call.startedAt)} · оператор {call.operator}</div>
        </div>
      </div>

      {/* Запись */}
      <div className="section-label mb-8">Запись разговора</div>
      {answered
        ? <Player duration={call.talkSec} />
        : <div className="card card--pad text-dim f13" style={{ background: "var(--gray-light)", border: "none" }}>Записи нет — звонок не состоялся (ожидание {call.waitSec}с).</div>}

      {/* Быстрые ссылки */}
      <div className="section-label mt-20 mb-8">Проверить номер</div>
      <div className="row gap-8 wrap">
        {links.map((l) => (
          <a key={l.label} className="btn btn--outline btn--sm" href={l.url} target="_blank" rel="noopener">
            <i className={`ti ti-${l.icon}`} aria-hidden="true" /> {l.label}
          </a>
        ))}
        <button className="btn btn--outline btn--sm" onClick={() => navigator.clipboard?.writeText(call.phone)}>
          <i className="ti ti-copy" aria-hidden="true" /> Копировать номер
        </button>
      </div>

      {/* Атрибуты */}
      <div className="section-label mt-20 mb-8">Атрибуты {client ? "клиента" : "звонка"}</div>
      <div className="row gap-6 wrap mb-12">
        {attrs.length ? attrs.map((id) => {
          const a = attrById(id);
          return a ? (
            <span key={id} className="badge badge--orange" style={{ cursor: "pointer" }} onClick={() => onToggleAttr(id)} title="Убрать">
              {a.name} <i className="ti ti-x" aria-hidden="true" style={{ fontSize: 11 }} />
            </span>
          ) : null;
        }) : <span className="text-dim f13">Пока не проставлены</span>}
      </div>
      <div className="card card--pad" style={{ background: "var(--gray-light)", border: "none" }}>
        <div className="text-dim f12 mb-8">Добавить атрибут:</div>
        {grouped.map((g) => (
          <div key={g.cat} className="mb-8">
            <div className="text-dim f12 mb-8" style={{ fontWeight: 700 }}>{CAT_LABEL[g.cat]}</div>
            <div className="row gap-6 wrap">
              {g.items.map((a) => {
                const on = attrs.includes(a.id);
                return (
                  <button key={a.id} className={`chip ${on ? "is-active" : ""}`} onClick={() => onToggleAttr(a.id)}>
                    {on && <i className="ti ti-check" aria-hidden="true" style={{ fontSize: 12 }} />} {a.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
