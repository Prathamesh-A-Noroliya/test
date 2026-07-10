/* ─── AgroLens Pricing Configuration ───
 * Single source of truth for all product prices.
 * ──────────────────────────────────────────── */

export type BillingType = "monthly" | "yearly" | "onetime";

export interface Plan {
  id: string;
  name: string;
  desc: string;
  monthlyPrice: number;
  yearlyPrice: number;
  onetimePrice: number;
  billingType: BillingType;
  iconName: string;
  color: string;
  bg: string;
  border: string;
  text: string;
}

export const PLANS: Record<string, Plan> = {
  irrigation: {
    id: "irrigation",
    name: "Automated Irrigation",
    desc: "Smart soil moisture monitoring, auto-irrigation scheduling, and water usage analytics.",
    monthlyPrice: 29,
    yearlyPrice: 299,
    onetimePrice: 0,
    billingType: "monthly",
    iconName: "Droplets",
    color: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
  },
  scans: {
    id: "scans",
    name: "Unlimited Crop Scans",
    desc: "Unlimited AI disease detection scans with full treatment protocols and expert reports.",
    monthlyPrice: 29,
    yearlyPrice: 299,
    onetimePrice: 0,
    billingType: "monthly",
    iconName: "Camera",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
  },
  ai: {
    id: "ai",
    name: "AI Treatment Plans",
    desc: "Personalised 10-day treatment schedules, fertiliser plans, organic alternatives, and charts.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    onetimePrice: 99,
    billingType: "onetime",
    iconName: "BrainCircuit",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  expert: {
    id: "expert",
    name: "Expert Help",
    desc: "Live chat with certified agronomists until your problem is fully resolved.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    onetimePrice: 299,
    billingType: "onetime",
    iconName: "Users",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
};

export const PLAN_ORDER = ["irrigation", "scans", "ai", "expert"] as const;

export function getPrice(plan: Plan, billing: "monthly" | "yearly"): number {
  if (plan.billingType === "onetime") return plan.onetimePrice;
  return billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
}

export function getPriceLabel(plan: Plan, billing: "monthly" | "yearly"): string {
  if (plan.billingType === "onetime") return `₹${plan.onetimePrice} one-time`;
  const price = getPrice(plan, billing);
  return billing === "yearly" ? `₹${price}/year` : `₹${price}/month`;
}

export function getSavings(plan: Plan): number {
  if (plan.billingType === "onetime" || plan.monthlyPrice === 0) return 0;
  return plan.monthlyPrice * 12 - plan.yearlyPrice;
}

export function getYearlySavingsLabel(plan: Plan): string {
  const savings = getSavings(plan);
  if (savings <= 0) return "";
  return `Save ₹${savings}`;
}

export const FREE_FEATURES = [
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

/* ─── Checkout helpers ─────────────────────────────── */

export interface CartItem {
  planId: string;
  billing: "monthly" | "yearly";
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const plan = PLANS[item.planId];
    if (!plan) return sum;
    return sum + getPrice(plan, item.billing);
  }, 0);
}

export function cartBreakdown(items: CartItem[]): Array<{ name: string; price: number; label: string }> {
  return items.map((item) => {
    const plan = PLANS[item.planId];
    if (!plan) return { name: "Unknown", price: 0, label: "" };
    return {
      name: plan.name,
      price: getPrice(plan, item.billing),
      label: getPriceLabel(plan, item.billing),
    };
  });
}
