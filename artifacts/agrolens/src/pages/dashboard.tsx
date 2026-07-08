import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Camera, History, CheckCircle2, AlertTriangle,
  Leaf, Sun, CloudRain, Droplets, Wind,
  Zap, Sparkles, TrendingUp,
  ChevronRight, Gauge, Sprout, Waves, Flame, Umbrella,
  MapPin,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language-context";

/* ──── Data ──────────────────────────────────────────── */
const HEALTH_DONUT = [
  { name: "Healthy",  value: 62, color: "#22c55e" },
  { name: "At Risk",  value: 21, color: "#f59e0b" },
  { name: "Diseased", value: 11, color: "#ef4444" },
  { name: "Unknown",  value: 6,  color: "#cbd5e1" },
];

const WEEKLY_SCANS = [
  { day: "Mon", scans: 3 }, { day: "Tue", scans: 5 }, { day: "Wed", scans: 2 },
  { day: "Thu", scans: 7 }, { day: "Fri", scans: 4 }, { day: "Sat", scans: 6 },
  { day: "Sun", scans: 1 },
];

const IRRIGATION_LOG = [
  { day: "Mon", water: 320 }, { day: "Tue", water: 0 }, { day: "Wed", water: 450 },
  { day: "Thu", water: 0 },   { day: "Fri", water: 380 }, { day: "Sat", water: 0 },
  { day: "Sun", water: 290 },
];

const FIELD_STATUS = [
  { field: "Field A", crop: "Wheat", status: "diseased",  issue: "Yellow Rust detected", soil: 38, action: "Apply Propiconazole today" },
  { field: "Field B", crop: "Rice",  status: "at-risk",   issue: "Minor leaf blight",    soil: 55, action: "Neem oil spray recommended" },
  { field: "Field C", crop: "Cotton",status: "diseased",  issue: "Aphid infestation",      soil: 42, action: "Imidacloprid spray ASAP" },
  { field: "Field D", crop: "Tomato", status: "healthy",   issue: "All healthy",           soil: 68, action: "No action needed" },
];

const TASKS = [
  { done: false, icon: Droplets,    color: "text-blue-600",  bg: "bg-blue-50",  text: "Irrigate Field A before 10:30 AM",     sub: "Soil moisture at 38% — below optimal" },
  { done: true,  icon: Umbrella,    color: "text-sky-600",   bg: "bg-sky-50",   text: "Delay pesticide spraying on Field B", sub: "Rain expected in 3 hours — save water" },
  { done: false, icon: Camera,       color: "text-violet-600",bg: "bg-violet-50",text: "Scan tomato crop in Field D",          sub: "5 days since last scan — recommended weekly" },
  { done: false, icon: Sprout,      color: "text-amber-600", bg: "bg-amber-50", text: "Nitrogen deficiency alert — Field C",   sub: "Apply urea 20 kg/acre after pest control" },
  { done: false, icon: Waves,       color: "text-cyan-600",  bg: "bg-cyan-50",  text: "Rainwater harvesting setup",           sub: "11 mm expected today — collect runoff" },
];

