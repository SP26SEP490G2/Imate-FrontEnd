import React, { useState, useEffect } from "react";
import { Users, Zap, UserPlus, Eye, Trash2, Search } from "lucide-react";
import { getOverviewAccount, getAccountList, updateAccountState } from "@/services/accountService";
import type { OverviewChartAccountResponse, AccountResponse } from "@/types/response/account.response";
import { MSG09, MSG10 } from "@/constants/messages";
import { ROLES } from "@/constants/role";
import { ACCOUNT_STATUS, ACCOUNT_STATUS_STRING, ROLE_LABELS, ROLE_BADGE_COLORS, DEFAULT_BADGE_COLOR } from "@/constants/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import UserAccountDetailModal from "@/dialog/management/account/UserAccountDetailModal";
import CreateStaffModal from "@/dialog/management/account/CreateStaffModal";

// This layout replicates the mockup
export default function UserManagement() {
  const [overview, setOverview] = useState<OverviewChartAccountResponse | null>(null);
  const [users, setUsers] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Table state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail modal
  const [selectedUser, setSelectedUser] = useState<AccountResponse | null>(null);

  // Confirmation dialog for status toggle
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: AccountResponse | null;
    newChecked: boolean;
  }>({ open: false, user: null, newChecked: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [createStaffOpen, setCreateStaffOpen] = useState(false);

  const fetchOverview = async () => {
    try {
      const data = await getOverviewAccount();
      if (data) setOverview(data);
    } catch (error) {
      console.error("Failed to fetch overview", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Construct params. For roles, we might need a specific filter if the API supports it, 
      // but according to the given accountService, we only have SearchTerm, SortBy, Page.
      // AccountStatus exists too.
      // Assuming role filtering is done later, or we map roleFilter to some query?
      // Mockup has "Vai trò: Tất cả".
      const params = {
        PageNumber: page,
        PageSize: 10,
        SearchTerm: searchTerm || undefined,
      };
      const data = await getAccountList(params);
      if (data) {
        let filteredUsers = data.items || [];
        if (roleFilter !== "all") {
          filteredUsers = filteredUsers.filter(u => u.roles?.includes(roleFilter));
        }
        setUsers(filteredUsers);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    // debounce search
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, page]);

  // Show confirmation dialog before changing status
  const handleStatusToggle = (user: AccountResponse, checked: boolean) => {
    setConfirmDialog({ open: true, user, newChecked: checked });
  };

  // Actually perform the status change after confirmation
  const handleConfirmStatusChange = async () => {
    // Capture values BEFORE closing dialog to avoid race condition
    const user = confirmDialog.user;
    const newChecked = confirmDialog.newChecked;
    
    if (!user) return;

    // Close dialog immediately
    setConfirmDialog({ open: false, user: null, newChecked: false });

    // Backend AccountStatus enum: Active=0, Suspended=1, PendingVerification=2
    // Backend endpoint expects string: "Active" or "Suspended"
    const newStatusStr = newChecked ? ACCOUNT_STATUS_STRING.ACTIVE : ACCOUNT_STATUS_STRING.SUSPENDED;
    const newStatusNum = newChecked ? ACCOUNT_STATUS.ACTIVE : ACCOUNT_STATUS.SUSPENDED;

    // Save previous state for rollback
    const previousUsers = [...users];

    // Optimistic update: update UI immediately
    setUsers(prev =>
      prev.map(u =>
        u.id === user.id ? { ...u, status: newStatusNum } : u
      )
    );

    try {
      await updateAccountState({ 
        id: user.id, 
        status: newStatusStr 
      });
      toast.success(MSG09);
      // Cập nhật overview stats (không refetch users vì optimistic update đã đúng)
      fetchOverview();
    } catch (error) {
      // Revert to previous state on failure
      setUsers(previousUsers);
      toast.error(MSG10);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#0a0f1c] min-h-screen text-slate-200">
      
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center text-sm text-slate-400 mb-1">
            <span>Dashboard</span>
            <span className="mx-2">&gt;</span>
            <span className="text-slate-300">Quản lý người dùng</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Quản lý người dùng</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="md" className="bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white gap-2 font-medium px-4 shadow-lg shadow-purple-900/20"
            onClick={() => setCreateStaffOpen(true)}
          >
            <span className="text-lg leading-none">+</span> Thêm tài khoản nhân viên
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users className="text-purple-400" size={20} />
            </div>
            {overview?.totalUsers?.trend && (
              <div className={cn("text-sm font-medium flex items-center gap-1", overview.totalUsers.trend?.isPositive ? "text-emerald-400" : "text-rose-400")}>
                {overview.totalUsers.trend?.isPositive ? "↗" : "↘"} {overview.totalUsers.trend?.percentage}%
              </div>
            )}
          </div>
          <div className="text-slate-400 text-sm mb-1">Tổng người dùng</div>
          <div className="text-3xl font-bold text-white mb-4">
            {overview?.totalUsers?.value?.toLocaleString() ?? "0"}
          </div>
          {/* Simple trendline mock */}
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-purple-500 w-[70%]"></div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Zap className="text-rose-400" size={20} />
            </div>
            {overview?.activeUsers?.trend && (
              <div className={cn("text-sm font-medium flex items-center gap-1", overview.activeUsers.trend?.isPositive ? "text-emerald-400" : "text-rose-400")}>
                {overview.activeUsers.trend?.isPositive ? "↗" : "↘"} {overview.activeUsers.trend?.percentage}%
              </div>
            )}
          </div>
          <div className="text-slate-400 text-sm mb-1">Người dùng hoạt động</div>
          <div className="text-3xl font-bold text-white mb-4">
            {overview?.activeUsers?.value?.toLocaleString() ?? "0"}
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-rose-500 w-[40%]"></div>
          </div>
        </div>

        {/* New Users */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <UserPlus className="text-emerald-400" size={20} />
            </div>
            {overview?.newUsers?.trend && (
              <div className={cn("text-sm font-medium flex items-center gap-1", overview.newUsers.trend?.isPositive ? "text-emerald-400" : "text-rose-400")}>
                {overview.newUsers.trend?.isPositive ? "↗" : "↘"} {overview.newUsers.trend?.percentage}%
              </div>
            )}
          </div>
          <div className="text-slate-400 text-sm mb-1">Người dùng mới</div>
          <div className="text-3xl font-bold text-white mb-4">
            {overview?.newUsers?.value?.toLocaleString() ?? "0"}
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 w-[85%]"></div>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl">
        <div className="p-6 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Danh sách tài khoản</h2>
            <p className="text-sm text-slate-400">{totalCount.toLocaleString()} người dùng được tìm thấy</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <Input 
                placeholder="Tìm kiếm người dùng..." 
                className="pl-10 bg-slate-900 border-slate-800 text-sm w-[250px] focus-visible:ring-purple-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px] bg-slate-900 border-slate-800 text-sm">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                <SelectItem value="all">Vai trò: Tất cả</SelectItem>
                <SelectItem value={ROLES.CANDIDATE}>Ứng viên</SelectItem>
                <SelectItem value={ROLES.MENTOR}>Mentor</SelectItem>
                <SelectItem value={ROLES.STAFF}>Nhân viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800/60">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">NO.</th>
                <th className="px-6 py-4 font-medium tracking-wider">TÊN NGƯỜI DÙNG</th>
                <th className="px-6 py-4 font-medium tracking-wider">EMAIL</th>
                <th className="px-6 py-4 font-medium tracking-wider">VAI TRÒ</th>
                <th className="px-6 py-4 font-medium tracking-wider">NGÀY THAM GIA</th>
                <th className="px-6 py-4 font-medium tracking-wider">TRẠNG THÁI</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Không tìm thấy người dùng
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {String((page - 1) * 10 + index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-700">
                          <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                          <AvatarFallback className="bg-slate-800 text-slate-300">
                            {user.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{user.fullName}</span>
                          {/* Subtitle logic based on role if desired, mockup shows "SOFTWARE ENGINEER" etc, keeping it simple or reading from user bio if available. Since it's not in base account model, omit for now or leave generic. */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.roles?.map(role => (
                          <Badge 
                            key={role} 
                            variant="outline" 
                            className={cn(
                              "font-medium border-none",
                              ROLE_BADGE_COLORS[role] ?? DEFAULT_BADGE_COLOR
                            )}>
                            {ROLE_LABELS[role] ?? role}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Switch 
                        checked={user.status === ACCOUNT_STATUS.ACTIVE} // Active=0 in backend enum
                        onCheckedChange={(c) => handleStatusToggle(user, c)}
                        className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-slate-700" 
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10"
                          onClick={() => { setSelectedUser(user); setModalOpen(true); }}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-800/60 flex items-center justify-between text-sm text-slate-400">
          <div>
            Hiển thị <span className="font-semibold text-slate-300">{(page - 1) * 10 + 1} - {Math.min(page * 10, totalCount)}</span> trong số <span className="font-semibold text-slate-300">{totalCount.toLocaleString()}</span>
          </div>
          {totalPages > 1 && (
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300"
                    disabled={page <= 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  >
                    {"<"}
                  </Button>
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  // simple pagination logic to show first few, current, and last few
                  if (
                    pNum === 1 || 
                    pNum === totalPages || 
                    (pNum >= page - 1 && pNum <= page + 1)
                  ) {
                    return (
                      <PaginationItem key={pNum}>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-8 min-w-8 bg-slate-900 border-slate-800 hover:bg-slate-800 px-3",
                            page === pNum ? "bg-purple-600 text-white hover:bg-purple-700 hover:text-white border-purple-600" : "text-slate-300"
                          )}
                          onClick={() => setPage(pNum)}
                        >
                          {pNum}
                        </Button>
                      </PaginationItem>
                    );
                  } else if (
                    pNum === page - 2 || 
                    pNum === page + 2
                  ) {
                    return <PaginationItem key={pNum} className="text-slate-500 px-1">...</PaginationItem>;
                  }
                  return null;
                })}
                
                <PaginationItem>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300"
                    disabled={page >= totalPages}
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    {">"}
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>

      <UserAccountDetailModal
        user={selectedUser}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedUser(null); }}
      />

      {/* Confirmation Dialog for Status Toggle */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ open: false, user: null, newChecked: false });
        }}
      >
        <AlertDialogContent className="bg-[#111827] border-slate-800 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {confirmDialog.newChecked ? "Kích hoạt tài khoản" : "Vô hiệu hóa tài khoản"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {confirmDialog.newChecked 
                ? <>Bạn có chắc chắn muốn <span className="text-emerald-400 font-medium">kích hoạt</span> tài khoản <span className="text-white font-medium">"{confirmDialog.user?.fullName}"</span>?</>
                : <>Bạn có chắc chắn muốn <span className="text-rose-400 font-medium">vô hiệu hóa</span> tài khoản <span className="text-white font-medium">"{confirmDialog.user?.fullName}"</span>? Người dùng sẽ không thể đăng nhập.</>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setConfirmDialog({ open: false, user: null, newChecked: false })}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              className={cn(
                "font-medium",
                confirmDialog.newChecked 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              )}
            >
              {confirmDialog.newChecked ? "Kích hoạt" : "Vô hiệu hóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Staff Modal */}
      <CreateStaffModal
        open={createStaffOpen}
        onClose={() => setCreateStaffOpen(false)}
        onCreated={() => { fetchUsers(); fetchOverview(); }}
      />
    </div>
  );
}
