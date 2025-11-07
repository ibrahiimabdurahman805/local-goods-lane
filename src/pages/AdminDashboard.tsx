import { useEffect, useState } from "react";
import { Users, ShoppingBag, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { KYCApprovals } from "@/components/admin/KYCApprovals";
import { UserManagement } from "@/components/admin/UserManagement";
import { OrdersManagement } from "@/components/admin/OrdersManagement";
import { SuppliersManagement } from "@/components/admin/SuppliersManagement";

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    revenue: 0,
    activeSuppliers: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total users (from profiles)
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch total orders
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      // Fetch revenue
      const { data: ordersData } = await supabase
        .from("orders")
        .select("total_price")
        .eq("status", "completed");

      const revenue = ordersData?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;

      // Fetch active suppliers
      const { count: suppliersCount } = await supabase
        .from("suppliers")
        .select("*", { count: "exact", head: true })
        .eq("kyc_status", "approved");

      setStats({
        totalUsers: usersCount || 0,
        totalOrders: ordersCount || 0,
        revenue,
        activeSuppliers: suppliersCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const displayStats = [
    { title: "Total Users", value: stats.totalUsers.toString(), icon: Users },
    { title: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingBag },
    { title: "Revenue", value: `KSh ${stats.revenue.toFixed(2)}`, icon: TrendingUp },
    { title: "Active Suppliers", value: stats.activeSuppliers.toString(), icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Button onClick={signOut} variant="outline">Sign Out</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="kyc">KYC Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Quick summary of your platform's performance and key metrics.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Recent Activity</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor real-time platform activity and user engagement.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Platform Health</h3>
                    <p className="text-sm text-muted-foreground">
                      All systems operational. No pending issues.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <OrdersManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle>Suppliers Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <SuppliersManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle>KYC Approval Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <KYCApprovals />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;