/* ──── Animation ──────────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const statusConfig: Record<string, { label: string; dot: string; bar: string; text: string }> = {
  healthy:   { label: "Healthy",   dot: "bg-emerald-500", bar: "bg-emerald-500", text: "text-emerald-700" },
  "at-risk": { label: "At Risk",   dot: "bg-amber-400",  bar: "bg-amber-400",  text: "text-amber-700" },
  diseased:  { label: "Diseased",  dot: "bg-red-500",    bar: "bg-red-500",    text: "text-red-700" },
};

/* ──── Component ──────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hour, setHour] = useState(0);

  useEffect(() => { setHour(new Date().getHours()); }, []);

  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const farmingScore = 92;
  const soilMoisture = 41;

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20">

        {/* ── Welcome Header ──────────────────────────────────────────────── */}
        <motion.div variants={item}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{greeting} 👋</p>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5 leading-tight">
                {user?.fullName.split(" ")[0]}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Pune, Maharashtra
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 text-xs font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Pro Plan
            </div>
          </div>
        </motion.div>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <motion.div variants={item} className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/scan")}
            className="flex-1 relative overflow-hidden rounded-2xl p-4 text-left shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
          >
            <Camera className="h-6 w-6 text-white/90 mb-3" />
            <p className="text-white font-bold text-sm leading-tight">AI Scan</p>
            <p className="text-white/70 text-[11px] mt-0.5">Detect diseases instantly</p>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/irrigation")}
            className="flex-1 relative overflow-hidden rounded-2xl p-4 text-left shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(200 65% 48%), hsl(230 55% 52%))" }}
          >
            <Droplets className="h-6 w-6 text-white/90 mb-3" />
            <p className="text-white font-bold text-sm leading-tight">Irrigate</p>
            <p className="text-white/70 text-[11px] mt-0.5">Smart water management</p>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/history")}
            className="flex-1 relative overflow-hidden rounded-2xl p-4 text-left shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(30 75% 48%), hsl(15 65% 52%))" }}
          >
            <History className="h-6 w-6 text-white/90 mb-3" />
            <p className="text-white font-bold text-sm leading-tight">History</p>
            <p className="text-white/70 text-[11px] mt-0.5">Past scans & irrigation</p>
          </motion.button>
        </motion.div>

        {/* ── Farm Conditions (hero section) ─────────────────────────────── */}
        <motion.div variants={item}>
          <div
            className="rounded-3xl p-5 shadow-sm relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, hsl(142 40% 97%) 0%, hsl(196 50% 96%) 50%, hsl(210 55% 95%) 100%)",
              border: "1px solid hsl(170 30% 88%)",
            }}
          >
            {/* Top row: temp + farming score */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ background: "linear-gradient(135deg, hsl(35 80% 55%), hsl(25 70% 48%))" }}>
                  <Sun className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">28°</span>
                    <span className="text-sm text-muted-foreground">Partly Cloudy</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Humidity 62% · Wind 12 km/h</p>
                </div>
              </div>
              <div className="text-center">
                <div className="relative w-14 h-14 mx-auto">
                  <svg viewBox="0 0 60 60" className="w-14 h-14 -rotate-90">
                    <circle cx="30" cy="30" r="24" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                    <circle cx="30" cy="30" r="24" fill="none" stroke="#22c55e" strokeWidth="6"
                      strokeDasharray={`${farmingScore * 1.51} ${151 - farmingScore * 1.51}`}
                      strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{farmingScore}</span>
                </div>
                <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Farm Score</p>
              </div>
            </div>

            {/* Insight bar */}
            <div className="flex items-start gap-2.5 bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/60 shadow-sm mb-4">
              <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-foreground">
                Excellent conditions for irrigation before 11 AM
              </p>
            </div>

            {/* Weather detail row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: CloudRain, label: "Rain", value: "11 mm", sub: "in ~3h", accent: true },
                { icon: Droplets,  label: "Humidity", value: "62%", sub: "Optimal" },
                { icon: Wind,      label: "Wind", value: "12 km/h", sub: "Calm" },
                { icon: Flame,     label: "UV", value: "High", sub: "Use shade" },
              ].map((w) => (
                <div key={w.label} className={`text-center rounded-xl py-2.5 px-1 ${w.accent ? "bg-sky-50 border border-sky-100" : "bg-white/60 border border-white/50"}`}>
                  <w.icon className={`h-4 w-4 mx-auto mb-1 ${w.accent ? "text-sky-500" : "text-muted-foreground"}`} />
                  <p className={`text-sm font-bold ${w.accent ? "text-sky-700" : "text-foreground"}`}>{w.value}</p>
                  <p className="text-[9px] text-muted-foreground leading-tight">{w.sub}</p>
                  <p className="text-[9px] font-medium text-muted-foreground/70">{w.label}</p>
                </div>
              ))}
            </div>

            {/* Soil moisture mini-bar */}
            <div className="mt-4 bg-white/60 rounded-xl px-3.5 py-2.5 border border-white/50 flex items-center gap-3">
              <Gauge className="h-4 w-4 text-emerald-500 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground">Soil Moisture</span>
                  <span className="text-xs font-bold text-emerald-600">{soilMoisture}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-emerald-500" initial={{ width: 0 }}
                    animate={{ width: `${soilMoisture}%` }} transition={{ duration: 1, delay: 0.3 }} />
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">Field avg</span>
            </div>
          </div>
        </motion.div>

        {/* ── Today's Suggested Tasks ────────────────────────────────────────── */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Today's Suggested Tasks</h2>
            <span className="text-[11px] text-muted-foreground">{TASKS.filter(t => !t.done).length} pending</span>
          </div>
          <div className="space-y-2">
            {TASKS.map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className={`flex items-start gap-3 rounded-2xl px-4 py-3 border transition-all ${
                  task.done
                    ? "bg-muted/30 border-border/30 opacity-60"
                    : "bg-white/80 border-white/60 shadow-sm"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5 ${task.done ? "bg-muted" : task.bg}`}>
                  {task.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <task.icon className={`h-4 w-4 ${task.color}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-snug ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task.text}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{task.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Field Status ─────────────────────────────────────────────────── */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Field Status</h2>
            <button onClick={() => navigate("/irrigation")} className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-0.5">
              All fields <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {FIELD_STATUS.map((f, i) => {
              const sty = statusConfig[f.status];
              return (
                <motion.div
                  key={f.field}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="flex items-center gap-3 bg-white/80 rounded-2xl px-4 py-3 border border-white/60 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${f.status === "healthy" ? "bg-emerald-50 border border-emerald-200" : f.status === "at-risk" ? "bg-amber-50 border border-amber-200" : "bg-red-50 border border-red-200"}`}>
                    <Leaf className={`h-5 w-5 ${f.status === "healthy" ? "text-emerald-500" : f.status === "at-risk" ? "text-amber-500" : "text-red-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-foreground">{f.field}</p>
                      <span className="text-xs text-muted-foreground">{f.crop}</span>
                      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${f.status === "healthy" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : f.status === "at-risk" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                        {sty.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{f.issue}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">{f.action}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Analytics Row ───────────────────────────────────────────────── */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Farm Analytics</h2>
            <button onClick={() => navigate("/analytics")} className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-0.5">
              Full analytics <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Crop Health */}
            <div className="rounded-3xl p-4 shadow-sm border border-white/60"
              style={{ background: "linear-gradient(135deg, hsl(142 35% 97%) 0%, hsl(170 40% 97%) 100%)" }}>
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-bold text-foreground">Crop Health</p>
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={HEALTH_DONUT} cx="50%" cy="50%" innerRadius="50%" outerRadius="75%"
                      paddingAngle={4} dataKey="value"
                      onMouseEnter={(_, i) => setActiveIndex(i)}
                      onMouseLeave={() => setActiveIndex(null)}>
                      {HEALTH_DONUT.map((entry, i) => (
                        <Cell key={i} fill={entry.color}
                          opacity={activeIndex === null || activeIndex === i ? 1 : 0.45}
                          stroke={activeIndex === i ? entry.color : "transparent"}
                          strokeWidth={activeIndex === i ? 2 : 0} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e5e7eb" }}
                      formatter={(v: number, n: string) => [`${v}%`, n]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-2 mt-1">
                {HEALTH_DONUT.slice(0, 2).map((h) => (
                  <div key={h.name} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: h.color }} />
                    <span className="text-[10px] text-muted-foreground">{h.name} {h.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Activity */}
            <div className="rounded-3xl p-4 shadow-sm border border-white/60"
              style={{ background: "linear-gradient(135deg, hsl(200 35% 97%) 0%, hsl(230 30% 97%) 100%)" }}>
              <div className="flex items-center gap-1.5 mb-3">
                <Camera className="h-4 w-4 text-blue-500" />
                <p className="text-xs font-bold text-foreground">Weekly Scans</p>
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEKLY_SCANS} barSize={8}>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Bar dataKey="scans" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1">28 scans this week</p>
            </div>

            {/* Water Usage */}
            <div className="rounded-3xl p-4 shadow-sm border border-white/60 col-span-2"
              style={{ background: "linear-gradient(135deg, hsl(210 35% 97%) 0%, hsl(190 30% 97%) 100%)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Waves className="h-4 w-4 text-cyan-500" />
                  <p className="text-xs font-bold text-foreground">Water Usage This Week</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <TrendingUp className="h-3 w-3" /> 18% saved
                </div>
              </div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={IRRIGATION_LOG}>
                    <defs>
                      <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Area type="monotone" dataKey="water" stroke="#06b6d4" strokeWidth={2}
                      fill="url(#waterGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
                <span>Total: 1,440 L</span>
                <span>Avg: 288 L/day</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── AI Recommendations ────────────────────────────────────────────── */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> AI Insights
            </h2>
            <button onClick={() => navigate("/recommendations")} className="text-[11px] text-primary font-semibold hover:underline">
              View all
            </button>
          </div>
          <div
            className="rounded-3xl p-4 shadow-sm border border-white/60"
            style={{ background: "linear-gradient(135deg, hsl(45 60% 97%) 0%, hsl(30 55% 97%) 100%)" }}
          >
            <div className="space-y-3">
              {[
                { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200", title: "Rain arriving in ~3 hours", desc: "Delay Field B irrigation to save 45L of water. Current soil moisture at 55% is sufficient." },
                { icon: Droplets,      color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", title: "Irrigate Field A before 11 AM", desc: "Soil moisture at 38% — below optimal threshold. Best window closes at 11 AM when UV peaks." },
                { icon: Sprout,        color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", title: "Nitrogen deficiency — Field C", desc: "Cotton showing yellowing lower leaves. Apply urea 20 kg/acre after aphid treatment completes." },
              ].map((insight, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-2xl p-3 border ${insight.bg} ${insight.border}`}>
                  <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-white/80 mt-0.5`}>
                    <insight.icon className={`h-4 w-4 ${insight.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{insight.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{insight.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Recent Scan Summary ─────────────────────────────────────────── */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Recent Activity</h2>
            <button onClick={() => navigate("/history")} className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-0.5">
              All activity <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {[
              { crop: "Wheat", field: "Field A", action: "Yellow Rust detected", time: "10:24 AM", type: "scan", severity: "urgent" },
              { crop: "Field A", field: "", action: "Irrigated — 320L used", time: "8:15 AM", type: "irrigation", severity: "info" },
              { crop: "Rice", field: "Field B", action: "Minor leaf blight", time: "Yesterday", type: "scan", severity: "moderate" },
              { crop: "Field C", field: "", action: "Skipped irrigation — rain expected", time: "Yesterday", type: "irrigation", severity: "info" },
            ].map((act, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/80 rounded-2xl px-4 py-3 border border-white/60 shadow-sm">
                <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
                  act.type === "scan"
                    ? act.severity === "urgent" ? "bg-red-50 border border-red-200" : act.severity === "moderate" ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"
                    : "bg-blue-50 border border-blue-200"
                }`}>
                  {act.type === "scan" ? <Camera className={`h-4 w-4 ${
                    act.severity === "urgent" ? "text-red-500" : act.severity === "moderate" ? "text-amber-500" : "text-emerald-500"
                  }`} /> : <Droplets className="h-4 w-4 text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{act.action}</p>
                  <p className="text-[11px] text-muted-foreground">{act.crop}{act.field ? ` · ${act.field}` : ""} · {act.time}</p>
                </div>
                {act.severity === "urgent" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 shrink-0">Urgent</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Floating Scan Button (mobile) ──────────────────────────────── */}
        <motion.div variants={item} className="lg:hidden">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/scan")}
            className="w-full h-14 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg"
            style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
          >
            <Camera className="h-5 w-5" /> Scan Crop Now
          </motion.button>
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}
