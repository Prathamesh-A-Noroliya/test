import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Camera, History, CheckCircle2, AlertTriangle,
  Leaf, Sun, CloudRain, Droplets, Wind, Flame,
  Sparkles, TrendingUp, ChevronRight, Gauge, Sprout,
  Waves, ArrowRight, Activity, BarChart3, Zap, Compass,
  Landmark, TrendingUp as TrendingUpIcon, Droplets as WaterIcon,
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

/* ─── Data ──────────────────────────────────────────── */
const HEALTH_DONUT = [
  { name: "Healthy", value: 62, color: "#22c55e" },
  { name: "At Risk", value: 21, color: "#f59e0b" },
  { name: "Diseased", value: 11, color: "#ef4444" },
  { name: "Unknown", value: 6,  color: "#94a3b8" },
];

const WEEKLY_SCANS = [
  { day: "Mon", scans: 3 }, { day: "Tue", scans: 5 }, { day: "Wed", scans: 2 },
  { day: "Thu", scans: 7 }, { day: "Fri", scans: 4 }, { day: "Sat", scans: 6 },
  { day: "Sun", scans: 1 },
];

const IRRIGATION_LOG = [
  { day: "Mon", water: 320 }, { day: "Tue", water: 0 },   { day: "Wed", water: 450 },
  { day: "Thu", water: 0 },   { day: "Fri", water: 380 }, { day: "Sat", water: 0 },
  { day: "Sun", water: 290 },
];

const FIELD_STATUS = [
  { field: "Field A", crop: "Wheat",  status: "diseased", issue: "Yellow Rust detected",  soil: 38, action: "Apply Propiconazole today", zone: "North" },
  { field: "Field B", crop: "Rice",   status: "at-risk",  issue: "Minor leaf blight",    soil: 55, action: "Neem oil spray recommended", zone: "East" },
  { field: "Field C", crop: "Cotton", status: "diseased", issue: "Aphid infestation",      soil: 42, action: "Imidacloprid spray ASAP", zone: "South" },
  { field: "Field D", crop: "Tomato", status: "healthy",  issue: "All healthy",           soil: 68, action: "No action needed", zone: "West" },
];

const HOURLY_RAIN = [
  { h: "6AM", v: 0 }, { h: "9AM", v: 0 }, { h: "12PM", v: 2 },
  { h: "3PM", v: 5 }, { h: "6PM", v: 3 }, { h: "9PM", v: 1 },
];

/* ─── Animation ─────────────────────────────────────── */
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

