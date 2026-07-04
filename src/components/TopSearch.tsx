import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { clients } from "../data/mock";
import { phoneSearchKey, phoneFmt, phoneHeader } from "../lib/format";

// Универсальный поиск в шапке: по номеру (любой формат: +7 / 8 / без кода)
// и по подписи клиента. Выпадающий список + кнопка «Найти».
export default function TopSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const digits = q.replace(/\D/g, "");
  const qKey = phoneSearchKey(q);          // последние 10 цифр запроса
  const term = q.trim().toLowerCase();
  const fullPhone = digits.length >= 10;   // полный номер → доступна страница номера
  const numberKey = "7" + qKey;            // 11-значный ключ для /calls/:phone

  const results = useMemo(() => {
    if (!term) return [];
    return clients.filter((c) => {
      if (digits && phoneSearchKey(c.phone).includes(qKey)) return true;
      if (c.name.toLowerCase().includes(term)) return true;
      return false;
    }).slice(0, 6);
  }, [term, digits, qKey]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function goClient(id: string) { setOpen(false); setQ(""); navigate(`/clients/${id}`); }
  function goNumber() { setOpen(false); setQ(""); navigate(`/calls/${numberKey}`); }
  function submit() {
    if (results.length) goClient(results[0].id);
    else if (fullPhone) goNumber();
  }

  const showDropdown = open && !!term;

  return (
    <div className="topbar-search" ref={boxRef} style={{ position: "relative" }}>
      <i className="ti ti-search" aria-hidden="true" />
      <input
        placeholder="Поиск по номеру, клиенту…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); else if (e.key === "Escape") setOpen(false); }}
        style={{ paddingRight: q ? 82 : 13 }}
      />
      {q && (
        <button className="btn btn--primary btn--sm" onClick={submit}
          style={{ position: "absolute", right: 4, top: 4, height: 32, padding: "0 12px" }}>
          Найти
        </button>
      )}

      {showDropdown && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 60,
          background: "var(--white)", border: "1px solid var(--line)", borderRadius: 12,
          boxShadow: "var(--shadow-lg)", overflow: "hidden", maxHeight: 360, overflowY: "auto",
        }}>
          {results.map((c) => (
            <button key={c.id} onClick={() => goClient(c.id)}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, width: "100%", textAlign: "left", padding: "9px 13px", background: "none", border: "none", borderBottom: "1px solid var(--line)", cursor: "pointer" }}>
              <span className="fw7 f13" style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text)" }}>{c.name}</span>
              <span className="text-dim f12">{phoneFmt(c.phone)}</span>
            </button>
          ))}

          {fullPhone && (
            <button onClick={goNumber}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "10px 13px", background: "none", border: "none", cursor: "pointer", color: "var(--orange)", fontWeight: 700, fontSize: 13 }}>
              <i className="ti ti-phone" aria-hidden="true" /> Звонки номера {phoneHeader(numberKey)}
            </button>
          )}

          {results.length === 0 && !fullPhone && (
            <div className="text-dim f13" style={{ padding: "14px 13px", textAlign: "center" }}>Ничего не найдено</div>
          )}
        </div>
      )}
    </div>
  );
}
