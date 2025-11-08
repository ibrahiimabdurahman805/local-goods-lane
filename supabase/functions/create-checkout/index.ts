import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user?.email) {
      throw new Error("User not authenticated");
    }

    // Parse request body
    const { orderId, items } = await req.json();
    
    if (!orderId || !items || items.length === 0) {
      throw new Error("Invalid request data");
    }

    // Verify UUID format for orderId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      throw new Error("Invalid order ID format");
    }

    // Validate items array
    if (items.length > 100) {
      throw new Error("Too many items in order");
    }

    for (const item of items) {
      if (!item.name || typeof item.name !== 'string' || item.name.length > 200) {
        throw new Error("Invalid item name");
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        throw new Error("Invalid item price");
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error("Invalid item quantity");
      }
    }

    // Verify order ownership - user must own this order
    const { data: orderData, error: orderError } = await supabaseClient
      .from("orders")
      .select("customer_id, status")
      .eq("id", orderId)
      .single();

    if (orderError || !orderData) {
      throw new Error("Order not found");
    }

    if (orderData.customer_id !== user.id) {
      throw new Error("Unauthorized: You don't own this order");
    }

    if (orderData.status !== "pending") {
      throw new Error("Order cannot be processed - invalid status");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "kes",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${req.headers.get("origin")}/payment-failed?order_id=${orderId}`,
      metadata: {
        order_id: orderId,
        user_id: user.id,
      },
    });

    // Update order with payment intent ID
    await supabaseClient
      .from("orders")
      .update({ payment_intent_id: session.id })
      .eq("id", orderId);

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
