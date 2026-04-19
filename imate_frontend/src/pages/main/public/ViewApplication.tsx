import { useState, useEffect } from "react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuth } from "@/store/AuthContext";

import { getListApplications } from "@/services/applicationService";
import { 
  APPLICATION_STATUS_OPTIONS, 
  ApplicationStatus, 
  type ApplicationStatusType,
  APPLICATION_TYPE_OPTIONS 
} from "@/constants/enum";

import type { ApplicationListResponse, ApplicationResponse } from "@/types/response/application.response";

import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import type { Status } from "@/components/ui/status-badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";

import { ViewApplicationDetailDialog } from "@/pages/dialog/main/reportApplication/ViewApplicationDetailDialog";
import { CreateApplicationDialog } from "@/pages/dialog/main/reportApplication/CreateApplicationDialog";

export default function ViewApplication() {
  const { user } = useAuth();

  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // State cho dialog chi tiết
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<{
    id: number;
    type: string;
  } | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setPage(1);
    fetchApplications();
  };

  const handleViewDetail = (app: ApplicationResponse) => {
    setSelectedAppForDetail({
      id: app.id,
      type: app.applicationType || "",
    });
    setIsDetailOpen(true);
  };

  // Mapping trạng thái sang màu badge
  const statusBadgeMap: Record<ApplicationStatusType, Status> = {
    [ApplicationStatus.Pending]: "pending",
    [ApplicationStatus.InReview]: "pending",
    [ApplicationStatus.Approved]: "active",
    [ApplicationStatus.Rejected]: "error",
  };

  const fetchApplications = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const params: any = {
        PageNumber: page,
        PageSize: pageSize,
        SortBy: "createdAt",
        SortOrder: "desc",
      };

      // Filter Status
      if (statusFilter !== "") {
        params.Status = statusFilter;        // string
      }

      // Filter Type - Truyền string trực tiếp
      if (typeFilter !== "") {
        params.Type = typeFilter;            // ví dụ: "ReportMentor"
      }

      const response: ApplicationListResponse = await getListApplications(params, user.id);

      setApplications(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (err: any) {
      console.error("Lỗi tải danh sách đơn:", err);
      setError("Không thể tải danh sách đơn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.id) {
      fetchApplications();
    }
  }, [page, pageSize, statusFilter, typeFilter, user?.id]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div className="container mx-auto max-w-7xl pt-10 pb-12 space-y-8">
  
      {/* Header chính */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Quản lý đơn
          </h1>
          <p className="text-slate-400">
            Xem tất cả đơn lỗi kỹ thuật, tố cáo mentor, tố cáo rating và tố cáo comment của bạn
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={handleOpenCreateDialog}
        >
          Tạo đơn mới
        </Button>
      </div>
      <div className="h-px bg-slate-700" />

      {/* Phần Filter + Tiêu đề phụ */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Lịch sử đơn đã gửi</h2>

          <div className="flex items-center gap-2">
            {/* Filter Loại đơn */}
            <p className="text-slate-400 text-sm">Loại đơn:</p>
            <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 w-44 focus:outline-none focus:border-primary"
              >
                <option value="">Tất cả</option>
                {APPLICATION_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

            {/* Filter Trạng thái */}
            <p className="text-slate-400 text-sm">Trạng thái:</p>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 w-44 focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Tất cả</option>
              {APPLICATION_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Đang tải danh sách đơn...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-900/50 border border-slate-700 rounded-2xl p-12">
          Bạn chưa có đơn nào. Hãy tạo đơn mới.
        </div>
      ) : (
        <Table
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          maxHeight="55vh"
        >
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Loại đơn</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Phản hồi</TableHead>
              <TableHead>Người xử lý</TableHead>
              <TableHead className="w-[140px] text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app, index) => (
              <TableRow key={app.id}>
                <TableCell className="text-slate-400">
                  {String((page - 1) * pageSize + index + 1).padStart(2, "0")}
                </TableCell>
                <TableCell className="font-medium">{app.applicationType}</TableCell>
                <TableCell>{new Date(app.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                <TableCell className="max-w-md truncate">{app.title}</TableCell>
                <TableCell>
                  <StatusBadge 
                    status={statusBadgeMap[app.status as ApplicationStatusType] || "inactive"}
                  >
                    {APPLICATION_STATUS_OPTIONS.find(opt => opt.value === app.status)?.label || app.status}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-slate-400 truncate max-w-xs">
                  {app.responseNote || "Chưa có phản hồi"}
                </TableCell>
                <TableCell className="text-slate-400">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={app.reviewer?.avatarUrl} 
                        alt={app.reviewer?.fullName} 
                      />
                      <AvatarFallback>
                        {app.reviewer?.fullName?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {app.reviewer?.fullName || "Chưa xử lý"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Eye size={14} />}
                        onClick={() => handleViewDetail(app)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Xem chi tiết đơn</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Dialogs */}
      <CreateApplicationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <ViewApplicationDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        applicationId={selectedAppForDetail?.id || null}
        applicationType={selectedAppForDetail?.type || ""}
      />
    </div>
  );
}