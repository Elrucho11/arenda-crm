import type {
  CallAttribute, Call, Client, Equipment, Deal, Calculation, Delivery, BlacklistEntry,
} from "../types";

// ===== Атрибуты звонков (структурировано по категориям) =====
export const attributes: CallAttribute[] = [
  { id: "a1", name: "Заказ", color: "#fff1e8", icon: "shopping-bag", category: "type", active: true },
  { id: "a2", name: "Консультация", color: "#e9f1fb", icon: "help-circle", category: "type", active: true },
  { id: "a3", name: "Повторный клиент", color: "#e7f6ec", icon: "repeat", category: "type", active: true },
  { id: "a4", name: "Реклама", color: "#fbf1dc", icon: "speakerphone", category: "type", active: true },
  { id: "a5", name: "Конкурент", color: "#fdecec", icon: "users", category: "type", active: true },
  { id: "a6", name: "Спам", color: "#f0f1f3", icon: "ban", category: "type", active: true },

  { id: "a7", name: "Должник", color: "#fdecec", icon: "alert-triangle", category: "quality", active: true },
  { id: "a8", name: "Надёжный", color: "#e7f6ec", icon: "thumb-up", category: "quality", active: true },
  { id: "a9", name: "Проблемный", color: "#fbf1dc", icon: "mood-confuzed", category: "quality", active: true },
  { id: "a10", name: "Мутный персонаж", color: "#f0f1f3", icon: "eye-off", category: "quality", active: true },

  { id: "a11", name: "Авито", color: "#e7f6ec", icon: "brand-avito", category: "source", active: true },
  { id: "a12", name: "Яндекс", color: "#fbf1dc", icon: "world-search", category: "source", active: true },
  { id: "a13", name: "Сайт", color: "#e9f1fb", icon: "world", category: "source", active: true },
  { id: "a14", name: "Сарафан", color: "#fff1e8", icon: "messages", category: "source", active: true },

  { id: "a15", name: "Расчёт отправлен", color: "#e9f1fb", icon: "calculator", category: "stage", active: true },
  { id: "a16", name: "Бронь", color: "#fbf1dc", icon: "calendar-check", category: "stage", active: true },
  { id: "a17", name: "В аренде", color: "#fff1e8", icon: "truck-loading", category: "stage", active: true },
];

// ===== Техника / номенклатура =====
export const equipment: Equipment[] = [
  { id: "e1", name: "Рама с лестницей", category: "Леса", pricePerDay: 50, deposit: 0, stockTotal: 120, stockAvailable: 78, unit: "шт" },
  { id: "e2", name: "Рама проходная", category: "Леса", pricePerDay: 45, deposit: 0, stockTotal: 120, stockAvailable: 82, unit: "шт" },
  { id: "e3", name: "Диагональная связь", category: "Леса", pricePerDay: 12, deposit: 0, stockTotal: 240, stockAvailable: 160, unit: "шт" },
  { id: "e4", name: "Горизонтальная связь", category: "Леса", pricePerDay: 12, deposit: 0, stockTotal: 240, stockAvailable: 150, unit: "шт" },
  { id: "e5", name: "Настил деревянный 3м × 0.3м", category: "Леса", pricePerDay: 35, deposit: 0, stockTotal: 200, stockAvailable: 95, unit: "шт" },
  { id: "e6", name: "Вышка-тура 4м", category: "Вышки-туры", pricePerDay: 760, deposit: 600, stockTotal: 8, stockAvailable: 3, unit: "шт" },
  { id: "e7", name: "Вышка-тура 8м", category: "Вышки-туры", pricePerDay: 1100, deposit: 1000, stockTotal: 5, stockAvailable: 2, unit: "шт" },
  { id: "e8", name: "Виброплита", category: "Инструмент", pricePerDay: 900, deposit: 5000, stockTotal: 6, stockAvailable: 4, unit: "шт" },
  { id: "e9", name: "Дровокол", category: "Инструмент", pricePerDay: 1200, deposit: 7000, stockTotal: 3, stockAvailable: 1, unit: "шт" },
  { id: "e10", name: "Генератор 5кВт", category: "Инструмент", pricePerDay: 1000, deposit: 6000, stockTotal: 4, stockAvailable: 3, unit: "шт" },
];

