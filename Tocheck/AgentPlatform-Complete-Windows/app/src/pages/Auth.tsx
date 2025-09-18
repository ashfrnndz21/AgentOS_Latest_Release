
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CreditCard } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('login');
  const navigate = useNavigate();

  // Auto-redirect after component mounts if login tab is selected
  useEffect(() => {
    if (tab === 'login') {
      // Short delay to make button interaction visible
      const timer = setTimeout(() => {
        navigate('/');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [tab, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Just for visual feedback
    setTimeout(() => {
      toast.success('Logged in successfully');
      navigate('/');
    }, 500);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Just for visual feedback
    setTimeout(() => {
      toast.success('Account created! Redirecting to dashboard');
      navigate('/');
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-beam-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-beam-dark to-beam-dark">
      <Card className="w-[400px] bg-beam-dark-accent/30 border-gray-700/50">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-true-red rounded-lg">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white text-center">Banking Agent OS</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Secure access to your banking AI platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-beam-dark/70 border border-gray-700/50">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-beam-dark/70 border-gray-700/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-beam-dark/70 border-gray-700/50 text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-beam-dark/70 border-gray-700/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-beam-dark/70 border-gray-700/50 text-white"
                  />
                  <p className="text-xs text-gray-400">
                    Password must be at least 6 characters
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <Alert className="bg-blue-900/20 border-blue-900/50 text-blue-300">
            <Info className="h-4 w-4" />
            <AlertDescription>
              For this demo: selecting Login will automatically redirect you to the banking dashboard. 
              No actual authentication is performed.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-400">
            {tab === 'login' 
              ? "Don't have an account? Switch to Sign Up tab" 
              : 'Already have an account? Switch to Login tab'}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
