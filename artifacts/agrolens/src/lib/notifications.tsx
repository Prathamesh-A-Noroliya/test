import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type NotifCategory = "ai" | "irrigation" | "government" | "market" | "weather" | "system";
export type NotifPriority = "high" | "normal" | "low";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: NotifCategory;
  priority: NotifPriority;
  time: string;
  read: boolean;
  action?: string;
  actionPath?: string;
}

const INITIAL: NotificationItem[] = [
  { id: "n1", title: "AI diagnosis completed", body: "Wheat scan — Yellow Rust detected with 86% confidence.", category: "ai", priority: "high", time: "2 min ago", read: false, action: "View Report", actionPath: "/history" },
  { id: "n2", title: "Irrigation completed", body: "Zone B drip irrigation finished. 450L used.", category: "irrigation", priority: "normal", time: "15 min ago", read: false, action: "View Schedule", actionPath: "/irrigation" },
  { id: "n3", title: "New PM-Kisan scheme", body: "Government launched new millet subsidy for Kharif 2026.", category: "government", priority: "normal", time: "1 hr ago", read: false, action: "Learn More", actionPath: "/profile" },
  { id: "n4", title: "Tomato prices up 12%", body: "Nashik mandi — ₹850/q. Best selling window now.", category: "market", priority: "high", time: "2 hr ago", read: false, action: "Check Prices", actionPath: "/analytics" },
  { id: "n5", title: "Heavy rainfall tomorrow", body: "65% probability. Skip irrigation to save water.", category: "weather", priority: "high", time: "3 hr ago", read: false, action: "View Forecast", actionPath: "/irrigation" },
  { id: "n6", title: "Pump Started", body: "Zone A pump activated at 5:30 AM. Auto schedule.", category: "irrigation", priority: "low", time: "5 hr ago", read: true, action: "View Log", actionPath: "/irrigation" },
  { id: "n7", title: "Nitrogen deficiency alert", body: "Field C cotton showing yellowing lower leaves.", category: "ai", priority: "high", time: "6 hr ago", read: true, action: "View Plan", actionPath: "/recommendations" },
  { id: "n8", title: "System Update", body: "AgroLens v2.1 available. New analytics features.", category: "system", priority: "low", time: "1 day ago", read: true },
];

interface NotifCtx {
  notifications: NotificationItem[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

const Ctx = createContext<NotifCtx>({
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
  dismiss: () => {},
  clearAll: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>(INITIAL);

  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <Ctx.Provider value={{ notifications: items, unreadCount, markRead, markAllRead, dismiss, clearAll }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  return useContext(Ctx);
}
