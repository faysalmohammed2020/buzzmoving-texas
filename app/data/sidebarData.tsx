import { JSX } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { FiFolder, FiImage } from "react-icons/fi";
import { RiArticleLine } from "react-icons/ri";
import { HiOutlineUserGroup } from "react-icons/hi";
import { AiOutlineBarChart, AiOutlineSetting } from "react-icons/ai";
import { MdOutlineSettings } from "react-icons/md";
import { FaPenFancy } from "react-icons/fa";

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
    href: "/dashboard",
    label: "Dashboard",
    icon: <LuLayoutDashboard className="size-6" />,
  },

  // Blog Management
  {
    href: "/dashboard/blog-management",
    label: "Blog Management",
    icon: <FaPenFancy className="size-6" />,
  },

  // Analytics
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: <AiOutlineBarChart className="size-6" />,
  },

  // Site Settings
  {
    href: "/dashboard/site-settings",
    label: "Site Settings",
    icon: <MdOutlineSettings className="size-6" />,
  },
];
