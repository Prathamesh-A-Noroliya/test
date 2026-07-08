import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Droplets, Thermometer, Wind, CloudRain, Sun, Cloud,
  Lock, Star, Zap, TrendingDown, TrendingUp, Clock,
  Leaf, AlertTriangle, CheckCircle2, CalendarClock,
  BarChart3, Gauge, RefreshCw, MapPin, Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";

/* ──── Types ────────────────────────────────────────────────────────────────────────── */
interface WeatherNow {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
}
interface DayForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  rain: number;
  rainChance: number;
}

/* ──── Open-Meteo free API (no API key needed) ──────────────────────────── */
const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=18.52&longitude=73.85" +
  "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m" +
  "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max" +
  "&forecast_days=4&timezone=Asia/Kolkata";

/* ──── Mock fallback data ──────────────────────────────────────────────────────────── */
const MOCK_NOW: WeatherNow = { temperature: 28, humidity: 65, precipitation: 0.2, windSpeed: 11, weatherCode: 1 };
const MOCK_FORECAST: DayForecast[] = [
  { date: "Today",     maxTemp: 32, minTemp: 22, rain: 0.2,  rainChance: 15 },
  { date: "Tomorrow",  maxTemp: 30, minTemp: 21, rain: 3.8,  rainChance: 65 },
  { date: "Day 3",     maxTemp: 27, minTemp: 20, rain: 12.4, rainChance: 85 },
];

/* ──── Mock soil / irrigation data ─────────────────────────────────────────────────────────── */
const SOIL = { moisture: 38, fieldCapacity: 70, wiltingPoint: 20 };
const WATER_USAGE = { today: 320, yesterday: 450, weekly: 2100, saved: 18 };
const SCHEDULE = { next: "Tomorrow 5:30 AM", method: "Drip Irrigation", duration: "45 min", zone: "Field A & B" };
const RECS = [
  { icon: Droplets,     color: "blue",   title: "Irrigate Field A",      desc: "Soil moisture at 38% — below optimal threshold. Apply 25L/100m² today." },
  { icon: CloudRain,    color: "sky",    title: "Rain expected Thursday", desc: "65% rainfall probability. Hold irrigation on Wednesday to conserve water." },
  { icon: Leaf,         color: "green",  title: "Fertilizer timing",      desc: "Apply NPK after irrigation tomorrow. Moist soil improves nutrient absorption." },
];

