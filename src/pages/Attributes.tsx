import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { PageHeader, Badge, Modal, Empty } from "../components/ui";
import { attributes as seedAttributes } from "../data/mock";
import type { CallAttribute } from "../data/mock";

function AttrPill({ attr }: { attr: CallAttribute }) {
  return (
    <span
      style={{
        background: attr.color,
        color: "#fff",
        padding: "4px 12px",
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 12.5,
        display: "inline-block",
      }}
    >
      {attr.name}
    </span>
  );
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <span className="row gap-8" style={{ alignItems: "center", display: "inline-flex" }}>
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
          flex: "none",
          border: "1px solid var(--line)",
        }}
      />
      <span className="text-dim f13">{color}</span>
    </span>
  );
}

const actionBtn = (color: string): CSSProperties => ({
  color, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", fontSize: 13.5,
});

export default function Attributes() {
  const [list, setList] = useState<CallAttribute[]>(() => [...seedAttributes]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CallAttribute | null>(null);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff6a00");
  const [icon, setIcon] = useState("");

  function openCreate() {
    setEditing(null); setName(""); setColor("#ff6a00"); setIcon(""); setFormOpen(true);
  }
  function openEdit(attr: CallAttribute) {
    setEditing(attr); setName(attr.name); setColor(attr.color); setIcon(attr.icon); setFormOpen(true);
  }

  function handleSave(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editing) {
      setList((prev) => prev.map((a) => (a.id === editing.id ? { ...a, name: trimmed, color, icon: icon.trim() } : a)));
    } else {
      setList((prev) => [{ id: "a" + Date.now(), name: trimmed, color, icon: icon.trim(), active: true }, ...prev]);
    }
    setFormOpen(false);
  }

  function toggleActive(id: string) {
    setList((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  }
  function handleDelete(id: string) {
    setList((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div>
      <PageHeader eyebrow="Метки" title="Атрибуты" accent="звонков">
        <button className="btn btn--primary" onClick={openCreate}>
          <i className="ti ti-plus" aria-hidden="true" /> Создать атрибут
        </button>
      </PageHeader>

      <div className="card" style={{ overflow: "hidden" }}>
        {list.length === 0 ? (
          <Empty icon="tag" text="Атрибутов пока нет" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Атрибут</th>
                <th>Цвет</th>
                <th>Иконка</th>
                <th>Статус</th>
                <th style={{ textAlign: "right" }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {list.map((attr) => (
                <tr key={attr.id} style={{ opacity: attr.active ? 1 : 0.55 }}>
                  <td><AttrPill attr={attr} /></td>
                  <td><ColorSwatch color={attr.color} /></td>
                  <td>{attr.icon ? <span className="row gap-6 f13"><i className={`ti ti-${attr.icon}`} aria-hidden="true" />{attr.icon}</span> : <span className="text-dim">—</span>}</td>
                  <td>{attr.active ? <Badge tone="green">Активен</Badge> : <Badge tone="gray">Отключён</Badge>}</td>
                  <td>
                    <span className="row gap-12" style={{ display: "inline-flex", justifyContent: "flex-end", width: "100%" }}>
                      <button onClick={() => openEdit(attr)} style={actionBtn("var(--orange)")}>Изменить</button>
                      <button onClick={() => toggleActive(attr.id)} style={actionBtn("var(--text-dim)")}>{attr.active ? "Отключить" : "Включить"}</button>
                      <button onClick={() => handleDelete(attr.id)} style={actionBtn("var(--red)")}>Удалить</button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formOpen && (
        <Modal
          title={editing ? "Изменить атрибут" : "Создать атрибут"}
          onClose={() => setFormOpen(false)}
          footer={
            <>
              <button className="btn btn--outline" onClick={() => setFormOpen(false)}>Отмена</button>
              <button className="btn btn--primary" onClick={() => handleSave()}>{editing ? "Сохранить" : "Создать"}</button>
            </>
          }
        >
          <form onSubmit={handleSave}>
            <div>
              <label className="field-label" htmlFor="attr-name">Название</label>
              <input id="attr-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Название атрибута" autoFocus />
            </div>
            <div className="grid grid-2 mt-12" style={{ gap: 12 }}>
              <div>
                <label className="field-label" htmlFor="attr-color">Цвет</label>
                <input id="attr-color" type="color" className="input" style={{ height: 44, padding: 4 }} value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <div>
                <label className="field-label" htmlFor="attr-icon">Иконка (Tabler)</label>
                <input id="attr-icon" className="input" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="например: x-circle" />
              </div>
            </div>
            <div className="mt-16">
              <div className="section-label mb-8">Предпросмотр</div>
              <span style={{ background: color, color: "#fff", padding: "4px 12px", borderRadius: 999, fontWeight: 700, fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 6 }}>
                {icon.trim() && <i className={`ti ti-${icon.trim()}`} aria-hidden="true" />}
                {name.trim() || "Название"}
              </span>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
