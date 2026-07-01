import { useState } from "react";
import type { CallAttribute } from "../types";
import { attributes as initialAttributes } from "../data/mock";
import { PageHeader, Stat, Badge, Modal, Empty } from "../components/ui";

type Category = CallAttribute["category"];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "quality", label: "Качество клиента" },
  { key: "type", label: "Тип звонка" },
  { key: "source", label: "Источник" },
  { key: "stage", label: "Этап сделки" },
];

const STAT_TONE: Record<Category, "orange" | "green" | "amber" | "accent"> = {
  quality: "orange",
  type: "green",
  source: "amber",
  stage: "accent",
};

export default function Attributes() {
  const [items, setItems] = useState<CallAttribute[]>(initialAttributes);
  const [creating, setCreating] = useState(false);

  // поля формы создания
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("quality");
  const [color, setColor] = useState("#fff1e8");
  const [icon, setIcon] = useState("");

  function countBy(cat: Category) {
    return items.filter((a) => a.category === cat).length;
  }

  function removeAttr(id: string) {
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  function resetForm() {
    setName("");
    setCategory("quality");
    setColor("#fff1e8");
    setIcon("");
  }

  function createAttr() {
    const next: CallAttribute = {
      id: "a" + Date.now(),
      name: name.trim() || "Без названия",
      color,
      icon: icon.trim() || "tag",
      category,
      active: true,
    };
    setItems((prev) => [...prev, next]);
    setCreating(false);
    resetForm();
  }

  return (
    <div>
      <PageHeader eyebrow="Метки звонков" title="Атрибуты" accent="звонков">
        <button className="btn btn--primary" onClick={() => setCreating(true)}>
          <i className="ti ti-plus" aria-hidden="true" /> Создать атрибут
        </button>
      </PageHeader>

      <div className="grid grid-4 mb-20">
        {CATEGORIES.map((c) => (
          <Stat
            key={c.key}
            label={c.label}
            value={countBy(c.key)}
            icon="tag"
            tone={STAT_TONE[c.key]}
          />
        ))}
      </div>

      {CATEGORIES.map((c) => {
        const rows = items.filter((a) => a.category === c.key);
        return (
          <div key={c.key} className="mb-20">
            <div className="section-label">{c.label}</div>
            <div className="card">
              {rows.length === 0 ? (
                <Empty icon="tag" text="Нет атрибутов в этой категории" />
              ) : (
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Атрибут</th>
                      <th>Иконка</th>
                      <th>Статус</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              background: a.color,
                              color: "#3a3f49",
                              padding: "4px 12px",
                              borderRadius: 999,
                              fontWeight: 700,
                            }}
                          >
                            <i className={`ti ti-${a.icon}`} aria-hidden="true" />
                            {a.name}
                          </span>
                        </td>
                        <td>
                          <span className="row gap-8">
                            <i className={`ti ti-${a.icon}`} aria-hidden="true" style={{ fontSize: 16 }} />
                            <code className="f13 text-dim">{a.icon}</code>
                          </span>
                        </td>
                        <td>
                          {a.active ? (
                            <Badge tone="green" dot>Активен</Badge>
                          ) : (
                            <Badge tone="gray">Выкл</Badge>
                          )}
                        </td>
                        <td>
                          <div className="row gap-8">
                            <button className="btn btn--outline btn--sm" style={{ color: "var(--orange)" }}>
                              Просмотр
                            </button>
                            <button className="btn btn--danger btn--sm" onClick={() => removeAttr(a.id)}>
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      })}

      {creating && (
        <Modal
          title="Новый атрибут"
          onClose={() => {
            setCreating(false);
            resetForm();
          }}
          footer={
            <>
              <button
                className="btn btn--outline"
                onClick={() => {
                  setCreating(false);
                  resetForm();
                }}
              >
                Отмена
              </button>
              <button className="btn btn--primary" onClick={createAttr}>
                Создать
              </button>
            </>
          }
        >
          <div className="grid">
            <div>
              <label className="field-label">Название</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например, Должник"
              />
            </div>
            <div>
              <label className="field-label">Категория</label>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-2">
              <div>
                <label className="field-label">Цвет</label>
                <input
                  className="input"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Иконка</label>
                <input
                  className="input"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="tag"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
