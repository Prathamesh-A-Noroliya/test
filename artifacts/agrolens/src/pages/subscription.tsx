import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  CheckCircle2, Star, Zap, Droplets, Camera, BrainCircuit,
  Users, ArrowRight, ChevronLeft, Sparkles, ToggleLeft, ToggleRight,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

/* ──── Plan Builder Data ──────────────────────────────────────────── */
const MODULES = [
  {
    id: "irrigation",
    icon: Droplets,
    name: "Automated Irrigation",
    price: 20,
    desc: "Smart soil moisture monitoring, auto-irrigation scheduling, and water usage analytics.",
    color: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
  },
  {
    id: "scans",
    icon: Camera,
    name: "Unlimited Crop Scans",
    price: 100,
    desc: "Unlimited AI disease detection scans with full treatment protocols and expert reports.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
  },
  {
    id: "ai",
    icon: BrainCircuit,
    name: "AI Treatment Plans",
    price: 200,
    desc: "Personalised 10-day treatment schedules, fertiliser plans, organic alternatives, and charts.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  {
    id: "expert",
    icon: Users,
    name: "Expert Help",
    price: 500,
    desc: "Live chat with certified agronomists + 3 on-field farm visits per year.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
];

const FREE_FEATURES = [
  "Soil Moisture Dashboard",
  "Basic Field Monitoring",
  "5 Crop Scans / month",
  "2 AI Recommendations / month",
  "Full Bhoomi Scan History",
  "Basic Weather Forecast",
  "Rainfall Overview",
  "Manual Irrigation Logs",
  "Community Support",
];

const YEARLY_BUNDLE = {
  total: 6200,
  monthly: 6200 / 12,
  savings: (20 + 100 + 200 + 500) * 12 - 6200,
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

/* ──── Page ─────────────────────────────────────────────────────────── */
export default function SubscriptionPage() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [yearly, setYearly] = useState(false);

  const toggleModule = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectedModules = MODULES.filter((m) => selected.has(m.id));
  const monthlyTotal = selectedModules.reduce((s, m) => s + m.price, 0);
  const yearlyTotal = yearly ? monthlyTotal * 12 : 0;
  const isAllSelected = MODULES.every((m) => selected.has(m.id));
  const isMultiSelected = selectedModules.length >= 2 && !isAllSelected;
  const multiDiscountRate = selectedModules.length === 2 ? 0.18 : selectedModules.length === 3 ? 0.19 : 0.20;
  const multiDiscount = isMultiSelected ? Math.round(yearly ? yearlyTotal * multiDiscountRate : monthlyTotal * multiDiscountRate) : 0;
  const finalMonthly = isMultiSelected ? monthlyTotal - multiDiscount : monthlyTotal;
  const finalYearly = isMultiSelected ? yearlyTotal - multiDiscount : yearlyTotal;

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-6">

        {/* Header */}
        <motion.div variants={item}>
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="text-center space-y-1">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Build Your Plan</h1>
            <p className="text-muted-foreground text-sm">Pick only what your farm needs</p>
          </div>
        </motion.div>

        {/* Monthly / Yearly toggle */}
        <motion.div variants={item}>
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 bg-muted rounded-full p-1">
              <button
                onClick={() => setYearly(false)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${!yearly ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${yearly ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                Yearly
                <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Save more</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Free plan reminder */}
        <motion.div variants={item}>
          <div className="rounded-2xl p-4 border border-border/60 bg-muted/30">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Free Plan Includes</p>
            <div className="flex flex-wrap gap-2">
              {FREE_FEATURES.map((f) => (
                <span key={f} className="text-[11px] bg-white/80 border border-border/50 rounded-full px-2.5 py-1 text-muted-foreground">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Module Cards */}
        <motion.div variants={item} className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Premium Modules</p>
          {MODULES.map((mod) => {
            const isOn = selected.has(mod.id);
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleModule(mod.id)}
                className={`rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                  isOn
                    ? `border-transparent shadow-md`
                    : "border-border/50 bg-card hover:border-border"
                }`}
                style={isOn ? {
                  background: `linear-gradient(135deg, hsl(142 30% 97%) 0%, hsl(196 25% 97%) 100%)`,
                  borderColor: "hsl(170 30% 85%)",
                } : {}}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${mod.bg} border ${mod.border}`}>
                    <Icon className={`h-5 w-5 ${mod.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-foreground">{mod.name}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-foreground">₹{yearly ? mod.price * 12 : mod.price}{yearly ? "/yr" : "/mo"}</span>
                        {isOn ? (
                          <ToggleRight className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">{mod.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Yearly Pro Bundle (when all selected) */}
        <AnimatePresence>
          {isAllSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="rounded-2xl p-5 border-2 border-emerald-300 shadow-md"
                style={{ background: "linear-gradient(135deg, hsl(142 40% 96%) 0%, hsl(170 35% 95%) 100%)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Yearly AgroLens Pro Bundle</p>
                    <p className="text-[11px] text-emerald-700 font-semibold">Best value — includes everything</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center bg-white/70 rounded-xl p-2 border border-emerald-100">
                    <p className="text-lg font-bold text-foreground">₹{YEARLY_BUNDLE.total}</p>
                    <p className="text-[10px] text-muted-foreground">per year</p>
                  </div>
                  <div className="text-center bg-white/70 rounded-xl p-2 border border-emerald-100">
                    <p className="text-lg font-bold text-emerald-600">₹{Math.round(YEARLY_BUNDLE.monthly)}</p>
                    <p className="text-[10px] text-muted-foreground">per month</p>
                  </div>
                  <div className="text-center bg-emerald-50 rounded-xl p-2 border border-emerald-200">
                    <p className="text-lg font-bold text-emerald-600">₹{YEARLY_BUNDLE.savings}</p>
                    <p className="text-[10px] text-emerald-700">saved / yr</p>
                  </div>
                </div>
                <Button
                  className="w-full h-12 rounded-xl font-bold text-white border-0 shadow-md"
                  style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
                  onClick={() => navigate("/checkout")}
                >
                  <Star className="h-4 w-4" /> Get Pro Bundle — ₹{YEARLY_BUNDLE.total}/yr
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multi-module discount banner */}
        <AnimatePresence>
          {isMultiSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl p-4 border-2 border-emerald-300 shadow-sm"
                style={{ background: "linear-gradient(135deg, hsl(142 40% 96%) 0%, hsl(170 35% 95%) 100%)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-bold text-foreground">Bundle Discount Applied</p>
                  <span className="ml-auto text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Save {Math.round(multiDiscountRate * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Original price</span>
                  <span className="line-through text-muted-foreground">₹{yearly ? yearlyTotal : monthlyTotal}{yearly ? "/yr" : "/mo"}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Discount ({Math.round(multiDiscountRate * 100)}% off)</span>
                  <span className="text-emerald-600 font-semibold">-₹{multiDiscount}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-foreground">Final price</span>
                  <span className="text-emerald-700">₹{yearly ? finalYearly : finalMonthly}{yearly ? "/yr" : "/mo"}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Price summary */}
        <motion.div variants={item}>
          <div className="rounded-2xl p-4 border border-border/60 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-muted-foreground">Your Plan Total</p>
              <p className="text-2xl font-bold text-foreground">₹{yearly ? finalYearly : finalMonthly}<span className="text-sm text-muted-foreground font-normal">{yearly ? "/yr" : "/mo"}</span></p>
            </div>
            {selectedModules.length > 0 && (
              <div className="space-y-1 mb-3">
                {selectedModules.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{m.name}</span>
                    <span className="font-semibold text-foreground">₹{yearly ? m.price * 12 : m.price}{yearly ? "/yr" : "/mo"}</span>
                  </div>
                ))}
                {isMultiSelected && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/30">
                    <span className="text-emerald-600 font-semibold">Bundle discount ({Math.round(multiDiscountRate * 100)}%)</span>
                    <span className="text-emerald-600 font-semibold">-₹{multiDiscount}</span>
                  </div>
                )}
              </div>
            )}
            <Button
              className="w-full h-12 rounded-xl font-bold gap-2"
              disabled={selectedModules.length === 0}
              onClick={() => navigate("/checkout")}
            >
              <ArrowRight className="h-4 w-4" />
              {selectedModules.length === 0 ? "Select at least one module" : `Continue — ₹${yearly ? finalYearly : finalMonthly}${yearly ? "/yr" : "/mo"}`}
            </Button>
          </div>
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}
