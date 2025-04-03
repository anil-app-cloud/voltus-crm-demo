import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Users, MessageSquare, FileText, BarChart2, Settings } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => 
      `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
        isActive 
          ? 'bg-primary/10 text-primary' 
          : 'text-muted-foreground hover:bg-muted dark:hover:bg-gray-800'
      }`
    }
  >
    <div className="h-5 w-5 shrink-0">{icon}</div>
    <span>{label}</span>
  </NavLink>
);

const Sidebar: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 h-screen w-64 border-r bg-background p-4 z-10 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex h-16 items-center px-2">
        <div className="text-xl font-bold text-primary">WorldZoneCRM</div>
      </div>
      <nav className="space-y-1 px-2 py-5">
        <NavItem to="/dashboard" icon={<Home />} label="Dashboard" />
        <NavItem to="/customers/1" icon={<Users />} label="Customers" />
        <NavItem to="/bookings" icon={<BookOpen />} label="Bookings" />
        <NavItem to="/communications" icon={<MessageSquare />} label="Communications" />
        <NavItem to="/invoices" icon={<FileText />} label="Invoices" />
        <NavItem to="/reports" icon={<BarChart2 />} label="Reports" />
        <NavItem to="/settings" icon={<Settings />} label="Settings" />
      </nav>
    </div>
  );
};

export default Sidebar; 