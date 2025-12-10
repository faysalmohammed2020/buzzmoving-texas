"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { sidebarItems, SidebarItem } from "@/app/data/sidebarData";
import { LuArrowLeftFromLine, LuArrowRightToLine } from "react-icons/lu";
import { signOut, useSession } from "@/lib/auth-client";

/** ✅ local safe user shape (no any) */
type AppUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type AppSession = {
  user?: AppUser | null;
};

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  /** ✅ safely read user with optional fields */
  const user = (session as unknown as AppSession | null)?.user;

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleMenu = (): void => {
    setIsCollapsed((prev) => !prev);
  };

  const pathname = usePathname();
  const isActive = (path: string): boolean => pathname === path;

  // Header-er মতো initials helper
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  // 🔐 Sign out + fallback redirect
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Sign out failed", e);
    } finally {
      router.push("/sign-in");
    }
  };

  return (
    <aside
      className={`flex flex-col shrink-0 ${
        isCollapsed ? "w-[72px]" : "w-72"
      } transition-[width] duration-500 bg-slate-800 h-screen`}
    >
      {/* Top: toggle button */}
      <div className="p-4 text-right">
        <button
          onClick={toggleMenu}
          className="text-white focus:outline-none transform transition-transform duration-300"
        >
          {isCollapsed ? (
            <LuArrowRightToLine className="size-6 font-extrabold mx-auto" />
          ) : (
            <LuArrowLeftFromLine className="size-6 font-extrabold ml-auto" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="px-3 pb-4 grow overflow-y-auto">
        <ul className="space-y-3">
          {sidebarItems.map((item: SidebarItem) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex py-2 px-2 items-center font-medium rounded-xl ${
                isCollapsed ? "gap-0 justify-center" : "gap-3"
              } whitespace-nowrap ${
                isActive(item.href)
                  ? "bg-cyan-600 text-white"
                  : "hover:text-white text-white/80 hover:bg-slate-700/60"
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

      {/* Bottom: User Profile (header-er design based) */}
      <div className="border-t border-slate-700 px-3 py-3">
        <div className="relative">
          <button
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            } w-full gap-3 p-2 rounded-lg hover:bg-slate-700/70 transition-colors`}
            onClick={() => setShowProfileMenu((prev) => !prev)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full h-10 w-10 text-white font-semibold">
                {getUserInitials()}
              </div>
              {!isCollapsed && (
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-white">
                    {user?.name || "User"}
                  </h3>
                  <p className="text-xs text-slate-300 capitalize">
                    {user?.role?.toLowerCase() || "admin"}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <svg
                className={`w-4 h-4 text-slate-300 transition-transform ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </button>

          {/* Profile dropdown menu */}
          {showProfileMenu && (
            <div
              className={`absolute ${
                isCollapsed ? "left-0" : "right-0"
              } bottom-12 mb-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10`}
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || ""}
                </p>
              </div>
              <div className="py-1">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  type="button"
                >
                  Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  type="button"
                >
                  Settings
                </button>
              </div>
              <div className="py-1 border-t border-gray-100">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleSignOut}
                  type="button"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
