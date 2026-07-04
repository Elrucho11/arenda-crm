// ===== Омниканальный чат (Telegram + SMS + Email) — mock =====
// Структура снята с боевого chats/index.blade.php (Alpine chatApp).

export type Channel = "telegram" | "sms" | "email";
export type ConvStatus = "open" | "waiting" | "closed";
export type MsgStatus = "queued" | "sending" | "sent" | "delivered" | "failed";
export type MsgDirection = "inbound" | "outbound";

export interface ChatAttachment {
  url: string;
  name: string;
  isImage: boolean;
}

export interface ChatMessage {
  id: number;
  direction: MsgDirection;
  channel: Channel;
  operator?: string;      // кто из операторов отправил (для outbound)
  edited?: boolean;
  body?: string;
  attachments?: ChatAttachment[];
  time: string;           // "14:35"
  status?: MsgStatus;     // только для outbound
  error?: string;
  sortKey: number;        // порядок (эпоха-подобный)
}

export interface ChatClientInfo {
  id: string;
  name: string;
  rating: number;         // 0..5
  phones: string[];
  notes?: string;
  totalCalls: number;
}

export interface ChatThread {
  id: number;
  title: string;
  clientId: string | null;
  isBlacklisted: boolean;
  botBlocked: boolean;
  channels: Channel[];
  availableChannels: Channel[];
  status: ConvStatus;
  phone?: string;         // номер, пришедший из Telegram (если тред не привязан)
  lastMessageAt: string;  // "14:35" / "Вчера"
  unread: number;
  messages: ChatMessage[];
}

export interface ChatTemplate {
  id: string;
  title: string;
  body: string;
}

export const chatTemplates: ChatTemplate[] = [
  { id: "t1", title: "Приветствие", body: "Здравствуйте, {имя}! Спасибо за обращение — чем можем помочь?" },
  { id: "t2", title: "Наличие", body: "Да, оборудование в наличии. Уточните, пожалуйста, срок аренды и адрес доставки." },
  { id: "t3", title: "Реквизиты", body: "Отправляю реквизиты для оплаты. Залог возвращается при возврате оборудования в исправном состоянии." },
  { id: "t4", title: "Не дозвонились", body: "Пытались до вас дозвониться, но не смогли. Напишите удобное время для звонка." },
];

export const botUsername = "arendastroy_bot";

