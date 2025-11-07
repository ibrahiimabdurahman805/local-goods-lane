import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  business_name: string;
  kyc_status: string;
  created_at: string;
  user_name?: string;
  products_count?: number;
}

export function SuppliersManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data: suppliersData, error: suppliersError } = await supabase
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false });

      if (suppliersError) throw suppliersError;

      // Fetch details for each supplier
      const suppliersWithDetails = await Promise.all(
        (suppliersData || []).map(async (supplier) => {
          // Fetch profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", supplier.user_id)
            .single();

          // Fetch product count
          const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("supplier_id", supplier.id);

          return {
            ...supplier,
            user_name: profile?.full_name || 'Unknown',
            products_count: count || 0
          };
        })
      );

      setSuppliers(suppliersWithDetails);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Business Name</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>KYC Status</TableHead>
          <TableHead>Products</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => (
          <TableRow key={supplier.id}>
            <TableCell className="font-medium">{supplier.business_name}</TableCell>
            <TableCell>{supplier.user_name}</TableCell>
            <TableCell>
              <Badge variant={getStatusColor(supplier.kyc_status)}>
                {supplier.kyc_status}
              </Badge>
            </TableCell>
            <TableCell>{supplier.products_count}</TableCell>
            <TableCell>{new Date(supplier.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
