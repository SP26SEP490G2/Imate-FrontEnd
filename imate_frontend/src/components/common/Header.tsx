import React from 'react';
import {
  Menu,
  X,
  ChevronDown,
  Wallet
} from "lucide-react";
import { useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { Button } from "@/components/ui/button";
import { HorizontalNavigationBar } from "@/components/ui/navigation-menu";
import { CANDIDATE_MENU_ITEMS, MENTOR_MENU_ITEMS } from "@/constants/menu";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/custom/UserMenu";
import type { MenuItem } from '@/types/common/menu';
import { ROLES } from '@/constants/role';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpenUserMenu, setIsOpenUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // menu cho guest
  const guestMenu = [
    { label: "Ngân hàng câu hỏi", href: "/view-question-bank" },
    { label: "Luyện tập AI", href: "/practice-with-AI" },
    { label: "Mentor", href: "/view-mentor" },
    { label: "Bảng giá", href: "/view-subscription" },
  ];

  let menuItems: MenuItem[] = guestMenu

  if (isAuthenticated) {
    if (user?.role === ROLES.MENTOR) {
      menuItems = MENTOR_MENU_ITEMS
    } else if (user?.role === ROLES.CANDIDATE) {
      menuItems = CANDIDATE_MENU_ITEMS
    }
  }

  return (
    <header className="glass-header sticky top-0 z-50 w-full backdrop-blur-lg bg-slate-900/60 border-b border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">
              I
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              IMATE
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden xl:flex items-center gap-6">
            {menuItems.map((item: any, index) => (
              <NavLink
                key={index}
                to={item.href || "#"}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-semibold transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-300 hover:text-white"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">

          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <a className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3" href="#">
                Đăng nhập
              </a>
              <a className="text-sm font-bold text-[#020617] bg-white hover:bg-slate-100 px-5 py-2.5 rounded-full transition-all" href="#">
                Đăng ký
              </a>
              <a className="text-sm font-bold text-white px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform" href="#">
                Trở thành Mentor
              </a>
              <a className="text-sm font-bold text-white px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform" href="#">
                Liên kết với chúng tôi
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-4">

              {/* Wallet */}
              <Button
                variant="outline"
                className="border-white/20 text-white cursor-pointer"
                onClick={() => navigate("/wallet")}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {user?.balance ?? 0}
              </Button>

              {/* Avatar */}
              <div
                ref={userMenuRef}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsOpenUserMenu(!isOpenUserMenu)}
              >
                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                  {user?.fullName?.charAt(0)}
                </div>

                <span className="text-sm text-white">
                  {user?.fullName}
                </span>

                <ChevronDown className="w-4 h-4 text-slate-300" />
              </div>

              <UserMenu
                isOpenUserMenu={isOpenUserMenu}
                onClose={() => setIsOpenUserMenu(false)}
                anchorRef={userMenuRef}
              />
            </div>
          )}
        </div>

        {/* Mobile button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

export default Header;