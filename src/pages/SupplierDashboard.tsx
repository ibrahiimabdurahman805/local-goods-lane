import { useCallback, useEffect, useMemo, useState } from "react";
import { Package, Plus, TrendingUp, DollarSign, AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { KYCForm } from "@/components/supplier/KYCForm";
import { ProductForm } from "@/components/supplier/ProductForm";
import { ProductsTable } from "@/components/supplier/ProductsTable";
import { SalesChart } from "@/components/supplier/SalesChart";
import { SupplierOrders } from "@/components/supplier/SupplierOrders";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product, Supplier, Order } from "@/types/entities";

const SupplierDashboard = () => {
  const { signOut, user } = useAuth();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const fetchSupplierData = useCallback(async () => {
    if (!user) return;

    try {
      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle<Supplier>();

      if (supplierError) throw supplierError;
      setSupplier(supplierData);

      if (!supplierData) {
        setProducts([]);
        setOrders([]);
        return;
      }

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("supplier_id", supplierData.id)
        .order("created_at", { ascending: false })
        .returns<Product[]>();

      if (productsError) throw productsError;
      setProducts(productsData ?? []);

      if (!productsData?.length) {
        setOrders([]);
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .in(
          "product_id",
          productsData.map((p) => p.id)
        )
        .eq("status", "completed")
        .returns<Order[]>();

      if (ordersError) throw ordersError;
      setOrders(ordersData ?? []);
    } catch (error) {
      console.error("Error fetching supplier data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void fetchSupplierData();
    }
  }, [user, fetchSupplierData]);

  const totalSales = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total_price), 0),
    [orders]
  );
  const stats = [
    { title: "Total Products", value: products.length.toString(), icon: Package, color: "text-primary" },
    { title: "Total Sales", value: `KSh ${totalSales.toFixed(2)}`, icon: DollarSign, color: "text-secondary" },
    { title: "Orders", value: orders.length.toString(), icon: TrendingUp, color: "text-accent" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Show KYC form if not registered
  if (!supplier) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
              <Button onClick={signOut} variant="outline">Sign Out</Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <KYCForm onSuccess={fetchSupplierData} />
        </div>
      </div>
    );
  }

  // Show pending status if KYC is pending
  if (supplier.kyc_status === "pending") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
              <Button onClick={signOut} variant="outline">Sign Out</Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your KYC documents are under review. You'll be able to add products once your account is approved.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Show rejected status with reason
  if (supplier.kyc_status === "rejected") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
              <Button onClick={signOut} variant="outline">Sign Out</Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your KYC application was rejected. Reason: {supplier.rejection_reason || "Please contact support for details."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h1 className="text-2xl font-bold">
                {supplier.store_name || supplier.business_name || "Supplier Dashboard"}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddProduct(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              <Button onClick={signOut} variant="outline">Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-8">
          <SalesChart orders={orders} />
        </div>

        <div className="mb-8">
          <SupplierOrders supplierId={supplier.id} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductsTable
              products={products}
              supplierId={supplier.id}
              onUpdate={fetchSupplierData}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            supplierId={supplier.id}
            onSuccess={() => {
              setShowAddProduct(false);
              fetchSupplierData();
            }}
            onCancel={() => setShowAddProduct(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierDashboard;