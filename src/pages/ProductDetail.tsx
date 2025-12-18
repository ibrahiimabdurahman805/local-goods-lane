import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { useCart } from "@/hooks/useCart";
import { ArrowLeft, ShoppingCart, Building2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/entities";

type SupplierInfo = Pick<Product, "supplier_id"> & {
  business_name: string;
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [supplier, setSupplier] = useState<SupplierInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProductDetails = async () => {
      try {
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single<Product>();

        if (productError) throw productError;
        setProduct(productData);

        const { data: supplierData, error: supplierError } = await supabase
          .from("suppliers")
          .select("business_name, id")
          .eq("id", productData.supplier_id)
          .single<SupplierInfo>();

        if (supplierError) throw supplierError;
        setSupplier(supplierData);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    void fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full rounded-lg shadow-lg object-cover aspect-square"
              />
            ) : (
              <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              {product.category && (
                <Badge variant="secondary" className="mb-4">
                  {product.category}
                </Badge>
              )}
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">
                    KSh {product.price.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className={product.stock > 0 ? "text-green-600" : "text-destructive"}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>

                {supplier && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>Sold by: {supplier.business_name}</span>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description available for this product."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
