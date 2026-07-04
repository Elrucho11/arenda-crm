import { useMemo, useRef, useState } from "react";
import { PageHeader, Modal } from "../components/ui";
import {
  chatThreads, chatClients, chatClientSearch, chatTemplates, botUsername,
} from "../data/chat";
import type { Channel, ChatThread, ChatMessage, ConvStatus } from "../data/chat";

const CHANNEL_ICON: Record<Channel, string> = { telegram: "brand-telegram", sms: "message-2", email: "mail" };
const CHANNEL_LABEL: Record<Channel, string> = { telegram: "Telegram", sms: "SMS", email: "Email" };
const STATUS_LABEL: Record<ConvStatus, string> = { open: "Открыт", waiting: "Ждёт ответа", closed: "Закрыт" };

function statusIcon(s?: string): string {
  switch (s) {
    case "sent": return "check";
    case "delivered": return "checks";
    case "failed": return "alert-triangle";
    default: return "clock";
  }
}

function stars(r: number): string {
  return "★".repeat(r) + "☆".repeat(5 - r);
}

type Folder = "all" | "unread" | "waiting" | "unassigned";

export default function Chat() {
  const [threads, setThreads] = useState<ChatThread[]>(chatThreads);
  const [folder, setFolder] = useState<Folder>("all");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<number | null>(threads[0]?.id ?? null);
  const [draft, setDraft] = useState("");
  const [channel, setChannel] = useState<Channel | "">("");
  const [linkSearch, setLinkSearch] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [invite, setInvite] = useState<{ open: boolean; link: string }>({ open: false, link: "" });
  const [copied, setCopied] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(9000);

  const counts = useMemo(() => ({
    unread: threads.filter((t) => t.unread > 0).length,
    waiting: threads.filter((t) => t.status === "waiting").length,
    unassigned: threads.filter((t) => t.clientId === null).length,
  }), [threads]);

  const folders: { key: Folder; label: string; count: number }[] = [
    { key: "all", label: "Все", count: 0 },
    { key: "unread", label: "Непроч.", count: counts.unread },
    { key: "waiting", label: "Ждут", count: counts.waiting },
    { key: "unassigned", label: "Новые", count: counts.unassigned },
  ];

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return threads.filter((t) => {
      if (folder === "unread" && t.unread === 0) return false;
      if (folder === "waiting" && t.status !== "waiting") return false;
      if (folder === "unassigned" && t.clientId !== null) return false;
      if (q && !t.title.toLowerCase().includes(q) && !(t.phone ?? "").includes(q)) return false;
      return true;
    });
  }, [threads, folder, search]);

  const active = threads.find((t) => t.id === activeId) ?? null;
  const client = active?.clientId ? chatClients[active.clientId] : null;

  const patchActive = (patch: Partial<ChatThread>) =>
    setThreads((prev) => prev.map((t) => (t.id === activeId ? { ...t, ...patch } : t)));

  function openThread(id: number) {
    setActiveId(id);
    setDraft("");
    const t = threads.find((x) => x.id === id);
    setChannel(t?.availableChannels[0] ?? "");
    // отметить прочитанным
    setThreads((prev) => prev.map((x) => (x.id === id ? { ...x, unread: 0 } : x)));
    requestAnimationFrame(() => feedRef.current?.scrollTo(0, feedRef.current.scrollHeight));
  }

  function send() {
    if (!active || !channel) return;
    const body = draft.trim();
    if (!body) return;
    if (channel === "telegram" && body.length > 4096) return;
    const msg: ChatMessage = {
      id: nextId.current++, direction: "outbound", channel, operator: "Pavel",
      body, time: "сейчас", status: "sent", sortKey: 999999,
    };
    patchActive({ messages: [...(active.messages), msg], lastMessageAt: "сейчас" });
    setDraft("");
    requestAnimationFrame(() => feedRef.current?.scrollTo(0, feedRef.current.scrollHeight));
  }

  function setStatus(status: ConvStatus) { patchActive({ status }); }

  function blockChat() {
    if (!active) return;
    setThreads((prev) => prev.filter((t) => t.id !== active.id));
    setActiveId(null);
  }

  function insertTemplate(id: string) {
    const t = chatTemplates.find((x) => x.id === id);
    if (!t) return;
    const body = t.body.replace(/\{имя\}|\{name\}/g, client?.name?.split(",")[0] ?? "");
    setDraft((d) => (d ? d + "\n" : "") + body);
  }

  function linkClient(id: string) {
    patchActive({ clientId: id });
    setLinkSearch("");
  }

  function createClient() {
    if (!newClientName.trim() || !active) return;
    // демо: привязываем к первому клиенту из справочника как заглушку
    chatClients[`new-${active.id}`] = {
      id: `new-${active.id}`, name: newClientName.trim(), rating: 3,
      phones: active.phone ? [active.phone] : [], totalCalls: 0,
    };
    patchActive({ clientId: `new-${active.id}` });
    setNewClientName("");
  }

  function openInvite() {
    setInvite({ open: true, link: `https://t.me/${botUsername}?start=inv_${active?.id}${Math.floor(1000 + (active?.id ?? 0) * 137 % 9000)}` });
    setCopied(false);
  }

  const linkResults = useMemo(() => {
    const q = linkSearch.trim().toLowerCase();
    if (q.length < 2) return [];
    return chatClientSearch.filter((c) => c.name.toLowerCase().includes(q) || c.phones.some((p) => p.includes(q))).slice(0, 6);
  }, [linkSearch]);

  return (
    <div>
      <PageHeader eyebrow="Сообщения" title="Чат" accent="клиентов" />

      <div style={{ display: "flex", gap: 12, height: "calc(100vh - 220px)", minHeight: 520 }}>

        {/* ===== Список диалогов ===== */}
        <div className="card" style={{ width: 300, flex: "none", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--line)" }}>
            {folders.map((f) => (
              <button key={f.key} onClick={() => setFolder(f.key)}
                style={{
                  flex: 1, padding: "9px 4px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  background: "none", border: "none", borderBottom: "2px solid",
                  borderBottomColor: folder === f.key ? "var(--orange)" : "transparent",
                  color: folder === f.key ? "var(--orange)" : "var(--text-dim)",
                }}>
                {f.label}
                {f.count > 0 && <span className="badge badge--red" style={{ marginLeft: 4, padding: "0 6px" }}>{f.count}</span>}
              </button>
            ))}
          </div>
          <div style={{ padding: 8, borderBottom: "1px solid var(--line)" }}>
            <input className="input" placeholder="Поиск по чатам…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: "8px 11px", fontSize: 13 }} />
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {shown.length === 0 && <div style={{ padding: 16, fontSize: 13, color: "var(--text-dim)", textAlign: "center" }}>Нет чатов</div>}
            {shown.map((t) => (
              <button key={t.id} onClick={() => openThread(t.id)}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 12px", cursor: "pointer",
                  borderBottom: "1px solid var(--line)", background: t.id === activeId ? "var(--hover)" : "transparent",
                  border: "none", borderLeft: t.id === activeId ? "2px solid var(--orange)" : "2px solid transparent",
                  display: "flex", gap: 8, alignItems: "flex-start",
                }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row gap-6" style={{ minWidth: 0 }}>
                    <span className="fw7 f13" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text)" }}>{t.title}</span>
                    {t.isBlacklisted && <span className="badge badge--red" style={{ flex: "none", padding: "0 6px", fontSize: 10 }}>ЧС</span>}
                    {!t.clientId && <span className="badge badge--amber" style={{ flex: "none", padding: "0 6px", fontSize: 10 }}>новый</span>}
                  </div>
                  <div className="row gap-6" style={{ marginTop: 3, fontSize: 12, color: "var(--text-dim)" }}>
                    {t.channels.map((ch) => <i key={ch} className={`ti ti-${CHANNEL_ICON[ch]}`} aria-hidden="true" style={{ fontSize: 14 }} />)}
                    {t.botBlocked && <i className="ti ti-ban" aria-hidden="true" title="Бот заблокирован" style={{ fontSize: 14, color: "var(--red)" }} />}
                    <span style={{ marginLeft: "auto" }}>{t.lastMessageAt}</span>
                  </div>
                </div>
                {t.unread > 0 && <span className="count-badge" style={{ background: "var(--orange)", minWidth: 18, height: 18, fontSize: 10 }}>{t.unread}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ===== Переписка ===== */}
        <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {!active ? (
            <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--text-dim)", fontSize: 14 }}>Выберите чат слева</div>
          ) : (
            <>
              <div className="row" style={{ gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
                <div style={{ minWidth: 0 }}>
                  <div className="fw8 f14" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active.title}</div>
                  <div className="f12 text-dim">{STATUS_LABEL[active.status]}</div>
                </div>
                <div className="row gap-6" style={{ marginLeft: "auto" }}>
                  {active.status !== "closed"
                    ? <button className="btn btn--outline btn--sm" onClick={() => setStatus("closed")}>Закрыть</button>
                    : <button className="btn btn--outline btn--sm" onClick={() => setStatus("open")}>Открыть</button>}
                  <button className="btn btn--danger btn--sm" onClick={blockChat}><i className="ti ti-ban" aria-hidden="true" /> Заблокировать</button>
                </div>
              </div>

              <div ref={feedRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8, background: "var(--gray-light)" }}>
                {active.messages.map((m) => {
                  const out = m.direction === "outbound";
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "72%", borderRadius: 12, padding: "8px 12px", border: "1px solid",
                        background: out ? "rgba(255,106,0,.10)" : "var(--white)",
                        borderColor: out ? "rgba(255,106,0,.30)" : "var(--line)",
                      }}>
                        <div className="row gap-6" style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 2 }}>
                          <span style={{ textTransform: "uppercase", letterSpacing: .4, fontWeight: 700 }}>{CHANNEL_LABEL[m.channel]}</span>
                          {m.operator && <span>{m.operator}</span>}
                          {m.edited && <span style={{ fontStyle: "italic" }}>изменено</span>}
                        </div>
                        {m.body && <div className="f13" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.body}</div>}
                        <div className="row gap-6" style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 3 }}>
                          <span>{m.time}</span>
                          {out && (
                            <span className="row gap-6" style={{ color: m.status === "failed" ? "var(--red)" : "var(--text-dim)" }}>
                              <i className={`ti ti-${statusIcon(m.status)}`} aria-hidden="true" style={{ fontSize: 13 }} />
                              {m.status === "failed" && "не отправлено"}
                            </span>
                          )}
                          {m.status === "failed" && <button className="open-link" style={{ padding: 0, color: "var(--red)" }}>повторить</button>}
                        </div>
                        {m.status === "failed" && m.error && <div style={{ fontSize: 10, color: "var(--red)", marginTop: 2 }}>{m.error}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: "1px solid var(--line)", padding: 10 }}>
                {active.availableChannels.length === 0 ? (
                  <div className="text-dim f12" style={{ textAlign: "center", padding: "10px 0" }}>
                    Нет доступных каналов. Пригласите клиента в Telegram (панель справа).
                  </div>
                ) : (
                  <>
                    <div className="row gap-8" style={{ marginBottom: 8 }}>
                      <select className="input" value={channel} onChange={(e) => setChannel(e.target.value as Channel)} style={{ width: "auto", padding: "6px 10px", fontSize: 12 }}>
                        {active.availableChannels.map((ch) => <option key={ch} value={ch}>{CHANNEL_LABEL[ch]}</option>)}
                      </select>
                      <select className="input" value="" onChange={(e) => { insertTemplate(e.target.value); e.target.value = ""; }} style={{ width: "auto", padding: "6px 10px", fontSize: 12 }}>
                        <option value="">Шаблоны…</option>
                        {chatTemplates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                      </select>
                      {channel === "telegram" && (
                        <span className="f12" style={{ marginLeft: "auto", color: draft.length > 4096 ? "var(--red)" : "var(--text-dim)" }}>{draft.length}/4096</span>
                      )}
                    </div>
                    <div className="row gap-8" style={{ alignItems: "flex-end" }}>
                      <textarea className="input" rows={2} placeholder="Сообщение…" value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                        style={{ resize: "none" }} />
                      <button className="icon-btn" title="Прикрепить файл" style={{ paddingBottom: 6 }}><i className="ti ti-paperclip" aria-hidden="true" /></button>
                      <button className="btn btn--primary" onClick={send} disabled={!draft.trim()}>Отправить</button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* ===== Панель клиента ===== */}
        <div className="card" style={{ width: 280, flex: "none", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="fw8 f14" style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>Клиент</div>
          <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
            {!active ? (
              <div className="text-dim f12">Выберите чат</div>
            ) : client ? (
              <div className="grid" style={{ gap: 12 }}>
                <div>
                  <div className="fw7">{client.name}</div>
                  <div style={{ color: "#e6a700", fontSize: 14, letterSpacing: 1 }}>{stars(client.rating)}</div>
                </div>
                {client.phones.length > 0 && (
                  <div>
                    <div className="f12 text-dim mb-8">Телефоны</div>
                    {client.phones.map((p) => <div key={p} className="f13">{p}</div>)}
                  </div>
                )}
                {client.notes && (
                  <div>
                    <div className="f12 text-dim mb-8">Заметки</div>
                    <div className="f12" style={{ whiteSpace: "pre-wrap" }}>{client.notes}</div>
                  </div>
                )}
                <div className="f13" style={{ color: "var(--orange)", fontWeight: 700 }}>Звонков: {client.totalCalls}</div>
                <button className="btn btn--outline btn--sm btn--block" onClick={openInvite}>
                  <i className="ti ti-brand-telegram" aria-hidden="true" /> Пригласить в Telegram
                </button>
              </div>
            ) : (
              <div className="grid" style={{ gap: 12 }}>
                <div className="f12 text-dim">Тред не привязан к клиенту.</div>
                {active.phone && (
                  <div className="badge badge--green" style={{ display: "block", padding: "8px 10px", borderRadius: 10 }}>
                    Номер из Telegram: <b>{active.phone}</b>
                    <div className="f12" style={{ opacity: .8 }}>Перенесётся клиенту при создании.</div>
                  </div>
                )}
                <div>
                  <div className="f12 text-dim mb-8">Привязать к клиенту</div>
                  <input className="input" placeholder="Поиск клиента…" value={linkSearch} onChange={(e) => setLinkSearch(e.target.value)} style={{ fontSize: 13 }} />
                  <div className="mt-8">
                    {linkResults.map((c) => (
                      <button key={c.id} onClick={() => linkClient(c.id)} className="open-link" style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 8px", color: "var(--text)" }}>{c.name}</button>
                    ))}
                  </div>
                </div>
                <div style={{ paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                  <div className="f12 text-dim mb-8">Или создать клиента</div>
                  <input className="input" placeholder="Имя клиента" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} style={{ fontSize: 13, marginBottom: 8 }} />
                  <button className="btn btn--primary btn--sm btn--block" onClick={createClient}>Создать и привязать</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {invite.open && (
        <Modal title="Пригласить в Telegram" onClose={() => setInvite({ open: false, link: "" })}
          footer={<button className="btn btn--outline" onClick={() => setInvite({ open: false, link: "" })}>Закрыть</button>}>
          <div className="f13 text-dim mb-12">Отправьте клиенту ссылку — по «Старт» чат привяжется автоматически.</div>
          <div className="row gap-8">
            <input className="input" readOnly value={invite.link} style={{ fontSize: 12 }} />
            <button className="btn btn--primary btn--sm" onClick={() => { navigator.clipboard?.writeText(invite.link); setCopied(true); }}>{copied ? "Скопировано" : "Копировать"}</button>
          </div>
          <div style={{ display: "grid", placeItems: "center", marginTop: 16 }}>
            <div style={{ width: 160, height: 160, borderRadius: 12, background: "var(--gray-light)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--text-dim)", textAlign: "center", fontSize: 12, gap: 6 }}>
              <i className="ti ti-qrcode" aria-hidden="true" style={{ fontSize: 40 }} />
              QR-код ссылки
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
