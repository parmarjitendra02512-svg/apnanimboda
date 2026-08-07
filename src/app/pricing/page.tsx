"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      priceMonthly: 0,
      priceYearly: 0,
      description: "Perfect for exploring the platform.",
      features: [
        "Basic Directory Access",
        "5 AI Chats / Day",
        "Read Public Notices",
        "Basic Profile",
      ],
      missing: [
        "Priority Support",
        "No Ads",
        "Business Listings",
        "Custom Integrations",
      ],
      buttonText: "Get Started",
      popular: false,
      colors: "from-slate-600/20 to-slate-800/20 border-slate-500/30",
    },
    {
      name: "Pro",
      priceMonthly: 199,
      priceYearly: 1990, // 2 months free
      description: "For active villagers & students.",
      features: [
        "Full Directory Access",
        "Unlimited AI Chats",
        "Post Notices",
        "Verified Badge",
        "No Ads",
      ],
      missing: ["Business Listings", "Custom Integrations"],
      buttonText: "Upgrade to Pro",
      popular: true,
      colors:
        "from-blue-600/20 to-purple-600/20 border-blue-500/50 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
    },
    {
      name: "Business",
      priceMonthly: 499,
      priceYearly: 4990,
      description: "For local shops and merchants.",
      features: [
        "Everything in Pro",
        "Business Listing",
        "Promoted Posts",
        "Customer Insights",
        "Priority Support",
      ],
      missing: ["Custom Integrations"],
      buttonText: "Grow Business",
      popular: false,
      colors: "from-amber-600/20 to-orange-600/20 border-amber-500/30",
    },
    {
      name: "Enterprise",
      priceMonthly: 999,
      priceYearly: 9990,
      description: "For institutions and large teams.",
      features: [
        "Everything in Business",
        "Custom Integrations",
        "Dedicated Account Manager",
        "API Access",
        "24/7 Phone Support",
      ],
      missing: [],
      buttonText: "Contact Sales",
      popular: false,
      colors: "from-emerald-600/20 to-teal-600/20 border-emerald-500/30",
    },
  ];

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Link href="/">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 mx-auto">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-300 mb-10"
          >
            Choose the perfect plan for your needs. No hidden fees.
          </motion.p>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <span
              className={`text-sm font-semibold ${!isYearly ? "text-white" : "text-slate-400"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-16 h-8 rounded-full bg-white/10 border border-white/20 transition-colors focus:outline-none"
            >
              <motion.div
                animate={{ x: isYearly ? 32 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 left-0 w-6 h-6 rounded-full bg-blue-500 shadow-lg"
              />
            </button>
            <span
              className={`text-sm font-semibold flex items-center gap-2 ${isYearly ? "text-white" : "text-slate-400"}`}
            >
              Yearly{" "}
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                Save 16%
              </span>
            </span>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`glass-card rounded-3xl p-8 relative flex flex-col border ${plan.colors} ${plan.popular ? "scale-105 lg:scale-110 z-10" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-400 text-sm h-10">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  ₹{isYearly ? plan.priceYearly : plan.priceMonthly}
                </span>
                <span className="text-slate-400 font-medium">
                  /{isYearly ? "year" : "month"}
                </span>
              </div>

              <Link href="/register" className="mb-8 mt-auto">
                <button
                  className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </Link>

              <div className="space-y-4 flex-1">
                <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
                  What's included
                </p>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-slate-200 text-sm">{feature}</span>
                  </div>
                ))}
                {plan.missing.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 opacity-50"
                  >
                    <X className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="text-slate-400 text-sm line-through">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section or Trust Badges could go here */}
        <div className="mt-24 text-center">
          <p className="text-slate-400 text-sm">
            Need a custom plan?{" "}
            <Link href="/contact" className="text-blue-400 hover:underline">
              Contact our sales team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
