import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="text-center space-y-3">
        <p className="text-primary/80 text-sm font-semibold tracking-wide uppercase">
          Planes & Suscripciones
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Escala la organización de tu casa
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          Automatiza recordatorios, comparte gastos y mantén a todos alineados en tus tareas recurrentes.
        </p>
        {successMessage && (
          <div className="text-sm rounded-md bg-emerald-50 px-4 py-2 text-emerald-700">
            {successMessage}
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col justify-between p-6 ${plan.highlighted ? "border-primary shadow-lg" : ""}`}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                  {plan.highlighted ? "Más popular" : "Plan"}
                </p>
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              <div className="text-3xl font-bold">{plan.priceLabel}</div>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              className="mt-6"
              disabled={loadingPlan === plan.id}
              onClick={() => handleSubscribe(plan)}
            >
              {loadingPlan === plan.id ? "Redirigiendo..." : "Suscribirme"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
