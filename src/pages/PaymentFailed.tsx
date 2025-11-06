import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <XCircle className="h-20 w-20 mx-auto text-destructive mb-6" />
          <h1 className="text-4xl font-bold mb-4">Payment Failed</h1>
          <p className="text-lg text-muted-foreground">
            We couldn't process your payment. Please try again or use a different payment method.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>What happened?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Your payment was not completed. This could be due to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Insufficient funds in your account</li>
              <li>Payment cancellation</li>
              <li>Network issues during transaction</li>
              <li>Card declined by your bank</li>
            </ul>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Your Order</p>
              {orderId && (
                <p className="text-xs text-muted-foreground">
                  Order ID: {orderId.slice(0, 8)}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Your order has been saved and is waiting for payment. You can try again or contact support if you need assistance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => navigate("/cart")} 
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button 
                onClick={() => navigate("/products")} 
                variant="outline" 
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Need help?</p>
              <Button 
                onClick={() => navigate("/customer-dashboard")} 
                variant="link"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
