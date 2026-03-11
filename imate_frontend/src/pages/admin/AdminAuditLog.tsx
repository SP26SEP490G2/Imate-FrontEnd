// 1. REACT & LIBRARIES
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// 2. ICONS
import { Eye, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

// 3. UTILITIES & SERVICES
import { getPaginationRange } from "@/helpers/getPaginationRange";
import { getAuditLogs, getAuditLogDetail, getAuditLogFilterOptions } from "@/services/auditLogService";
import { getInitials, getAvatarColor } from "@/helpers/common";
import { cn } from "@/lib/utils";

// 4. UI COMPONENTS
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// 5. TYPES
import type { PaginatedAuditLogResponse, AuditLogListResponse, AuditLogDetailResponse } from "@/types/response/audit-log.response";

const PAGE_SIZE = 10;

const AdminAuditLog: React.FC = () => {
  //==========STATE==========
  // URL & ROUTING STATE
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentTab = (() => {
    const tab = searchParams.get("tab") || "all";
    // Fallback to "all" if tab is "actions" (removed tab)
    return tab === "actions" ? "all" : tab;
  })();

  const [formFilter, setFormFilter] = useState<{
    staffName: string;
    entityType: string;
    search: string;
  }>({
    staffName: searchParams.get("staffName") || "all",
    entityType: searchParams.get("entityType") || "all",
    search: searchParams.get("search") || "",
  });

  // DATA STATE
  const [data, setData] = useState<PaginatedAuditLogResponse | null>(null);
  const [auditLogDetail, setAuditLogDetail] = useState<AuditLogDetailResponse | null>(null);
  const [filterOptions, setFilterOptions] = useState<{
    staffNames: string[];
    actions: string[];
    entityTypes: string[];
  }>({
    staffNames: [],
    actions: [],
    entityTypes: [],
  });

  // UI STATE
  const [openDialogDetail, setOpenDialogDetail] = useState(false);

  // LOADING STATE
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // DERIVED STATE
  const totalPage = data?.totalPages || 0;
  const [paginationRange, setPaginationRange] = useState<(number | "dots")[]>([]);

  //==========USE EFFECT==========
  // Sync formFilter with URL params
  useEffect(() => {
    setFormFilter({
      staffName: searchParams.get("staffName") || "all",
      entityType: searchParams.get("entityType") || "all",
      search: searchParams.get("search") || "",
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchListData = async () => {
      try {
        setLoadingData(true);

        // Filter by tab
        let fromDate: string | undefined;
        const now = new Date();

        if (currentTab === "today") {
          // Today's date range
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          fromDate = startOfDay.toISOString();
        }

        const staffName = searchParams.get("staffName");
        const entityType = searchParams.get("entityType");
        const searchTerm = searchParams.get("search");

        const requestParams = {
          pageNumber: currentPage,
          pageSize: PAGE_SIZE,
          staffName: staffName && staffName !== "all" ? staffName : undefined,
          entityType: entityType && entityType !== "all" ? entityType : undefined,
          searchTerm: searchTerm || undefined,
          fromDate,
          sortBy: "actiontime",
          sortOrder: "desc",
        };

        const response = await getAuditLogs(requestParams);
        if (response) {
          setData(response);
          setPaginationRange(
            getPaginationRange({
              currentPage: currentPage,
              totalPage: response?.totalPages,
              siblingCount: 1,
            })
          );
        }
      } catch (error) {
        console.log("List error:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchListData();
  }, [currentPage, currentTab, searchParams]);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await getAuditLogFilterOptions();
        if (options) {
          setFilterOptions(options);
        }
      } catch (error) {
        console.log("Error fetching filter options:", error);
      }
    };
    fetchFilterOptions();
  }, []);

  // ========== EVENT HANDLES ==========
  // 1. PAGINATION HANDLE
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  // 2. TAB HANDLE
  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", value);
    newParams.set("page", "1"); // Reset to page 1 when changing tabs
    setSearchParams(newParams);
  };

  // 3. FILTER HANDLE - Auto apply when dropdown changes
  const handleFilterChange = (filterType: "staffName" | "entityType", value: string) => {
    const newParams = new URLSearchParams(searchParams);

    if (value === "all") {
      newParams.delete(filterType);
    } else {
      newParams.set(filterType, value);
    }

    newParams.set("page", "1"); // Reset to page 1 when filter changes
    setSearchParams(newParams);

    // Update formFilter state
    setFormFilter((prev) => ({ ...prev, [filterType]: value }));
  };

  // 4. SEARCH HANDLE - Only for search input
  const handleSearchSubmit = () => {
    const newParams = new URLSearchParams(searchParams);
    if (formFilter.search) {
      newParams.set("search", formFilter.search);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  // Handle Enter key in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // 4. VIEW DETAIL
  const handleViewDetails = async (id: number) => {
    try {
      setLoadingDetail(true);
      const detail = await getAuditLogDetail(id);
      if (detail) {
        setAuditLogDetail(detail);
        setOpenDialogDetail(true);
      }
    } catch (error) {
      console.log("Error fetching detail:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 6. HELPER FUNCTIONS
  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
      case "thêm":
        return "text-green-600";
      case "update":
      case "sửa":
        return "text-yellow-600";
      case "delete":
      case "xóa":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${day}, Th${month}, ${year}\n${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
  };


  return (
    <div className="min-h-screen bg-[#050816] p-6 lg:p-8 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="imate-glow-blob -top-20 -left-20" />
      <div className="imate-glow-blob bottom-[-100px] right-[-100px]" style={{ background: 'radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, transparent 70%)' }} />

      <div className="max-w-[1400px] mx-auto space-y-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Truy vết hệ thống</h1>
            <p className="text-[#A0A3BD] max-w-2xl">Theo dõi và quản lý nhật ký hoạt động của nhân viên trên nền tảng IMATE.</p>
          </div>

          <div className="flex items-center gap-3">
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-auto">
              <TabsList className="bg-[#11142D] border border-white/10 p-1 h-11 rounded-xl">
                <TabsTrigger
                  value="all"
                  className={cn(
                    "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                    "data-[state=active]:bg-[#6C63FF] data-[state=active]:text-white text-[#A0A3BD]"
                  )}
                >
                  Tất cả
                </TabsTrigger>
                <TabsTrigger
                  value="today"
                  className={cn(
                    "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                    "data-[state=active]:bg-[#6C63FF] data-[state=active]:text-white text-[#A0A3BD]"
                  )}
                >
                  Hôm nay
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Filters Card */}
        <section className="bg-[#1e293b]/40 p-6 rounded-2xl border border-white/5 mb-8 flex flex-col lg:flex-row gap-4 items-end">
          <div className="w-full lg:w-48 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">
              Người dùng
            </label>
            <Select value={formFilter.staffName} onValueChange={(value) => handleFilterChange("staffName", value)}>
              <SelectTrigger className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-auto text-sm text-white outline-none focus:ring-[#8B5CF6] transition-all">
                <SelectValue placeholder="Chọn người dùng" />
              </SelectTrigger>
              <SelectContent className="bg-[#11142D] border-white/10 text-white rounded-xl">
                <SelectItem value="all">Tất cả người dùng</SelectItem>
                {filterOptions.staffNames.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full lg:w-48 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">
              Loại Entity
            </label>
            <Select value={formFilter.entityType} onValueChange={(value) => handleFilterChange("entityType", value)}>
              <SelectTrigger className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-auto text-sm text-white outline-none focus:ring-[#8B5CF6] transition-all">
                <SelectValue placeholder="Chọn loại entity" />
              </SelectTrigger>
              <SelectContent className="bg-[#11142D] border-white/10 text-white rounded-xl">
                <SelectItem value="all">Tất cả loại</SelectItem>
                {filterOptions.entityTypes.map((entity) => (
                  <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2 w-full">
            <label className="text-xs font-bold text-slate-400 uppercase">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm nội dung, ID..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
              value={formFilter.search}
              onChange={(e) => setFormFilter((prev) => ({ ...prev, search: e.target.value }))}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <button
            onClick={handleSearchSubmit}
            className="bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-sm cursor-pointer hover:bg-indigo-600 transition-colors"
          >
            Tìm kiếm
          </button>
        </section>

        {/* Table Content */}
        <div className="imate-card overflow-hidden border-white/5">
          {loadingData ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-6 pb-4 border-b border-white/5 last:border-0">
                  <div className="h-4 w-8 animate-pulse rounded bg-white/5" />
                  <div className="h-12 w-12 animate-pulse rounded-full bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded bg-white/5" />
                    <div className="h-3 w-32 animate-pulse rounded bg-white/5" />
                  </div>
                  <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
                  <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
                  <div className="h-8 w-8 animate-pulse rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#6B6F8E] space-y-4">
              <div className="p-4 rounded-full bg-white/5">
                <Search className="h-8 w-8 opacity-20" />
              </div>
              <p className="text-lg">Không tìm thấy dữ liệu phù hợp</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full border-collapse">
                <TableHeader>
                  <TableRow className="border-b border-white/5 hover:bg-transparent bg-white/[0.02]">
                    <TableHead className="w-[60px] text-center font-bold text-[#6B6F8E] uppercase text-[10px] tracking-widest py-5">#</TableHead>
                    <TableHead className="font-bold text-[#6B6F8E] uppercase text-[10px] tracking-widest py-5">Người dùng</TableHead>
                    <TableHead className="font-bold text-[#6B6F8E] uppercase text-[10px] tracking-widest py-5">Hành động</TableHead>
                    <TableHead className="font-bold text-[#6B6F8E] uppercase text-[10px] tracking-widest py-5">Đối tượng</TableHead>
                    <TableHead className="font-bold text-[#6B6F8E] uppercase text-[10px] tracking-widest py-5">Nội dung</TableHead>
                    <TableHead className="font-bold text-[#6B6F8E] uppercase text-[10px] tracking-widest py-5">Thời gian</TableHead>
                    <TableHead className="w-[80px] text-center py-5"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data?.items.map((item, index) => (
                    <TableRow key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] group transition-colors">
                      <TableCell className="text-center font-mono text-[#6B6F8E] text-xs">
                        {String((currentPage - 1) * PAGE_SIZE + (index + 1)).padStart(2, '0')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-10 w-10 ring-2 ring-white/5 group-hover:ring-indigo-500/30 transition-all">
                              <AvatarFallback className={cn("font-bold text-white shadow-inner", getAvatarColor(item.staffName))}>
                                {getInitials(item.staffName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#22C55E] border-2 border-[#11142D]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{item.staffName}</p>
                            <p className="text-[11px] text-[#6B6F8E] font-medium">{item.staffEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          item.action.toLowerCase().includes("create") || item.action.toLowerCase().includes("thêm")
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : item.action.toLowerCase().includes("update") || item.action.toLowerCase().includes("sửa")
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {item.action}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-white px-2 py-1 rounded-md bg-white/5 border border-white/5">{item.entityType}</span>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-[#A0A3BD] line-clamp-1 max-w-[200px]">
                          {item.action} {item.entityType} ID {item.id}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-white font-medium">{formatDate(item.actionTime).split("\n")[0]}</span>
                          <span className="text-[10px] text-[#6B6F8E]">{formatDate(item.actionTime).split("\n")[1]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleViewDetails(item.id)}
                          className="p-2 rounded-lg text-[#6B6F8E] hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Improved Pagination */}
        {totalPage > 0 && (
          <div className="flex items-center justify-between pb-10">
            <p className="text-sm text-[#6B6F8E]">
              Hiển thị <span className="text-white font-medium">{(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, data?.items.length || 0)}</span> kết quả
            </p>
            <Pagination className="justify-end w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage === 1}
                    className="h-9 w-9 border-white/10 bg-[#11142D] text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-lg transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>

                {paginationRange.map((page, index) => (
                  <PaginationItem key={index}>
                    {page === "dots" ? (
                      <PaginationEllipsis className="text-[#6B6F8E]" />
                    ) : (
                      <Button
                        variant={page === currentPage ? "default" : "ghost"}
                        className={cn(
                          "h-9 w-9 rounded-lg text-xs font-bold transition-all cursor-pointer border border-transparent",
                          page === currentPage
                            ? "bg-[#6C63FF] text-white hover:bg-[#5D54E5]"
                            : "bg-transparent text-[#6B6F8E] hover:text-white hover:bg-white/5"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                      >
                        {page}
                      </Button>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage === totalPage}
                    className="h-9 w-9 border-white/10 bg-[#11142D] text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-lg transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPage) handlePageChange(currentPage + 1);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Modern Detail Dialog */}
      <Dialog open={openDialogDetail} onOpenChange={setOpenDialogDetail}>
        <DialogContent className="max-w-2xl bg-[#0B0F2A] border-white/10 text-white p-0 overflow-hidden rounded-2xl">
          <div className="p-6 border-b border-white/5 bg-[#11142D]/50">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Eye className="h-5 w-5" />
                </div>
                Chi tiết truy vết
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-[#6B6F8E] font-medium">Đang truy xuất dữ liệu...</span>
              </div>
            ) : auditLogDetail ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Information Column */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#6B6F8E] uppercase tracking-widest">Thông tin thực hiện</h4>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                      <Avatar className="h-12 w-12 ring-4 ring-indigo-500/10">
                        <AvatarFallback className={cn("font-bold text-white", getAvatarColor(auditLogDetail.staffName))}>
                          {getInitials(auditLogDetail.staffName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-white">{auditLogDetail.staffName}</p>
                        <p className="text-xs text-[#6B6F8E]">{auditLogDetail.staffEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#6B6F8E] uppercase tracking-widest">Thời gian & Hành động</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] font-bold text-[#6B6F8E] uppercase mb-1">Thời gian</p>
                        <p className="text-sm font-semibold">{formatDate(auditLogDetail.actionTime).replace('\n', ' ')}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] font-bold text-[#6B6F8E] uppercase mb-1">Hành động</p>
                        <p className="text-sm font-semibold text-indigo-400">{auditLogDetail.action}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Column */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#6B6F8E] uppercase tracking-widest">Dữ liệu thay đổi</h4>

                    <div className="space-y-3">
                      <div className="rounded-xl overflow-hidden border border-white/5">
                        <div className="bg-white/[0.03] px-4 py-2 text-[10px] font-bold text-[#6B6F8E] uppercase">Giá trị mới</div>
                        <pre className="p-4 text-[11px] bg-[#050816] font-mono text-green-400 overflow-x-auto">
                          {auditLogDetail.newValue ? JSON.stringify(auditLogDetail.newValue, null, 2) : "Không có dữ liệu"}
                        </pre>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-white/5">
                        <div className="bg-white/[0.03] px-4 py-2 text-[10px] font-bold text-[#6B6F8E] uppercase">Giá trị cũ</div>
                        <pre className="p-4 text-[11px] bg-[#050816] font-mono text-red-400 overflow-x-auto">
                          {auditLogDetail.oldValue ? JSON.stringify(auditLogDetail.oldValue, null, 2) : "Không có dữ liệu"}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="p-6 bg-[#11142D]/50 border-t border-white/5 flex justify-end">
            <Button
              onClick={() => setOpenDialogDetail(false)}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-8"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AdminAuditLog;
