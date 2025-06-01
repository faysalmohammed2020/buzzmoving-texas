"use client";

import AdminDashboard from "@/components/AdminDashboard";
import { useSession } from "@/lib/auth-client";
import { BellIcon } from "@heroicons/react/16/solid";
import { UserCircleIcon } from "lucide-react";
import React from "react";

const DashboardPage: React.FC = () => {
  const {data : session} = useSession();
  return (
    <div>
      {/* Header */}
      <header className="flex justify-between items-center mb-6 px-6">
        <h1 className="text-3xl font-bold">Welcome to Admin Panel.</h1>
        <div className="flex gap-4 items-center justify-center">
          {/* Bell Icon */}
          <div className="text-gray-500 hover:text-black">
            <BellIcon className="size-8" />
          </div>
          {/* Profile Icon */}
          <div className="flex gap-2 text-gray-500 hover:text-black">
            <UserCircleIcon className="size-10" />
            <div>
              <h3 className="text-md font-semibold text-slate-900">
              {session?.user?.name}
              </h3>
              <p className="text-sm font-medium">{session?.user?.role}</p>
            </div>
          </div>
        </div>
      </header>
      <AdminDashboard />
    </div>
  );
};

export default DashboardPage;
