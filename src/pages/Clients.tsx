import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clients, dashboardStats, attrById } from "../data/mock";
import { PageHeader, Stat, Badge, Avatar, Stars, Modal } from "../components/ui";
import { phoneFmt, dateShort } from "../lib/format";

export default function Clients() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [rating, setRating] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("contact");
  const [showNew, setShowNew] = useState(false);

  const list = useMemo(() => {
    let r = clients.filter((c) => {
      const t = `${c.name} ${c.phone} ${c.note ?? ""} ${c.city ?? ""}`.toLowerCase();
      if (q && !t.includes(q.toLowerCase())) return false;
      if (rating !== "all" && c.rating < Number(rating)) return false;
      if (status !== "all" && c.status !== status) return false;
      return true;
    });
    r = [...r].sort((a, b) =>
      sort === "contact" ? +new Date(b.lastContactAt) - +new Date(a.lastContactAt)
        : sort === "rating" ? b.rating - a.rating
          : sort === "debt" ? b.debt - a.debt
            : a.name.localeCompare(b.name)
    );
    return r;
  }, [q, rating, status, sort]);

  return (
    <div>
      <PageHeader eyebrow="База клиентов" title="Клиенты">
        <button className="btn btn--primary" onClick={() => setShowNew(true)}><i className="ti ti-plus" aria-hidden="true" /> Новый клиент</button>
      </PageHeader>

      <div className="grid grid-4 mb-20">
        <Stat tone="orange" icon="users" label="Всего клиентов" value={dashboardStats.totalClients} />
        <Stat tone="green" icon="user-check" label="Активных" value={dashboardStats.totalClients - dashboardStats.blacklistCount} />
        <Stat tone="amber" icon="alert-triangle" label="Должников" value={clients.filter((c) => c.debt > 0).length} />
        <Stat tone="red" icon="ban" label="В чёрном списке" value={dashboardStats.blacklistCount} />
      </div>

      <div className="card card--pad mb-16">
        <div className="filters-grid">
          <div>
            <label className="field-label">Поиск</label>
            <input className="input" placeholder="Имя, телефон, заметка…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Рейтинг</label>
            <select className="input" value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="all">Все</option><option value="4">4+ ★</option><option value="3">3+ ★</option><option value="2">2+ ★</option>
            </select>
          </div>
          <div>
            <label className="field-label">Статус</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">Все</option><option value="active">Активные</option><option value="blacklist">Чёрный список</option>
            </select>
          </div>
          <div>
            <label className="field-label">Сортировка</label>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="contact">Последний контакт</option><option value="rating">Рейтинг</option><option value="debt">Долг</option><option value="name">Имя</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr><th>Клиент</th><th>Контакты</th><th>Рейтинг</th><th>Долг</th><th>Статус</th></tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => nav(`/clients/${c.id}`)}>
                <td>
                  <div className="row gap-12">
                    <Avatar name={c.name} size={36} />
                    <div>
                      <div className="fw7">{c.name}</div>
                      {c.note && <div className="text-dim f12" style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.note}</div>}
                      <div className="row gap-6 wrap mt-8">
                        {c.tags.slice(0, 2).map((t) => { const a = attrById(t); return a ? <span key={t} className="badge badge--gray">{a.name}</span> : null; })}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="fw7 f13">{phoneFmt(c.phone)}</div>
                  <div className="text-dim f12">{c.city ?? "—"} · {dateShort(c.lastContactAt).slice(0, 5)}</div>
                </td>
                <td><Stars value={c.rating} /></td>
                <td>{c.debt > 0 ? <span style={{ color: "var(--red)", fontWeight: 700 }}>{new Intl.NumberFormat("ru-RU").format(c.debt)} ₽</span> : <span className="text-dim">—</span>}</td>
                <td>{c.status === "blacklist" ? <Badge tone="red">Чёрный список</Badge> : <Badge tone="green">Активен</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNew && (
        <Modal title="Новый клиент" onClose={() => setShowNew(false)}
          footer={<><button className="btn btn--outline" onClick={() => setShowNew(false)}>Отмена</button><button className="btn btn--primary" onClick={() => setShowNew(false)}>Сохранить</button></>}>
          <div className="grid" style={{ gap: 12 }}>
            <div><label className="field-label">Имя / компания</label><input className="input" placeholder="Напр. Морозов А." /></div>
            <div><label className="field-label">Телефон</label><input className="input" placeholder="+7 ___ ___-__-__" /></div>
            <div><label className="field-label">Город / адрес</label><input className="input" placeholder="Тюмень" /></div>
            <div><label className="field-label">Источник</label>
              <select className="input"><option>Авито</option><option>Яндекс</option><option>Сайт</option><option>Сарафан</option></select>
            </div>
            <div><label className="field-label">Заметка</label><textarea className="input" rows={2} placeholder="Что хотел, особенности…" /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
