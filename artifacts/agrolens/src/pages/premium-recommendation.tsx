import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  FlaskConical, Droplets, Leaf, Sprout, ArrowLeft,
  Lock, ShieldCheck, Star, AlertTriangle, Info,
  ChevronRight, Clock, Beaker,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

/* ─── Mock Data ──────────────────────────────────────── */

const HISTORICAL_DATA = [
  { year: "2019", yellowRust: 38, leafBlight: 22, powderyMildew: 15 },
  { year: "2020", yellowRust: 52, leafBlight: 31, powderyMildew: 18 },
  { year: "2021", yellowRust: 29, leafBlight: 44, powderyMildew: 26 },
  { year: "2022", yellowRust: 61, leafBlight: 38, powderyMildew: 20 },
  { year: "2023", yellowRust: 45, leafBlight: 55, powderyMildew: 32 },
  { year: "2024", yellowRust: 73, leafBlight: 48, powderyMildew: 28 },
];

const TREATMENT_STEPS = [
  {
    step: 1,
    action: "Immediate isolation",
    detail: "Separate infected plants from healthy ones. Remove and burn all visibly infected leaves immediately.",
    timing: "Day 0 — Right now",
    urgency: "urgent",
  },
  {
    step: 2,
    action: "First fungicide application",
    detail: "Apply Propiconazole 25% EC at 1 ml/litre water. Use a knapsack sprayer, ensuring full leaf coverage including undersides.",
    timing: "Day 1 — Within 24 hours",
    urgency: "urgent",
  },
  {
    step: 3,
    action: "Follow-up spray",
    detail: "Repeat application with Tebuconazole 25.9% EC at 1 ml/litre. Rotate chemical class to prevent resistance.",
    timing: "Day 10–14",
    urgency: "moderate",
  },
  {
    step: 4,
    action: "Recovery monitoring",
    detail: "Inspect treated plants daily. Look for new pustule formation. If symptoms persist, escalate to systemic fungicide.",
    timing: "Day 7–21",
    urgency: "info",
  },
];

