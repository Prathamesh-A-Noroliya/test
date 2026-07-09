import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, Trash2, Sparkles, Droplets, CloudRain, Landmark, TrendingUp, CloudLightning, Settings, ChevronRight } from "lucide-react";
import { useNotifications, type NotifCategory, type NotificationItem } from "@/lib/notifications";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const CAT_ICON: Record<NotifCategory, typeof Sparkles> = {
  ai: Sparkles,
  irrigation: Droplets,
  government: Landmark,
  market: TrendingUp,
  weather: CloudRain,
  system: Settings,
};

const CAT_COLOR: Record<NotifCategory, { bg: string; text: string; dot: string }> = {
  ai:        { bg: "bg-violet-50",  text: "text-violet-600",  dot: "bg-violet-500" },
  irrigation:{ bg: "bg-sky-50",     text: "text-sky-600",     dot: "bg-sky-500" },
  government:{ bg: "bg-amber-50",    text: "text-amber-600",   dot: "bg-amber-500" },
  market:    { bg: "bg-emerald-50",  text: "text-emerald-600", dot: "bg-emerald-500" },
  weather:   { bg: "bg-blue-50",     text: "text-blue-600",    dot: "bg-blue-500" },
  system:    { bg: "bg-slate-50",    text: "text-slate-600",   dot: "bg-slate-500" },
};

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, dismiss, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | NotifCategory>("all");
  const [, navigate] = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.category === filter);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-white/70 border border-border/60 hover:bg-white transition-all"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 text-foreground" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-12 z-50 w-[380px] max-w-[92vw] rounded-2xl bg-white shadow-xl border border-border/40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <h3 className="text-sm font-bold text-foreground">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Mark all read">
                    <Check className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
                <button onClick={clearAll} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Clear all">
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </button>
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide">
              {(["all", "ai", "irrigation", "government", "market", "weather"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all capitalize",
                    filter === cat ? "bg-foreground text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto px-3 pb-3 space-y-1.5">
              {filtered.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No notifications</p>
                </div>
              ) : (
                filtered.map((n) => <NotifRow key={n.id} n={n} onRead={markRead} onDismiss={dismiss} onNavigate={(p) => { navigate(p); setOpen(false); }} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotifRow({ n, onRead, onDismiss, onNavigate }: {
  n: NotificationItem;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onNavigate: (p: string) => void;
}) {
  const Icon = CAT_ICON[n.category];
  const col = CAT_COLOR[n.category];
  return (
    <div
      onClick={() => onRead(n.id)}
      className={cn(
        "group flex items-start gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer transition-all hover:bg-muted/60",
        n.read ? "opacity-70" : "bg-white/80"
      )}
    >
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", col.bg)}>
        <Icon className={cn("h-4 w-4", col.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {!n.read && <div className={cn("w-1.5 h-1.5 rounded-full", col.dot)} />}
          <p className={cn("text-xs font-semibold truncate", n.read ? "text-muted-foreground" : "text-foreground")}>{n.title}</p>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">{n.body}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted-foreground/60">{n.time}</span>
          {n.action && n.actionPath && (
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate(n.actionPath!); }}
              className="flex items-center gap-0.5 text-[10px] font-semibold text-primary hover:underline"
            >
              {n.action} <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 transition-all shrink-0 mt-0.5"
      >
        <X className="h-3 w-3 text-muted-foreground hover:text-red-400" />
      </button>
    </div>
  );
}
