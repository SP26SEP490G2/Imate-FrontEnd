import React, { useEffect, useRef, useState } from "react";
import { Card } from "../ui/card";
import { MENTOR_PROFILE_MENU, RECRUITER_PROFILE_MENU, USER_PROFILE_MENU } from "@/constants/menu";
import { ROLES } from "@/constants/role";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { cn } from "@/lib/utils";
import { getInitials, getAvatarColor } from "@/helpers/common";

interface UserMenuProps {
  isOpenUserMenu: boolean;
  onClose: () => void;
  userRole?: "Candidate" | "Mentor";
  anchorRef?: React.RefObject<HTMLDivElement | null>;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpenUserMenu, onClose, anchorRef }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const handleLogout = () => {
    logout();
    navigate("/sign-in");
    onClose();
  };

  // Xử lý click bên ngoài menu để đóng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Nếu click vào anchorRef (nút Avatar ở Header) thì không xử lý ở đây
      // vì nút đó đã có logic toggle riêng
      if (anchorRef?.current?.contains(event.target as Node)) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpenUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenUserMenu, onClose]);

  useEffect(() => {
    if (!user?.avatarUrl) return;
    const img = new Image();
    img.src = user.avatarUrl;

    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(false);
  }, [user?.avatarUrl]);

  if (!isOpenUserMenu) return null;
  return (
    <div className="absolute top-14 right-0 z-50" ref={menuRef}>
      <Card className="w-72 overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-xl">

        {/* User info */}
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full font-semibold",
              getAvatarColor(user?.fullName || "User")
            )}
          >
            {loaded ? (
              <img src={user?.avatarUrl} className="h-full w-full object-cover" />
            ) : (
              <span className="font-semibold text-white">
                {getInitials(user?.fullName || "User")}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-white">
              {user?.fullName}
            </h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="flex flex-col py-2">

          {(user?.role === ROLES.MENTOR
            ? MENTOR_PROFILE_MENU
            : user?.role === ROLES.RECRUITER
              ? RECRUITER_PROFILE_MENU
              : USER_PROFILE_MENU
          ).map((item, index) => {
            const Icon = item.icon;
            const isLogout = item.label === "Đăng xuất";

            return isLogout ? (
              <button
                key={index}
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
              >
                {Icon && <Icon className="h-4 w-4 text-red-400" />}
                <span className="text-sm text-red-400">{item.label}</span>
              </button>
            ) : (
              <Link
                key={index}
                to={item.href || "#"}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/5"
              >
                {Icon && <Icon className="h-4 w-4 text-slate-300" />}
                <span className="text-sm text-slate-200">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default UserMenu;
