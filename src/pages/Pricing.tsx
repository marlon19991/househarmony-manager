import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  priceId?: string;
  features: string[];
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    id: "pro",
    name: "Pro",
    description: "Pensado para colivings o familias grandes",
    priceLabel: "$19 / mes",
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    features: [
      "Perfiles ilimitados",
      "Automatizaciones avanzadas",
      "Prioridad en soporte",
      "Integración con reportes financieros",
    ],
    highlighted: true,
  },
  {
    id: "starter",
    name: "Starter",
    description: "Controla las tareas básicas del hogar",
    priceLabel: "$9 / mes",
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
    features: [
      "Hasta 5 perfiles",
      "Tareas recurrentes ilimitadas",
      "Notificaciones por email",
    ],
  },
];

const Pricing = () => {
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const checkoutStatus = searchParams.get("checkout");
  const successMessage = useMemo(() => {
    if (checkoutStatus === "success") {
      return "Pago exitoso 🎉 Tu suscripción está activa.";
    }
    if (checkoutStatus === "cancelled") {
      return "El proceso de pago se canceló. Puedes intentarlo de nuevo cuando quieras.";
    }
    return null;
  }, [checkoutStatus]);

  const handleSubscribe = async (plan: Plan) => {
    if (!plan.priceId) {
      toast.error("Este plan no está disponible por el momento.");
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const successUrl = `${window.location.origin}/pricing?checkout=success`;
      const cancelUrl = `${window.location.origin}/pricing?checkout=cancelled`;

      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          priceId: plan.priceId,
          planId: plan.id,
          successUrl,
          cancelUrl,
        },
      });

      if (error || !data?.url) {
        throw error || new Error("No se recibió la URL del checkout");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Error creando checkout:", error);
      toast.error("No pudimos iniciar el pago. Intenta de nuevo.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 animate-fade-in">
      <div className="text-center space-y-3">
        <p className="text-primary/80 text-sm font-semibold tracking-wide uppercase">
          Planes & Suscripciones
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
          Escala la organización de tu casa
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          Automatiza recordatorios, comparte gastos y mantén a todos alineados en tus tareas recurrentes.
        </p>
        {successMessage && (
          <div className="text-sm rounded-md bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-emerald-500">
            {successMessage}
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col justify-between p-8 rounded-2xl transition-all duration-300",
              plan.highlighted
                ? "glass-panel border-primary/50 shadow-[0_0_30px_rgba(124,58,237,0.15)] scale-105 z-10"
                : "glass-card border-white/5 hover:border-white/10"
            )}
          >
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                  {plan.highlighted ? "Más popular" : "Plan"}
                </p>
                <h2 className="text-2xl font-bold text-foreground">{plan.name}</h2>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </div>
              <div className="text-4xl font-bold text-foreground">{plan.priceLabel}</div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="p-1 rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              className={cn(
                "mt-8 w-full",
                plan.highlighted ? "glass-button" : "bg-white/5 hover:bg-white/10 text-white"
              )}
              disabled={loadingPlan === plan.id}
              onClick={() => handleSubscribe(plan)}
            >
              {loadingPlan === plan.id ? "Redirigiendo..." : "Suscribirme"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
