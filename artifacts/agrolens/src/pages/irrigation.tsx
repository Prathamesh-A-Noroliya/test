import { useState } from "react";
import { motion } from "framer-motion";
import {
  Droplets, TrendingUp, Clock, Activity,
  ChevronRight, Zap, CloudRain, Timer,
  Waves, BarChart3,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ─── Data ──────────────────────────────────────────── */
const ZONE_DATA = [
  { name: "Zone A", moisture: 42, trend: "down", status: "Needs Water", color: "#ef4444", soilType: "Clay Loam" },
  { name: "Zone B", moisture: 68, trend: "stable", status: "Optimal", color: "#22c55e", soilType: "Sandy Loam" },
  { name: "Zone C", moisture: 55, trend: "up", status: "Good", color: "#3b82f6", soilType: "Silty Clay" },
  { name: "Zone D", moisture: 38, trend: "down", status: "Critical", color: "#f59e0b", soilType: "Clay" },
];

const MOISTURE_TREND: Record<string, Array<{ time: string; value: number }>> = {
  "Zone A": [{ time: "Morning", value: 45 }, { time: "Afternoon", value: 38 }, { time: "Evening", value: 42 }],
  "Zone B": [{ time: "Morning", value: 70 }, { time: "Afternoon", value: 65 }, { time: "Evening", value: 68 }],
  "Zone C": [{ time: "Morning", value: 58 }, { time: "Afternoon", value: 52 }, { time: "Evening", value: 55 }],
  "Zone D": [{ time: "Morning", value: 42 }, { time: "Afternoon", value: 35 }, { time: "Evening", value: 38 }],
};

const RAINFALL_PREDICTION = [
  { day: "Mon", rain: 0 }, { day: "Tue", rain: 2 }, { day: "Wed", rain: 8 },
  { day: "Thu", rain: 12 }, { day: "Fri", rain: 5 }, { day: "Sat", rain: 0 }, { day: "Sun", rain: 1 },
];

const WATER_CONSUMPTION = [
  { day: "Mon", used: 320 }, { day: "Tue", used: 0 }, { day: "Wed", used: 450 },
  { day: "Thu", used: 0 }, { day: "Fri", used: 380 }, { day: "Sat", used: 0 }, { day: "Sun", used: 290 },
];

const PUMP_ACTIVITY = [
  { time: "5:00", zone: "A", duration: 45, status: "on" },
  { time: "6:00", zone: "B", duration: 30, status: "on" },
  { time: "7:00", zone: "C", duration: 20, status: "on" },
  { time: "17:00", zone: "A", duration: 0, status: "scheduled" },
  { time: "18:00", zone: "D", duration: 0, status: "scheduled" },
];

/* ─── Animations ──────────────────────────────────────────── */
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function IrrigationPage() {
  const [activeZone, setActiveZone] = useState("Zone A");
  const activeZoneData = ZONE_DATA.find((z) => z.name === activeZone)!;
  const trendData = MOISTURE_TREND[activeZone];

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-6">

        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Smart Irrigation</h1>
              <p className="text-muted-foreground text-xs mt-0.5">Water management & analytics</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              <TrendingUp className="h-3 w-3" /> 18% saved this week
            </div>
          </div>
        </motion.div>

        {/* Zone selector cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ZONE_DATA.map((zone) => (
            <button
              key={zone.name}
              onClick={() => setActiveZone(zone.name)}
              className={cn(
                "relative rounded-2xl p-3 md:p-4 text-left border transition-all",
                activeZone === zone.name
                  ? "border-border/60 shadow-md bg-card ring-2 ring-primary/20"
                  : "border-border/30 bg-card/50 hover:bg-card hover:border-border/50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">{zone.name}</span>
                <div className="w-2 h-2 rounded-full" style={{ background: zone.color }} />
              </div>
              <p className="text-2xl font-black text-foreground">{zone.moisture}%</p>
              <p className="text-[10px] text-muted-foreground">{zone.soilType}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <p className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: zone.color + "15", color: zone.color, border: `1px solid ${zone.color}30` }}>
                  {zone.status}
                </p>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Main chart area */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  {activeZone} - Moisture Trend
                </CardTitle>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Soil Moisture %
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`moistureGrad-${activeZone}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={activeZoneData.color} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={activeZoneData.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, fontSize: 12, color: "#f1f5f9" }}
                    />
                    <Area type="monotone" dataKey="value" stroke={activeZoneData.color} strokeWidth={3}
                      fill={`url(#moistureGrad-${activeZone})`} dot={{ r: 4, fill: activeZoneData.color, stroke: "#0f172a", strokeWidth: 2 }} />
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
            { label: "Pumps Active", value: "2 / 4", icon: Zap, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
            { label: "Next Schedule", value: "5:30 PM", icon: Timer, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl p-4 border ${stat.bg} ${stat.border} shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
              <p className="text-lg font-black text-foreground">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Charts row */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Rainfall Prediction */}
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-blue-500" /> Rainfall Prediction
                </p>
                <span className="text-[10px] text-muted-foreground">Next 7 days</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={RAINFALL_PREDICTION} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e5e7eb" }} />
                    <Bar dataKey="rain" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Water Consumption */}
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Waves className="h-4 w-4 text-cyan-500" /> Water Consumption
                </p>
                <span className="text-[10px] text-muted-foreground">This week</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WATER_CONSUMPTION}>
                    <defs>
                      <linearGradient id="wcUsed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e5e7eb" }} />
                    <Area type="monotone" dataKey="used" stroke="#06b6d4" strokeWidth={2} fill="url(#wcUsed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pump Activity Schedule */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" /> Pump Activity & Schedule
                </p>
                <button className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-0.5">
                  View All <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-2">
                {PUMP_ACTIVITY.map((pump, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl p-3 border border-border/30 bg-card/50">
                    <div className={cn(
                      "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center",
                      pump.status === "on" ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50 border border-slate-200"
                    )}>
                      <Zap className={cn("h-5 w-5", pump.status === "on" ? "text-emerald-500" : "text-slate-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{pump.zone} Pump</p>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          pump.status === "on"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        )}>
                          {pump.status === "on" ? "Running" : "Scheduled"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {pump.time} {pump.duration > 0 ? `· ${pump.duration} min` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-foreground">
                        {pump.duration > 0 ? `${Math.round(pump.duration * 10)}L` : "--"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Water</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}
