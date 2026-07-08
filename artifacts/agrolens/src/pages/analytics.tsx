import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  ArrowLeft, TrendingUp, Droplets, Leaf, Thermometer,
  CloudRain, ShieldCheck, Camera,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

/* ──── Data ──────────────────────────────────────────── */
const WATER_WEEKLY = [
  { week: "W1", used: 2100, target: 2500 }, { week: "W2", used: 1800, target: 2500 },
  { week: "W3", used: 1950, target: 2500 }, { week: "W4", used: 1440, target: 2500 },
];

const HEALTH_TREND = [
  { month: "Jan", score: 72 }, { month: "Feb", score: 78 }, { month: "Mar", score: 82 },
  { month: "Apr", score: 87 }, { month: "May", score: 92 },
];

const DISEASES = [
  { name: "Yellow Rust", count: 5, color: "#ef4444" },
  { name: "Blast", count: 3, color: "#f59e0b" },
  { name: "Early Blight", count: 4, color: "#3b82f6" },
  { name: "Aphids", count: 2, color: "#8b5cf6" },
  { name: "Healthy", count: 12, color: "#22c55e" },
];

const RAINFALL = [
  { day: "Mon", mm: 0 }, { day: "Tue", mm: 3 }, { day: "Wed", mm: 0 },
  { day: "Thu", mm: 12 }, { day: "Fri", mm: 5 }, { day: "Sat", mm: 0 }, { day: "Sun", mm: 0 },
];

const TEMP_HISTORY = [
  { day: "Mon", max: 32, min: 22 }, { day: "Tue", max: 30, min: 21 },
  { day: "Wed", max: 28, min: 20 }, { day: "Thu", max: 27, min: 19 },
  { day: "Fri", max: 29, min: 20 }, { day: "Sat", max: 31, min: 22 },
  { day: "Sun", max: 33, min: 23 },
];

const SENSOR_HEALTH = [
  { name: "Soil", value: 98, color: "#22c55e" },
  { name: "Temp", value: 95, color: "#3b82f6" },
  { name: "Humidity", value: 92, color: "#06b6d4" },
  { name: "Rain", value: 88, color: "#8b5cf6" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

/* ──── Page ──────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [, navigate] = useLocation();

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-6">

        {/* Header */}
        <motion.div variants={item}>
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </button>
          <h1 className="text-xl font-bold text-foreground">Farm Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Insights for smarter decisions</p>
        </motion.div>

        {/* Top KPIs */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          {[
            { icon: TrendingUp, label: "Crop Health", value: "92", sub: "/100 · +12% this month", color: "emerald" },
            { icon: Droplets,   label: "Water Saved", value: "18%", sub: "vs last month", color: "cyan" },
            { icon: Camera,     label: "Scans This Month", value: "28", sub: "8 diseases caught early", color: "blue" },
            { icon: ShieldCheck, label: "Resolution Rate", value: "87.5%", sub: "21 of 24 issues resolved", color: "amber" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl p-4 border border-white/60 shadow-sm"
              style={{ background: `linear-gradient(135deg, hsl(${kpi.color === "emerald" ? "142" : kpi.color === "cyan" ? "190" : kpi.color === "blue" ? "210" : "35"} 35% 97%) 0%, white 100%)` }}>
              <kpi.icon className={`h-5 w-5 mb-2 ${kpi.color === "emerald" ? "text-emerald-500" : kpi.color === "cyan" ? "text-cyan-500" : kpi.color === "blue" ? "text-blue-500" : "text-amber-500"}`} />
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">{kpi.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Water Usage vs Target */}
        <motion.div variants={item}>
          <div className="rounded-3xl p-4 border border-white/60 shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(190 35% 97%) 0%, hsl(210 30% 97%) 100%)" }}>
            <div className="flex items-center gap-1.5 mb-3">
              <Droplets className="h-4 w-4 text-cyan-500" />
              <p className="text-xs font-bold text-foreground">Water Usage vs Target</p>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WATER_WEEKLY} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="used" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Health Score Trend */}
        <motion.div variants={item}>
          <div className="rounded-3xl p-4 border border-white/60 shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(142 35% 97%) 0%, hsl(170 30% 97%) 100%)" }}>
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-xs font-bold text-foreground">Crop Health Score Trend</p>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HEALTH_TREND}>
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11, border: "1px solid #e2e8f0" }} />
                  <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} fill="url(#healthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Disease Detections */}
        <motion.div variants={item}>
          <div className="rounded-3xl p-4 border border-white/60 shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(0 35% 97%) 0%, hsl(30 30% 97%) 100%)" }}>
            <div className="flex items-center gap-1.5 mb-3">
              <Leaf className="h-4 w-4 text-red-500" />
              <p className="text-xs font-bold text-foreground">Disease Detections (6 months)</p>
            </div>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DISEASES} cx="50%" cy="50%" innerRadius="45%" outerRadius="70%" paddingAngle={4} dataKey="count">
                    {DISEASES.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11, border: "1px solid #e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {DISEASES.map((d) => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[10px] text-muted-foreground">{d.name} ({d.count})</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Rainfall + Temperature */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl p-4 border border-white/60 shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(210 35% 97%) 0%, hsl(230 30% 97%) 100%)" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <CloudRain className="h-3.5 w-3.5 text-blue-500" />
              <p className="text-[10px] font-bold text-foreground">Rainfall</p>
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RAINFALL} barSize={10}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Bar dataKey="mm" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl p-4 border border-white/60 shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(30 35% 97%) 0%, hsl(15 30% 97%) 100%)" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Thermometer className="h-3.5 w-3.5 text-orange-500" />
              <p className="text-[10px] font-bold text-foreground">Temperature</p>
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TEMP_HISTORY}>
                  <Line type="monotone" dataKey="max" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="min" stroke="#94a3b8" strokeWidth={2} dot={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Sensor Health */}
        <motion.div variants={item}>
          <div className="rounded-3xl p-4 border border-white/60 shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(270 35% 97%) 0%, hsl(290 30% 97%) 100%)" }}>
            <div className="flex items-center gap-1.5 mb-3">
              <ShieldCheck className="h-4 w-4 text-violet-500" />
              <p className="text-xs font-bold text-foreground">Field Sensor Health</p>
            </div>
            <div className="space-y-3">
              {SENSOR_HEALTH.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{s.name}</span>
                    <span className="text-xs font-bold text-foreground">{s.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: s.color }}
                      initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}