// ===== Клиенты (декодировано из текстовых полей в структуру) =====
export const clients: Client[] = [
  { id: "c1", name: "Падерин", phone: "+79058264734", city: "Тюмень", address: "ул. Падерина", rating: 3, status: "active", source: "Авито", tags: ["a7", "a3"], note: "Жадный заказчик, тянет с оплатой", callsCount: 11, dealsCount: 4, debt: 22028, createdAt: "2024-09-12", lastContactAt: "2026-06-24T18:02:00" },
  { id: "c2", name: "Соловьёва (Соловьиная роща)", phone: "+79044940176", city: "Тюмень", address: "Соловьиная роща", rating: 4, status: "active", source: "Яндекс", tags: ["a8"], note: "Вышка 4м на 5 дней", callsCount: 3, dealsCount: 2, debt: 0, createdAt: "2025-04-02", lastContactAt: "2025-11-24T12:10:00" },
  { id: "c3", name: "Ватутин Д.", phone: "+79123915862", city: "Тюмень", address: "ул. Ватутина", rating: 3, status: "active", source: "Сарафан", tags: ["a3"], note: "Газель везёт лестницу 3×20", callsCount: 5, dealsCount: 3, debt: 0, createdAt: "2025-03-18", lastContactAt: "2025-10-16T10:30:00" },
  { id: "c4", name: "Кулаково (дровокол)", phone: "+79123817376", city: "Кулаково", address: "с. Кулаково", rating: 3, status: "active", source: "Авито", tags: ["a2"], note: "Спрашивал дровокол", callsCount: 7, dealsCount: 0, debt: 0, createdAt: "2026-03-04", lastContactAt: "2026-06-24T18:56:00" },
  { id: "c5", name: "Заказчик (виброплита)", phone: "+79619763330", city: "Тюмень", rating: 4, status: "active", source: "Сайт", tags: ["a17"], note: "Виброплита в аренду", callsCount: 8, dealsCount: 1, debt: 0, createdAt: "2026-01-20", lastContactAt: "2026-06-25T19:09:00" },
  { id: "c6", name: "Новый номер", phone: "+79673838885", rating: 3, status: "active", source: "Авито", tags: [], callsCount: 4, dealsCount: 0, debt: 0, createdAt: "2026-06-25", lastContactAt: "2026-06-25T17:24:00" },
  { id: "c7", name: "Помост-компакт (самовывоз)", phone: "+79220002425", city: "Тюмень", rating: 3, status: "active", source: "Яндекс", tags: ["a15"], note: "Помост компакт 2.8м, 7-14 дней, самовывоз", callsCount: 2, dealsCount: 0, debt: 0, createdAt: "2026-04-07", lastContactAt: "2026-04-07T11:00:00" },
  { id: "c8", name: "Морозов А.", phone: "+79091112233", city: "Тюмень", rating: 5, status: "active", source: "Сарафан", tags: ["a8", "a3"], note: "Постоянник, берёт леса каждый сезон", callsCount: 14, dealsCount: 9, debt: 0, createdAt: "2024-05-10", lastContactAt: "2026-06-20T09:30:00" },
  { id: "c9", name: "СтройМонтаж ООО", phone: "+73452556677", city: "Тюмень", rating: 4, status: "active", source: "Сайт", tags: ["a8"], note: "Юрлицо, безнал", callsCount: 6, dealsCount: 5, debt: 0, createdAt: "2025-02-14", lastContactAt: "2026-06-18T15:40:00" },
  { id: "c10", name: "Гусев (леса)", phone: "+79324567890", city: "Тюмень", rating: 2, status: "active", source: "Авито", tags: ["a9"], note: "Сдал леса с недостачей", callsCount: 5, dealsCount: 2, debt: 3400, createdAt: "2025-08-01", lastContactAt: "2026-05-30T14:00:00" },
  { id: "c11", name: "Парфёнова (леса)", phone: "+79129995894", city: "Тюмень", rating: 1, status: "blacklist", source: "Авито", tags: ["a10"], note: "Цыгане, леса на 5 дней — отказ", callsCount: 3, dealsCount: 0, debt: 0, createdAt: "2026-06-22", lastContactAt: "2026-06-22T09:53:00" },
  { id: "c12", name: "Геосинтетика (геосм)", phone: "+79063592585", city: "Тюмень", rating: 2, status: "blacklist", source: "Яндекс", tags: ["a5"], note: "Конкурент / прозвон", callsCount: 2, dealsCount: 0, debt: 0, createdAt: "2026-05-22", lastContactAt: "2026-06-22T13:04:00" },
  { id: "c13", name: "Тобольск (вышка 8м)", phone: "+79191452351", city: "Тобольск", rating: 2, status: "blacklist", source: "Авито", tags: [], note: "Иногородний, не возим", callsCount: 1, dealsCount: 0, debt: 0, createdAt: "2026-06-22", lastContactAt: "2026-06-22T10:01:00" },
  { id: "c14", name: "Кино (леса 1к)", phone: "+79833403900", rating: 1, status: "blacklist", source: "Сайт", tags: ["a10"], note: "Леса для киносъёмок — посмотреть", callsCount: 1, dealsCount: 0, debt: 0, createdAt: "2026-06-21", lastContactAt: "2026-06-21T15:31:00" },
];

