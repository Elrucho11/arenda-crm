import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { clientDetail, callsForNumber } from "../data/mock";
import type { ClientPhone, ProdCall } from "../data/mock";
import { PageHeader, Stars, Badge, Modal, Empty } from "../components/ui";
import CallsTable from "../components/CallsTable";
import { phoneFmt, dateShort } from "../lib/format";

export default function ClientDetail() {
  const { id = "" } = useParams();
  return <ClientDetailInner key={id} id={id} />;
}

function ClientDetailInner({ id }: { id: string }) {
  const navigate = useNavigate();
  const detail = useMemo(() => clientDetail(id), [id]);

  const [phones, setPhones] = useState<ClientPhone[]>(detail?.phones ?? []);
  const [newPhone, setNewPhone] = useState("");
  const [edit, setEdit] = useState(false);

  // редактируемые поля (mock)
  const [name, setName] = useState(detail?.name ?? "");
  const [rating, setRating] = useState(detail?.rating ?? 3);
  const [company, setCompany] = useState(detail?.company ?? "");
  const [address, setAddress] = useState(detail?.address ?? "");
  const [notes, setNotes] = useState(detail?.notes ?? "");

  const calls = useMemo(() => {
    if (!detail) return [] as ProdCall[];
    const seen = new Set<string>();
    const out: ProdCall[] = [];
    for (const p of phones) {
      for (const c of callsForNumber(p.phone)) {
        if (!seen.has(c.id)) { seen.add(c.id); out.push(c); }
      }
    }
    return out.sort((a, b) => (a.dateTime < b.dateTime ? 1 : -1));
  }, [detail, phones]);

  if (!detail) {
    return (
      <div>
        <PageHeader eyebrow="Карточка" title="Клиент" />
        <div className="card"><Empty icon="user-off" text="Клиент не найден" /></div>
      </div>
    );
  }

  const addPhone = () => {
    const v = newPhone.trim();
    if (!v) return;
    setPhones((prev) => [...prev, { phone: v, primary: prev.length === 0 }]);
    setNewPhone("");
  };
  const removePhone = (phone: string) =>
    setPhones((prev) => {
      const next = prev.filter((p) => p.phone !== phone);
      if (next.length && !next.some((p) => p.primary)) next[0].primary = true;
      return [...next];
    });
  const setPrimary = (phone: string) =>
    setPhones((prev) => prev.map((p) => ({ ...p, primary: p.phone === phone })));

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="eyebrow">Карточка клиента</span>
          <h1 className="page-title" style={{ maxWidth: 720, lineHeight: 1.25 }}>{name}</h1>
        </div>
        <div className="row gap-8 wrap">
          <button className="btn btn--outline btn--sm" onClick={() => navigate("/clients")}>
            <i className="ti ti-arrow-left" aria-hidden="true" /> Назад
          </button>
          <button className="btn btn--primary btn--sm" onClick={() => setEdit(true)}>
            <i className="ti ti-edit" aria-hidden="true" /> Редактировать
          </button>
        </div>
      </div>

      <div className="split split--detail">
        {/* ЛЕВО: инфо + статистика */}
        <div className="grid" style={{ gap: 16 }}>
          <div className="card card--pad">
            <div className="row between" style={{ alignItems: "flex-start" }}>
              <div>
                <div className="row gap-8" style={{ alignItems: "center" }}>
                  <span className="fw8 f15">Рейтинг</span>
                  <Stars value={rating} />
                  <span className="text-dim f13">{rating}/5</span>
                </div>
              </div>
              {detail.status === "В черном списке"
                ? <Badge tone="red">В черном списке</Badge>
                : <Badge tone="green">Активен</Badge>}
            </div>

            {(company || address) && (
              <div className="mt-16 grid" style={{ gap: 8 }}>
                {company && <div className="row gap-8"><i className="ti ti-building" aria-hidden="true" style={{ color: "var(--text-dim)" }} /><span className="f13">{company}</span></div>}
                {address && <div className="row gap-8"><i className="ti ti-map-pin" aria-hidden="true" style={{ color: "var(--text-dim)" }} /><span className="f13">{address}</span></div>}
              </div>
            )}

            {notes && (
              <div className="mt-16">
                <div className="section-label mb-8">Заметки</div>
                <div className="f13" style={{ whiteSpace: "pre-wrap" }}>{notes}</div>
              </div>
            )}

            {detail.crmLink && (
              <a href={detail.crmLink} target="_blank" rel="noreferrer" className="btn btn--outline btn--sm btn--block mt-16">
                <i className="ti ti-external-link" aria-hidden="true" /> Перейти в CRM
              </a>
            )}
          </div>

          <div className="card card--pad">
            <div className="fw8 f15 mb-12">Статистика звонков</div>
            <div className="grid" style={{ gap: 10 }}>
              <Row label="Всего звонков" value={detail.totalCalls} />
              <Row label="Успешных" value={detail.successfulCalls} tone="var(--green)" />
              <Row label="В этом месяце" value={detail.callsThisMonth} />
              <Row label="Последний контакт" value={dateShort(detail.lastContactAt)} />
            </div>
          </div>
        </div>

        {/* ПРАВО: телефоны + звонки */}
        <div className="grid" style={{ gap: 16 }}>
          <div className="card card--pad">
            <div className="fw8 f15 mb-12">Телефонные номера</div>
            <div className="grid" style={{ gap: 8 }}>
              {phones.map((p) => (
                <div key={p.phone} className="row between" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "9px 12px" }}>
                  <div className="row gap-8" style={{ minWidth: 0 }}>
                    <span className="fw7 f13">{phoneFmt(p.phone)}</span>
                    {p.primary && <span className="badge badge--orange" style={{ fontSize: 10 }}>основной</span>}
                    {p.description && <span className="text-dim f12">{p.description}</span>}
                  </div>
                  <div className="row gap-6">
                    {!p.primary && <button className="open-link" style={{ fontSize: 12 }} onClick={() => setPrimary(p.phone)}>Сделать основным</button>}
                    <button className="icon-btn" aria-label="Удалить номер" onClick={() => removePhone(p.phone)}><i className="ti ti-trash" aria-hidden="true" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="row gap-8 mt-12">
              <input className="input" placeholder="+7 ___ ___-__-__" value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addPhone(); }} />
              <button className="btn btn--primary" onClick={addPhone}><i className="ti ti-plus" aria-hidden="true" /> Добавить</button>
            </div>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <div className="card--pad" style={{ borderBottom: "1px solid var(--line)" }}>
              <div className="row gap-8" style={{ alignItems: "center" }}>
                <span className="fw8 f15">Звонки клиента</span>
                <span className="badge badge--gray">{calls.length}</span>
              </div>
            </div>
            {calls.length ? <CallsTable rows={calls} /> : <Empty icon="phone-off" text="Звонков не найдено" />}
          </div>
        </div>
      </div>

      {edit && (
        <Modal title="Редактировать клиента" onClose={() => setEdit(false)}
          footer={<>
            <button className="btn btn--outline" onClick={() => setEdit(false)}>Отмена</button>
            <button className="btn btn--primary" onClick={() => setEdit(false)}>Сохранить</button>
          </>}>
          <div className="grid" style={{ gap: 12 }}>
            <div>
              <label className="field-label">Имя / подпись</label>
              <textarea className="input" rows={2} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-2" style={{ gap: 12 }}>
              <div>
                <label className="field-label">Рейтинг</label>
                <select className="input" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Компания</label>
                <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="field-label">Адрес</label>
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Заметки</label>
              <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ resize: "vertical" }} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="row between">
      <span className="f13 text-dim">{label}</span>
      <span className="fw7 f14" style={{ color: tone }}>{value}</span>
    </div>
  );
}
