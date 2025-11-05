import { ShoppingBag, TrendingUp, Users, Shield, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Header } from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Index = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(6);
    
    setFeaturedProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("products")
      .select("category")
      .not("category", "is", null);
    
    const uniqueCategories = [...new Set(data?.map((p) => p.category).filter(Boolean))];
    setCategories(uniqueCategories as string[]);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/products");
    }
  };
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
      <Header />

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
            
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-12 h-14 text-lg"
                />
                <Button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/products">
                <Button size="lg" className="text-lg px-8">
                  Start Shopping
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/auth">Become a Supplier</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Shop by Category</h2>
            <div className="flex gap-3 justify-center flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="lg"
                  asChild
                >
                  <Link to={`/products?category=${encodeURIComponent(category)}`}>
                    {category}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
              <p className="text-muted-foreground text-lg">
                Discover our latest and most popular items
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <Link to={`/products/${product.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      {product.category && (
                        <Badge className="absolute top-2 left-2 bg-secondary">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        KSh {product.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {product.stock} in stock
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button size="lg" variant="outline" asChild>
                <Link to="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-background">
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
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link to="/auth">Create Your Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
