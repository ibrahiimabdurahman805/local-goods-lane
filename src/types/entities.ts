import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export type Supplier = Tables<"suppliers"> & {
  store_name?: string | null;
  facebook_handle?: string | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
};

export type Order = Tables<"orders">;

export type OrderWithProduct = Order & {
  products: Pick<Product, "name" | "image_url" | "price"> | null;
};

export type OrderWithItems = Order & {
  order_items: (Tables<"order_items"> & {
    products: Pick<Product, "name" | "image_url"> | null;
  })[];
};
