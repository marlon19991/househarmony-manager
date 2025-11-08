import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.9.0?target=deno";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const DEFAULT_PRICE_ID = Deno.env.get("STRIPE_PRICE_ID");
const DEFAULT_SUCCESS_URL = Deno.env.get("STRIPE_CHECKOUT_SUCCESS_URL");
const DEFAULT_CANCEL_URL = Deno.env.get("STRIPE_CHECKOUT_CANCEL_URL");

if (!STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});

type CheckoutRequest = {
  priceId?: string;
  planId?: string;
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = (await req.json()) as CheckoutRequest;
    const priceId = body.priceId ?? DEFAULT_PRICE_ID;
    const successUrl = body.successUrl ?? DEFAULT_SUCCESS_URL;
    const cancelUrl = body.cancelUrl ?? DEFAULT_CANCEL_URL;
    const planId = body.planId ?? "pro";

    if (!priceId || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: "Missing priceId, successUrl or cancelUrl" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: body.customerEmail,
      metadata: {
        source: "househarmony",
        planId,
        priceId,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: "Unable to create checkout session" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
