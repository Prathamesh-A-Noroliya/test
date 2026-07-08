import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, ShieldCheck, Leaf, Camera, MapPin, Phone,
  Mail, CreditCard, Sparkles, CheckCircle2, Lock,
  Edit3, BadgeCheck, Tractor, BarChart3, Crown,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

/* ─── Animation Variants ──────────────────────────────── */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" as const } },
};

/* ─── Stat Pill ──────────────────────────────────────── */

function StatPill({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 bg-muted/60 rounded-2xl p-3">
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", color)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-base font-black text-foreground leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground font-medium leading-none text-center">{label}</p>
    </div>
  );
}

/* ─── Info Row ───────────────────────────────────────── */

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType; label: string; value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-foreground capitalize truncate">{value}</p>
      </div>
    </div>
  );
}

/* ─── Premium Toggle ─────────────────────────────────── */

function PremiumToggle({ isPremium, onToggle }: { isPremium: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0",
        isPremium ? "bg-primary" : "bg-muted-foreground/30"
      )}
      role="switch"
      aria-checked={isPremium}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 35 }}
        className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md",
          isPremium ? "left-[calc(100%-1.375rem)]" : "left-0.5"
        )}
      />
    </button>
  );
}

/* ─── Profile Page ───────────────────────────────────── */

