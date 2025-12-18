import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const preselectedRole = searchParams.get('role') === 'supplier' ? 'supplier' : 'customer';
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: preselectedRole as 'admin' | 'supplier' | 'customer',
    storeName: '',
    facebookHandle: '',
    tiktokHandle: '',
    instagramHandle: ''
  });

  const redirectToDashboard = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const role = data?.role || 'customer';

      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'supplier') {
        navigate('/supplier/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Failed to redirect after auth', error);
      navigate('/', { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      toast.error(error.message || 'Failed to sign in');
    } else {
      toast.success('Signed in successfully');
      await redirectToDashboard();
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Security: Always default new signups to 'customer' role
    // Admin and supplier roles must be assigned by administrators
    const { error } = await signUp(
      signupData.email,
      signupData.password,
      signupData.fullName,
      signupData.role === 'supplier' ? 'supplier' : 'customer'
    );

    if (error) {
      toast.error(error.message || 'Failed to sign up');
    } else {
      toast.success('Account created successfully');
      if (signupData.role === 'supplier') {
        toast.info('Complete your supplier profile in the dashboard to start selling.');
      }
      await redirectToDashboard();
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to MarketHub</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 8 characters required
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-store">Store / Shop Name</Label>
                  <Input
                    id="signup-store"
                    type="text"
                    placeholder="Local Goods Lane Shop"
                    value={signupData.storeName}
                    onChange={(e) => setSignupData({ ...signupData, storeName: e.target.value })}
                    minLength={2}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional but recommended for suppliers so buyers recognize you.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-facebook">Facebook Page</Label>
                    <Input
                      id="signup-facebook"
                      placeholder="@yourstore"
                      value={signupData.facebookHandle}
                      onChange={(e) => setSignupData({ ...signupData, facebookHandle: e.target.value })}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-tiktok">TikTok Handle</Label>
                    <Input
                      id="signup-tiktok"
                      placeholder="@yourstore"
                      value={signupData.tiktokHandle}
                      onChange={(e) => setSignupData({ ...signupData, tiktokHandle: e.target.value })}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-instagram">Instagram Handle</Label>
                    <Input
                      id="signup-instagram"
                      placeholder="@yourstore"
                      value={signupData.instagramHandle}
                      onChange={(e) => setSignupData({ ...signupData, instagramHandle: e.target.value })}
                      maxLength={100}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