/* ──── Weather helpers ────────────────────────────────────────────────────────────────────────── */
function weatherInfo(code: number) {
  if (code === 0)        return { icon: Sun,       label: "Clear Sky",   insight: "Perfect day for all field operations & spraying" };
  if (code <= 3)         return { icon: Cloud,      label: "Partly Cloudy", insight: "Good conditions for transplanting & fieldwork" };
  if (code <= 48)        return { icon: Cloud,      label: "Foggy",       insight: "Delay pesticide application until fog clears" };
  if (code <= 55)        return { icon: CloudRain,  label: "Drizzle",     insight: "Skip irrigation today — light drizzle is sufficient" };
  if (code <= 65)        return { icon: CloudRain,  label: "Rainy",       insight: "No irrigation needed — rainfall is sufficient today" };
  if (code <= 82)        return { icon: CloudRain,  label: "Showers",     insight: "Hold off irrigation — rain showers expected" };
  return                        { icon: CloudRain,  label: "Thunderstorm", insight: "Avoid field operations — stay safe indoors" };
}
function soilStatus(m: number) {
  if (m < 30) return { label: "Low",     color: "#ef4444", bg: "bg-red-50   border-red-200",    action: "Irrigate immediately",       icon: AlertTriangle };
  if (m < 62) return { label: "Optimal", color: "#22c55e", bg: "bg-emerald-50 border-emerald-200", action: "No irrigation needed",    icon: CheckCircle2  };
  return             { label: "High",    color: "#3b82f6", bg: "bg-blue-50  border-blue-200",    action: "Reduce irrigation frequency", icon: TrendingDown };
}
function dayLabel(dateStr: string, idx: number) {
  if (idx === 0) return "Today";
  if (idx === 1) return "Tomorrow";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

/* ──── Premium Gate ────────────────────────────────────────────────────────────────────────────── */
function PremiumGate({ children, label }: { children: React.ReactNode; label: string }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (user?.isPremium) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="select-none pointer-events-none" style={{ filter: "blur(4px)", opacity: 0.55 }}>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
        <div className="text-center px-6 py-8 max-w-xs">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 gradient-primary shadow-md">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Premium Feature</p>
          <h3 className="text-lg font-bold text-foreground mb-2">{label}</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Unlock smart irrigation insights, soil analysis, and water-saving recommendations.
          </p>
          <Button
            className="w-full gap-2 text-white border-0 font-semibold"
            style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
            onClick={() => navigate("/subscription")}
          >
            <Star className="h-4 w-4" /> Upgrade to Premium — ₹79/mo
          </Button>
          <button
            onClick={() => navigate("/subscription")}
            className="mt-2 text-xs text-muted-foreground hover:underline"
          >
            View all plans →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──── Main Page ────────────────────────────────────────────────────────────────────────────── */
export default function IrrigationPage() {
  const { user } = useAuth();
  const [weatherNow, setWeatherNow] = useState<WeatherNow | null>(null);
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchWeather = async () => {
    setWeatherLoading(true);
    try {
      const res = await fetch(WEATHER_API);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setWeatherNow({
        temperature: Math.round(data.current.temperature_2m),
        humidity:    Math.round(data.current.relative_humidity_2m),
        precipitation: data.current.precipitation,
        windSpeed:   Math.round(data.current.wind_speed_10m),
        weatherCode: data.current.weather_code,
      });
      setForecast(
        (data.daily.time as string[]).slice(0, 4).map((d: string, i: number) => ({
          date: d,
          maxTemp:   Math.round(data.daily.temperature_2m_max[i]),
          minTemp:   Math.round(data.daily.temperature_2m_min[i]),
          rain:      data.daily.precipitation_sum[i] ?? 0,
          rainChance: data.daily.precipitation_probability_max[i] ?? 0,
        }))
      );
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setWeatherNow(MOCK_NOW);
      setForecast(MOCK_FORECAST);
      setLastUpdated("Mock data");
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => { fetchWeather(); }, []);

  const now = weatherNow ?? MOCK_NOW;
  const fc  = forecast.length ? forecast : MOCK_FORECAST;
  const wInfo = weatherInfo(now.weatherCode);
  const WeatherIcon = wInfo.icon;
  const soil = soilStatus(SOIL.moisture);
  const SoilIcon = soil.icon;

  /* ─── Circular moisture gauge ─── */
  const gaugeR = 44;
  const gaugeCirc = 2 * Math.PI * gaugeR;
  const moisPct = SOIL.moisture / 100;
  const gaugeOffset = gaugeCirc * (1 - moisPct);

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* ──── Page Header ────────────────────────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Smart Irrigation</h1>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Pune, Maharashtra · AI-powered irrigation intelligence
            </p>
          </div>
          {!user?.isPremium && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold">
              <Lock className="h-3.5 w-3.5" /> Premium Feature
            </div>
          )}
          {user?.isPremium && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <Star className="h-3.5 w-3.5" /> Premium Access
            </div>
          )}
        </div>

        {/* ═════ 1. Recommendation Card (free) ═════ */}
        <div className="rounded-2xl p-5 border border-white/60 shadow-sm"
          style={{ background: "linear-gradient(135deg, hsl(142 40% 96%) 0%, hsl(196 50% 95%) 100%)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-bold text-foreground">Irrigation Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {RECS.map((rec, i) => (
              <div key={i} className="bg-white/80 rounded-xl border border-white/60 p-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                  rec.color === "blue" ? "bg-blue-100" : rec.color === "sky" ? "bg-sky-100" : "bg-emerald-100"
                }`}>
                  <rec.icon className={`h-5 w-5 ${
                    rec.color === "blue" ? "text-blue-600" : rec.color === "sky" ? "text-sky-600" : "text-emerald-600"
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{rec.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{rec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═════ 2. AI Water Requirement (premium gated) ═════ */}
        <PremiumGate label="AI Water Requirement">
          <div className="rounded-2xl p-5 border border-white/60 shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(200 40% 96%) 0%, hsl(220 50% 95%) 100%)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">AI Water Requirement</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: "Field A — Wheat", need: "High", mm: 25, soil: 38, reason: "Below optimal moisture" },
                { field: "Field B — Rice",  need: "Low",  mm: 0,  soil: 55, reason: "Sufficient moisture + rain expected" },
                { field: "Field C — Cotton", need: "Med",  mm: 12, soil: 42, reason: "Approaching threshold" },
                { field: "Field D — Tomato", need: "Low",  mm: 0,  soil: 68, reason: "Optimal moisture levels" },
              ].map((row) => (
                <div key={row.field} className="bg-white/80 rounded-xl border border-white/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-foreground">{row.field}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      row.need === "High" ? "bg-red-50 text-red-700 border-red-200" :
                      row.need === "Med"  ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>{row.need} Need</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      <Gauge className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Soil {row.soil}%</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${row.soil}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-foreground">{row.mm} mm</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{row.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </PremiumGate>

        {/* ═════ 3. Soil Moisture (premium gated) ═════ */}
        <PremiumGate label="Soil Moisture Analysis">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 rounded-2xl border border-white/60 shadow-sm p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Soil Moisture</h2>
              <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full border ${soil.bg}`}>
                {soil.label}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r={gaugeR} fill="none" stroke="hsl(190 28% 90%)" strokeWidth="10" />
                  <circle
                    cx="55" cy="55" r={gaugeR}
                    fill="none"
                    stroke={soil.color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={gaugeCirc}
                    strokeDashoffset={gaugeOffset}
                    transform="rotate(-90 55 55)"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{SOIL.moisture}%</span>
                  <span className="text-[10px] text-muted-foreground">moisture</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {[
                  { label: "Field Capacity", value: SOIL.fieldCapacity, color: "#22c55e" },
                  { label: "Current Level",  value: SOIL.moisture,      color: soil.color },
                  { label: "Wilting Point",  value: SOIL.wiltingPoint,  color: "#ef4444" },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{bar.label}</span>
                      <span className="text-xs font-bold text-foreground">{bar.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: bar.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${bar.value}%` }}
                        transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl border ${soil.bg}`}>
              <SoilIcon className="h-4 w-4 shrink-0" style={{ color: soil.color }} />
              <p className="text-sm font-semibold" style={{ color: soil.color }}>{soil.action}</p>
            </div>
          </motion.div>
        </PremiumGate>

        {/* ═════ 4. Crop Info ═════ */}
        <div className="rounded-2xl p-5 border border-white/60 shadow-sm"
          style={{ background: "linear-gradient(135deg, hsl(45 50% 97%) 0%, hsl(35 45% 97%) 100%)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-foreground">Crop Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { crop: "Wheat",  stage: "Tillering", planted: "Oct 2025", days: 120 },
              { crop: "Rice",   stage: "Flowering", planted: "Jul 2025", days: 210 },
              { crop: "Cotton", stage: "Boll",      planted: "Jun 2025", days: 180 },
              { crop: "Tomato", stage: "Fruiting",  planted: "Sep 2025", days: 90 },
            ].map((c) => (
              <div key={c.crop} className="bg-white/80 rounded-xl border border-white/60 p-3">
                <p className="text-sm font-bold text-foreground">{c.crop}</p>
                <p className="text-[11px] text-muted-foreground">{c.stage} · Day {c.days}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Planted {c.planted}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═════ 5. Water Usage Analytics (premium gated) ═════ */}
        <PremiumGate label="Water Usage Analytics">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/80 rounded-2xl border border-white/60 shadow-sm p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-sky-500" />
              <h2 className="text-base font-bold text-foreground">Water Usage</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Today",        value: `${WATER_USAGE.today}L`,    sub: "/ acre",     icon: Droplets,     color: "text-sky-600",     bg: "bg-sky-50 border-sky-100" },
                { label: "Yesterday",    value: `${WATER_USAGE.yesterday}L`, sub: "/ acre",    icon: Clock,        color: "text-muted-foreground", bg: "bg-muted/40 border-border" },
                { label: "This Week",    value: `${WATER_USAGE.weekly}L`,   sub: "total",      icon: CalendarClock, color: "text-primary",    bg: "bg-emerald-50 border-emerald-100" },
                { label: "Water Saved",  value: `${WATER_USAGE.saved}%`,    sub: "vs baseline", icon: TrendingDown, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border p-3 text-center ${s.bg}`}>
                  <s.icon className={`h-4 w-4 mx-auto mb-1.5 ${s.color}`} />
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                  <p className="text-[11px] font-medium text-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Usage comparison bar */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Usage vs Yesterday</p>
              <div className="flex items-center gap-3">
                <span className="text-xs w-20 text-muted-foreground shrink-0">Today</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-sky-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${(WATER_USAGE.today / WATER_USAGE.yesterday) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.2 }} />
                </div>
                <span className="text-xs font-bold text-sky-600 w-14 text-right">{WATER_USAGE.today}L</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs w-20 text-muted-foreground shrink-0">Yesterday</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-muted-foreground/30"
                    initial={{ width: 0 }} animate={{ width: "100%" }}
                    transition={{ duration: 0.9, delay: 0.25 }} />
                </div>
                <span className="text-xs font-bold text-muted-foreground w-14 text-right">{WATER_USAGE.yesterday}L</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-xs text-emerald-600 font-semibold">
                  Saved {WATER_USAGE.yesterday - WATER_USAGE.today}L today ({WATER_USAGE.saved}% less than yesterday)
                </p>
              </div>
            </div>
          </motion.div>
        </PremiumGate>

        {/* ═════ 6. AI Suggestions (premium gated) ═════ */}
        <PremiumGate label="AI Irrigation Suggestions">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Smart Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {RECS.map((rec, i) => (
                <div key={i}
                  className="bg-white/80 rounded-2xl border border-white/60 shadow-sm p-4 flex items-start gap-3.5"
                >
                  <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
                    rec.color === "blue"  ? "bg-blue-100"
                    : rec.color === "sky"   ? "bg-sky-100"
                    : "bg-emerald-100"
                  }`}>
                    <rec.icon className={`h-4.5 w-4.5 ${
                      rec.color === "blue"  ? "text-blue-600"
                      : rec.color === "sky"   ? "text-sky-600"
                      : "text-emerald-600"
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground mb-0.5">{rec.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PremiumGate>

        {/* ═════ 7. Irrigation History ═════ */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Irrigation History</h2>
          <div className="bg-white/80 rounded-2xl border border-white/60 shadow-sm p-5">
            <div className="space-y-3">
              {[
                { date: "Today, 8:15 AM",   field: "Field A", water: 320, method: "Drip", status: "completed" },
                { date: "Yesterday, 6:30 AM", field: "Field B", water: 450, method: "Sprinkler", status: "completed" },
                { date: "Apr 1, 2026",       field: "Field C", water: 0,   method: "None", status: "skipped" },
                { date: "Mar 30, 2026",       field: "Field D", water: 280, method: "Drip", status: "completed" },
              ].map((h) => (
                <div key={h.date} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      h.status === "completed" ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"
                    }`}>
                      {h.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <CloudRain className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{h.field}</p>
                      <p className="text-[11px] text-muted-foreground">{h.date} · {h.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{h.water > 0 ? `${h.water}L` : "Skipped"}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      h.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {h.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═════ 8. Live Weather (compact, last) ═════ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Live Weather</h2>
            <button
              onClick={fetchWeather}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${weatherLoading ? "animate-spin" : ""}`} />
              {lastUpdated ? `Updated ${lastUpdated}` : "Refresh"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Current weather card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/60 shadow-sm overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(142 40% 96%) 0%, hsl(196 50% 95%) 100%)" }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold text-foreground">{now.temperature}°</span>
                      <span className="text-lg text-muted-foreground">C</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{wInfo.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Pune, Maharashtra</p>
                  </div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
                  >
                    <WeatherIcon className="h-7 w-7 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { icon: Droplets,    value: `${now.humidity}%`,       label: "Humidity" },
                    { icon: Wind,        value: `${now.windSpeed} km/h`,   label: "Wind" },
                    { icon: CloudRain,   value: `${now.precipitation} mm`, label: "Rain Today" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/70 rounded-xl px-2 py-2 text-center border border-white/60">
                      <s.icon className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
                      <p className="text-xs font-bold text-foreground">{s.value}</p>
                      <p className="text-[9px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/70 border border-white/60">
                  <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <p className="text-xs font-medium text-foreground">{wInfo.insight}</p>
                </div>
              </div>
            </motion.div>

            {/* 4-day forecast */}
            <div className="md:col-span-2 rounded-2xl border border-white/60 shadow-sm p-4"
              style={{ background: "linear-gradient(135deg, hsl(45 40% 96%) 0%, hsl(35 50% 95%) 100%)" }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">4-Day Forecast</p>
              <div className="grid grid-cols-4 gap-2">
                {fc.map((day, i) => (
                  <div key={i} className="bg-white/70 rounded-xl border border-white/60 p-3 text-center">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1">{dayLabel(day.date, i)}</p>
                    <CloudRain className={`h-4 w-4 mx-auto mb-1 ${day.rainChance > 50 ? "text-sky-500" : "text-muted-foreground/40"}`} />
                    <p className="text-sm font-bold text-foreground">{day.maxTemp}°</p>
                    <p className="text-[10px] text-muted-foreground">{day.minTemp}°</p>
                    <p className={`text-[10px] font-medium mt-0.5 ${day.rainChance > 50 ? "text-sky-600" : "text-muted-foreground/60"}`}>
                      {day.rainChance}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
