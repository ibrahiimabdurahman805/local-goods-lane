import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CreditCard } from "lucide-react";

export default function PaymentProcessing() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  useEffect(() => {
    // Redirect to home after 30 seconds if still on this page
    const timer = setTimeout(() => {
      navigate("/");
    }, 30000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <div className="relative">
                  <CreditCard className="h-20 w-20 mx-auto text-primary mb-4" />
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary absolute top-16 left-1/2 -translate-x-1/2" />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">Processing Payment</h1>
                  <p className="text-muted-foreground">
                    Please complete your payment in the Stripe checkout window
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg max-w-md mx-auto">
                  <p className="text-sm font-medium mb-2">What's happening?</p>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    <li>• A secure payment window has opened</li>
                    <li>• Complete your payment there</li>
                    <li>• You'll be redirected automatically after payment</li>
                  </ul>
                </div>

                {orderId && (
                  <div className="text-sm text-muted-foreground">
                    Order Reference: {orderId.slice(0, 8)}
                  </div>
                )}

                <p className="text-xs text-muted-foreground pt-4">
                  If you closed the payment window, please check your email for payment instructions
                  or return to your cart to try again.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
