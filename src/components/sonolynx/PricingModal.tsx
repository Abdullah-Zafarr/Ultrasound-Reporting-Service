import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, X, Zap, Shield, Crown, ArrowRight, ExternalLink } from "lucide-react";
import type { OrganizationTier } from "@/lib/org-scope";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: OrganizationTier;
}

interface Feature {
  label: string;
  individual: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
}

const STRIPE_LINKS: Record<string, { monthly: string; yearly: string }> = {
  individual: {
    monthly: "https://buy.stripe.com/5kQ7sMeps26P2dg3cBdAk01",
    yearly: "https://buy.stripe.com/eVq4gAeps26P9FIdRfdAk05",
  },
  professional: {
    monthly: "https://buy.stripe.com/5kQ9AU0yCdPxaJM6oNdAk02",
    yearly: "https://buy.stripe.com/bJe6oIeps8vd5ps3cBdAk06",
  },
  enterprise: {
    monthly: "https://buy.stripe.com/fZu3cw1CGdPxcRUdRfdAk04",
    yearly: "https://buy.stripe.com/3cIeVe3KO12L2dgfZndAk07",
  },
};

const FEATURES: Feature[] = [
  { label: "Staff Members",        individual: "Up to 3",      professional: "Up to 15",     enterprise: "Unlimited" },
  { label: "Standard Templates",   individual: "2 templates",  professional: "5 templates",  enterprise: "All 9+ templates" },
  { label: "Custom Template Builder", individual: false,        professional: true,           enterprise: true },
  { label: "Conditional Logic Rules", individual: false,        professional: true,           enterprise: true },
  { label: "A4 Report Designer",   individual: false,          professional: true,           enterprise: true },
  { label: "Report Branding",      individual: false,          professional: true,           enterprise: true },
  { label: "6 Layout Themes",      individual: false,          professional: "3 themes",     enterprise: "All 6 themes" },
  { label: "Voice Dictation",      individual: true,           professional: true,           enterprise: true },
  { label: "HL7 / DICOM Export",   individual: false,          professional: true,           enterprise: true },
  { label: "Audit Logs",           individual: false,          professional: true,           enterprise: true },
  { label: "Priority Support",     individual: false,          professional: false,          enterprise: true },
  { label: "SLA Guarantee",        individual: false,          professional: false,          enterprise: true },
];

const PLANS: Array<{
  id: OrganizationTier;
  name: string;
  tagline: string;
  monthlyPrice: string;
  yearlyPrice: string;
  icon: React.ReactNode;
  highlight: boolean;
  badge?: string;
  gradient: string;
  iconBg: string;
  borderClass: string;
  buttonClass: string;
}> = [
  {
    id: "individual",
    name: "Individual",
    tagline: "Solo practitioners & small clinics.",
    monthlyPrice: "$99",
    yearlyPrice: "$990",
    icon: <Zap className="h-5 w-5" />,
    highlight: false,
    gradient: "from-slate-50 to-slate-100/50",
    iconBg: "bg-slate-100 text-slate-600",
    borderClass: "border-slate-200",
    buttonClass: "bg-slate-800 hover:bg-slate-700 text-white",
  },
  {
    id: "professional",
    name: "Clinic",
    tagline: "Growing radiology clinics.",
    monthlyPrice: "$299",
    yearlyPrice: "$2,990",
    icon: <Shield className="h-5 w-5" />,
    highlight: true,
    badge: "Most Popular",
    gradient: "from-blue-50 to-indigo-50",
    iconBg: "bg-blue-100 text-blue-600",
    borderClass: "border-blue-400 ring-2 ring-blue-400/30",
    buttonClass: "bg-blue-600 hover:bg-blue-500 text-white",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Hospital networks & large departments.",
    monthlyPrice: "$899",
    yearlyPrice: "$8,990",
    icon: <Crown className="h-5 w-5" />,
    highlight: false,
    badge: "Full Access",
    gradient: "from-amber-50 to-orange-50",
    iconBg: "bg-amber-100 text-amber-600",
    borderClass: "border-amber-300",
    buttonClass: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white",
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === false) {
    return <X className="h-4 w-4 text-slate-300 mx-auto" />;
  }
  if (value === true) {
    return <Check className="h-4 w-4 text-emerald-500 mx-auto" />;
  }
  return <span className="text-xs font-medium text-foreground">{value}</span>;
}

