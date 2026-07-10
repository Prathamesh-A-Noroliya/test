import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  CheckCircle2, Star, Droplets, Camera, BrainCircuit,
  Users, ArrowRight, ChevronLeft, Sparkles, ToggleLeft, ToggleRight,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { PLANS, PLAN_ORDER, getPrice, getPriceLabel, getYearlySavingsLabel, FREE_FEATURES } from "@/lib/pricing";

const ICON_MAP: Record<string, React.ElementType> = {
  Droplets, Camera, BrainCircuit, Users,
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

/* ─── Yearly bundle calculation ──────────────────────────────────────── */
function yearlyTotal(selected: Set<string>): number {
  return Array.from(selected).reduce((sum, id) => {
    const p = PLANS[id];
    return sum + (p ? getPrice(p, "yearly") : 0);
  }, 0);
}
function monthlyTotal(selected: Set<string>): number {
  return Array.from(selected).reduce((sum, id) => {
    const p = PLANS[id];
    return sum + (p ? getPrice(p, "monthly") : 0);
  }, 0);
}

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

  const selectedIds = Array.from(selected);
  const subTotal = yearly ? yearlyTotal(selected) : monthlyTotal(selected);
  const isAllSelected = selectedIds.length === PLAN_ORDER.length;
  const isMultiSelected = selectedIds.length >= 2 && !isAllSelected;

  /* bundle discount: 2 = 10%, 3 = 12%, 4 = 15% */
  const multiDiscountRate = selectedIds.length === 2 ? 0.10 : selectedIds.length === 3 ? 0.12 : selectedIds.length >= 4 ? 0.15 : 0;
  const multiDiscount = isMultiSelected ? Math.round(subTotal * multiDiscountRate) : 0;
  const finalTotal = subTotal - multiDiscount;

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
          {PLAN_ORDER.map((key) => {
            const mod = PLANS[key];
            const Icon = ICON_MAP[mod.iconName] || Star;
            const isOn = selected.has(mod.id);
            const isRecurring = mod.billingType === "monthly";
            const priceLabel = getPriceLabel(mod, yearly ? "yearly" : "monthly");
            const savings = yearly && isRecurring ? getYearlySavingsLabel(mod) : "";

            return (
              <motion.div
                key={mod.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleModule(mod.id)}
                className="rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200"
                style={isOn ? {
                  background: "linear-gradient(135deg, hsl(142 30% 97%) 0%, hsl(196 25% 97%) 100%)",
                  borderColor: "hsl(170 30% 85%)",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                } : {
                  borderColor: "rgba(0,0,0,0.08)",
                  background: "var(--card)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${mod.bg} border ${mod.border}`}>
                    <Icon className={`h-5 w-5 ${mod.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">{mod.name}</p>
                        {!isRecurring && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-semibold">One-Time Purchase</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-bold text-foreground">{priceLabel}</span>
                          {savings && <p className="text-[10px] text-emerald-600 font-semibold">{savings}</p>}
                        </div>
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

        {/* All-Selected Pro Bundle banner */}
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
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center bg-white/70 rounded-xl p-2 border border-emerald-100">
                    <p className="text-lg font-bold text-foreground">₹{yearlyTotal(selected)}</p>
                    <p className="text-[10px] text-muted-foreground">per year</p>
                  </div>
                  <div className="text-center bg-emerald-50 rounded-xl p-2 border border-emerald-200">
                    <p className="text-lg font-bold text-emerald-600">₹{Math.round(yearlyTotal(selected) / 12)}</p>
                    <p className="text-[10px] text-emerald-700">per month</p>
                  </div>
                </div>
                <Button
                  className="w-full h-12 rounded-xl font-bold text-white border-0 shadow-md"
                  style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
                  onClick={() => navigate("/checkout")}
                >
                  <Star className="h-4 w-4" /> Get Pro Bundle — ₹{yearlyTotal(selected)}/yr
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
                  <span className="line-through text-muted-foreground">₹{subTotal}{yearly ? "/yr" : "/mo"}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Discount ({Math.round(multiDiscountRate * 100)}% off)</span>
                  <span className="text-emerald-600 font-semibold">-₹{multiDiscount}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-foreground">Final price</span>
                  <span className="text-emerald-700">₹{finalTotal}{yearly ? "/yr" : "/mo"}</span>
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
              <p className="text-2xl font-bold text-foreground">₹{finalTotal}<span className="text-sm text-muted-foreground font-normal">{yearly ? "/yr" : "/mo"}</span></p>
            </div>
            {selectedIds.length > 0 && (
              <div className="space-y-1 mb-3">
                {selectedIds.map((id) => {
                  const p = PLANS[id];
                  if (!p) return null;
                  const label = getPriceLabel(p, yearly ? "yearly" : "monthly");
                  return (
                    <div key={id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{p.name}</span>
                      <span className="font-semibold text-foreground">{label}</span>
                    </div>
                  );
                })}
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
              disabled={selectedIds.length === 0}
              onClick={() => navigate("/checkout")}
            >
              <ArrowRight className="h-4 w-4" />
              {selectedIds.length === 0 ? "Select at least one module" : `Continue — ₹${finalTotal}${yearly ? "/yr" : "/mo"}`}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
