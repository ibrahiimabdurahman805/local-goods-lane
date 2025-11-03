import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    stock: number;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
        />
        <Badge className="absolute top-2 left-2 bg-secondary">
          {product.category}
        </Badge>
      </div>
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
        <Button className="w-full" size="lg">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};