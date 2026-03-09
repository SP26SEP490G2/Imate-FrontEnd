import {
  ChevronDown,
  Menu,
  X,
  CalendarDays,
  History,
  Bookmark,
  FolderOpen,
  LibraryBig,
  Wallet,
  FileQuestion,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import UserMenu from "../custom/UserMenu";
import { useAuth } from "@/store/AuthContext";
import { cn } from "@/lib/utils";
import { getInitials, getAvatarColor } from "@/helpers/common";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpenUserMenu, setIsOpenUserMenu] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const loadedRef = useRef<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  // Drawer animation giữ nguyên
  useEffect(() => {
    if (isMenuOpen) {
      setIsDrawerVisible(true);
    } else {
      const timer = setTimeout(() => setIsDrawerVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isMenuOpen]);

  // Avatar cache logic giữ nguyên
  useEffect(() => {
    if (!user?.avatar) return;

    if (loadedRef.current[user.avatar]) {
      setLoaded(true);
      return;
    }

    const img = new Image();
    img.src = user.avatar;

    if (img.complete && img.naturalHeight !== 0) {
      loadedRef.current[user.avatar] = true;
      setLoaded(true);
    } else {
      img.onload = () => {
        loadedRef.current[user.avatar!] = true;
        setLoaded(true);
      };
      img.onerror = () => setLoaded(false);
    }
  }, [user?.avatar]);

  // Candidate menu giữ nguyên logic
  const menuItems = [
    {
      label: "Ngân hàng câu hỏi",
      subItems: [
        { label: "Câu hỏi của Imate", href: "/system-question-bank", icon: FolderOpen },
        { label: "Câu hỏi từ cộng đồng", href: "/contributed-question-bank", icon: LibraryBig },
        { label: "Câu hỏi đã lưu", href: "/save-question", icon: Bookmark },
        { label: "Câu hỏi đã đóng góp", href: "/my-contributed-questions", icon: FileQuestion },
      ],
    },
    { label: "Luyện tập AI", href: "/practice-with-AI" },
    { label: "Mentor", href: "/view-mentor" },
    { label: "Bảng giá", href: "/view-subscription" },
    {
      label: "Lịch phỏng vấn",
      subItems: [
        { label: "Lịch phỏng vấn", href: "/interview-schedule", icon: CalendarDays },
        { label: "Lịch sử phỏng vấn", href: "/mentor-practice-history", icon: History },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-10">

          {/* LOGO */}
          <Link to="/candidate-dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
              I
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              Imate
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden xl:flex items-center gap-8">
            {menuItems.map((item, index) =>
              item.href ? (
                <NavLink
                  key={index}
                  to={item.href}
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
              ) : (
                <div key={index} className="relative group">
                  <span className="text-sm font-semibold text-slate-300 hover:text-white cursor-pointer">
                    {item.label}
                  </span>

                  <div className="absolute left-0 top-full pt-3 hidden group-hover:block">
                    <div className="bg-slate-800 border border-white/10 rounded-xl shadow-xl min-w-[230px] p-2">
                      {item.subItems?.map((sub, i) => (
                        <NavLink
                          key={i}
                          to={sub.href}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                        >
                          {sub.icon && <sub.icon className="w-4 h-4" />}
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6">

          {/* WALLET */}
          <button
            onClick={() => navigate("/wallet")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition"
          >
            <Wallet className="w-4 h-4" />
            {user?.balance?.toLocaleString("vi-VN") || 0}
          </button>

          {/* USER */}
          <div
            className="relative"
            onClick={() => setIsOpenUserMenu(!isOpenUserMenu)}
          >
            <div className="flex items-center gap-3 cursor-pointer">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden",
                  getAvatarColor(user?.fullName || "User")
                )}
              >
                {loaded && user?.avatar ? (
                  <img
                    src={user.avatar}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(user?.fullName || "User")
                )}
              </div>

              <span className="text-white text-sm font-medium">
                {user?.fullName}
              </span>

              <ChevronDown className="w-4 h-4 text-slate-300" />
            </div>

            <UserMenu
              isOpenUserMenu={isOpenUserMenu}
              onClose={() => setIsOpenUserMenu(false)}
            />
          </div>

          {/* MOBILE MENU */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden text-white"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;