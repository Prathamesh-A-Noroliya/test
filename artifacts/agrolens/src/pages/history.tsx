import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Search, X, SlidersHorizontal, Camera, Droplets,
  Download, Clock, MapPin,
  CheckCircle2, AlertTriangle, FlaskConical,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Severity = "urgent" | "moderate" | "mild" | "healthy";
type Tab = "scans" | "irrigation";

interface ScanRecord {
  id: string;
  date: string;
  dateRaw: Date;
  crop: string;
  field: string;
  result: string;
  severity: Severity;
  thumbnail: string;
  confidence: number;
  weather: string;
  treatment: string;
}

interface IrrigationRecord {
  id: string;
  date: string;
  field: string;
  waterUsed: number;
  duration: string;
  mode: "auto" | "manual";
  moistureBefore: number;
  moistureAfter: number;
  rainfall: number;
  status: "completed" | "skipped";
}

/* ──── Data ──────────────────────────────────────────── */
const MOCK_SCANS: ScanRecord[] = [
  { id: "1", date: "Today, 10:24 AM", dateRaw: new Date(), crop: "Wheat", field: "Field A", result: "Yellow Leaf Rust", severity: "urgent", thumbnail: "🌾", confidence: 86, weather: "28°C, Partly Cloudy", treatment: "Propiconazole 25% EC" },
  { id: "2", date: "Yesterday, 3:12 PM", dateRaw: new Date(Date.now() - 864e5), crop: "Rice", field: "Field B", result: "Blast Disease", severity: "urgent", thumbnail: "🌾", confidence: 88, weather: "30°C, Humid", treatment: "Tricyclazole 75% WP" },
  { id: "3", date: "Apr 1, 2026", dateRaw: new Date(Date.now() - 2*864e5), crop: "Tomato", field: "Greenhouse", result: "Early Blight", severity: "moderate", thumbnail: "🍅", confidence: 91, weather: "27°C, Sunny", treatment: "Mancozeb 75% WP" },
  { id: "4", date: "Mar 30, 2026", dateRaw: new Date(Date.now() - 4*864e5), crop: "Cotton", field: "Field C", result: "Aphid Infestation", severity: "moderate", thumbnail: "🌿", confidence: 78, weather: "29°C, Windy", treatment: "Imidacloprid 17.8% SL" },
  { id: "5", date: "Mar 28, 2026", dateRaw: new Date(Date.now() - 6*864e5), crop: "Mustard", field: "Field D", result: "Alternaria Leaf Spot", severity: "moderate", thumbnail: "🌻", confidence: 74, weather: "26°C, Cloudy", treatment: "Copper oxychloride" },
  { id: "6", date: "Mar 25, 2026", dateRaw: new Date(Date.now() - 9*864e5), crop: "Soybean", field: "Field A", result: "All Healthy", severity: "healthy", thumbnail: "🌱", confidence: 95, weather: "25°C, Clear", treatment: "None needed" },
  { id: "7", date: "Mar 22, 2026", dateRaw: new Date(Date.now() - 12*864e5), crop: "Potato", field: "Field E", result: "Late Blight", severity: "urgent", thumbnail: "🥔", confidence: 82, weather: "24°C, Rainy", treatment: "Metalaxyl + Mancozeb" },
  { id: "8", date: "Mar 19, 2026", dateRaw: new Date(Date.now() - 15*864e5), crop: "Wheat", field: "Field B", result: "Powdery Mildew", severity: "mild", thumbnail: "🌾", confidence: 63, weather: "22°C, Foggy", treatment: "Tebuconazole" },
  { id: "9", date: "Mar 15, 2026", dateRaw: new Date(Date.now() - 19*864e5), crop: "Onion", field: "Greenhouse", result: "Purple Blotch", severity: "moderate", thumbnail: "🧅", confidence: 79, weather: "23°C, Overcast", treatment: "Mancozeb spray" },
  { id: "10", date: "Mar 10, 2026", dateRaw: new Date(Date.now() - 24*864e5), crop: "Mango", field: "Orchard", result: "All Healthy", severity: "healthy", thumbnail: "🥭", confidence: 97, weather: "31°C, Sunny", treatment: "None needed" },
];

