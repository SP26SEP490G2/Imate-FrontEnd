import { NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { managementRoutes } from "@/config/managementRoutes";
import { useAuth } from "@/store/AuthContext";
import React from 'react';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ManagementLayout ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-white bg-red-900 min-h-screen">
        <h1>Something went wrong in ManagementLayout.</h1>
        <pre className="mt-4 text-xs">{this.state.error?.toString()}</pre>
      </div>;
    }
    return this.props.children;
  }
}

export default function ManagementLayout() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Màn hình tải nếu Auth vẫn đang check token
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#0a0f1c] text-white">Loading...</div>;
  }

  // Nếu không có user, navigate về sign-in thay vì return null (tránh black screen)
  if (!isAuthenticated || !user) {
    return <Navigate to="/sign-in" replace />;
  }

  const sidebarUser = {
    name: user.fullName || "User",
    email: user.email || "",
    avatar:
      user.avatarUrl ||
      "https://i.pinimg.com/736x/3c/67/75/3c67757cef723535a7484a6c7bfbfc43.jpg",
    role: user.role || "Role",
  };

  const handleLogout = () => {
    logout();
    navigate("/Trang-chu");
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen">

        {/* Sidebar */}
        <aside className="w-72 flex flex-col justify-between bg-gradient-to-b from-[#0f172a] to-[#020617] border-r border-slate-800">

          {/* Top */}
          <div>

            {/* Logo */}
            <div className="px-8 py-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                I
              </div>

              <span className="text-xl font-bold text-white">
                IMATE
              </span>

              <span className="text-[10px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded border border-cyan-400/30 font-semibold">
                {sidebarUser.role}
              </span>
            </div>

            {/* Menu */}
            <nav className="mt-6 flex flex-col">

              {managementRoutes.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={`/management-dashboard/${item.path}`}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-8 py-4 text-sm font-medium transition-all
                      ${
                        isActive
                          ? "text-white bg-gradient-to-r from-purple-500/20 to-transparent border-l-4 border-purple-500"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                      }`
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}

            </nav>
          </div>

          {/* User */}
          <div className="border-t border-slate-800 p-6">

            <div className="flex items-center gap-3 mb-4">
              <img
                src={sidebarUser.avatar}
                className="w-10 h-10 rounded-full object-cover"
                alt="avatar"
              />

              <div>
                <p className="text-sm text-white font-semibold">
                  {sidebarUser.name}
                </p>

                <p className="text-xs text-slate-400">
                  {sidebarUser.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-md transition"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>

          </div>

        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>

      </div>
    </ErrorBoundary>
  );
}
