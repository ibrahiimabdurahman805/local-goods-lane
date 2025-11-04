import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye } from "lucide-react";

export function KYCApprovals() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (supplierId: string) => {
    try {
      const { error } = await supabase
        .from("suppliers")
        .update({ kyc_status: "approved" })
        .eq("id", supplierId);

      if (error) throw error;

      toast.success("Supplier approved successfully");
      fetchSuppliers();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve supplier");
    }
  };

  const handleReject = async () => {
    if (!selectedSupplier || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const { error } = await supabase
        .from("suppliers")
        .update({
          kyc_status: "rejected",
          rejection_reason: rejectionReason,
        })
        .eq("id", selectedSupplier.id);

      if (error) throw error;

      toast.success("Supplier rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedSupplier(null);
      fetchSuppliers();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject supplier");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No supplier applications yet
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.business_name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        supplier.kyc_status === "approved"
                          ? "default"
                          : supplier.kyc_status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {supplier.kyc_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(supplier.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedSupplier(supplier)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {supplier.kyc_status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(supplier.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedSupplier(supplier);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Details Dialog */}
      <Dialog
        open={!!selectedSupplier && !showRejectDialog}
        onOpenChange={() => setSelectedSupplier(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4">
              <div>
                <Label>Business Name</Label>
                <p className="text-sm">{selectedSupplier.business_name}</p>
              </div>
              <div>
                <Label>Status</Label>
                <p className="text-sm">{selectedSupplier.kyc_status}</p>
              </div>
              {selectedSupplier.id_document_url && (
                <div>
                  <Label>ID Document</Label>
                  <a
                    href={selectedSupplier.id_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Document
                  </a>
                </div>
              )}
              {selectedSupplier.business_certificate_url && (
                <div>
                  <Label>Business Certificate</Label>
                  <a
                    href={selectedSupplier.business_certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Supplier Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a detailed reason for rejection"
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Application
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
