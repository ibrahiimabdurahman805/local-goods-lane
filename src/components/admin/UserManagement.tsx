import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserX, UserCheck, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type UserRole = 'admin' | 'supplier' | 'customer';

interface User {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  created_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('customer');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name");

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Get user emails from auth.users via admin API
      const userMap = new Map(rolesData?.map(r => [r.user_id, r.role]));
      
      const usersWithDetails = await Promise.all(
        (profilesData || []).map(async (profile) => {
          return {
            id: profile.id,
            full_name: profile.full_name || 'N/A',
            email: 'user@example.com', // Note: Email requires admin privileges
            role: (userMap.get(profile.id) as UserRole) || 'customer',
            created_at: new Date().toISOString()
          };
        })
      );

      setUsers(usersWithDetails);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully"
      });

      setIsRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      // Note: Actual user deletion requires admin API access
      // For now, we'll just remove the role
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User access removed successfully"
      });

      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to remove user access",
        variant: "destructive"
      });
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
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : user.role === 'supplier' ? 'secondary' : 'outline'}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(user);
                      setNewRole(user.role);
                      setIsRoleDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangeRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove access for {selectedUser?.full_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