// ===== Звонки =====
export const calls: Call[] = [
  { id: "call1", clientId: "c5", phone: "+79619763330", direction: "outgoing", status: "answered", operator: "Павел", startedAt: "2026-06-25T19:09:00", talkSec: 8, waitSec: 27, attributeIds: ["a17"], wantedItem: "Виброплита", recordingUrl: "#", transcript: null, summary: null },
  { id: "call2", clientId: "c6", phone: "+79673838885", direction: "incoming", status: "missed", operator: "Павел", startedAt: "2026-06-25T17:24:00", talkSec: 0, waitSec: 15, attributeIds: [], transcript: null, summary: null },
  { id: "call3", clientId: "c4", phone: "+79123817376", direction: "incoming", status: "missed", operator: "Павел", startedAt: "2026-06-24T18:56:00", talkSec: 0, waitSec: 16, attributeIds: ["a2"], wantedItem: "Дровокол", transcript: null, summary: null },
  { id: "call4", clientId: "c1", phone: "+79058264734", direction: "incoming", status: "answered", operator: "Павел", startedAt: "2026-06-24T18:02:00", talkSec: 42, waitSec: 8, attributeIds: ["a7", "a3"], wantedItem: "Леса", recordingUrl: "#", transcript: null, summary: null },
  { id: "call5", clientId: "c8", phone: "+79091112233", direction: "incoming", status: "answered", operator: "Александр", startedAt: "2026-06-20T09:30:00", talkSec: 95, waitSec: 4, attributeIds: ["a8", "a3"], wantedItem: "Леса", recordingUrl: "#", transcript: null, summary: null },
  { id: "call6", clientId: "c9", phone: "+73452556677", direction: "outgoing", status: "answered", operator: "Александр", startedAt: "2026-06-18T15:40:00", talkSec: 130, waitSec: 0, attributeIds: ["a8"], wantedItem: "Леса", recordingUrl: "#", transcript: null, summary: null },
  { id: "call7", clientId: "c10", phone: "+79324567890", direction: "incoming", status: "answered", operator: "Алексей", startedAt: "2026-05-30T14:00:00", talkSec: 60, waitSec: 12, attributeIds: ["a9"], wantedItem: "Леса", transcript: null, summary: null },
  { id: "call8", clientId: "c3", phone: "+79123915862", direction: "incoming", status: "no-answer", operator: "Александр", startedAt: "2026-06-23T11:20:00", talkSec: 0, waitSec: 22, attributeIds: [], wantedItem: "Вышка-тура", transcript: null, summary: null },
  { id: "call9", clientId: null, phone: "+79667712009", direction: "incoming", status: "missed", operator: "Александр", startedAt: "2026-06-23T08:50:00", talkSec: 0, waitSec: 9, attributeIds: [], transcript: null, summary: null },
  { id: "call10", clientId: "c2", phone: "+79044940176", direction: "incoming", status: "answered", operator: "Павел", startedAt: "2025-11-24T12:10:00", talkSec: 73, waitSec: 6, attributeIds: ["a8"], wantedItem: "Вышка-тура", recordingUrl: "#", transcript: null, summary: null },
  { id: "call11", clientId: "c7", phone: "+79220002425", direction: "incoming", status: "answered", operator: "Алексей", startedAt: "2026-04-07T11:00:00", talkSec: 51, waitSec: 10, attributeIds: ["a15"], wantedItem: "Леса", transcript: null, summary: null },
  { id: "call12", clientId: "c12", phone: "+79063592585", direction: "incoming", status: "missed", operator: "Александр", startedAt: "2026-06-22T13:04:00", talkSec: 0, waitSec: 5, attributeIds: ["a5"], transcript: null, summary: null },
];

