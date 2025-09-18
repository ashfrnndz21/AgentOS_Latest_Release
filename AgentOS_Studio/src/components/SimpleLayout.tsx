import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/mcp-dashboard', label: 'MCP Gateway', icon: '🌐' },
    { path: '/agent-command', label: 'Command Centre', icon: '⚡' },
    { path: '/agents', label: 'Agents', icon: '🤖' },
    { path: '/multi-agent-workspace', label: 'Multi-Agent', icon: '👥' },
    { path: '/wealth-management', label: 'Wealth Management', icon: '💰' },
    { path: '/customer-insights', label: 'Customer Insights', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Simple Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">AgentRepo</h1>
          <p className="text-sm text-gray-400">AI Agent Platform</p>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};