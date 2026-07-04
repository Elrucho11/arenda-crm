export function money(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽";
}

export function money0(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n));
}

const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export function dateShort(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export function dateNice(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function timeHM(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function dur(sec: number): string {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m}:${String(s).padStart(2, "0")}` : `${s} сек`;
}

export function initials(name: string): string {
  const parts = name.replace(/[()]/g, "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function phoneFmt(p: string): string {
  const d = p.replace(/\D/g, "");
  if (d.length === 11) {
    return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}`;
  }
  return p;
}

// Канонический ключ номера — только цифры, ведущая 8 приводится к 7.
// "+79055373211", "89055373211", "8 (905) 537-32-11" → "79055373211".
export function phoneKey(p: string): string {
  let d = (p || "").replace(/\D/g, "");
  if (d.length === 11 && d[0] === "8") d = "7" + d.slice(1);
  return d;
}

// Ключ для поиска по номеру — значимые цифры без кода страны 7/8.
// "9129271637", "+79129271637", "89129271637" → все дают "9129271637".
// Частичный ввод тоже нормализуется: "+7 905" / "8 905" → "905"
// (мобильные РФ начинаются с 9, поэтому ведущие 7/8 — это код страны).
export function phoneSearchKey(p: string): string {
  let d = (p || "").replace(/\D/g, "");
  if (d.length > 10) return d.slice(-10);           // полный номер → последние 10
  if (d.length > 1 && (d[0] === "7" || d[0] === "8")) d = d.slice(1); // частичный: убрать код
  return d;
}

// Отображение номера в шапке страницы — как на проде: 8(905)537-32-11.
export function phoneHeader(p: string): string {
  const d = phoneKey(p);
  if (d.length === 11) {
    return `8(${d.slice(1, 4)})${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}`;
  }
  return p;
}

export function daysLeft(iso: string): number {
  const now = new Date("2026-06-26T00:00:00").getTime();
  const then = new Date(iso).getTime();
  return Math.round((then - now) / 86400000);
}
