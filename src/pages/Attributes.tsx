import { useState } from "react";
import type { FormEvent } from "react";
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

export default function Attributes() {
  const [list, setList] = useState<CallAttribute[]>(() => [...seedAttributes]);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewAttr, setViewAttr] = useState<CallAttribute | null>(null);

  // Поля формы создания
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff6a00");
  const [icon, setIcon] = useState("");

  function openCreate() {
    setName("");
    setColor("#ff6a00");
    setIcon("");
    setCreateOpen(true);
  }

  function handleCreate(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const attr: CallAttribute = {
      id: "a" + Date.now(),
      name: trimmed,
      color,
      icon: icon.trim(),
      active: true,
    };
    setList((prev) => [attr, ...prev]);
    setCreateOpen(false);
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

      <div className="card">
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
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {list.map((attr) => (
                <tr key={attr.id}>
                  <td>
                    <AttrPill attr={attr} />
                  </td>
                  <td>
                    <ColorSwatch color={attr.color} />
                  </td>
                  <td>{attr.icon ? <span className="f13">{attr.icon}</span> : null}</td>
                  <td>
                    <Badge tone="green">Активен</Badge>
                  </td>
                  <td>
                    <span className="row gap-12" style={{ display: "inline-flex" }}>
                      <button
                        onClick={() => setViewAttr(attr)}
                        style={{
                          color: "var(--orange)",
                          fontWeight: 700,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          font: "inherit",
                          fontSize: 13.5,
                        }}
                      >
                        Просмотр
                      </button>
                      <button
                        onClick={() => handleDelete(attr.id)}
                        style={{
                          color: "var(--red)",
                          fontWeight: 700,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          font: "inherit",
                          fontSize: 13.5,
                        }}
                      >
                        Удалить
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {createOpen && (
        <Modal
          title="Создать атрибут"
          onClose={() => setCreateOpen(false)}
          footer={
            <>
              <button className="btn btn--outline" onClick={() => setCreateOpen(false)}>
                Отмена
              </button>
              <button className="btn btn--primary" onClick={() => handleCreate()}>
                Создать
              </button>
            </>
          }
        >
          <form onSubmit={handleCreate}>
            <div>
              <label className="field-label" htmlFor="attr-name">Название</label>
              <input
                id="attr-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название атрибута"
                autoFocus
              />
            </div>
            <div className="mt-12">
              <label className="field-label" htmlFor="attr-color">Цвет</label>
              <input
                id="attr-color"
                type="color"
                className="input"
                style={{ height: 44 }}
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div className="mt-12">
              <label className="field-label" htmlFor="attr-icon">Иконка</label>
              <input
                id="attr-icon"
                className="input"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="например: x-circle"
              />
            </div>
          </form>
        </Modal>
      )}

      {viewAttr && (
        <Modal title="Просмотр атрибута" onClose={() => setViewAttr(null)}>
          <div>
            <div className="section-label">Атрибут</div>
            <div className="mt-8">
              <AttrPill attr={viewAttr} />
            </div>
          </div>
          <div className="mt-16">
            <div className="section-label">Цвет</div>
            <div className="mt-8">
              <ColorSwatch color={viewAttr.color} />
            </div>
          </div>
          <div className="mt-16">
            <div className="section-label">Иконка</div>
            <div className="mt-8 f13">
              {viewAttr.icon ? viewAttr.icon : <span className="text-dim">—</span>}
            </div>
          </div>
          <div className="mt-16">
            <div className="section-label">Статус</div>
            <div className="mt-8">
              <Badge tone="green">Активен</Badge>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