/* ─── Component ───────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hour, setHour] = useState(0);

  useEffect(() => { setHour(new Date().getHours()); }, []);

  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-20">

        {/* ===== Welcome Banner ===== */}
        <motion.div variants={item}>
          <div className="rounded-3xl p-5 md:p-8 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(142 55% 38%) 0%, hsl(170 50% 35%) 40%, hsl(200 60% 30%) 100%)" }}>
            <div className="relative z-10">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="text-white/70 text-xs md:text-sm font-medium">Thursday, 9 July</p>
                  <h1 className="text-xl md:text-2xl font-bold text-white mt-0.5 leading-tight">
                    Welcome back, {user?.fullName.split(" ")[0] || "Demo"}!
                  </h1>
                  <p className="text-white/60 text-xs md:text-sm mt-1">
                    Your farm is being monitored. Here&apos;s today&apos;s overview.
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-white/70 text-[10px] md:text-xs">Farmer ID</p>
                  <p className="text-white text-xs md:text-sm font-bold">AGR24-DEMO1</p>
                  <p className="text-white/70 text-[10px] md:text-xs mt-1">Crop</p>
                  <p className="text-white text-xs md:text-sm font-bold">Rice</p>
                </div>
              </div>
              {/* Interactive badges */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/history")}
                  className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-white border border-white/20 hover:bg-white/25 transition-all cursor-pointer"
                >
                  <Camera className="h-3 w-3" /> 24 Scans
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/history")}
                  className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-white border border-white/20 hover:bg-white/25 transition-all cursor-pointer"
                >
                  <AlertTriangle className="h-3 w-3" /> 3 Active Issues
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/analytics")}
                  className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-white border border-white/20 hover:bg-white/25 transition-all cursor-pointer"
                >
                  <Leaf className="h-3 w-3" /> 87% Health
                </motion.button>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/5" />
          </div>
        </motion.div>

        {/* ===== Quick Actions 2x2 Grid ===== */}
        <motion.div variants={item}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Camera, title: "Scan Crop", subtitle: "AI diagnosis", color1: "hsl(142 62% 36%)", color2: "hsl(196 70% 44%)", path: "/scan" },
              { icon: WaterIcon, title: "Irrigation", subtitle: "Smart watering", color1: "hsl(200 65% 42%)", color2: "hsl(180 55% 38%)", path: "/irrigation" },
              { icon: History, title: "History", subtitle: "All farm activity", color1: "hsl(280 55% 52%)", color2: "hsl(260 50% 48%)", path: "/history" },
              { icon: BarChart3, title: "Analytics", subtitle: "Farm insights", color1: "hsl(260 50% 48%)", color2: "hsl(320 50% 48%)", path: "/analytics" },
            ].map((qa) => (
              <motion.button
                key={qa.title}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(qa.path)}
                className="relative overflow-hidden rounded-2xl p-4 md:p-5 text-left shadow-sm group"
                style={{ background: `linear-gradient(135deg, ${qa.color1}, ${qa.color2})` }}
              >
                <qa.icon className="h-6 w-6 text-white/90 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white font-bold text-sm md:text-base leading-tight">{qa.title}</p>
                <p className="text-white/70 text-[11px] md:text-xs mt-0.5">{qa.subtitle}</p>
                <qa.icon className="absolute top-3 right-3 h-10 w-10 text-white opacity-10 group-hover:opacity-20 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ===== Farm Health Overview ===== */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-bold text-foreground">Farm Health Overview</p>
                </div>
                <span className="text-[10px] text-muted-foreground">Last 30 days</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                <div className="w-36 h-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={HEALTH_DONUT} cx="50%" cy="50%" innerRadius="45%" outerRadius="70%"
                        paddingAngle={3} dataKey="value"
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
                <div className="flex-1 w-full space-y-2.5">
                  {HEALTH_DONUT.map((h) => (
                    <div key={h.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: h.color }} />
                      <span className="text-xs text-muted-foreground w-16">{h.name}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${h.value}%`, background: h.color }} />
                      </div>
                      <span className="text-xs font-bold text-foreground w-8 text-right">{h.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ===== Water Usage + Weekly Scans ===== */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Waves className="h-4 w-4 text-cyan-500" />
                  <p className="text-sm font-bold text-foreground">Water Usage This Week</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <TrendingUp className="h-3 w-3" /> 18% saved
                </div>
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={IRRIGATION_LOG}>
                    <defs>
                      <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Area type="monotone" dataKey="water" stroke="#06b6d4" strokeWidth={2} fill="url(#waterGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
                <span>Total: 1,440 L</span>
                <span>Avg: 288 L/day</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-bold text-foreground">Weekly Scan Activity</p>
                </div>
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEKLY_SCANS} barSize={16}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Bar dataKey="scans" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ===== Field Status ===== */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Field Status</h2>
            <button onClick={() => navigate("/irrigation")} className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-0.5">
              All fields <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {FIELD_STATUS.map((f, i) => {
              const sty = statusConfig[f.status];
              return (
                <motion.div
                  key={f.field}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3 border border-border/30 shadow-sm hover:shadow-md hover:border-border/50 transition-all cursor-pointer"
                  onClick={() => navigate("/irrigation")}
                >
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                    f.status === "healthy" ? "bg-emerald-50 border border-emerald-200" :
                    f.status === "at-risk" ? "bg-amber-50 border border-amber-200" :
                    "bg-red-50 border border-red-200"
                  }`}>
                    <Leaf className={`h-5 w-5 ${
                      f.status === "healthy" ? "text-emerald-500" :
                      f.status === "at-risk" ? "text-amber-500" : "text-red-500"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-foreground">{f.field}</p>
                      <span className="text-xs text-muted-foreground">{f.crop}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">{f.zone}</span>
                      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        f.status === "healthy" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        f.status === "at-risk" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {sty.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{f.issue}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5 flex-1">
                        <Gauge className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Soil moisture</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[80px]">
                          <motion.div className="h-full rounded-full bg-emerald-500"
                            initial={{ width: 0 }} animate={{ width: `${f.soil}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }} />
                        </div>
                        <span className="text-[10px] font-bold text-foreground w-6">{f.soil}%</span>
                      </div>
                      <p className="text-[10px] text-primary font-semibold">{f.action}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ===== AI Insights ===== */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> AI Insights
            </h2>
            <button onClick={() => navigate("/recommendations")} className="text-[11px] text-primary font-semibold hover:underline">
              View all
            </button>
          </div>
          <div className="rounded-2xl p-4 shadow-sm border border-border/30 bg-card">
            <div className="space-y-3">
              {[
                { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200", title: "Rain arriving in ~3 hours", desc: "Delay Field B irrigation to save 45L of water. Current soil moisture at 55% is sufficient." },
                { icon: Droplets, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", title: "Irrigate Field A before 11 AM", desc: "Soil moisture at 38% - below optimal threshold. Best window closes at 11 AM when UV peaks." },
                { icon: Sprout, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", title: "Nitrogen deficiency - Field C", desc: "Cotton showing yellowing lower leaves. Apply urea 20 kg/acre after aphid treatment completes." },
              ].map((insight, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-2xl p-3 border ${insight.bg} ${insight.border}`}>
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-white/80 mt-0.5">
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

        {/* ===== Recent Activity ===== */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Recent Activity</h2>
            <button onClick={() => navigate("/history")} className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-0.5">
              All activity <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {[
              { icon: Camera, crop: "Wheat", field: "Field A", action: "Yellow Rust detected", time: "Today, 10:24 AM", type: "scan", severity: "urgent" },
              { icon: WaterIcon, crop: "Rice", field: "Field B", action: "Drip irrigation completed", time: "Today, 8:00 AM", type: "irrigation", severity: "low" },
              { icon: Sparkles, crop: "Cotton", field: "Field C", action: "AI recommendation generated", time: "Yesterday", type: "ai", severity: "low" },
              { icon: Landmark, crop: "All crops", field: "Farm", action: "PM-Kisan subsidy update", time: "2 days ago", type: "gov", severity: "moderate" },
            ].map((act, i) => (
              <div key={i} className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3 border border-border/30 shadow-sm hover:border-border/50 transition-all cursor-pointer"
                onClick={() => navigate("/history")}>
                <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
                  act.severity === "urgent" ? "bg-red-50 border border-red-200" :
                  act.severity === "moderate" ? "bg-amber-50 border border-amber-200" :
                  "bg-blue-50 border border-blue-200"
                }`}>
                  <act.icon className={`h-4 w-4 ${
                    act.severity === "urgent" ? "text-red-500" :
                    act.severity === "moderate" ? "text-amber-500" :
                    "text-blue-500"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{act.action}</p>
                  <p className="text-[11px] text-muted-foreground">{act.crop} &middot; {act.field} &middot; {act.time}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  act.severity === "urgent" ? "bg-red-50 text-red-700 border-red-200" :
                  act.severity === "moderate" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  {act.severity === "urgent" ? "High" : act.severity === "moderate" ? "Medium" : "Low"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ===== Today's Weather Strip ===== */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Sun className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="text-lg font-bold text-foreground">29&deg;C</p>
                    <p className="text-[11px] text-muted-foreground">Partly Cloudy</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-xs font-semibold text-foreground">62%</p>
                    <p className="text-[10px] text-muted-foreground">Humidity</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">12 km/h</p>
                    <p className="text-[10px] text-muted-foreground">Wind</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">65%</p>
                    <p className="text-[10px] text-muted-foreground">Rain</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">5:52 AM</p>
                    <p className="text-[10px] text-muted-foreground">Sunrise</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">7:18 PM</p>
                    <p className="text-[10px] text-muted-foreground">Sunset</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}
