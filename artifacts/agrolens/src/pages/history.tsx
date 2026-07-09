import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Droplets, Sparkles, CloudRain, Landmark, TrendingUp,
  Search, X, SlidersHorizontal, ChevronRight, Filter, Clock,
  AlertTriangle, CheckCircle2, Info, Leaf,
} from "lucide-react";
import { useLocation } from "wouter";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EventCategory = "all" | "diagnoses" | "irrigation" | "alerts" | "government" | "market";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  time: string;
  date: string;
  priority: "high" | "normal" | "low";
  icon: typeof Camera;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  action?: string;
  actionPath?: string;
}

const ALL_EVENTS: TimelineEvent[] = [
  {
    id: "e1", title: "Yellow Rust detected", description: "Wheat - Field A - 86% confidence. Apply Propiconazole immediately.",
    category: "diagnoses", time: "10:24 AM", date: "Today", priority: "high",
    icon: Camera, iconColor: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200",
    action: "View Report", actionPath: "/scan",
  },
  {
    id: "e2", title: "Drip irrigation completed", description: "Zone B finished - 450L used. Soil moisture now at 58%.",
    category: "irrigation", time: "8:00 AM", date: "Today", priority: "normal",
    icon: Droplets, iconColor: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200",
    action: "View Log", actionPath: "/irrigation",
  },
  {
    id: "e3", title: "Heavy rainfall alert", description: "65% probability tomorrow. Skip irrigation to save water.",
    category: "alerts", time: "7:30 AM", date: "Today", priority: "high",
    icon: CloudRain, iconColor: "text-amber-500", bgColor: "bg-amber-50", borderColor: "border-amber-200",
    action: "View Forecast", actionPath: "/irrigation",
  },
  {
    id: "e4", title: "AI recommendation generated", description: "Cotton showing nitrogen deficiency. Apply urea 20 kg/acre.",
    category: "diagnoses", time: "Yesterday", date: "Yesterday", priority: "normal",
    icon: Sparkles, iconColor: "text-violet-500", bgColor: "bg-violet-50", borderColor: "border-violet-200",
    action: "View Plan", actionPath: "/recommendations",
  },
  {
    id: "e5", title: "PM-Kisan subsidy update", description: "Government launched new millet subsidy for Kharif 2026. Check eligibility.",
    category: "government", time: "Yesterday", date: "Yesterday", priority: "normal",
    icon: Landmark, iconColor: "text-emerald-500", bgColor: "bg-emerald-50", borderColor: "border-emerald-200",
    action: "Learn More", actionPath: "/profile",
  },
  {
    id: "e6", title: "Tomato prices up 12%", description: "Nashik mandi - Rs 850/q. Best selling window now.",
    category: "market", time: "2 days ago", date: "2 days ago", priority: "normal",
    icon: TrendingUp, iconColor: "text-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-200",
    action: "Check Prices", actionPath: "/analytics",
  },
  {
    id: "e7", title: "Pump Started - Zone A", description: "Auto schedule at 5:30 AM. Duration: 45 minutes.",
    category: "irrigation", time: "2 days ago", date: "2 days ago", priority: "low",
    icon: Droplets, iconColor: "text-sky-500", bgColor: "bg-sky-50", borderColor: "border-sky-200",
    action: "View Log", actionPath: "/irrigation",
  },
  {
    id: "e8", title: "All crops healthy", description: "Routine scan complete. No issues detected in any field.",
    category: "diagnoses", time: "3 days ago", date: "3 days ago", priority: "low",
    icon: CheckCircle2, iconColor: "text-emerald-500", bgColor: "bg-emerald-50", borderColor: "border-emerald-200",
    action: "View Report", actionPath: "/scan",
  },
];

const FILTER_OPTIONS: { value: EventCategory; label: string; icon: typeof Camera }[] = [
  { value: "all", label: "All", icon: Filter },
  { value: "diagnoses", label: "Diagnoses", icon: Camera },
  { value: "irrigation", label: "Irrigation", icon: Droplets },
  { value: "alerts", label: "Alerts", icon: AlertTriangle },
  { value: "government", label: "Government", icon: Landmark },
  { value: "market", label: "Market", icon: TrendingUp },
];

export default function HistoryPage() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<EventCategory>("all");
  const [query, setQuery] = useState("");

  const filtered = ALL_EVENTS.filter((e) => {
    const catMatch = filter === "all" || e.category === filter;
    const qMatch = !query || e.title.toLowerCase().includes(query.toLowerCase()) || e.description.toLowerCase().includes(query.toLowerCase());
    return catMatch && qMatch;
  });

  // Group by date
  const groups: Record<string, TimelineEvent[]> = {};
  for (const e of filtered) {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  }
  const dates = Object.keys(groups);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="space-y-5 pb-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Complete farm activity timeline</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search" placeholder="Search events..."
            className="pl-9 h-11 rounded-xl pr-8" value={query} onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setQuery("")}><X className="h-3.5 w-3.5" /></button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border",
                  active
                    ? "bg-foreground text-white border-foreground"
                    : "bg-card text-muted-foreground border-border/40 hover:text-foreground hover:border-border"
                )}
              >
                <opt.icon className="h-3.5 w-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Filter className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No events match your filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dates.map((date) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{date}</span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
                <div className="space-y-2.5">
                  {groups[date].map((e) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex items-start gap-3 bg-card rounded-2xl px-4 py-3 border shadow-sm transition-all hover:shadow-md cursor-pointer",
                        e.borderColor
                      )}
                      onClick={() => e.actionPath && navigate(e.actionPath)}
                    >
                      <div className={cn("w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5", e.bgColor)}>
                        <e.icon className={cn("h-4 w-4", e.iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-foreground">{e.title}</p>
                          {e.priority === "high" && (
                            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full border border-red-200">High</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug">{e.description}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-muted-foreground">{e.time}</span>
                          {e.action && (
                            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-primary">
                              {e.action} <ChevronRight className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
