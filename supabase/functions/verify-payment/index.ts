import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Parse request
    const { sessionId, orderId } = await req.json();
    
    if (!sessionId || !orderId) {
      throw new Error("Missing session ID or order ID");
    }

    // Validate session ID format (Stripe checkout sessions start with cs_)
    if (!sessionId.startsWith('cs_')) {
      throw new Error("Invalid session ID format");
    }

    // Validate UUID format for orderId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      throw new Error("Invalid order ID format");
    }

    // Verify order ownership and payment intent
    const { data: orderData, error: orderError } = await supabaseClient
      .from("orders")
      .select("customer_id, payment_intent_id")
      .eq("id", orderId)
      .single();

    if (orderError || !orderData) {
      throw new Error("Order not found");
    }

    if (orderData.customer_id !== user.id) {
      throw new Error("Unauthorized: You don't own this order");
    }

    if (orderData.payment_intent_id !== sessionId) {
      throw new Error("Session ID doesn't match order");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Update order status
      const { error: updateError } = await supabaseClient
        .from("orders")
        .update({
          status: "confirmed",
          payment_status: "paid",
        })
        .eq("id", orderId)
        .eq("customer_id", user.id);

      if (updateError) throw updateError;

      console.log(`Payment verified for order ${orderId}`);

      return new Response(
        JSON.stringify({ success: true, status: "paid" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, status: session.payment_status }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
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
