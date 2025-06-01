"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { sidebarItems, SidebarItem } from "@/app/data/sidebarData";
import { LuArrowLeftFromLine, LuArrowRightToLine } from "react-icons/lu";
import { VscAccount } from "react-icons/vsc";
import { Button } from "./ui/button";
import { signOut, useSession } from "@/lib/auth-client";

const Sidebar: React.FC = () => {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const pathname = usePathname();
  const isActive = (path: string): boolean => pathname === path;

  return (
    <aside
      className={`flex flex-col shrink-0 ${
        isCollapsed ? "w-[72px]" : "w-72"
      } transition-width duration-500 bg-slate-800 h-screen`}
    >
      {/* Toggle Button */}
      <div className="p-4 text-right">
        <button
          onClick={toggleMenu}
          className="text-white focus:outline-none transform transition-transform duration-300"
        >
          {isCollapsed ? (
            <LuArrowRightToLine className="size-6 font-extrabold flex justify-center text-center" />
          ) : (
            <LuArrowLeftFromLine className="size-6 flex justify-end font-extrabold" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 grow overflow-y-auto">
        <ul className="space-y-3">
          {sidebarItems.map((item: SidebarItem) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex py-2 px-2 items-center font-medium ${
                isCollapsed ? "gap-0" : "gap-3"
              } whitespace-nowrap ${
                isActive(item.href)
                  ? "bg-cyan-600 rounded-xl w-full text-white"
                  : "hover:text-white text-white/80"
              }`}
            >
              <div>{item.icon}</div>
              <li className={`text-md ${isCollapsed ? "hidden" : "block"}`}>
                {item.label}
              </li>
            </Link>
          ))}
        </ul>
      </nav>
      <div className="hidden md:flex justify-end items-center space-x-4 mb-8 mr-5">
        {session ? (
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          ): <div className="text-white bg-red-500  font-semibold px-4 py-2 rounded-lg">Not Login</div>}
        </div>
       </aside>
  );
};

export default Sidebar;
