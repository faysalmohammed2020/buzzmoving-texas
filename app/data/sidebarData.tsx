import { JSX } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaPenFancy } from "react-icons/fa";
import { AiOutlineBarChart } from "react-icons/ai";


// Define the structure of each sidebar item
export interface SidebarItem {
  href: string;
  label: string;
  icon: JSX.Element;
}

// Sidebar items list
export const sidebarItems: SidebarItem[] = [
  // Dashboard
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: <LuLayoutDashboard className="size-6" />,
  },

  // Blog Management
  {
    href: "/admin/dashboard/blog-management",
    label: "Blog Management",
    icon: <FaPenFancy className="size-6" />,
  },

  // Analytics
  {
    href: "/admin/dashboard/analytics",
    label: "Analytics",
    icon: <AiOutlineBarChart className="size-6" />,
  },

  // // Site Settings
  // {
  //   href: "/dashboard/site-settings",
  //   label: "Site Settings",
  //   icon: <MdOutlineSettings className="size-6" />,
  // },
];
