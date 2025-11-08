import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.9.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  throw new Error("Missing Stripe environment variables");
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase service role environment variables");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PLAN_MAP: Record<string, string> = {
  [Deno.env.get("STRIPE_PRICE_ID") ?? ""]: "pro",
  [Deno.env.get("STRIPE_STARTER_PRICE_ID") ?? ""]: "starter",
};

const getCustomerEmail = async (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
) => {
  if (!customer) return "";
  if (typeof customer === "string") {
    const customerObj = await stripe.customers.retrieve(customer);
    if (!("deleted" in customerObj) && customerObj.email) {
      return customerObj.email;
    }
    return "";
  }
  if (!("deleted" in customer) && customer.email) {
    return customer.email;
  }
  return "";
};

const upsertSubscription = async ({
  email,
  customerId,
  subscriptionId,
  plan,
  status,
  currentPeriodEnd,
  metadata,
}: {
  email: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  plan: string;
  status: string;
  currentPeriodEnd?: string | null;
  metadata?: Record<string, unknown> | null;
}) => {
  if (!email) return;

  await supabase
    .from("subscriptions")
    .upsert(
      {
        email,
        stripe_customer_id: customerId ?? null,
        stripe_subscription_id: subscriptionId ?? null,
        plan,
        status,
        current_period_end: currentPeriodEnd ?? null,
        metadata: metadata ?? null,
      },
      {
        onConflict: "email,plan",
      },
    );
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email =
          session.customer_details?.email ??
          session.customer_email ??
          (await getCustomerEmail(session.customer));
        const planId =
          session.metadata?.planId ??
          PLAN_MAP[(session.metadata?.priceId as string) ?? ""] ??
          "pro";

        let status = "active";
        let currentPeriodEnd: string | null = null;

        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );
          status = subscription.status;
          currentPeriodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null;
        }

        await upsertSubscription({
          email,
          customerId: session.customer as string,
          subscriptionId: session.subscription as string,
          plan: planId,
          status,
          currentPeriodEnd,
          metadata: session.metadata ?? null,
        });

        break;
      }
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id ?? null;
        let email =
          subscription.customer_email ??
          subscription.metadata?.email ??
          "";
        if (!email) {
          email = await getCustomerEmail(subscription.customer);
        }
        const planId =
          PLAN_MAP[
            subscription.items.data[0]?.price?.id ?? ""
          ] ?? subscription.metadata?.planId ?? "pro";
        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        await upsertSubscription({
          email,
          customerId,
          subscriptionId: subscription.id,
          plan: planId,
          status: subscription.status,
          currentPeriodEnd,
          metadata: subscription.metadata ?? null,
        });
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: "Webhook handling failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
