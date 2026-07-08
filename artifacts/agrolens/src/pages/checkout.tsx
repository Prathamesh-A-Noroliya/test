import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  ChevronLeft, CreditCard, Smartphone, Wallet,
  Lock, CheckCircle2, Leaf, ChevronRight, Shield,
  Star, Sparkles,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

/* ─── Payment method types ───────────────────────────── */

type Method = "upi" | "card" | "wallet";

const PAYMENT_METHODS: Array<{ id: Method; label: string; icon: React.ElementType; sub: string }> = [
  { id: "upi",    label: "UPI",                  icon: Smartphone, sub: "GPay, PhonePe, Paytm, BHIM" },
  { id: "card",   label: "Credit / Debit Card",   icon: CreditCard, sub: "Visa, Mastercard, RuPay"    },
  { id: "wallet", label: "Mobile Wallet",          icon: Wallet,     sub: "Paytm, Amazon Pay, Mobikwik" },
];

const UPI_APPS = [
  { name: "GPay",    emoji: "🅶" },
  { name: "PhonePe", emoji: "🟣" },
  { name: "Paytm",   emoji: "🔵" },
  { name: "BHIM",    emoji: "🇮🇳" },
];

const WALLETS = [
  { name: "Paytm Wallet",  emoji: "💙" },
  { name: "Amazon Pay",    emoji: "🟠" },
  { name: "Mobikwik",      emoji: "💛" },
  { name: "FreeCharge",    emoji: "🟢" },
];

/* ─── Updated pricing ────────────────────────────────── */

const ORDER_SUMMARY = {
  plan:    "AgroLens Pro — Yearly",
  price:   "₹849",
  per:     "₹70.75/month",
  trial:   "7 days free",
  saving:  "Saving ₹99 vs monthly",
};

/* ─── Success Modal ──────────────────────────────────── */

