import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(100),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
  category: z.string().max(50).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  supplierId: string;
  product?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ supplierId, product, onSuccess, onCancel }: ProductFormProps) {
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      category: product.category || "",
    } : undefined,
  });

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${supplierId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const onSubmit = async (data: ProductFormData) => {
    setUploading(true);
    try {
      let imageUrl = product?.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const productData = {
        supplier_id: supplierId,
        name: data.name,
        description: data.description || null,
        price: data.price,
        stock: data.stock,
        category: data.category || null,
        image_url: imageUrl,
      };

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;
        toast.success("Product updated successfully!");
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) throw error;
        toast.success("Product added successfully!");
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" {...register("name")} placeholder="Enter product name" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter product description"
          rows={4}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (KSh)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price")}
            placeholder="0.00"
          />
          {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            {...register("stock")}
            placeholder="0"
          />
          {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" {...register("category")} placeholder="e.g., Electronics, Clothing" />
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Product Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
        {product?.image_url && !imageFile && (
          <p className="text-xs text-muted-foreground">Current image will be kept if no new image is uploaded</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={uploading} className="flex-1">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {product ? "Update Product" : "Add Product"}
            </>
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
