import { useState } from "react";
import { motion } from "framer-motion";
import {
  Droplets, TrendingUp, Thermometer, Wind,
  ChevronRight, Zap, CloudRain, Timer,
  Waves, BarChart3, Power,
} from "lucide-react";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ─── Data ──────────────────────────────────────────── */
const ZONES = [
  {
    name: "Zone A",
    moisture: 68,
    temperature: 29,
    humidity: 63,
    status: "Healthy" as const,
    pump: "OFF" as const,
    waterReq: "Low",
    lastIrrigation: "Today • 6:45 AM",
    soilType: "Sandy Loam",
    color: "#22c55e",
  },
  {
    name: "Zone B",
    moisture: 42,
    temperature: 31,
    humidity: 58,
    status: "Needs Water" as const,
    pump: "Recommended ON" as const,
    waterReq: "Medium",
    lastIrrigation: "Yesterday • 5:30 PM",
    soilType: "Clay Loam",
    color: "#f59e0b",
  },
];

const MOISTURE_TREND = {
  "Zone A": [
    { time: "6 AM", value: 65 },
    { time: "9 AM", value: 66 },
    { time: "12 PM", value: 68 },
    { time: "3 PM", value: 67 },
    { time: "6 PM", value: 68 },
  ],
  "Zone B": [
    { time: "6 AM", value: 48 },
    { time: "9 AM", value: 45 },
    { time: "12 PM", value: 43 },
    { time: "3 PM", value: 41 },
    { time: "6 PM", value: 42 },
  ],
};

const WATER_CONSUMPTION = [
  { day: "Mon", used: 320 },
  { day: "Tue", used: 0 },
  { day: "Wed", used: 450 },
  { day: "Thu", used: 0 },
  { day: "Fri", used: 380 },
  { day: "Sat", used: 0 },
  { day: "Sun", used: 290 },
];

/* ─── Animations ──────────────────────────────────────────── */
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