function SuccessModal({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="bg-card rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
          className="relative w-24 h-24 mx-auto"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary"
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
                x: Math.cos((i * 60 * Math.PI) / 180) * 44,
                y: Math.sin((i * 60 * Math.PI) / 180) * 44,
              }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }}
              style={{ top: "50%", left: "50%", marginLeft: -4, marginTop: -4 }}
            />
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-bold text-foreground mb-1">{t("checkout.success")}</h2>
          <p className="text-muted-foreground text-sm">{t("checkout.welcomePro")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-left space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("checkout.plan")}</span>
            <span className="font-semibold text-foreground">AgroLens Pro Yearly</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("checkout.amountPaid")}</span>
            <span className="font-bold text-foreground">₹849</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("checkout.validUntil")}</span>
            <span className="font-semibold text-foreground">Apr 9, 2027</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("checkout.transactionId")}</span>
            <span className="font-mono text-xs text-muted-foreground">TXN{Date.now().toString().slice(-8)}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="space-y-2">
          <Button className="w-full rounded-xl h-11 font-semibold gap-2" onClick={() => navigate("/dashboard")}>
            <Sparkles className="h-4 w-4" /> {t("checkout.goToDashboard")}
          </Button>
          <button className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={onClose}>
            {t("common.close")}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Checkout Page ──────────────────────────────────── */

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [method, setMethod] = useState<Method>("upi");
  const [selectedUpi, setSelectedUpi] = useState("GPay");
  const [selectedWallet, setSelectedWallet] = useState("Paytm Wallet");
  const [upiId, setUpiId] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const canPay =
    (method === "upi" && upiId.includes("@")) ||
    (method === "card" && cardNum.replace(/\s/g, "").length === 16 && cardName && cardExpiry.length === 5 && cardCvv.length === 3) ||
    method === "wallet";

  const handlePay = async () => {
    if (!canPay) return;
    setPaying(true);
    await new Promise((r) => setTimeout(r, 2200));
    setPaying(false);
    setSuccess(true);
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate("/subscription")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
            <ChevronLeft className="h-4 w-4" /> {t("checkout.backToPlans")}
          </button>
          <h1 className="text-2xl font-bold text-foreground">{t("checkout.secureCheckout")}</h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Lock className="h-3.5 w-3.5 text-emerald-500" />
            {t("checkout.ssl")}
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="rounded-2xl border-border/60 shadow-sm bg-gradient-to-br from-primary/5 to-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{ORDER_SUMMARY.plan}</p>
                    <p className="text-xs text-muted-foreground">{ORDER_SUMMARY.per} · {ORDER_SUMMARY.trial}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{ORDER_SUMMARY.price}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">{ORDER_SUMMARY.saving}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Method Selector */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t("checkout.paymentMethod")}</p>
          <div className="space-y-2">
            {PAYMENT_METHODS.map(({ id, label, icon: Icon, sub }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-150",
                  method === id ? "border-primary bg-primary/5" : "border-border/60 bg-card hover:border-primary/40"
                )}
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", method === id ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0", method === id ? "border-primary bg-primary" : "border-border/60")}>
                  {method === id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Payment Form */}
        <AnimatePresence mode="wait">
          {method === "upi" && (
            <motion.div key="upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Select UPI App</p>
                  <div className="grid grid-cols-4 gap-2">
                    {UPI_APPS.map(({ name, emoji }) => (
                      <button
                        key={name}
                        onClick={() => setSelectedUpi(name)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all text-center",
                          selectedUpi === name ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/30"
                        )}
                      >
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-[10px] font-semibold text-foreground">{name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Or enter UPI ID</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="yourname@upi"
                        className="h-11 rounded-xl flex-1"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                      <Button variant="outline" className="h-11 rounded-xl px-4 text-sm font-medium shrink-0">
                        Verify
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">You'll receive a collect request on your UPI app.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {method === "card" && (
            <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Card Details</p>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Card Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="0000 0000 0000 0000"
                        className="h-11 rounded-xl pl-10 font-mono"
                        value={cardNum}
                        onChange={(e) => setCardNum(formatCard(e.target.value))}
                        maxLength={19}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Name on Card</Label>
                    <Input
                      placeholder="RAMESH PATIL"
                      className="h-11 rounded-xl uppercase"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Expiry</Label>
                      <Input
                        placeholder="MM/YY"
                        className="h-11 rounded-xl font-mono"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">CVV</Label>
                      <div className="relative">
                        <Input
                          placeholder="•••"
                          type="password"
                          className="h-11 rounded-xl font-mono"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          maxLength={3}
                        />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-xl px-3 py-2">
                    <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Your card details are encrypted and never stored on our servers.
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {method === "wallet" && (
            <motion.div key="wallet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Choose Wallet</p>
                  <div className="grid grid-cols-2 gap-2">
                    {WALLETS.map(({ name, emoji }) => (
                      <button
                        key={name}
                        onClick={() => setSelectedWallet(name)}
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left",
                          selectedWallet === name ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/30"
                        )}
                      >
                        <span className="text-xl">{emoji}</span>
                        <span className="text-sm font-semibold text-foreground">{name}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">You will be redirected to the {selectedWallet} app to complete payment.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pay Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="pb-6 space-y-3">
          <Button
            className="w-full h-13 rounded-xl font-bold text-base gap-2 shadow-md"
            size="lg"
            onClick={handlePay}
            disabled={!canPay || paying}
          >
            {paying ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                {t("checkout.processing")}
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                {t("checkout.paySecurely")}
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1"><Shield className="h-3 w-3 text-emerald-500" /> Secure</div>
            <div className="flex items-center gap-1"><Lock className="h-3 w-3 text-blue-500" /> Encrypted</div>
            <div className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> PCI-DSS compliant</div>
          </div>
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {success && <SuccessModal onClose={() => setSuccess(false)} />}
      </AnimatePresence>
    </AppLayout>
  );
}
