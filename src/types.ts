// ===== Доменная модель АрендаСтрой CRM =====

export type Operator = "Александр" | "Павел" | "Алексей";

export type CallDirection = "incoming" | "outgoing";
export type CallStatus = "answered" | "missed" | "no-answer";

export interface CallAttribute {
  id: string;
  name: string;
  color: string;      // hex фона
  icon: string;       // tabler icon name (без префикса ti-)
  category: AttributeCategory;
  active: boolean;
}

export type AttributeCategory = "quality" | "type" | "source" | "stage";

export interface Call {
  id: string;
  clientId: string | null;
  phone: string;
  direction: CallDirection;
  status: CallStatus;
  operator: Operator;
  startedAt: string;        // ISO
  talkSec: number;          // длительность разговора
  waitSec: number;          // ожидание
  recordingUrl?: string;
  attributeIds: string[];
  // авто-разбор (речевая аналитика — заполнится позже)
  wantedItem?: string;      // что хотел: "Леса", "Виброплита"...
  transcript?: string | null;
  summary?: string | null;
}

export type ClientStatus = "active" | "blacklist";

export interface Client {
  id: string;
  name: string;             // имя/компания (структурно)
  phone: string;
  city?: string;
  address?: string;
  rating: number;           // 1..5
  status: ClientStatus;
  source?: string;          // канал: Авито / Яндекс / сайт / сарафан
  tags: string[];           // id атрибутов
  note?: string;
  callsCount: number;
  dealsCount: number;
  debt: number;             // текущий долг, ₽
  createdAt: string;
  lastContactAt: string;
}

export type EquipmentCategory = "Леса" | "Вышки-туры" | "Инструмент";

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  pricePerDay: number;      // тариф/сутки
  deposit: number;          // залог
  stockTotal: number;
  stockAvailable: number;
  unit: string;             // "компл." / "шт" / "м"
}

export type DealStatus = "booked" | "active" | "overdue" | "closed" | "debt";

export interface DealItem {
  equipmentName: string;
  qty: number;
  unit: string;
}

export interface Deal {
  id: string;
  clientId: string;
  clientName: string;
  items: DealItem[];
  startDate: string;
  endDate: string;
  days: number;
  total: number;
  deposit: number;
  depositReturned: boolean;
  debt: number;
  status: DealStatus;
  operator: Operator;
  address?: string;
  delivery: boolean;
}

export type CalcKind = "Комплекты" | "Метры";

export interface CalculationLine {
  name: string;
  qty: number;
  unit: string;
}

export interface Calculation {
  id: number;
  category: EquipmentCategory;
  kind: CalcKind;
  createdAt: string;
  author: Operator;
  startDate: string;
  endDate: string;
  days: number;
  lines: CalculationLine[];
  fullPrice: number;        // полная стоимость
  perDay: number;
  deliveryPrice: number;
  discount: number;
  total: number;            // итого с учётом скидки
  attached: boolean;
}

export type DeliveryStatus = "planned" | "on-the-way" | "delivered" | "pickup" | "returned";

export interface Delivery {
  id: string;
  clientName: string;
  phone: string;
  address: string;
  date: string;
  timeSlot: string;
  driver?: string;
  type: "delivery" | "pickup";
  status: DeliveryStatus;
  dealId?: string;
  comment?: string;
}

export type BlacklistDuration = "permanent" | string; // ISO date или "permanent"

export interface BlacklistEntry {
  id: string;
  phone: string;
  label: string;            // что было в звонке
  addedBy: Operator;
  addedAt: string;
  reason: BlacklistReason;
  until: BlacklistDuration;
  syncedTelphin: boolean;
}

export type BlacklistReason =
  | "Не указана" | "Иногородний" | "Осмотр/кинокрю" | "Спам" | "Неадекват" | "Разовый осмотр";