// ===== Сделки (аренда) =====
export const deals: Deal[] = [
  { id: "d1", clientId: "c1", clientName: "Падерин", items: [{ equipmentName: "Леса (рамы+настилы)", qty: 18, unit: "компл." }], startDate: "2025-09-25", endDate: "2025-10-09", days: 14, total: 14400, deposit: 700, depositReturned: false, debt: 22028, status: "overdue", operator: "Александр", address: "ул. Падерина", delivery: true },
  { id: "d2", clientId: "c5", clientName: "Заказчик (виброплита)", items: [{ equipmentName: "Виброплита", qty: 1, unit: "шт" }], startDate: "2026-06-25", endDate: "2026-06-28", days: 3, total: 2700, deposit: 5000, depositReturned: false, debt: 0, status: "active", operator: "Павел", delivery: false },
  { id: "d3", clientId: "c8", clientName: "Морозов А.", items: [{ equipmentName: "Леса (рамы+настилы)", qty: 30, unit: "компл." }], startDate: "2026-06-15", endDate: "2026-06-29", days: 14, total: 21000, deposit: 0, depositReturned: true, debt: 0, status: "active", operator: "Александр", address: "ДНТ Берёзка", delivery: true },
  { id: "d4", clientId: "c2", clientName: "Соловьёва", items: [{ equipmentName: "Вышка-тура 4м", qty: 1, unit: "шт" }], startDate: "2025-11-24", endDate: "2025-11-29", days: 5, total: 3800, deposit: 600, depositReturned: true, debt: 0, status: "closed", operator: "Павел", delivery: true },
  { id: "d5", clientId: "c9", clientName: "СтройМонтаж ООО", items: [{ equipmentName: "Леса (рамы+настилы)", qty: 24, unit: "компл." }], startDate: "2026-06-10", endDate: "2026-07-10", days: 30, total: 36000, deposit: 0, depositReturned: false, debt: 0, status: "active", operator: "Александр", address: "ул. Республики 200", delivery: true },
  { id: "d6", clientId: "c10", clientName: "Гусев", items: [{ equipmentName: "Леса (рамы+настилы)", qty: 12, unit: "компл." }], startDate: "2026-05-20", endDate: "2026-05-27", days: 7, total: 8400, deposit: 0, depositReturned: false, debt: 3400, status: "debt", operator: "Алексей", delivery: false },
];

// ===== Расчёты (как на скриншоте: #13 и #12) =====
export const calculations: Calculation[] = [
  {
    id: 13, category: "Леса", kind: "Комплекты", createdAt: "2025-10-31T13:45:00", author: "Александр",
    startDate: "2025-10-31", endDate: "2025-11-15", days: 15,
    lines: [
      { name: "Рама с лестницей", qty: 18, unit: "шт" },
      { name: "Рама проходная", qty: 18, unit: "шт" },
      { name: "Диагональная связь", qty: 18, unit: "шт" },
      { name: "Горизонтальная связь", qty: 18, unit: "шт" },
      { name: "Настил деревянный 3м × 0.3м", qty: 18, unit: "шт" },
    ],
    fullPrice: 99126, perDay: 893.33, deliveryPrice: 0, discount: 0, total: 13400, attached: false,
  },
  {
    id: 12, category: "Леса", kind: "Метры", createdAt: "2025-10-27T20:11:00", author: "Алексей",
    startDate: "2025-10-27", endDate: "2025-10-31", days: 4,
    lines: [
      { name: "Рама с лестницей", qty: 12, unit: "шт" },
      { name: "Настил деревянный 3м × 0.3м", qty: 12, unit: "шт" },
    ],
    fullPrice: 35100, perDay: 2193.75, deliveryPrice: 0, discount: 0, total: 8775, attached: false,
  },
];

