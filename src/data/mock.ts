// ===== Данные, снятые с боевого calls.plntr.store (1:1) =====
import type { Calculation, Equipment } from "../types";

// --- Операторы (сотрудники) ---
export interface Employee {
  name: "Александр" | "Павел";
  fullName: string;
  number: string; // внутренний номер линии
}
export const employees: Employee[] = [
  { name: "Александр", fullName: "Александр Александрович", number: "73452212120" },
  { name: "Павел", fullName: "Павел Евгеньевич", number: "73452492525" },
];
export const operators = ["Александр", "Павел"] as const;

// --- Атрибуты звонков (как на проде: имя, цвет, иконка, статус) ---
export interface CallAttribute {
  id: string;
  name: string;
  color: string;      // hex
  icon: string;       // имя иконки ("x-circle") либо ""
  active: boolean;
}
export const attributes: CallAttribute[] = [
  { id: "a1", name: "долбаеб", color: "#0252f2", icon: "x-circle", active: true },
  { id: "a2", name: "должник", color: "#cd2c04", icon: "", active: true },
  { id: "a3", name: "какой-то длинный пиздец атрибут", color: "#d90d21", icon: "", active: true },
  { id: "a4", name: "капитальный красавчик", color: "#0bd018", icon: "", active: true },
  { id: "a5", name: "конкурент", color: "#cf0221", icon: "", active: true },
  { id: "a6", name: "мутный персонаж", color: "#d11a05", icon: "", active: true },
  { id: "a7", name: "пидарасина", color: "#c205a9", icon: "", active: true },
  { id: "a8", name: "пиздабол", color: "#03f8fc", icon: "", active: true },
  { id: "a9", name: "Промазал", color: "#036db0", icon: "", active: true },
  { id: "a10", name: "радар", color: "#f90606", icon: "x-circle", active: true },
  { id: "a11", name: "Реклама", color: "#f70202", icon: "", active: true },
  { id: "a12", name: "сомнительно, но ОК", color: "#f8fd08", icon: "", active: true },
];
export function attrById(id: string) { return attributes.find((a) => a.id === id); }

