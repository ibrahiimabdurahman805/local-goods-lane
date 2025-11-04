import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

interface Order {
  created_at: string;
  total_price: number;
}

interface SalesChartProps {
  orders: Order[];
}

export function SalesChart({ orders }: SalesChartProps) {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, "MMM dd"),
        fullDate: format(date, "yyyy-MM-dd"),
        sales: 0,
      };
    });

    orders.forEach((order) => {
      const orderDate = format(new Date(order.created_at), "yyyy-MM-dd");
      const dayData = last7Days.find((d) => d.fullDate === orderDate);
      if (dayData) {
        dayData.sales += Number(order.total_price);
      }
    });

    return last7Days;
  }, [orders]);

  const totalSales = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total_price), 0),
    [orders]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview (Last 7 Days)</CardTitle>
        <p className="text-2xl font-bold">
          KSh {totalSales.toFixed(2)}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`KSh ${value.toFixed(2)}`, "Sales"]}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
