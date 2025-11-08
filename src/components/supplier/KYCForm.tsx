import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, FileCheck, Loader2 } from "lucide-react";

const kycSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters"),
  idDocument: z.any(),
  businessCertificate: z.any(),
});

type KYCFormData = z.infer<typeof kycSchema>;

export function KYCForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [idDocFile, setIdDocFile] = useState<File | null>(null);
  const [businessCertFile, setBusinessCertFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
  });

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const onSubmit = async (data: KYCFormData) => {
    if (!user) return;
    if (!idDocFile || !businessCertFile) {
      toast.error("Please upload both documents");
      return;
    }

    setUploading(true);
    try {
      // Upload documents
      const idDocUrl = await uploadFile(
        idDocFile,
        "kyc-documents",
        `${user.id}/id-document-${Date.now()}`
      );

      const businessCertUrl = await uploadFile(
        businessCertFile,
        "kyc-documents",
        `${user.id}/business-cert-${Date.now()}`
      );

      // Create supplier record
      const { error: dbError } = await supabase
        .from("suppliers")
        .insert({
          user_id: user.id,
          business_name: data.businessName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          contact_person: data.contactPerson,
          id_document_url: idDocUrl,
          business_certificate_url: businessCertUrl,
          kyc_status: "pending",
        });

      if (dbError) throw dbError;

      toast.success("KYC documents submitted for review!");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit KYC documents");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Registration</CardTitle>
        <CardDescription>
          Complete your KYC verification to start selling on our platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              {...register("businessName")}
              placeholder="Enter your business name"
            />
            {errors.businessName && (
              <p className="text-sm text-destructive">{errors.businessName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              {...register("contactPerson")}
              placeholder="Full name of contact person"
            />
            {errors.contactPerson && (
              <p className="text-sm text-destructive">{errors.contactPerson.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="business@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+254 712 345 678"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Enter full business address"
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="idDocument">ID Document</Label>
            <div className="flex items-center gap-2">
              <Input
                id="idDocument"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setIdDocFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {idDocFile && <FileCheck className="h-5 w-5 text-success" />}
            </div>
            <p className="text-xs text-muted-foreground">Upload your ID (PDF, JPG, or PNG)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessCertificate">Business Certificate</Label>
            <div className="flex items-center gap-2">
              <Input
                id="businessCertificate"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setBusinessCertFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {businessCertFile && <FileCheck className="h-5 w-5 text-success" />}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload your business registration certificate (PDF, JPG, or PNG)
            </p>
          </div>

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit KYC Documents
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
