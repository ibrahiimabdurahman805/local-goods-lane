import { ShoppingBag, TrendingUp, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: ShoppingBag,
      title: "Browse & Shop",
      description: "Discover thousands of products from verified suppliers across Kenya",
    },
    {
      icon: TrendingUp,
      title: "Sell Your Products",
      description: "Join our marketplace and reach customers nationwide",
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Shop with confidence from verified sellers",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and secure payment processing for all transactions",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MarketHub
            </div>
            <div className="flex gap-3">
              <Link to="/products">
                <Button variant="outline">Browse Products</Button>
              </Link>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Kenya's Premier
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {" "}Marketplace Platform
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect buyers and sellers across Kenya. Shop from trusted suppliers or grow your business by reaching thousands of customers.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/products">
                <Button size="lg" className="text-lg px-8">
                  Start Shopping
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Become a Supplier
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose MarketHub</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to buy and sell online with confidence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of satisfied customers and suppliers on Kenya's fastest-growing marketplace
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8">
            Create Your Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
