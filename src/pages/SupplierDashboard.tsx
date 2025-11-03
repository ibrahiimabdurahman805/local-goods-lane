import { Package, Plus, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SupplierDashboard = () => {
  const stats = [
    { title: "Total Products", value: "24", icon: Package, color: "text-primary" },
    { title: "Total Sales", value: "KSh 145,000", icon: DollarSign, color: "text-secondary" },
    { title: "Growth", value: "+23%", icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
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

        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your product listings will appear here. Add your first product to get started!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDashboard;