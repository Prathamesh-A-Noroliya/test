import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  AlertTriangle, ChevronRight, Lock, Leaf, RotateCcw,
  CheckCircle2, FlaskConical, ShieldAlert, ArrowLeft,
  Share2, Sprout, Info, Clock, MapPin, X,
  Star, Phone, MessageSquare, Users, Sparkles, UserCheck,
  ShieldCheck, Zap,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScan } from "@/lib/scan-store";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────── */

type Severity = "urgent" | "moderate" | "mild";

interface DiseaseOutcome {
  rank: 1 | 2;
  disease: string;
  scientificName: string;
  confidence: number;
  severity: Severity;
  cause: string;
  affected: string;
  spreadRate: string;
  estimatedLoss: string;
  treatmentWindow: string;
  quickFix: string;
  icon: React.ElementType;
}

/* ─── Mock Expert Data ───────────────────────────────── */

const EXPERTS = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    title: "Senior Agronomist",
    specialty: "Rice · Wheat · Fungal Diseases",
    rating: 4.9,
    reviews: 312,
    experience: "12 yrs",
    responseTime: "< 5 min",
    available: true,
    avatar: "PS",
    avatarBg: "from-emerald-400 to-teal-500",
    badge: "Top Rated",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    id: 2,
    name: "Rajesh Bhosale",
    title: "Crop Protection Specialist",
    specialty: "Cotton · Sugarcane · Pest Control",
    rating: 4.7,
    reviews: 218,
    experience: "8 yrs",
    responseTime: "< 15 min",
    available: true,
    avatar: "RB",
    avatarBg: "from-blue-400 to-indigo-500",
    badge: "Expert",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: 3,
    name: "Anita Kulkarni",
    title: "Organic Farming Consultant",
    specialty: "Organic · Soil Health · Horticulture",
    rating: 4.8,
    reviews: 174,
    experience: "10 yrs",
    responseTime: "< 10 min",
    available: false,
    avatar: "AK",
    avatarBg: "from-violet-400 to-purple-500",
    badge: "Organic Pro",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
];

/* ─── Mock Result Logic ──────────────────────────────── */

