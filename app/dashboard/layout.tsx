import React, { ReactNode } from "react";
import Sidebar from "@/components/Sidebar"; // Adjust the import path as per your project structure

interface DashboardLayoutProps {
  children: ReactNode; // Accepts nested routes or pages as children
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex overflow-hidden bg-gray-100">
      <div className="h-screen">
        <Sidebar />
      </div>

      <main className="flex-grow p-4 overflow-y-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
