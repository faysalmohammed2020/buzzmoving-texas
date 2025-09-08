'use client'

import AdminDashboard from "@/components/AdminDashboard";
import {  Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
const DashboardPage: React.FC = () => {
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  return (
    <div>
      {/* Header */}
       <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-5">
          
          {/* Settings Icon */}
          <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100">
            <Cog6ToothIcon className="size-6" />
          </button>
          
          {/* User Profile */}
          <div className="relative">
            <button 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
            >
              <div className="flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full h-10 w-10 text-white font-semibold">
                {getUserInitials()}
              </div>
              <div className="text-left hidden md:block">
                <h3 className="text-sm font-semibold text-gray-900">
                  {session?.user?.name || 'User'}
                </h3>
                <p className="text-xs text-gray-500 capitalize">
                  {session?.user?.role?.toLowerCase() || 'admin'}
                </p>
              </div>
            </button>
            
            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{session?.user?.email || ''}</p>
                </div>
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                </div>
                <div className="py-1 border-t border-gray-100">
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => signOut()}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
      <AdminDashboard />
    </div>
  );
};

export default DashboardPage;
