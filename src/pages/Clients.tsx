import { useMemo, useState } from "react";
import type { ProdClient } from "../data/mock";
import { clients, clientStats } from "../data/mock";
import { PageHeader, Stat, Badge, Avatar, Stars, Modal, Empty } from "../components/ui";
import { dateShort } from "../lib/format";

interface Filters {
  q: string;
  rating: string; // "all" | "1".."5"
  status: string; // "all" | "Активен" | "В черном списке"
  sort: string;   // "contact" | "name" | "rating"
}

const DEFAULT_FILTERS: Filters = { q: "", rating: "all", status: "all", sort: "contact" };

export default function Clients() {
  const [list, setList] = useState<ProdClient[]>(clients);

  // фильтры применяются по кнопке: черновик -> применённые
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const rows = useMemo(() => {
    let r = list.filter((c) => {
      if (applied.q) {
        const t = `${c.name} ${c.phone}`.toLowerCase();
        if (!t.includes(applied.q.trim().toLowerCase())) return false;
      }
      if (applied.rating !== "all" && c.rating !== Number(applied.rating)) return false;
      if (applied.status !== "all" && c.status !== applied.status) return false;
      return true;
    });
    r = [...r].sort((a, b) =>
      applied.sort === "name" ? a.name.localeCompare(b.name, "ru")
        : applied.sort === "rating" ? b.rating - a.rating
          : +new Date(b.lastContactAt) - +new Date(a.lastContactAt)
    );
    return r;
  }, [list, applied]);

  const saveNew = () => {
    setList((prev) => [
      {
        id: `new-${Date.now()}`,
        name: newName.trim() || "Без подписи",
        phone: newPhone.trim(),
        rating: 3,
        status: "Активен",
        lastContactAt: "2026-06-26",
      },
      ...prev,
    ]);
    setNewName("");
    setNewPhone("");
    setShowNew(false);
  };

  return (
    <div>
      <PageHeader eyebrow="База" title="Клиенты">
        <button className="btn btn--primary" onClick={() => setShowNew(true)}>
          <i className="ti ti-plus" aria-hidden="true" /> Новый клиент
        </button>
      </PageHeader>

      <div className="grid grid-4 mb-20">
        <Stat tone="orange" icon="users" label="Всего клиентов" value={clientStats.total} />
        <Stat tone="green" icon="user-check" label="Активных" value={clientStats.active} />
        <Stat tone="amber" icon="phone" label="С звонками" value={clientStats.withCalls} />
        <Stat tone="red" icon="ban" label="В черном списке" value={clientStats.blacklisted} />
      </div>

      <div className="card card--pad mb-16">
        <div className="filters-grid">
          <div>
            <label className="field-label">Поиск</label>
            <input
              className="input"
              placeholder="Имя, телефон, компания..."
              value={draft.q}
              onChange={(e) => setDraft({ ...draft, q: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Рейтинг</label>
            <select className="input" value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: e.target.value })}>
              <option value="all">Все</option>
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
          </div>
          <div>
            <label className="field-label">Статус</label>
            <select className="input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              <option value="all">Все</option>
              <option value="Активен">Активен</option>
              <option value="В черном списке">В черном списке</option>
            </select>
          </div>
          <div>
            <label className="field-label">Сортировка</label>
            <select className="input" value={draft.sort} onChange={(e) => setDraft({ ...draft, sort: e.target.value })}>
              <option value="contact">Последний контакт</option>
              <option value="name">Имя</option>
              <option value="rating">Рейтинг</option>
            </select>
          </div>
        </div>
        <div className="row gap-10 wrap mt-16">
          <button className="btn btn--primary" onClick={() => setApplied(draft)}>
            <i className="ti ti-filter" aria-hidden="true" /> Применить фильтры
          </button>
          <button
            className="btn btn--dark"
            onClick={() => { setDraft(DEFAULT_FILTERS); setApplied(DEFAULT_FILTERS); }}
          >
            Сбросить
          </button>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {rows.length === 0 ? (
          <Empty icon="users" text="Клиенты не найдены" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Контакты</th>
                <th>Рейтинг</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="row gap-12">
                      <Avatar name={c.name} size={36} />
                      <div className="fw7" style={{ maxWidth: 480, lineHeight: 1.4 }}>{c.name}</div>
                    </div>
                  </td>
                  <td>
                    <div className="fw7 f13">{c.phone}</div>
                    <div className="text-dim f12">{dateShort(c.lastContactAt)}</div>
                  </td>
                  <td>
                    <div className="fw7 f13">{c.rating}/5</div>
                    <Stars value={c.rating} />
                  </td>
                  <td>
                    {c.status === "В черном списке"
                      ? <Badge tone="red">В черном списке</Badge>
                      : <Badge tone="green">Активен</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showNew && (
        <Modal
          title="Новый клиент"
          onClose={() => setShowNew(false)}
          footer={
            <>
              <button className="btn btn--outline" onClick={() => setShowNew(false)}>Отмена</button>
              <button className="btn btn--primary" onClick={saveNew}>Сохранить</button>
            </>
          }
        >
          <div className="grid" style={{ gap: 12 }}>
            <div>
              <label className="field-label">Имя / подпись</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Свободная подпись клиента"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Телефон</label>
              <input
                className="input"
                placeholder="+7 ___ ___-__-__"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