// --- Звонки (строки как на проде: КТО/КОМУ со свободной подписью) ---
export interface ProdCall {
  id: string;
  dateTime: string;          // ISO
  direction: "incoming" | "outgoing";
  status: "Отвечен" | "Пропущен" | "Без ответа";
  operator: "Александр" | "Павел";
  clientLabel?: string;      // свободная подпись клиента (если есть в базе)
  clientPhone: string;       // номер клиента
  transferNumber?: string;   // номер переадресации (значок ⇅ на проде)
  toExtension?: string;      // внутренний добавочный (например "104")
  ourNumberOverride?: string;// если линия не основная (73452564101)
  count: number;             // счётчик звонков с контактом (цифра в кружке)
  talkSec: number;
  waitSec: number;
  attributeIds: string[];
}
export const calls: ProdCall[] = [
  { id: "c1", dateTime: "2026-06-26T10:34:00", direction: "incoming", status: "Отвечен", operator: "Александр", clientLabel: "леса эм-строй 6на84+168р252щ+ две вышки", clientPhone: "+79829235996", transferNumber: "79292697562", toExtension: "104", ourNumberOverride: "73452519090", count: 5, talkSec: 57, waitSec: 12, attributeIds: [] },
  { id: "c2", dateTime: "2026-06-26T10:08:00", direction: "incoming", status: "Отвечен", operator: "Александр", clientLabel: "леса 6на21 на 10 дней 8800 +7н +1500 д800 переулок вербный 5", clientPhone: "+79088560120", transferNumber: "79292697562", toExtension: "104", ourNumberOverride: "73452564243", count: 1, talkSec: 37, waitSec: 15, attributeIds: [] },
  { id: "c3", dateTime: "2026-06-26T09:40:00", direction: "outgoing", status: "Отвечен", operator: "Александр", clientPhone: "+79667622227", count: 3, talkSec: 111, waitSec: 6, attributeIds: [] },
  { id: "c4", dateTime: "2026-06-26T09:07:00", direction: "outgoing", status: "Отвечен", operator: "Александр", clientLabel: "денис ип попов вышка 6м на месяц 7800 д800 чаркова 60", clientPhone: "+79224753531", count: 3, talkSec: 95, waitSec: 7, attributeIds: [] },
  { id: "c5", dateTime: "2026-06-26T09:03:00", direction: "outgoing", status: "Отвечен", operator: "Александр", clientPhone: "+79328472304", count: 5, talkSec: 9, waitSec: 5, attributeIds: [] },
  { id: "c6", dateTime: "2026-06-26T08:21:00", direction: "outgoing", status: "Отвечен", operator: "Александр", clientLabel: "по осушителю звонила 26.10.2025", clientPhone: "+79224906399", count: 6, talkSec: 21, waitSec: 8, attributeIds: [] },
  { id: "c7", dateTime: "2026-06-25T19:09:00", direction: "outgoing", status: "Отвечен", operator: "Павел", clientPhone: "+79619763330", count: 8, talkSec: 8, waitSec: 27, attributeIds: [] },
  { id: "c8", dateTime: "2026-06-25T17:24:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientPhone: "+79673838885", count: 4, talkSec: 0, waitSec: 15, attributeIds: [] },
  { id: "c9", dateTime: "2026-06-24T18:56:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientLabel: "по дровоколу в кулаково звонил 04.03.2026", clientPhone: "+79123817376", count: 7, talkSec: 0, waitSec: 16, attributeIds: [] },
  { id: "c10", dateTime: "2026-06-24T18:02:00", direction: "incoming", status: "Отвечен", operator: "Павел", clientLabel: "виброплита в аренду 21.06.2026", clientPhone: "+79058264734", count: 11, talkSec: 42, waitSec: 8, attributeIds: [] },
  { id: "c11", dateTime: "2026-06-24T17:26:00", direction: "incoming", status: "Отвечен", operator: "Павел", clientPhone: "+79195921732", count: 5, talkSec: 60, waitSec: 4, attributeIds: [] },
  { id: "c12", dateTime: "2026-06-24T14:42:00", direction: "incoming", status: "Отвечен", operator: "Павел", clientPhone: "+79220080056", count: 2, talkSec: 117, waitSec: 10, attributeIds: [] },
  { id: "c13", dateTime: "2026-06-24T09:42:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientPhone: "+79829876343", count: 2, talkSec: 0, waitSec: 14, attributeIds: [] },
  { id: "c14", dateTime: "2026-06-24T09:25:00", direction: "incoming", status: "Отвечен", operator: "Павел", clientLabel: "культиватор в аренду звонил 16.06.2026", clientPhone: "+79026282463", count: 2, talkSec: 29, waitSec: 14, attributeIds: [] },
  { id: "c15", dateTime: "2026-06-24T08:20:00", direction: "incoming", status: "Отвечен", operator: "Павел", clientPhone: "+79504981588", count: 4, talkSec: 43, waitSec: 13, attributeIds: [] },
  { id: "c16", dateTime: "2026-06-23T12:49:00", direction: "incoming", status: "Отвечен", operator: "Павел", clientLabel: "розмотчик труб, такер-степлер и пресс для обжима труб звонил 24.02.2026", clientPhone: "+79504827491", count: 9, talkSec: 75, waitSec: 6, attributeIds: [] },
  { id: "c17", dateTime: "2026-06-23T12:37:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientLabel: "Звонил по дровоколу 10.06.26", clientPhone: "+79292686400", count: 4, talkSec: 0, waitSec: 5, attributeIds: [] },
  { id: "c18", dateTime: "2026-06-23T11:46:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientPhone: "+79953022274", count: 6, talkSec: 0, waitSec: 5, attributeIds: [] },
  { id: "c19", dateTime: "2026-06-22T15:20:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientLabel: "виброплита в аренду кулаково горького звонил 21.06.2026", clientPhone: "+79324741692", count: 13, talkSec: 0, waitSec: 0, attributeIds: [] },
  { id: "c20", dateTime: "2026-06-22T14:37:00", direction: "incoming", status: "Отвечен", operator: "Павел", clientPhone: "+79182877848", ourNumberOverride: "73452564101", count: 2, talkSec: 9, waitSec: 7, attributeIds: [] },
  { id: "c21", dateTime: "2026-06-22T13:39:00", direction: "outgoing", status: "Отвечен", operator: "Павел", clientLabel: "дровокол на долгий срок 26.05.2026", clientPhone: "89530051008", count: 1, talkSec: 42, waitSec: 13, attributeIds: [] },
  { id: "c22", dateTime: "2026-06-22T13:24:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientLabel: "виброплита в аренду звонил 08.06.2026", clientPhone: "+79224707717", count: 39, talkSec: 0, waitSec: 0, attributeIds: [] },
  { id: "c23", dateTime: "2026-06-22T13:16:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientPhone: "12911*102", count: 6, talkSec: 0, waitSec: 0, attributeIds: [] },
  { id: "c24", dateTime: "2026-06-22T12:58:00", direction: "outgoing", status: "Отвечен", operator: "Павел", clientLabel: "стойки 20 шт. на три дня звонил 20.06.2026", clientPhone: "+79827819251", count: 9, talkSec: 60, waitSec: 20, attributeIds: [] },
  { id: "c25", dateTime: "2026-06-22T12:57:00", direction: "outgoing", status: "Отвечен", operator: "Павел", clientLabel: "Звонила по генератору 7квт 22.06.26", clientPhone: "+79827703413", count: 11, talkSec: 37, waitSec: 6, attributeIds: [] },
  { id: "c26", dateTime: "2026-06-22T08:38:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientLabel: "виброплита в аренду звонил 22.06.2026", clientPhone: "+79829477986", count: 4, talkSec: 0, waitSec: 0, attributeIds: [] },
  { id: "c27", dateTime: "2026-06-22T08:30:00", direction: "outgoing", status: "Отвечен", operator: "Павел", clientLabel: "виброплита на 50 кг в аренду звонил 22.06.2026", clientPhone: "+79827885400", count: 7, talkSec: 23, waitSec: 10, attributeIds: [] },
  { id: "c28", dateTime: "2026-06-21T19:24:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientLabel: "виброплита в аренду 20.06.2026", clientPhone: "+79199420054", count: 13, talkSec: 0, waitSec: 2, attributeIds: [] },
  { id: "c29", dateTime: "2026-06-21T18:45:00", direction: "incoming", status: "Отвечен", operator: "Павел", clientLabel: "стройконсалтинг по мотопомпе холмы 27.03.2026", clientPhone: "+79829625030", count: 7, talkSec: 34, waitSec: 8, attributeIds: [] },
  { id: "c30", dateTime: "2026-06-21T17:30:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientLabel: "по компрессору 2-й номер звонил 21.06.2026", clientPhone: "+79129924147", count: 2, talkSec: 0, waitSec: 3, attributeIds: [] },
  { id: "c31", dateTime: "2026-06-21T17:26:00", direction: "incoming", status: "Отвечен", operator: "Павел", clientLabel: "по компрессору 1-й номер звонил 21.06.2026", clientPhone: "+79612019681", count: 2, talkSec: 72, waitSec: 7, attributeIds: [] },
  { id: "c32", dateTime: "2026-06-21T17:01:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientLabel: "виброплита в аренду 21.06.2026", clientPhone: "+79048756022", count: 4, talkSec: 0, waitSec: 8, attributeIds: [] },
  { id: "c33", dateTime: "2026-06-21T13:02:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientLabel: "газонокосилка на колесах в аренду звонила 21.06.2026", clientPhone: "+79123893773", count: 2, talkSec: 0, waitSec: 13, attributeIds: [] },
  { id: "c34", dateTime: "2026-06-21T12:40:00", direction: "incoming", status: "Отвечен", operator: "Павел", clientLabel: "мотопомпа в аренду 22.03.2026", clientPhone: "+79044992224", transferNumber: "79292697822", ourNumberOverride: "73452564101", count: 5, talkSec: 48, waitSec: 4, attributeIds: [] },
  { id: "c35", dateTime: "2026-06-21T10:08:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientLabel: "бензобур в аренду звонил 21.06.2026", clientPhone: "+79292682268", count: 2, talkSec: 0, waitSec: 8, attributeIds: [] },
  { id: "c36", dateTime: "2026-06-20T19:03:00", direction: "incoming", status: "Пропущен", operator: "Павел", clientLabel: "виброплита в аренду звонил 20.06.2026", clientPhone: "+79199338192", count: 2, talkSec: 0, waitSec: 16, attributeIds: [] },
];

// --- Быстрые действия (счётчики) ---
export const quickStats = { missed: 19, important: 13, callback: 2, orders: 24 };

// --- Клиентская база ---
export interface ProdClient {
  id: string;
  name: string;              // свободная подпись (как на проде)
  phone: string;
  rating: number;            // из 5
  status: "Активен" | "В черном списке";
  lastContactAt: string;
}
export const clients: ProdClient[] = [
  { id: "k1", name: "газелизд везет лестницу 3на20 с ватутина 16.10.2025", phone: "+79123915862", rating: 3, status: "Активен", lastContactAt: "2025-10-16" },
  { id: "k2", name: "вышка 4м на 5 дней 3800 д600 соловьиная роща звонила 24.11.2025", phone: "+79044940176", rating: 3, status: "Активен", lastContactAt: "2025-11-24" },
  { id: "k3", name: "должник 22028.60 рублей ватсап жадный заказчик леса 18к+18н на 14 дней 14400 д700 падерина звонил 25.09.2025", phone: "+79224602525", rating: 3, status: "Активен", lastContactAt: "2025-09-25" },
  { id: "k4", name: "пиСДЕК ошибся звонил 24.02.2026", phone: "+79668721016", rating: 3, status: "В черном списке", lastContactAt: "2026-02-24" },
  { id: "k5", name: "помост компакт 2.8м на 7-14 дней 3400-5800 самовывоз 07.04.2026", phone: "+79220002425", rating: 3, status: "Активен", lastContactAt: "2026-04-07" },
  { id: "k6", name: "виброплита в аренду 21.06.2026", phone: "+79058264734", rating: 3, status: "Активен", lastContactAt: "2026-06-24" },
  { id: "k7", name: "по дровоколу в кулаково звонил 04.03.2026", phone: "+79123817376", rating: 3, status: "Активен", lastContactAt: "2026-06-24" },
  { id: "k8", name: "леса 6на21 на 10 дней 8800 +7н +1500 д800 переулок вербный 5", phone: "+79088560120", rating: 3, status: "Активен", lastContactAt: "2026-06-26" },
  { id: "k9", name: "культиватор в аренду звонил 16.06.2026", phone: "+79026282463", rating: 3, status: "Активен", lastContactAt: "2026-06-24" },
  { id: "k10", name: "стройконсалтинг по мотопомпе холмы 27.03.2026", phone: "+79829625030", rating: 3, status: "Активен", lastContactAt: "2026-06-21" },
];
export const clientStats = { total: 1788, active: 1788, withCalls: 0, blacklisted: 286 };

// --- Чёрный список ---
export interface BlacklistEntry {
  id: string;
  when: string;              // ISO
  label: string;             // подпись «кого»
  phone: string;
  by: string;                // кем
  reason: string;            // причина ("Не указана")
  until: string | "permanent";
  remains?: string;          // «осталось: …»
}
export const blacklist: BlacklistEntry[] = [
  { id: "b1", when: "2026-06-22T13:04:00", label: "геосм геосинтетика звонил 22.05.2026", phone: "+79063592585", by: "Александр", reason: "Не указана", until: "2026-07-22T13:04:00", remains: "через 3 недели" },
  { id: "b2", when: "2026-06-22T10:01:00", label: "вышка 8м на два дня тобольск звонил 22.06.2026", phone: "+79191452351", by: "Александр", reason: "Не указана", until: "2026-07-22T10:01:00", remains: "через 3 недели" },
  { id: "b3", when: "2026-06-22T09:53:00", label: "цыгане леса на 5 дней парфенова звонил 22.06.2026", phone: "+79129995894", by: "Александр", reason: "Не указана", until: "permanent" },
  { id: "b4", when: "2026-06-22T09:51:00", label: "вышка 2м*2м на три дня в тобольске 2й номер звонил 20.06.2026", phone: "+79829447319", by: "Александр", reason: "Не указана", until: "2026-07-22T09:51:00", remains: "через 3 недели" },
  { id: "b5", when: "2026-06-21T15:31:00", label: "леса 1к для киносъемок посмотреть звонил 21.06.2026", phone: "+79833403900", by: "Александр", reason: "Не указана", until: "2026-06-28T15:31:00", remains: "через 2 дня" },
  { id: "b6", when: "2026-06-21T15:10:00", label: "залупа леса для кино на 15 минут звонила 21.06.2026", phone: "+79334402452", by: "Александр", reason: "Не указана", until: "permanent" },
  { id: "b7", when: "2026-06-20T15:25:00", label: "вышка 22 4м на три дня тобольск звонил 20.06.2026", phone: "+79221002030", by: "Александр", reason: "Не указана", until: "permanent" },
];

// --- Пользователи (Настройки → Управление правами) ---
export interface AccessUser {
  id: string; name: string; email: string; fullAccess: boolean; self?: boolean;
}
export const accessUsers: AccessUser[] = [
  { id: "u1", name: "Valery Valeryevich", email: "lolx32@mail.ru", fullAccess: false },
  { id: "u2", name: "Алексей", email: "batalov2509@gmail.com", fullAccess: true },
  { id: "u3", name: "Александр", email: "arendastroytyumen@gmail.com", fullAccess: true },
  { id: "u4", name: "Pavel", email: "batalovpavel009@gmail.com", fullAccess: true, self: true },
  { id: "u5", name: "Лёха", email: "batalov25509@gmail.com", fullAccess: false },
  { id: "u6", name: "Lopoloifhidwjdwfefee fjedwjdwj ijwhfwdj wfiefwjdwd", email: "nomin.momin+285e1@mail.ru", fullAccess: false },
  { id: "u7", name: "Stevespeer", email: "pavlov-9ao9i@rambler.ua", fullAccess: false },
  { id: "u8", name: "RobertDurce", email: "orqbqlphzb@rambler.ru", fullAccess: false },
  { id: "u9", name: "Wolkc", email: "wolkc10@gmail.com", fullAccess: false },
];

// --- Расчёты (точно как на проде) ---
export const calculations: Calculation[] = [
  {
    id: 13, category: "Леса", kind: "Комплекты", createdAt: "2025-10-31T13:45:00", author: "Александр",
    startDate: "2025-10-31", endDate: "2025-11-15", days: 15,
    lines: [
      { name: "Рама с лестницей", qty: 18, unit: "шт" },
      { name: "Рама проходная", qty: 18, unit: "шт" },
      { name: "Диагональная связь", qty: 18, unit: "шт" },
      { name: "Горизонтальная связь", qty: 18, unit: "шт" },
      { name: "Настил деревянный 3м на 0.3м", qty: 18, unit: "шт" },
    ],
    fullPrice: 99126, perDay: 893.33, deliveryPrice: 0, discount: 0, total: 13400, attached: false,
  },
  {
    id: 12, category: "Леса", kind: "Метры", createdAt: "2025-10-27T20:11:00", author: "Алексей",
    startDate: "2025-10-27", endDate: "2025-10-31", days: 4,
    lines: [
      { name: "Рама с лестницей", qty: 12, unit: "шт" },
      { name: "Настил деревянный 3м на 0.3м", qty: 12, unit: "шт" },
    ],
    fullPrice: 35100, perDay: 2193.75, deliveryPrice: 0, discount: 0, total: 8775, attached: false,
  },
];

// --- Номенклатура (для настроек/калькулятора) ---
export const equipment: Equipment[] = [
  { id: "e1", name: "Рама с лестницей", category: "Леса", pricePerDay: 50, deposit: 0, stockTotal: 120, stockAvailable: 78, unit: "шт" },
  { id: "e2", name: "Рама проходная", category: "Леса", pricePerDay: 45, deposit: 0, stockTotal: 120, stockAvailable: 82, unit: "шт" },
  { id: "e3", name: "Диагональная связь", category: "Леса", pricePerDay: 12, deposit: 0, stockTotal: 240, stockAvailable: 160, unit: "шт" },
  { id: "e4", name: "Горизонтальная связь", category: "Леса", pricePerDay: 12, deposit: 0, stockTotal: 240, stockAvailable: 150, unit: "шт" },
  { id: "e5", name: "Настил деревянный 3м на 0.3м", category: "Леса", pricePerDay: 35, deposit: 0, stockTotal: 200, stockAvailable: 95, unit: "шт" },
  { id: "e6", name: "Вышка-тура 4м", category: "Вышки-туры", pricePerDay: 760, deposit: 600, stockTotal: 8, stockAvailable: 3, unit: "шт" },
  { id: "e7", name: "Вышка-тура 8м", category: "Вышки-туры", pricePerDay: 1100, deposit: 1000, stockTotal: 5, stockAvailable: 2, unit: "шт" },
];
