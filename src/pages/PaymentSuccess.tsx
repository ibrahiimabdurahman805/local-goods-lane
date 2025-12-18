import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import type { OrderWithItems } from "@/types/entities";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderWithItems | null>(null);

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !orderId) {
        toast.error("Invalid payment session");
        navigate("/");
        return;
      }

      try {
        // Verify payment with backend
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { sessionId, orderId },
        });

        if (error) throw error;

        if (data?.success) {
          // Fetch order details
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .select(
              `
              *,
              order_items (
                quantity,
                price,
                products (name, image_url)
              )
            `
            )
            .eq("id", orderId)
            .single<OrderWithItems>();

          if (orderError) throw orderError;

          setOrderDetails(order);
          toast.success("Payment successful! Your order has been confirmed.");
        } else {
          toast.error("Payment verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        const message = error instanceof Error ? error.message : "Failed to verify payment";
        toast.error(message);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, orderId, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary mb-6" />
          <h1 className="text-2xl font-bold mb-4">Verifying Payment...</h1>
          <p className="text-muted-foreground">Please wait while we confirm your order</p>
        </main>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Button onClick={() => navigate("/")}>Return Home</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <CheckCircle className="h-20 w-20 mx-auto text-green-500 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your order. We've received your payment and will process your order shortly.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono">{orderDetails.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-green-600">Confirmed</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">
                  KSh {orderDetails.total_price?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Delivery Details</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Address:</span>{" "}
                  {orderDetails.delivery_address}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">City:</span>{" "}
                  {orderDetails.delivery_city}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Phone:</span>{" "}
                  {orderDetails.delivery_phone}
                </p>
                {orderDetails.delivery_notes && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Notes:</span>{" "}
                    {orderDetails.delivery_notes}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Items Ordered</h3>
              <div className="space-y-2">
                {orderDetails.order_items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.products?.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      KSh {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={() => navigate("/customer-dashboard")} className="flex-1">
                View My Orders
              </Button>
              <Button onClick={() => navigate("/products")} variant="outline" className="flex-1">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
