import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/products/ProductCard";

const Products = () => {
  // Mock products data
  const products = [
    {
      id: "1",
      name: "Wireless Bluetooth Headphones",
      price: 4999,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      category: "Electronics",
      stock: 45,
    },
    {
      id: "2",
      name: "Smart Watch Pro",
      price: 12999,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      category: "Electronics",
      stock: 23,
    },
    {
      id: "3",
      name: "Premium Running Shoes",
      price: 8999,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      category: "Fashion",
      stock: 67,
    },
    {
      id: "4",
      name: "Leather Backpack",
      price: 5999,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      category: "Fashion",
      stock: 34,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MarketHub
            </a>
            <Button>Sign In</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for products..."
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" size="lg">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            {["All", "Electronics", "Fashion", "Home", "Beauty", "Sports"].map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">All Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;