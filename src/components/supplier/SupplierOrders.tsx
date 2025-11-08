import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Order {
  id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
  delivery_address: string;
  delivery_city: string;
  delivery_phone: string;
  delivery_notes: string | null;
  product_name?: string;
  customer_name?: string;
}

interface SupplierOrdersProps {
  supplierId: string;
}

export function SupplierOrders({ supplierId }: SupplierOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [supplierId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // First get all products for this supplier
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name")
        .eq("supplier_id", supplierId);

      if (productsError) throw productsError;

      const productIds = products?.map((p) => p.id) || [];

      if (productIds.length === 0) {
        setOrders([]);
        return;
      }

      // Get orders for these products
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .in("product_id", productIds)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch customer names
      const customerIds = [...new Set(ordersData?.map((o) => o.customer_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", customerIds);

      // Combine data
      const ordersWithDetails = ordersData?.map((order) => {
        const product = products?.find((p) => p.id === order.product_id);
        const customer = profiles?.find((p) => p.id === order.customer_id);
        return {
          ...order,
          product_name: product?.name || "Unknown Product",
          customer_name: customer?.full_name || "Unknown Customer",
        };
      }) || [];

      setOrders(ordersWithDetails);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "processing":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>No orders yet for your products</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Orders</CardTitle>
        <CardDescription>Manage orders for your products</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Delivery Info</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{order.product_name}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>KSh {order.total_price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="max-w-xs">
                      <p className="font-medium">{order.delivery_phone}</p>
                      <p className="text-muted-foreground">{order.delivery_address}</p>
                      <p className="text-muted-foreground">{order.delivery_city}</p>
                      {order.delivery_notes && (
                        <p className="text-muted-foreground italic mt-1">{order.delivery_notes}</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