const MOCK_IRRIGATION: IrrigationRecord[] = [
  { id: "i1", date: "Today, 8:15 AM", field: "Field A", waterUsed: 320, duration: "45 min", mode: "manual", moistureBefore: 38, moistureAfter: 55, rainfall: 0, status: "completed" },
  { id: "i2", date: "Yesterday, 6:30 AM", field: "Field B", waterUsed: 450, duration: "60 min", mode: "auto", moistureBefore: 30, moistureAfter: 52, rainfall: 0, status: "completed" },
  { id: "i3", date: "Apr 1, 2026", field: "Field C", waterUsed: 0, duration: "0 min", mode: "auto", moistureBefore: 55, moistureAfter: 55, rainfall: 12, status: "skipped" },
  { id: "i4", date: "Mar 30, 2026", field: "Field D", waterUsed: 280, duration: "40 min", mode: "manual", moistureBefore: 35, moistureAfter: 50, rainfall: 0, status: "completed" },
  { id: "i5", date: "Mar 28, 2026", field: "Field A", waterUsed: 350, duration: "50 min", mode: "auto", moistureBefore: 33, moistureAfter: 48, rainfall: 0, status: "completed" },
  { id: "i6", date: "Mar 25, 2026", field: "Field B", waterUsed: 0, duration: "0 min", mode: "auto", moistureBefore: 60, moistureAfter: 60, rainfall: 8, status: "skipped" },
  { id: "i7", date: "Mar 22, 2026", field: "Field C", waterUsed: 400, duration: "55 min", mode: "manual", moistureBefore: 28, moistureAfter: 50, rainfall: 0, status: "completed" },
  { id: "i8", date: "Mar 19, 2026", field: "Field E", waterUsed: 300, duration: "42 min", mode: "auto", moistureBefore: 32, moistureAfter: 47, rainfall: 0, status: "completed" },
];

const SEVERITY_STYLE: Record<Severity, { label: string; badge: string; icon: React.ElementType }> = {
  urgent:   { label: "Urgent",   badge: "bg-red-50 text-red-700 border-red-200",    icon: AlertTriangle },
  moderate: { label: "Moderate", badge: "bg-amber-50 text-amber-700 border-amber-200", icon: FlaskConical },
  mild:     { label: "Mild",     badge: "bg-blue-50 text-blue-700 border-blue-200",   icon: CheckCircle2 },
  healthy:  { label: "Healthy",  badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } } };

