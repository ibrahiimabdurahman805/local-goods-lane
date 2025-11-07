import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  id: string;
  customer_id: string;
  total_price: number;
  status: string;
  payment_status: string;
  delivery_address: string | null;
  delivery_city: string | null;
  created_at: string;
  customer_name?: string;
}

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('pending');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch customer names separately
      const ordersWithNames = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", order.customer_id)
            .single();

          return {
            ...order,
            customer_name: profile?.full_name || 'Unknown Customer'
          };
        })
      );

      setOrders(ordersWithNames);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated successfully"
      });

      setIsStatusDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'processing': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell className="font-medium">KSh {Number(order.total_price).toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={order.payment_status === 'completed' ? 'default' : 'secondary'}>
                  {order.payment_status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedOrder(order);
                      setNewStatus(order.status);
                      setIsStatusDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono text-sm">{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p>{selectedOrder.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="font-medium">KSh {Number(selectedOrder.total_price).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p>{selectedOrder.delivery_address || 'N/A'}</p>
                <p>{selectedOrder.delivery_city || ''}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge variant={selectedOrder.payment_status === 'completed' ? 'default' : 'secondary'}>
                  {selectedOrder.payment_status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order {selectedOrder?.id.slice(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