function getOutcomes(crop: string): [DiseaseOutcome, DiseaseOutcome] {
  const c = crop.toLowerCase();

  const map: Record<string, [DiseaseOutcome, DiseaseOutcome]> = {
    wheat: [
      { rank: 1, disease: "Yellow Leaf Rust", scientificName: "Puccinia striiformis", confidence: 86, severity: "urgent", cause: "Fungal — airborne spores", affected: "~40% leaf area", spreadRate: "Very High", estimatedLoss: "15–30%", treatmentWindow: "48 hours", quickFix: "Propiconazole 25% EC at 1 ml/L", icon: ShieldAlert },
      { rank: 2, disease: "Powdery Mildew", scientificName: "Blumeria graminis", confidence: 61, severity: "moderate", cause: "Fungal — dry humid conditions", affected: "~18% leaf area", spreadRate: "Moderate", estimatedLoss: "8–15%", treatmentWindow: "5–7 days", quickFix: "Tebuconazole 25.9% EC at 1 ml/L", icon: AlertTriangle },
    ],
    tomato: [
      { rank: 1, disease: "Early Blight", scientificName: "Alternaria solani", confidence: 91, severity: "moderate", cause: "Fungal — water-splash spread", affected: "~25% foliage", spreadRate: "Moderate", estimatedLoss: "10–20%", treatmentWindow: "5–7 days", quickFix: "Mancozeb 75% WP at 2 g/L", icon: AlertTriangle },
      { rank: 2, disease: "Septoria Leaf Spot", scientificName: "Septoria lycopersici", confidence: 54, severity: "mild", cause: "Fungal — warm wet weather", affected: "~12% leaf area", spreadRate: "Low–Moderate", estimatedLoss: "5–10%", treatmentWindow: "7–10 days", quickFix: "Chlorothalonil 75% WP at 2 g/L", icon: Info },
    ],
    rice: [
      { rank: 1, disease: "Blast Disease", scientificName: "Magnaporthe oryzae", confidence: 88, severity: "urgent", cause: "Fungal — airborne conidia", affected: "~50% tillers", spreadRate: "Very High", estimatedLoss: "Up to 70%", treatmentWindow: "Immediate", quickFix: "Tricyclazole 75% WP at 0.6 g/L", icon: ShieldAlert },
      { rank: 2, disease: "Bacterial Leaf Blight", scientificName: "Xanthomonas oryzae", confidence: 71, severity: "moderate", cause: "Bacterial — seed/water borne", affected: "~30% leaf margins", spreadRate: "Moderate", estimatedLoss: "10–30%", treatmentWindow: "3–5 days", quickFix: "Copper oxychloride at 3 g/L", icon: AlertTriangle },
    ],
    potato: [
      { rank: 1, disease: "Late Blight", scientificName: "Phytophthora infestans", confidence: 83, severity: "urgent", cause: "Oomycete — cool wet weather", affected: "~45% vines", spreadRate: "Very High", estimatedLoss: "20–60%", treatmentWindow: "24–48 hours", quickFix: "Metalaxyl + Mancozeb at 2.5 g/L", icon: ShieldAlert },
      { rank: 2, disease: "Early Blight", scientificName: "Alternaria solani", confidence: 59, severity: "moderate", cause: "Fungal — warm humid weather", affected: "~20% leaf area", spreadRate: "Moderate", estimatedLoss: "10–20%", treatmentWindow: "5–7 days", quickFix: "Azoxystrobin 23% SC at 1 ml/L", icon: AlertTriangle },
    ],
    cotton: [
      { rank: 1, disease: "Leaf Curl Virus", scientificName: "Cotton Leaf Curl Virus (CLCuV)", confidence: 79, severity: "urgent", cause: "Viral — whitefly transmitted", affected: "~35% crop stand", spreadRate: "High", estimatedLoss: "15–40%", treatmentWindow: "Immediate", quickFix: "Control whitefly with Imidacloprid 17.8% SL", icon: ShieldAlert },
      { rank: 2, disease: "Root Rot", scientificName: "Rhizoctonia solani", confidence: 52, severity: "moderate", cause: "Fungal — waterlogged soil", affected: "~15% plant stand", spreadRate: "Low", estimatedLoss: "5–15%", treatmentWindow: "7–10 days", quickFix: "Carbendazim 50% WP soil drench at 2 g/L", icon: AlertTriangle },
    ],
  };

  return (
    map[c] ?? [
      { rank: 1, disease: "Leaf Blight Infection", scientificName: "Mixed fungal/bacterial", confidence: 82, severity: "moderate", cause: "Fungal or bacterial — mixed symptoms", affected: "~30% leaf surface", spreadRate: "Moderate", estimatedLoss: "10–25%", treatmentWindow: "3–5 days", quickFix: "Copper-based fungicide at 3 g/L", icon: AlertTriangle },
      { rank: 2, disease: "Nutrient Deficiency", scientificName: "Nitrogen / Micronutrient imbalance", confidence: 47, severity: "mild", cause: "Soil nutrient depletion", affected: "Systemic yellowing", spreadRate: "Non-infectious", estimatedLoss: "8–15%", treatmentWindow: "10–15 days", quickFix: "Apply balanced NPK + micronutrient foliar spray", icon: Info },
    ] as [DiseaseOutcome, DiseaseOutcome]
  );
}

/* ─── Severity config ────────────────────────────────── */

const SEV: Record<Severity, { label: string; color: string; bg: string; border: string; badge: string; headerBg: string }> = {
  urgent:   { label: "Urgent",   color: "text-red-600",   bg: "bg-red-50",   border: "border-red-200",   badge: "bg-red-50 text-red-700 border-red-200",     headerBg: "from-red-50 to-red-50/30"   },
  moderate: { label: "Moderate", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-50 text-amber-700 border-amber-200", headerBg: "from-amber-50 to-amber-50/30" },
  mild:     { label: "Mild",     color: "text-blue-600",  bg: "bg-blue-50",  border: "border-blue-200",  badge: "bg-blue-50 text-blue-700 border-blue-200",   headerBg: "from-blue-50 to-blue-50/30"   },
};

/* ─── Quick recommendation helper ───────────────────── */

interface QuickRecs {
  pesticide: { product: string; dosage: string; method: string };
  organic: { product: string; dosage: string; benefit: string };
  preventive: string[];
}

function getQuickRecs(disease: string, quickFix: string): QuickRecs {
  const d = disease.toLowerCase();

  if (d.includes("rust")) return {
    pesticide: { product: "Propiconazole 25% EC", dosage: "1 ml / litre water", method: "Knapsack sprayer — both leaf surfaces. Apply 6–9 AM when wind is calm." },
    organic: { product: "Trichoderma viride", dosage: "4 g / litre water", benefit: "Parasitises fungal spores; safe for beneficial insects & soil microbiome." },
    preventive: ["Avoid overhead irrigation — wet foliage accelerates rust spread.", "Remove and burn all infected leaf debris after each spray.", "Rotate fungicide class: Tebuconazole on 2nd spray (Day 10–14) to prevent resistance."],
  };
  if (d.includes("blast")) return {
    pesticide: { product: "Tricyclazole 75% WP", dosage: "0.6 g / litre water", method: "Apply at tillering and panicle initiation. Avoid midday application." },
    organic: { product: "Pseudomonas fluorescens", dosage: "10 g / litre water", benefit: "Biocontrol + plant growth promoter; apply as soil drench at root zone." },
    preventive: ["Maintain correct plant spacing — overcrowding traps humidity.", "Use silicon-enriched fertilizers to strengthen leaf cell walls.", "Monitor weather closely: blast favours 22–28°C with >90% humidity."],
  };
  if (d.includes("blight") && d.includes("late")) return {
    pesticide: { product: "Metalaxyl + Mancozeb", dosage: "2.5 g / litre water", method: "Full plant coverage spray including stems and tuber hills. Repeat every 5 days." },
    organic: { product: "Neem Oil 3000 ppm", dosage: "5 ml + 1 ml soap / litre", benefit: "Disrupts spore germination; also repels aphid vectors. Biodegradable." },
    preventive: ["Destroy infected plant material — Late Blight spreads in 48 hours.", "Avoid irrigating in the evening — wet soil overnight accelerates spread.", "Hill up soil around tuber rows to protect developing potatoes."],
  };
  if (d.includes("blight") || d.includes("spot")) return {
    pesticide: { product: "Mancozeb 75% WP", dosage: "2 g / litre water", method: "Foliar spray ensuring coverage of undersides. Repeat every 7 days." },
    organic: { product: "Neem Oil 3000 ppm", dosage: "5 ml + 1 ml soap / litre", benefit: "Natural antifungal + repels aphids and whiteflies that spread blight." },
    preventive: ["Remove lower infected leaves first — they are the primary spread source.", "Avoid splash irrigation — use drip if possible.", "Apply mulch to prevent spore splash-back from soil to leaves."],
  };
  if (d.includes("curl") || d.includes("viral")) return {
    pesticide: { product: "Imidacloprid 17.8% SL", dosage: "0.5 ml / litre water", method: "Spray whitefly vector population on leaf undersides. Repeat every 10 days." },
    organic: { product: "Neem Oil + Yellow Sticky Traps", dosage: "5 ml / litre + traps every 10m", benefit: "Repels whitefly; traps monitor and reduce vector pressure organically." },
    preventive: ["Remove and destroy affected plants immediately to limit viral spread.", "Grow barrier crops like maize or sorghum around the field perimeter.", "Use reflective mulch to deter whitefly from landing on seedlings."],
  };
  // Generic fallback
  const pestProduct = quickFix.includes(" at ") ? quickFix.split(" at ")[0] : quickFix;
  const pestDosage  = quickFix.includes(" at ") ? quickFix.split(" at ")[1] : "As directed on label";
  return {
    pesticide: { product: pestProduct, dosage: pestDosage, method: "Spray both leaf surfaces thoroughly. Apply early morning. Repeat in 10–14 days." },
    organic: { product: "Neem Oil 3000 ppm", dosage: "5 ml + 1 ml soap / litre", benefit: "Natural antifungal; repels insect vectors. Safe and biodegradable." },
    preventive: ["Remove infected plant material from the field immediately.", "Avoid working in the field when leaves are wet to prevent spread.", "Improve air circulation with proper plant spacing and pruning."],
  };
}

/* ─── Animated bar ───────────────────────────────────── */

function Bar({ value, delay, color }: { value: number; delay: number; color: string }) {
  return (
    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
      <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ delay, duration: 0.8, ease: "easeOut" }} />
    </div>
  );
}

/* ─── Disease Outcome Card ───────────────────────────── */

function OutcomeCard({ outcome, delay }: { outcome: DiseaseOutcome; delay: number }) {
  const [expanded, setExpanded] = useState(outcome.rank === 1);
  const sev = SEV[outcome.severity];
  const SevIcon = outcome.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Card className={cn("rounded-2xl shadow-sm border-2 overflow-hidden", outcome.rank === 1 ? `border-${outcome.severity === "urgent" ? "red" : outcome.severity === "moderate" ? "amber" : "blue"}-300` : "border-border/60")}>
        <div className={cn("flex items-start gap-3 p-4 cursor-pointer select-none", `bg-gradient-to-r ${sev.headerBg}`)} onClick={() => setExpanded((v) => !v)}>
          <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", sev.bg, sev.border)}>
            <SevIcon className={cn("h-5 w-5", sev.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", sev.badge)}>{sev.label}</span>
              <span className="text-[10px] bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-full border border-border/60">
                #{outcome.rank} {outcome.rank === 1 ? "Most Likely" : "Possible"}
              </span>
            </div>
            <p className="text-sm font-bold text-foreground truncate">{outcome.disease}</p>
            <p className="text-[11px] text-muted-foreground italic">{outcome.scientificName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className={cn("text-xl font-black", outcome.rank === 1 ? sev.color : "text-muted-foreground")}>{outcome.confidence}%</p>
            <p className="text-[10px] text-muted-foreground">confidence</p>
          </div>
        </div>

        <div className="px-4 pb-2 pt-1">
          <Bar
            value={outcome.confidence}
            delay={delay + 0.2}
            color={outcome.rank === 1
              ? outcome.severity === "urgent"   ? "bg-gradient-to-r from-red-400 to-red-500"
              : outcome.severity === "moderate" ? "bg-gradient-to-r from-amber-400 to-amber-500"
              : "bg-gradient-to-r from-blue-400 to-blue-500"
              : "bg-gradient-to-r from-slate-300 to-slate-400"}
          />
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Cause", value: outcome.cause },
                    { label: "Affected Area", value: outcome.affected },
                    { label: "Spread Rate", value: outcome.spreadRate },
                    { label: "Est. Loss", value: outcome.estimatedLoss },
                    { label: "Treatment Window", value: outcome.treatmentWindow },
                    { label: "Quick Fix", value: outcome.quickFix },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted/50 rounded-xl p-2.5">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5 leading-snug">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => setExpanded((v) => !v)} className="w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground py-2 border-t border-border/60 hover:bg-muted/40 transition-colors">
          {expanded ? "Collapse details" : "Expand details"}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="h-3 w-3 rotate-90" />
          </motion.div>
        </button>
      </Card>
    </motion.div>
  );
}

/* ─── Expert Card (unlocked) ─────────────────────────── */

function ExpertCard({ expert, delay }: { expert: typeof EXPERTS[0]; delay: number }) {
  const [requested, setRequested] = useState(false);
  const [chatting, setChatting] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <Card className="rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${expert.avatarBg} flex items-center justify-center shrink-0 shadow-sm`}>
              <span className="text-white text-sm font-bold">{expert.avatar}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{expert.name}</p>
                  <p className="text-xs text-muted-foreground">{expert.title}</p>
                </div>
                <Badge className={cn("text-[10px] shrink-0 font-semibold border", expert.badgeColor)}>
                  {expert.badge}
                </Badge>
              </div>

              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{expert.specialty}</p>

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-foreground">{expert.rating}</span>
                  <span className="text-[10px] text-muted-foreground">({expert.reviews})</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{expert.experience} exp</span>
                <div className="flex items-center gap-1">
                  <div className={cn("w-1.5 h-1.5 rounded-full", expert.available ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                  <span className="text-[10px] text-muted-foreground">
                    {expert.available ? `Responds ${expert.responseTime}` : "Busy — check later"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setRequested(true)}
              disabled={!expert.available}
              className={cn(
                "h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                requested
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : expert.available
                  ? "bg-muted hover:bg-muted/80 text-foreground border border-border"
                  : "bg-muted text-muted-foreground border border-border opacity-50 cursor-not-allowed"
              )}
            >
              {requested ? (
                <><CheckCircle2 className="h-3.5 w-3.5" /> Requested</>
              ) : (
                <><Phone className="h-3.5 w-3.5" /> Request Callback</>
              )}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setChatting(true)}
              disabled={!expert.available}
              className={cn(
                "h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border",
                chatting
                  ? "bg-primary/10 text-primary border-primary/30"
                  : expert.available
                  ? "bg-primary text-white border-primary hover:bg-primary/90"
                  : "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed"
              )}
            >
              {chatting ? (
                <><Sparkles className="h-3.5 w-3.5" /> Chat Started</>
              ) : (
                <><MessageSquare className="h-3.5 w-3.5" /> Start Live Chat</>
              )}
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Expert Help Section ────────────────────────────── */

function ExpertHelpSection({ isPremium, onSubscribe }: { isPremium: boolean; onSubscribe: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      <Card className="rounded-2xl overflow-hidden border-border/60 shadow-sm">
        {/* Section header */}
        <CardHeader className="pt-5 px-5 pb-3 bg-gradient-to-r from-blue-50 to-indigo-50/40 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-white" />
              </div>
              Consult an Agri-Expert
            </CardTitle>
            {isPremium ? (
              <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold gap-1">
                <UserCheck className="h-3 w-3" /> Pro Access
              </Badge>
            ) : (
              <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 font-semibold gap-1">
                <Lock className="h-3 w-3" /> Premium Only
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Get live guidance from certified agronomists who specialise in your crop type.
          </p>
        </CardHeader>

        <CardContent className="px-5 pb-5 pt-4">
          <AnimatePresence mode="wait">
            {isPremium ? (
              /* ── UNLOCKED STATE ── */
              <motion.div
                key="unlocked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-3">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>3 agronomists available now · Avg. response under 10 min</span>
                </div>
                {EXPERTS.map((expert, i) => (
                  <ExpertCard key={expert.id} expert={expert} delay={i * 0.1} />
                ))}
              </motion.div>
            ) : (
              /* ── LOCKED STATE ── */
              <motion.div
                key="locked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Blurred preview cards */}
                <div className="relative">
                  <div className="space-y-3 pointer-events-none select-none">
                    {EXPERTS.map((expert) => (
                      <div key={expert.id} className="rounded-2xl border border-border/60 p-4 blur-[3px] opacity-60">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${expert.avatarBg} flex items-center justify-center shrink-0`}>
                            <span className="text-white text-sm font-bold">{expert.avatar}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">{expert.name}</p>
                            <p className="text-xs text-muted-foreground">{expert.specialty}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-bold">{expert.rating}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">{expert.experience} exp</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="h-9 rounded-xl bg-muted" />
                          <div className="h-9 rounded-xl bg-primary/20" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-background/80 to-background rounded-2xl">
                    <div className="bg-white border border-border/60 rounded-2xl shadow-lg p-6 text-center max-w-[280px] mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                        <Lock className="h-7 w-7 text-white" />
                      </div>
                      <p className="text-sm font-bold text-foreground mb-1">Expert Help is a Pro Feature</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        Subscribe to connect with certified agronomists, get live chat support, and request callbacks within minutes.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onSubscribe}
                        className="w-full h-10 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Subscribe to Unlock Expert Help
                      </motion.button>
                      <p className="text-[10px] text-muted-foreground mt-2">Starting ₹79/month · Cancel anytime</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────── */

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.38 } } };

export default function ScanResultPage() {
  const [, navigate] = useLocation();
  const { scanData, clearScan } = useScan();
  const { user } = useAuth();
  const hasRedirected = useRef(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!scanData && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate("/scan");
    }
  }, [scanData, navigate]);

  if (!scanData) return null;

  const [outcome1, outcome2] = getOutcomes(scanData.cropType);
  const primarySev = SEV[outcome1.severity];

  const handleNewScan = () => { clearScan(); navigate("/scan"); };

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <button onClick={handleNewScan} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to scan
            </button>
            <h1 className="text-2xl font-bold text-foreground">AI Scan Results</h1>
          </div>
          <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Scan summary strip */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1.5 rounded-full">
                  <Leaf className="h-3 w-3" />
                  {scanData.cropType.charAt(0).toUpperCase() + scanData.cropType.slice(1)}
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1.5 rounded-full border border-amber-200">
                  <FlaskConical className="h-3 w-3" />
                  {scanData.soilType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1.5 rounded-full border border-blue-200">
                  <Sprout className="h-3 w-3" />
                  {scanData.growthStage.split(" (")[0]}
                </div>
                <div className="flex items-center gap-1.5 bg-muted text-muted-foreground text-xs font-semibold px-2.5 py-1.5 rounded-full">
                  <MapPin className="h-3 w-3" />
                  {scanData.fieldName}
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Photo thumbnails */}
        <motion.div variants={item}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Analysed Photos</p>
          <div className="grid grid-cols-3 gap-2">
            {scanData.photos.map((photo) => (
              <button
                key={photo.type}
                onClick={() => setSelectedPhoto(photo.url)}
                className="relative group overflow-hidden rounded-xl border border-border/60 hover:border-primary/40 transition-all"
              >
                <img src={photo.url} alt={photo.type} className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                  <p className="text-white text-[10px] font-semibold capitalize">{photo.type === "whole" ? "Whole Plant" : photo.type === "leaf" ? "Leaf Close-up" : "Soil / Root"}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Primary diagnosis banner */}
        <motion.div variants={item}>
          <div className={cn("rounded-2xl border p-4 flex items-start gap-3", primarySev.bg, primarySev.border)}>
            <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", primarySev.bg, primarySev.border)}>
              <outcome1.icon className={cn("h-5 w-5", primarySev.color)} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Primary Diagnosis</p>
              <p className={cn("text-base font-black", primarySev.color)}>{outcome1.disease}</p>
              <p className="text-xs text-muted-foreground">{outcome1.scientificName} · {outcome1.confidence}% confidence</p>
            </div>
            <span className={cn("ml-auto text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 uppercase tracking-wider", primarySev.badge)}>
              {primarySev.label}
            </span>
          </div>
        </motion.div>

        {/* 2 Outcome Cards */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            2 Possible Diagnoses — tap to expand
          </p>
          <div className="space-y-3">
            <OutcomeCard outcome={outcome1} delay={0.3} />
            <OutcomeCard outcome={outcome2} delay={0.45} />
          </div>
        </div>

        {/* ── BHOOMI Treatment Recommendations (visible) ── */}
        {(() => {
          const qr = getQuickRecs(outcome1.disease, outcome1.quickFix);
          return (
            <motion.div variants={item} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> BHOOMI Treatment Recommendations
                </p>
                <button
                  onClick={() => navigate("/recommendations")}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  All recs <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Pesticide card */}
              <Card className="rounded-2xl border-l-4 border-l-red-400 border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                      <FlaskConical className="h-4.5 w-4.5 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{qr.pesticide.product}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Pesticide</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{outcome1.disease} — {scanData.cropType}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-muted/40 rounded-xl p-2.5 border border-border/30">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Dosage</p>
                      <p className="text-xs font-bold text-foreground">{qr.pesticide.dosage}</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-2.5 border border-border/30">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Priority</p>
                      <p className={`text-xs font-bold ${SEV[outcome1.severity].color}`}>{SEV[outcome1.severity].label} — Act within {outcome1.treatmentWindow}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-muted/30 rounded-xl px-3 py-2">
                    <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{qr.pesticide.method}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Organic card */}
              <Card className="rounded-2xl border-l-4 border-l-emerald-400 border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                      <Sprout className="h-4.5 w-4.5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{qr.organic.product}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Organic</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Eco-friendly alternative — zero chemical residue</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-muted/40 rounded-xl p-2.5 border border-border/30">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Dosage</p>
                      <p className="text-xs font-bold text-foreground">{qr.organic.dosage}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                      <p className="text-[10px] text-emerald-700 uppercase tracking-wide font-semibold mb-1">Benefit</p>
                      <p className="text-xs font-semibold text-emerald-800 leading-snug">{qr.organic.benefit.split(";")[0]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preventive card */}
              <Card className="rounded-2xl border-l-4 border-l-blue-400 border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-4.5 w-4.5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">Preventive Actions</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Preventive</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Follow these steps to stop further spread</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {qr.preventive.map((action, i) => (
                      <div key={i} className="flex items-start gap-2.5 bg-muted/30 rounded-xl px-3 py-2.5">
                        <span className="w-4.5 h-4.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-xs text-foreground leading-relaxed">{action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* View full plan CTA */}
              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/premium-recommendation")}
                className="w-full h-12 rounded-xl text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 border-0"
                style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
              >
                <Star className="h-4 w-4" /> View Full 10-Day Treatment Plan
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          );
        })()}

        {/* ── Consult an Agri-Expert ──────────────────── */}
        <ExpertHelpSection
          isPremium={user?.isPremium ?? false}
          onSubscribe={() => navigate("/subscription")}
        />

        {/* Action row */}
        <motion.div variants={item} className="flex gap-3 pb-4">
          <Button variant="outline" className="flex-1 rounded-xl h-11 gap-2" onClick={handleNewScan}>
            <RotateCcw className="h-4 w-4" /> New Scan
          </Button>
          <Button className="flex-1 rounded-xl h-11 gap-2" onClick={() => navigate("/premium-recommendation")}>
            <CheckCircle2 className="h-4 w-4" /> View Full Plan
          </Button>
        </motion.div>
      </motion.div>

      {/* Photo lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.img
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              src={selectedPhoto} alt="Photo preview"
              className="max-w-full max-h-full rounded-2xl object-contain"
            />
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors" onClick={() => setSelectedPhoto(null)}>
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