/* ─── Circular progress (SVG) ──────────────────────────── */
function CircularProgress({
  value,
  color,
  size = 80,
  strokeWidth = 6,
  label,
  sublabel,
}: {
  value: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - dash }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-sm font-black"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {value}%
          </motion.span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        {sublabel && <p className="text-[10px] text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}

/* ─── Animated bar ─────────────────────────────────── */
function AnimatedBar({
  value,
  max = 100,
  color,
  label,
}: {
  value: number;
  max?: number;
  color: string;
  label: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>
          {value}
          {label.includes("Temperature") ? "°C" : label.includes("Humidity") ? "%" : ""}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function IrrigationPage() {
  const [activeZone, setActiveZone] = useState("Zone A");
  const zone = ZONES.find((z) => z.name === activeZone)!;
  const trendData = MOISTURE_TREND[activeZone as keyof typeof MOISTURE_TREND];

  const statusStyles: Record<string, { dot: string; badge: string; text: string; bg: string; border: string }> = {
    Healthy: {
      dot: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    "Needs Water": {
      dot: "bg-amber-500",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    Critical: {
      dot: "bg-red-500",
      badge: "bg-red-50 text-red-700 border-red-200",
      text: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  };
  const sty = statusStyles[zone.status] || statusStyles["Needs Water"];

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-6">

        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-foreground">Smart Irrigation</h1>
              <p className="text-muted-foreground text-xs mt-0.5">Water management & analytics</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              <TrendingUp className="h-3 w-3" /> 18% saved this week
            </div>
          </div>
        </motion.div>

        {/* Zone Selector Tabs */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          {ZONES.map((z) => {
            const active = z.name === activeZone;
            const s = statusStyles[z.status] || statusStyles["Needs Water"];
            return (
              <button
                key={z.name}
                onClick={() => setActiveZone(z.name)}
                className={cn(
                  "relative rounded-2xl p-4 md:p-5 text-left border transition-all duration-300",
                  active
                    ? "border-border/60 shadow-md bg-card ring-1 ring-primary/20"
                    : "border-border/30 bg-card/50 hover:bg-card hover:border-border/50"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-foreground">{z.name}</span>
                  <span className={cn("w-2.5 h-2.5 rounded-full", s.dot)} />
                </div>
                <p className="text-3xl font-black text-foreground tracking-tight">{z.moisture}%</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Soil Moisture</p>
                <div className="mt-3">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", s.badge)}>
                    {z.status}
                  </span>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Active Zone Detail Card */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-primary" />
                  {zone.name} — Sensor Overview
                </CardTitle>
                <span className="text-[10px] text-muted-foreground">{zone.soilType}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {/* Circular progress */}
                <div className="flex items-center justify-around sm:justify-start gap-6">
                  <CircularProgress
                    value={zone.moisture}
                    color={zone.color}
                    size={88}
                    label="Soil Moisture"
                  />
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-semibold text-foreground">{zone.temperature}°C</span>
                      <span className="text-[10px] text-muted-foreground">Temperature</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-sky-500" />
                      <span className="text-sm font-semibold text-foreground">{zone.humidity}%</span>
                      <span className="text-[10px] text-muted-foreground">Humidity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-semibold text-foreground">{zone.waterReq}</span>
                      <span className="text-[10px] text-muted-foreground">Water Need</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Power className={cn("h-4 w-4", zone.pump === "OFF" ? "text-slate-400" : "text-emerald-500")} />
                      <span className="text-sm font-semibold text-foreground">{zone.pump}</span>
                      <span className="text-[10px] text-muted-foreground">Pump</span>
                    </div>
                  </div>
                </div>

                {/* Animated bars */}
                <div className="flex flex-col gap-4 justify-center">
                  <AnimatedBar value={zone.moisture} color={zone.color} label="Soil Moisture" />
                  <AnimatedBar value={zone.temperature} max={50} color="#ef4444" label="Temperature" />
                  <AnimatedBar value={zone.humidity} color="#3b82f6" label="Humidity" />
                </div>
              </div>

              {/* Last irrigation */}
              <div className={cn("mt-5 rounded-xl px-4 py-3 border flex items-center gap-3", sty.bg, sty.border)}>
                <Timer className={cn("h-4 w-4", sty.text)} />
                <div>
                  <p className="text-xs font-semibold text-foreground">Last Irrigation</p>
                  <p className="text-[11px] text-muted-foreground">{zone.lastIrrigation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Moisture Trend Chart */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Waves className="h-4 w-4 text-primary" />
                  {zone.name} — Moisture Trend (Today)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={zone.color} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={zone.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e5e7eb" }}
                      formatter={(v: number) => [`${v}%`, "Moisture"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={zone.color}
                      strokeWidth={3}
                      fill="url(#moistureGrad)"
                      dot={{ r: 4, fill: zone.color, stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Rainfall This Week", value: "28 mm", icon: CloudRain, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
            { label: "Water Consumed", value: "1,440 L", icon: Droplets, color: "text-cyan-500", bg: "bg-cyan-50", border: "border-cyan-200" },
            { label: "Pumps Active", value: "2 / 2", icon: Zap, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
            { label: "Next Schedule", value: "5:30 PM", icon: Timer, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
          ].map((stat) => (
            <div key={stat.label} className={cn("rounded-2xl p-4 border shadow-sm", stat.bg, stat.border)}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={cn("h-4 w-4", stat.color)} />
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
              <p className="text-lg font-black text-foreground">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Weekly Water Consumption */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-cyan-500" /> Water Consumption
                </p>
                <span className="text-[10px] text-muted-foreground">This week</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WATER_CONSUMPTION}>
                    <defs>
                      <linearGradient id="wcGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e5e7eb" }} />
                    <Area type="monotone" dataKey="used" stroke="#06b6d4" strokeWidth={2} fill="url(#wcGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}
