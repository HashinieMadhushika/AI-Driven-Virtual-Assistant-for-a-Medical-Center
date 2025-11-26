import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderAdminProps {
  userName?: string;
  userRole?: string;
}

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ 
  userName = "John Miller", 
  userRole = "Admin" 
}) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 px-6">
      <div className="h-full grid grid-cols-[1fr_auto] items-center">
        {/* Left Section - Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="bg-teal-500 rounded-lg w-11 h-11 flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div>
            <h1 className="text-gray-900 font-semibold text-base leading-tight">ADMIN</h1>
            <p className="text-gray-500 text-xs">MediCare AI System</p>
          </div>
        </div>

        {/* Right Section - Notifications and User */}
        <div className="flex items-center gap-4">
          {/* Notification Icon */}
          <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5">
            <div className="bg-teal-500 rounded-full w-9 h-9 flex items-center justify-center">
              <span className="text-white font-medium text-sm">JM</span>
            </div>
            <div className="leading-tight">
              <p className="text-gray-900 font-medium text-sm">{userName}</p>
              <p className="text-gray-500 text-xs">{userRole}</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button className="text-gray-700 hover:text-gray-900 text-sm font-normal ml-2 hover:underline transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;