// ===== Доставка =====
export const deliveries: Delivery[] = [
  { id: "dl1", clientName: "Морозов А.", phone: "+79091112233", address: "ДНТ Берёзка, уч. 14", date: "2026-06-26", timeSlot: "09:00–11:00", driver: "Сергей", type: "delivery", status: "on-the-way", dealId: "d3" },
  { id: "dl2", clientName: "СтройМонтаж ООО", phone: "+73452556677", address: "ул. Республики 200", date: "2026-06-26", timeSlot: "12:00–14:00", driver: "Сергей", type: "delivery", status: "planned", dealId: "d5" },
  { id: "dl3", clientName: "Падерин", phone: "+79058264734", address: "ул. Падерина 8", date: "2026-06-26", timeSlot: "15:00–17:00", driver: "Игорь", type: "pickup", status: "planned", dealId: "d1", comment: "Забрать леса + долг" },
  { id: "dl4", clientName: "Заказчик (виброплита)", phone: "+79619763330", address: "ул. Мельникайте 100", date: "2026-06-25", timeSlot: "10:00–12:00", driver: "Игорь", type: "pickup", status: "returned", dealId: "d2" },
  { id: "dl5", clientName: "Гусев", phone: "+79324567890", address: "пос. Молодёжный", date: "2026-06-24", timeSlot: "16:00–18:00", driver: "Сергей", type: "delivery", status: "delivered", dealId: "d6" },
];

// ===== Чёрный список =====
export const blacklist: BlacklistEntry[] = [
  { id: "b1", phone: "+79063592585", label: "геосинтетика (прозвон)", addedBy: "Александр", addedAt: "2026-06-22T13:04:00", reason: "Спам", until: "2026-07-22", syncedTelphin: true },
  { id: "b2", phone: "+79191452351", label: "вышка 8м на два дня, Тобольск", addedBy: "Александр", addedAt: "2026-06-22T10:01:00", reason: "Иногородний", until: "2026-07-22", syncedTelphin: true },
  { id: "b3", phone: "+79129995894", label: "цыгане, леса на 5 дней", addedBy: "Александр", addedAt: "2026-06-22T09:53:00", reason: "Неадекват", until: "permanent", syncedTelphin: true },
  { id: "b4", phone: "+79829447319", label: "вышка 2×2 на три дня, Тобольск", addedBy: "Александр", addedAt: "2026-06-20T09:51:00", reason: "Иногородний", until: "2026-07-22", syncedTelphin: true },
  { id: "b5", phone: "+79833403900", label: "леса для киносъёмок — посмотреть", addedBy: "Александр", addedAt: "2026-06-21T15:31:00", reason: "Осмотр/кинокрю", until: "2026-06-28", syncedTelphin: true },
  { id: "b6", phone: "+79334402452", label: "леса для кино на 15 минут", addedBy: "Александр", addedAt: "2026-06-21T15:10:00", reason: "Осмотр/кинокрю", until: "permanent", syncedTelphin: false },
  { id: "b7", phone: "+79221002030", label: "вышка 22, 4м на три дня, Тобольск", addedBy: "Александр", addedAt: "2026-06-20T15:25:00", reason: "Иногородний", until: "2026-07-20", syncedTelphin: true },
];

// ===== Помощники / агрегаты =====
export const operators = ["Александр", "Павел", "Алексей"] as const;

export function attrById(id: string) { return attributes.find((a) => a.id === id); }
export function clientById(id: string | null) { return id ? clients.find((c) => c.id === id) : undefined; }
export function dealsByClient(id: string) { return deals.filter((d) => d.clientId === id); }
export function callsByClient(id: string) { return calls.filter((c) => c.clientId === id); }

export const dashboardStats = {
  missed: calls.filter((c) => c.status === "missed" || c.status === "no-answer").length,
  important: 13,
  callback: 2,
  orders: 24,
  totalClients: 1788,
  blacklistCount: 286,
  activeDeals: deals.filter((d) => d.status === "active" || d.status === "overdue").length,
  overdue: deals.filter((d) => d.status === "overdue").length,
  totalDebt: deals.reduce((s, d) => s + d.debt, 0),
};