/* ──── Page ──────────────────────────────────────────── */
export default function HistoryPage() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("scans");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Severity | "all">("all");

  const scanFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_SCANS.filter((s) => {
      const matchQuery = !q || s.crop.toLowerCase().includes(q) || s.result.toLowerCase().includes(q) || s.field.toLowerCase().includes(q);
      const matchFilter = filter === "all" || s.severity === filter;
      return matchQuery && matchFilter;
    });
  }, [query, filter]);

  const irrFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_IRRIGATION.filter((r) => !q || r.field.toLowerCase().includes(q));
  }, [query]);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="max-w-lg mx-auto space-y-5 pb-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Crop scans & irrigation logs</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          <button
            onClick={() => { setTab("scans"); setQuery(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              tab === "scans" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Camera className="h-3.5 w-3.5" /> Crop Scans
          </button>
          <button
            onClick={() => { setTab("irrigation"); setQuery(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              tab === "irrigation" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Droplets className="h-3.5 w-3.5" /> Irrigation
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search" placeholder={tab === "scans" ? "Search crop, disease, field..." : "Search field..."}
              className="pl-9 h-11 rounded-xl pr-8" value={query} onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setQuery("")}><X className="h-3.5 w-3.5" /></button>
            )}
          </div>
          {tab === "scans" && (
            <div className="flex items-center gap-1.5 border border-border/60 rounded-xl px-3 bg-card">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select className="text-sm bg-transparent border-none outline-none text-foreground pr-1 py-0 h-full cursor-pointer"
                value={filter} onChange={(e) => setFilter(e.target.value as Severity | "all")}>
                <option value="all">All</option>
                <option value="urgent">Urgent</option>
                <option value="moderate">Moderate</option>
                <option value="mild">Mild</option>
                <option value="healthy">Healthy</option>
              </select>
            </div>
          )}
        </div>

        {/* Stats */}
        {tab === "scans" && (
          <div className="grid grid-cols-4 gap-2">
            {(["urgent", "moderate", "mild", "healthy"] as Severity[]).map((sev) => {
              const count = MOCK_SCANS.filter((s) => s.severity === sev).length;
              const sty = SEVERITY_STYLE[sev];
              return (
                <button key={sev} onClick={() => setFilter(filter === sev ? "all" : sev)}
                  className={cn(
                    "border rounded-xl p-2.5 text-center transition-all cursor-pointer",
                    filter === sev ? `${sty.badge} ring-2 ring-current/30` : "border-border/60 bg-card hover:bg-muted/60"
                  )}>
                  <p className="text-lg font-bold text-foreground">{count}</p>
                  <p className="text-[10px] font-medium text-muted-foreground capitalize">{sty.label}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Results count + export */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">
              {tab === "scans" ? scanFiltered.length : irrFiltered.length}</span> results
          </p>
          <button className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            <Download className="h-3 w-3" /> Export
          </button>
        </div>

        {/* Lists */}
        <AnimatePresence mode="wait">
          {tab === "scans" ? (
            scanFiltered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No scans found</p>
                <p className="text-xs mt-1">Try a different search or clear filters</p>
              </div>
            ) : (
              <motion.div key="scans" variants={container} initial="hidden" animate="show" className="space-y-2.5">
                {scanFiltered.map((scan) => {
                  const sty = SEVERITY_STYLE[scan.severity];
                  const SevIcon = sty.icon;
                  return (
                    <motion.div key={scan.id} variants={item} layout>
                      <Card className="rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate("/scan-result")}>
                        <CardContent className="p-0">
                          <div className="flex items-stretch gap-0 overflow-hidden">
                            <div className="w-16 sm:w-20 shrink-0 flex items-center justify-center bg-muted/60 border-r border-border/60 text-3xl select-none">
                              {scan.thumbnail}
                            </div>
                            <div className="flex-1 min-w-0 p-3.5">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-bold text-foreground">{scan.crop}</p>
                                    <span className="text-xs text-muted-foreground">· {scan.field}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">{scan.result}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${sty.badge}`}>
                                  {sty.label}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Clock className="h-3 w-3" /> {scan.date}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <MapPin className="h-3 w-3" /> {scan.weather}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground col-span-2">
                                  <FlaskConical className="h-3 w-3" /> Treatment: {scan.treatment}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2">
                                <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                                  <div className={cn("h-full rounded-full", scan.confidence > 80 ? "bg-emerald-500" : scan.confidence > 60 ? "bg-amber-400" : "bg-slate-400")}
                                    style={{ width: `${scan.confidence}%` }} />
                                </div>
                                <span className="font-medium">{scan.confidence}% confidence</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )
          ) : irrFiltered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Droplets className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No irrigation logs found</p>
              <p className="text-xs mt-1">Try a different search</p>
            </div>
          ) : (
            <motion.div key="irr" variants={container} initial="hidden" animate="show" className="space-y-2.5">
              {irrFiltered.map((rec) => (
                <motion.div key={rec.id} variants={item} layout>
                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">{rec.field}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              rec.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-sky-50 text-sky-700 border-sky-200"
                            }`}>
                              {rec.status === "completed" ? "Completed" : "Skipped (rain)"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{rec.date} · {rec.mode === "auto" ? "Auto" : "Manual"}</p>
                        </div>
                        {rec.status === "completed" && (
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-foreground">{rec.waterUsed} L</p>
                            <p className="text-[10px] text-muted-foreground">{rec.duration}</p>
                          </div>
                        )}
                      </div>
                      {rec.status === "completed" && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div className="bg-muted/40 rounded-xl p-2 text-center border border-border/30">
                            <p className="text-[10px] text-muted-foreground">Moisture Before</p>
                            <p className="text-sm font-bold text-foreground">{rec.moistureBefore}%</p>
                          </div>
                          <div className="bg-emerald-50 rounded-xl p-2 text-center border border-emerald-100">
                            <p className="text-[10px] text-emerald-600">Moisture After</p>
                            <p className="text-sm font-bold text-emerald-700">{rec.moistureAfter}%</p>
                          </div>
                          <div className="bg-muted/40 rounded-xl p-2 text-center border border-border/30">
                            <p className="text-[10px] text-muted-foreground">Rainfall</p>
                            <p className="text-sm font-bold text-foreground">{rec.rainfall} mm</p>
                          </div>
                        </div>
                      )}
                      {rec.status === "skipped" && (
                        <div className="flex items-start gap-2 bg-sky-50 rounded-xl px-3 py-2 border border-sky-100 mt-2">
                          <Droplets className="h-3.5 w-3.5 text-sky-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-sky-700">Skipped — {rec.rainfall}mm rainfall expected. Soil moisture at {rec.moistureBefore}% was sufficient.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}