const FERTILIZER_PLAN = [
  { nutrient: "Nitrogen (N)", product: "Urea 46%", dose: "20 kg/acre", timing: "After disease control confirmed", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { nutrient: "Phosphorus (P)", product: "DAP (18:46:0)", dose: "12 kg/acre", timing: "At next irrigation cycle", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { nutrient: "Potassium (K)", product: "MOP 60%", dose: "8 kg/acre", timing: "Mix with P application", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { nutrient: "Zinc", product: "Zinc Sulphate 33%", dose: "5 kg/acre", timing: "Soil application once", color: "bg-purple-50 border-purple-200 text-purple-700" },
];

const APPLICATION_METHODS = [
  {
    icon: Droplets,
    method: "Knapsack Sprayer",
    detail: "Most effective. Set nozzle to fine mist. Spray early morning (6–9 AM) when wind speed is low. Cover 1 acre in 200–250 litres.",
    recommended: true,
  },
  {
    icon: Beaker,
    method: "Drip Fertigation",
    detail: "For water-soluble fertilizers. Mix nutrient solution at 1:100 ratio. Run for 30 minutes per irrigation cycle.",
    recommended: false,
  },
  {
    icon: Leaf,
    method: "Foliar Spray",
    detail: "Effective for micronutrients. Use 0.5–1% solution. Apply to both leaf surfaces. Avoid during peak heat (11 AM–4 PM).",
    recommended: false,
  },
];

const ORGANIC_ALTERNATIVES = [
  {
    name: "Trichoderma viride",
    type: "Biocontrol agent",
    dose: "4 g/litre water",
    benefit: "Parasitises fungal pathogens; safe for beneficial insects and soil microbiome.",
    availability: "Available at KVK centres & agricultural cooperatives",
  },
  {
    name: "Neem Oil (3000 ppm)",
    type: "Botanical pesticide",
    dose: "5 ml/litre + 1 ml soap emulsifier",
    benefit: "Disrupts fungal spore germination; also repels aphids and whiteflies.",
    availability: "Widely available at agro-input stores",
  },
  {
    name: "Garlic-Chilli Extract",
    type: "Traditional remedy",
    dose: "20 ml/litre (fermented 48h)",
    benefit: "Contains allicin — a natural antifungal. Effective for mild to moderate infections.",
    availability: "Home-prepared; zero chemical input",
  },
];

const urgencyStyle = {
  urgent: { dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200", border: "border-l-red-400" },
  moderate: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200", border: "border-l-amber-400" },
  info: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700 border-blue-200", border: "border-l-blue-300" },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" as const } },
};

export default function PremiumRecommendationPage() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

        {/* Header */}
        <motion.div variants={item}>
          <button onClick={() => navigate("/recommendations")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> {t("common.back")}
          </button>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">Premium Treatment Plan</h1>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">Pro</Badge>
              </div>
              <p className="text-muted-foreground text-sm">Yellow Leaf Rust — Wheat · Field A · Diagnosed Today</p>
            </div>
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <span className="text-xs font-semibold text-red-700">Urgent — Act within 48h</span>
            </div>
          </div>
        </motion.div>

        {/* ── 1. Treatment Solutions ────────────────────── */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="pt-5 px-5 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> {t("reco.treatment")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {TREATMENT_STEPS.map((step, i) => {
                const sty = urgencyStyle[step.urgency as keyof typeof urgencyStyle];
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`border-l-4 ${sty.border} bg-muted/40 rounded-r-xl pl-4 pr-4 py-3 space-y-1.5`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">{step.step}</span>
                        <p className="text-sm font-semibold text-foreground">{step.action}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sty.badge}`}>
                          {step.urgency}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" /> {step.timing}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 2. Fertilizer Dosage ──────────────────────── */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="pt-5 px-5 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-amber-500" /> {t("reco.fertilizer")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FERTILIZER_PLAN.map((f, i) => (
                  <motion.div
                    key={f.nutrient}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className={`border rounded-xl p-3.5 space-y-2 ${f.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider">{f.nutrient}</p>
                      <span className="text-sm font-bold">{f.dose}</span>
                    </div>
                    <p className="text-xs font-semibold">{f.product}</p>
                    <div className="flex items-center gap-1 text-[11px] opacity-75">
                      <Clock className="h-3 w-3" /> {f.timing}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-foreground leading-relaxed">
                  Do <strong>not</strong> apply nitrogen while the disease is active — it accelerates fungal spread. Wait until fungicide treatment shows visible results (7–10 days).
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 3. Application Methods ────────────────────── */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="pt-5 px-5 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" /> {t("reco.application")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {APPLICATION_METHODS.map(({ icon: Icon, method, detail, recommended }, i) => (
                <motion.div
                  key={method}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`flex gap-3 p-3.5 rounded-xl border ${recommended ? "border-primary/30 bg-primary/5" : "border-border/60 bg-muted/30"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${recommended ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{method}</p>
                      {recommended && (
                        <span className="text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full">
                          {t("reco.recommended")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 4. Organic Alternatives ───────────────────── */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="pt-5 px-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-emerald-500" /> {t("reco.organic")}
                </CardTitle>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                  {t("reco.organic.badge")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {ORGANIC_ALTERNATIVES.map((alt, i) => (
                <motion.div
                  key={alt.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-bold text-foreground">{alt.name}</p>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{alt.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Dosage</p>
                      <p className="text-xs font-bold text-foreground">{alt.dose}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{alt.benefit}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <ShieldCheck className="h-3 w-3 shrink-0" />
                    {alt.availability}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 5. Historical Case Insights Line Chart ───── */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="pt-5 px-5 pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" /> {t("reco.historicalData")}
                </CardTitle>
                <span className="text-xs text-muted-foreground">Your region · 2019–2024</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Disease incidence (% of farms affected) — Maharashtra</p>
            </CardHeader>
            <CardContent className="px-2 pb-5">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={HISTORICAL_DATA} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                      formatter={(v: number, name: string) => [`${v}%`, name.replace(/([A-Z])/g, " $1").trim()]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                      formatter={(v) => v.replace(/([A-Z])/g, " $1").trim()}
                    />
                    <Line type="monotone" dataKey="yellowRust" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="leafBlight" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="powderyMildew" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 4, fill: "#60a5fa", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 mx-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Yellow Rust incidence in your region has risen <strong>92% since 2019</strong>. 2024 shows the highest outbreak in 6 years. Early preventive treatment is strongly advised.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div variants={item} className="pb-4">
          <Button className="w-full h-12 rounded-xl font-semibold gap-2" onClick={() => navigate("/subscription")}>
            <Lock className="h-4 w-4" /> Renew Pro Plan to Keep Access
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
