
import React, { useState } from 'react';
import { IndustrySidebar } from './IndustrySidebar';
import { IndustrySwitcher } from './IndustrySwitcher';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SidebarProvider } from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  // For demo purposes, we'll just assume the user is logged in
  const [user] = useState({ email: 'demo@ashrepo.com' });
  const navigate = useNavigate();

  const handleSignOut = () => {
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-black w-full">
        <IndustrySidebar />
        <div className="flex-1 overflow-hidden min-w-0">
          {user && (
            <div className="flex justify-between items-center px-4 py-2 bg-gray-900/80 border-b border-white/20">
              <IndustrySwitcher />
              <div className="flex items-center gap-2 text-white">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{user.email}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
          <div className="h-full overflow-y-auto overflow-x-hidden pl-6 pr-0 pt-6 pb-6">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
