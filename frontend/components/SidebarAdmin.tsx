import React, { useState } from 'react';
import { LayoutDashboard, Calendar, MessageSquare, Clock, Users, UserCog } from 'lucide-react';

interface SidebarAdminProps {
  defaultActive?: string;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ 
  defaultActive = "chat-history"
}) => {
  const [activeItem, setActiveItem] = useState(defaultActive);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'active-conversation', label: 'Active Conversation', icon: MessageSquare },
    { id: 'chat-history', label: 'Chat History', icon: Clock },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: UserCog },
  ];

  const handleClick = (itemId: string) => {
    setActiveItem(itemId);
    // Add your navigation logic here
    console.log('Navigating to:', itemId);
  };

  return (
    <aside className="bg-white w-48 min-h-screen border-r border-gray-200">
      <nav className="pt-4 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-normal transition-all mb-1
                ${isActive 
                  ? 'bg-teal-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default SidebarAdmin;