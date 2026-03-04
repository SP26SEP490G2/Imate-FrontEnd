import React, { useEffect, useRef, useState } from "react";
import { Card } from "../ui/card";
import { MENTOR_PROFILE_MENU, USER_PROFILE_MENU } from "@/constants/menu";
import { Separator } from "../ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { cn } from "@/lib/utils";
import { getInitials, getAvatarColor } from "@/helpers/common";

interface UserMenuProps {
  isOpenUserMenu: boolean;
  onClose: () => void;
  userRole?: "Candidate" | "Mentor";
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpenUserMenu, onClose }) => {
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
    <div className="absolute top-12 -right-1 z-10 bg-transparent" ref={menuRef}>
      <Card className="w-72 gap-0 rounded-md border bg-white py-0 shadow">
        {/* Header thông tin user */}
        <div className="flex items-center gap-3 border-b p-4">
          <div className={cn("flex h-10 w-10 items-center justify-center overflow-hidden rounded-full font-semibold", getAvatarColor(user?.fullName || "User"))}>
            {loaded ? <img src={user?.avatarUrl} className="h-full w-full object-cover" /> : <span className="font-semibold text-white">{getInitials(user?.fullName || "User")}</span>}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user?.fullName}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Danh sách menu */}
        <div className="flex flex-col">
          {user?.role === "Mentor"
            ? MENTOR_PROFILE_MENU.filter((item) => {
                // Nếu accountStatus là PendingVerification, chỉ hiển thị "Hồ sơ cá nhân", "Câu hỏi đã đăng" và "Đăng xuất"
                if (user?.accountStatus === "PendingVerification") {
                  return item.label === "Hồ sơ cá nhân" || item.label === "Câu hỏi đã đăng" || item.label === "Đăng xuất";
                }
                return true;
              }).map((item, index) => {
                const Icon = item.icon;
                const isLogout = item.label === "Đăng xuất";
                return (
                  <React.Fragment key={item.href}>
                    {index === 5 && <Separator />}
                    {isLogout ? (
                      <button onClick={handleLogout} className="flex w-full cursor-pointer items-center gap-3 bg-transparent px-4 py-3 text-left transition hover:bg-gray-50">
                        {Icon && <Icon className="h-5 w-5 text-red-600" />}
                        <span className="text-sm text-red-600">{item.label}</span>
                      </button>
                    ) : (
                      <Link to={item.href || "#"} className={`flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50 ${index >= 5 ? "border-t last:border-none" : ""}`}>
                        {Icon && <Icon className="h-5 w-5 text-gray-600" />}
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </Link>
                    )}
                  </React.Fragment>
                );
              })
            : USER_PROFILE_MENU.map((item, index) => {
                const Icon = item.icon;

                const isLogout = item.label === "Đăng xuất";

                return (
                  <React.Fragment key={item.href}>
                    {index === 7 && <Separator />}
                    {isLogout ? (
                      <button onClick={handleLogout} className="flex w-full cursor-pointer items-center gap-3 bg-transparent px-4 py-3 text-left transition hover:bg-gray-50">
                        {Icon && <Icon className="h-5 w-5 text-red-600" />}
                        <span className="text-sm text-red-600">{item.label}</span>
                      </button>
                    ) : (
                      <Link to={item.href || "#"} className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50">
                        {Icon && <Icon className="h-5 w-5 text-gray-600" />}
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
        </div>
      </Card>
    </div>
  );
};

export default UserMenu;