export function PricingModal({ open, onOpenChange, currentTier }: Props) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const handleBuy = (planId: OrganizationTier) => {
    const link = STRIPE_LINKS[planId]?.[billingCycle];
    if (link) {
      window.open(link, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Scale Your Radiology Workflow
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            Unlock professional reporting, custom templates, and HL7 integration.
          </DialogDescription>

          <div className="flex items-center justify-center gap-4 mt-6">
            <Label className={cn("text-sm font-medium", billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground")}>Monthly</Label>
            <Switch
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            />
            <Label className={cn("text-sm font-medium", billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground")}>
              Yearly <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Save 20%</span>
            </Label>
          </div>
        </DialogHeader>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {PLANS.map((plan) => {
            const isCurrent = currentTier === plan.id;
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-3xl border p-6 flex flex-col gap-6 transition-all duration-300 bg-gradient-to-b",
                  plan.gradient,
                  plan.borderClass,
                  plan.highlight && "shadow-xl shadow-blue-500/10 scale-[1.03] z-10",
                )}
              >
                {/* Badges */}
                <div className="flex items-start justify-between">
                  <div className={cn("p-2.5 rounded-2xl shadow-sm", plan.iconBg)}>
                    {plan.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {plan.badge && (
                      <Badge
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5",
                          plan.id === "professional" && "bg-blue-600 text-white",
                          plan.id === "enterprise" && "bg-amber-500 text-white",
                        )}
                      >
                        {plan.badge}
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge variant="outline" className="text-[10px] font-bold border-emerald-500 text-emerald-600 bg-emerald-50/50 uppercase tracking-wider px-2.5 py-0.5">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{plan.tagline}</p>
                </div>

                <div className="py-4 border-y border-slate-200/50">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">{price}</span>
                    <span className="text-sm font-medium text-slate-500">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 font-medium">
                    {billingCycle === "yearly" ? "Billed annually" : "Billed monthly"}
                  </p>
                </div>

                <Button
                  className={cn("w-full h-12 text-base font-bold gap-2.5 rounded-2xl shadow-lg transition-transform active:scale-95", plan.buttonClass)}
                  disabled={isCurrent}
                  onClick={() => handleBuy(plan.id)}
                >
                  {isCurrent ? (
                    <>
                      <Check className="h-5 w-5" /> Active Plan
                    </>
                  ) : (
                    <>
                      Upgrade Now <ExternalLink className="h-4 w-4 opacity-70" />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-12 bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-slate-50/50">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Full Feature Comparison
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50/20">
                  <th className="text-left p-4 font-semibold text-slate-600 w-1/2">Feature Capability</th>
                  <th className="text-center p-4 font-semibold w-[16%]">Individual</th>
                  <th className="text-center p-4 font-semibold w-[16%] text-blue-600">Clinic</th>
                  <th className="text-center p-4 font-semibold w-[16%] text-amber-600">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, i) => (
                  <tr key={feature.label} className={cn("border-b last:border-0 hover:bg-slate-50/50 transition-colors", i % 2 === 0 ? "bg-white" : "bg-slate-50/30")}>
                    <td className="p-4 font-medium text-slate-700">{feature.label}</td>
                    <td className="p-4 text-center">
                      <FeatureValue value={feature.individual} />
                    </td>
                    <td className="p-4 text-center bg-blue-50/10">
                      <FeatureValue value={feature.professional} />
                    </td>
                    <td className="p-4 text-center">
                      <FeatureValue value={feature.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 pb-4">
          All plans include HIPAA-compliant infrastructure, automatic backups, and end-to-end encryption. 
          Checkout is securely processed via Stripe.
        </p>
      </DialogContent>
    </Dialog>
  );
}