// --- Диалоги ---
export const chatThreads: ChatThread[] = [
  {
    id: 1, title: "Денис, ИП Попов", clientId: "k9", isBlacklisted: false, botBlocked: false,
    channels: ["telegram", "sms"], availableChannels: ["telegram", "sms"], status: "open",
    lastMessageAt: "14:38", unread: 2,
    messages: [
      { id: 101, direction: "inbound", channel: "telegram", body: "Здравствуйте! Вышка 6м ещё в аренде?", time: "14:20", sortKey: 1020 },
      { id: 102, direction: "outbound", channel: "telegram", operator: "Павел", body: "Здравствуйте, Денис! Да, доступна. На какой срок нужна?", time: "14:22", status: "delivered", sortKey: 1022 },
      { id: 103, direction: "inbound", channel: "telegram", body: "На месяц. Сколько выйдет с доставкой на Чаркова 60?", time: "14:35", sortKey: 1035 },
      { id: 104, direction: "inbound", channel: "telegram", body: "И залог какой?", time: "14:38", sortKey: 1038 },
    ],
  },
  {
    id: 2, title: "+7 905 826-47-34", clientId: null, isBlacklisted: false, botBlocked: false,
    channels: ["telegram"], availableChannels: ["telegram"], status: "waiting",
    phone: "+79058264734", lastMessageAt: "13:05", unread: 1,
    messages: [
      { id: 201, direction: "inbound", channel: "telegram", body: "Вибропл␁ита 50кг в аренду на выходные есть?".replace("␁", ""), time: "13:01", sortKey: 1301 },
      { id: 202, direction: "outbound", channel: "telegram", operator: "Александр", body: "Добрый день! Да, есть. Самовывоз или доставка?", time: "13:03", status: "delivered", sortKey: 1303 },
      { id: 203, direction: "inbound", channel: "telegram", body: "Доставка. Кулаково", time: "13:05", sortKey: 1305 },
    ],
  },
  {
    id: 3, title: "Ирина (леса)", clientId: "k8", isBlacklisted: false, botBlocked: false,
    channels: ["sms"], availableChannels: ["sms"], status: "open",
    lastMessageAt: "11:47", unread: 0,
    messages: [
      { id: 301, direction: "outbound", channel: "sms", operator: "Павел", body: "Ирина, добрый день! По лесам 6на21 — договор готов, можно подъезжать.", time: "11:40", status: "delivered", sortKey: 1140 },
      { id: 302, direction: "inbound", channel: "sms", body: "Спасибо, будем к 15:00", time: "11:47", sortKey: 1147 },
    ],
  },
  {
    id: 4, title: "+7 982 947-79-86", clientId: null, isBlacklisted: false, botBlocked: true,
    channels: ["telegram"], availableChannels: [], status: "waiting",
    phone: "+79829477986", lastMessageAt: "Вчера", unread: 0,
    messages: [
      { id: 401, direction: "inbound", channel: "telegram", body: "Виброплита в аренду", time: "18:20", sortKey: 902 },
      { id: 402, direction: "outbound", channel: "telegram", operator: "Александр", body: "Здравствуйте! Уточните адрес и срок, пожалуйста.", time: "18:25", status: "failed", error: "Бот заблокирован пользователем", sortKey: 905 },
    ],
  },
  {
    id: 5, title: "Компрессор (2 линия)", clientId: "k10", isBlacklisted: false, botBlocked: false,
    channels: ["telegram", "email"], availableChannels: ["telegram", "email"], status: "closed",
    lastMessageAt: "Пн", unread: 0,
    messages: [
      { id: 501, direction: "inbound", channel: "telegram", body: "По компрессору договорились, спасибо!", time: "10:15", sortKey: 700 },
      { id: 502, direction: "outbound", channel: "telegram", operator: "Павел", body: "Отлично! Ждём вас. Хорошего дня 🙂", time: "10:16", status: "delivered", sortKey: 701 },
    ],
  },
  {
    id: 6, title: "+7 933 440-24-52", clientId: null, isBlacklisted: true, botBlocked: false,
    channels: ["sms"], availableChannels: ["sms"], status: "closed",
    phone: "+79334402452", lastMessageAt: "Пн", unread: 0,
    messages: [
      { id: 601, direction: "inbound", channel: "sms", body: "Леса для кино на 15 минут посмотреть", time: "15:10", sortKey: 500 },
    ],
  },
];

// Инфо о клиентах для правой панели (по clientId треда)
export const chatClients: Record<string, ChatClientInfo> = {
  k9: { id: "k9", name: "Денис, ИП Попов", rating: 4, phones: ["+7 922 475-35-31"], notes: "Постоянный. Вышки, лес. Оплата по счёту.", totalCalls: 3 },
  k8: { id: "k8", name: "Ирина — леса 6на21", rating: 3, phones: ["+7 908 856-01-20"], notes: "Переулок Вербный 5. Договор 10 дней.", totalCalls: 1 },
  k10: { id: "k10", name: "Стройконсалтинг (мотопомпа/компрессор)", rating: 5, phones: ["+7 982 962-50-30"], notes: "Холмы. Берёт технику регулярно.", totalCalls: 7 },
};

// Клиенты для поиска при привязке треда
export const chatClientSearch: ChatClientInfo[] = [
  { id: "k1", name: "газель везёт лестницу 3на20", rating: 3, phones: ["+7 912 391-58-62"], totalCalls: 1 },
  { id: "k3", name: "должник 22028₽ (леса, Падерина)", rating: 2, phones: ["+7 922 460-25-25"], totalCalls: 4 },
  { id: "k5", name: "помост компакт 2.8м", rating: 3, phones: ["+7 922 000-24-25"], totalCalls: 2 },
  { id: "k6", name: "виброплита в аренду", rating: 3, phones: ["+7 905 826-47-34"], totalCalls: 11 },
];