export default function ProfilePage() {
  const { user, togglePremium } = useAuth();
  const [, navigate] = useLocation();
  const [editMode, setEditMode] = useState(false);

  if (!user) return null;

  const isPremium = user.isPremium;

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">

        {/* Page title */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Farmer Profile</h1>
            <p className="text-sm text-muted-foreground">Your account details and settings</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl text-xs"
            onClick={() => setEditMode((v) => !v)}
          >
            <Edit3 className="h-3.5 w-3.5" />
            {editMode ? "Done" : "Edit"}
          </Button>
        </motion.div>

        {/* Profile Hero Card */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            {/* Green header strip */}
            <div className="h-24 bg-gradient-to-r from-emerald-500 via-primary to-emerald-700 relative">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute top-3 right-4">
                {isPremium ? (
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-bold text-white">
                    <Crown className="h-3.5 w-3.5 text-amber-300" />
                    AgroLens Pro
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-white/80">
                    Free Plan
                  </div>
                )}
              </div>
            </div>

            <CardContent className="px-5 pb-5 pt-0">
              {/* Avatar + Name */}
              <div className="flex items-end gap-4 -mt-7 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/80 to-primary border-3 border-white shadow-md flex items-center justify-center text-white text-2xl font-black">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  {isPremium && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="pb-1 flex-1 min-w-0">
                  <h2 className="text-lg font-black text-foreground leading-tight truncate">{user.fullName}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{user.farmerId}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                <StatPill icon={Camera}   label="Total Scans"  value="24"            color="bg-blue-500"    />
                <StatPill icon={Leaf}     label="Crop Type"    value={user.cropType.slice(0,6)} color="bg-emerald-500" />
                <StatPill icon={MapPin}   label="Region"       value={user.state.slice(0,6)}    color="bg-violet-500"  />
                <StatPill icon={BarChart3} label="Health Score" value="87%"          color="bg-amber-500"   />
              </div>

              {/* Info rows */}
              <div>
                <InfoRow icon={User}       label="Full Name"  value={user.fullName}  />
                <InfoRow icon={Mail}       label="Email"      value={user.email}     />
                <InfoRow icon={Phone}      label="Mobile"     value={user.mobile}    />
                <InfoRow icon={MapPin}     label="State"      value={user.state}     />
                <InfoRow icon={Leaf}       label="Crop Type"  value={user.cropType}  />
                <InfoRow icon={Tractor}    label="Soil Type"  value={user.soilType}  />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Aadhaar Verification Card */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="pt-5 px-5 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <BadgeCheck className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-sm font-bold text-foreground">Identity Verification</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-4 space-y-3">
              {/* Aadhaar Verified */}
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Aadhaar Verified</p>
                    <p className="text-xs text-muted-foreground">XXXX XXXX {user.id === "demo" ? "0000" : "7842"}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              </div>

              {/* PM-Kisan Linked */}
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">PM-Kisan Linked</p>
                    <p className="text-xs text-muted-foreground">Beneficiary ID · {user.farmerId}</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] font-bold gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </Badge>
              </div>

              {/* KYC Status */}
              <div className="flex items-center justify-between p-3 bg-muted/60 border border-border/60 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Bank KYC</p>
                    <p className="text-xs text-muted-foreground">Required for subsidy disbursement</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-7 rounded-lg px-3">
                  Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Active Subscription Toggle — DEV TOOL ──── */}
        <motion.div variants={item}>
          <Card className={cn(
            "rounded-2xl shadow-sm overflow-hidden border-2 transition-all duration-300",
            isPremium ? "border-primary/40 bg-gradient-to-br from-emerald-50/50 to-background" : "border-border/60"
          )}>
            <CardHeader className="pt-5 px-5 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors", isPremium ? "bg-primary" : "bg-muted")}>
                  <Sparkles className={cn("h-3.5 w-3.5", isPremium ? "text-white" : "text-muted-foreground")} />
                </div>
                <CardTitle className="text-sm font-bold text-foreground">Subscription Status</CardTitle>
                <Badge className="ml-auto text-[10px] bg-blue-100 text-blue-700 border-blue-200 font-semibold">
                  Dev Toggle
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-4 space-y-4">
              {/* Current plan display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border",
                    isPremium ? "bg-amber-50 border-amber-200" : "bg-muted border-border"
                  )}>
                    {isPremium
                      ? <Crown className="h-6 w-6 text-amber-500" />
                      : <Lock className="h-6 w-6 text-muted-foreground" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {isPremium ? "AgroLens Pro" : "Free Plan"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isPremium ? "All premium features unlocked" : "Limited features only"}
                    </p>
                  </div>
                </div>
                <PremiumToggle isPremium={isPremium} onToggle={togglePremium} />
              </div>

              {/* What's gated by this toggle */}
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Premium Features — Toggle to test
                </p>
                {[
                  { icon: CheckCircle2, label: "Full BHOOMI Treatment Protocol", key: "treatment" },
                  { icon: User,         label: "Consult an Agri-Expert (on Scan Result)", key: "expert" },
                  { icon: BarChart3,    label: "Historical Disease Analytics", key: "analytics" },
                  { icon: Sparkles,     label: "BHOOMI Voice Assistant", key: "voice" },
                ].map(({ icon: Icon, label, key }) => (
                  <div key={key} className="flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      {isPremium ? (
                        <motion.div key="on" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                        </motion.div>
                      ) : (
                        <motion.div key="off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <span className={cn("text-xs", isPremium ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Status indicator */}
              <div className={cn(
                "flex items-center gap-2 rounded-xl p-3 transition-all",
                isPremium ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"
              )}>
                <div className={cn("w-2 h-2 rounded-full shrink-0", isPremium ? "bg-emerald-500 animate-pulse" : "bg-amber-400")} />
                <p className={cn("text-xs font-medium", isPremium ? "text-emerald-700" : "text-amber-700")}>
                  {isPremium
                    ? "Premium active — Expert Help is now visible on the Scan Result page"
                    : "Tap the toggle above to simulate a Pro subscription and test gated features"
                  }
                </p>
              </div>

              {!isPremium && (
                <Button
                  className="w-full rounded-xl h-10 text-sm font-semibold gap-2"
                  onClick={() => navigate("/subscription")}
                >
                  <Crown className="h-4 w-4" /> View Real Plans
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger zone */}
        <motion.div variants={item} className="pb-4">
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Account Settings</p>
                <p className="text-xs text-muted-foreground">Privacy, notifications, data export</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                Manage
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
