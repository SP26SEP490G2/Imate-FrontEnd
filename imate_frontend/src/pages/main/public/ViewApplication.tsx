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

// Service (giả sử bạn đã sửa để id optional hoặc xử lý backend)
import { getListApplications } from "@/services/applicationService";
import { APPLICATION_STATUS_OPTIONS, ApplicationStatus, type ApplicationStatusType } from "@/constants/enum";
import type { ApplicationListResponse, ApplicationResponse } from "@/types/response/application.response";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import type { Status } from "@/components/ui/status-badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";
import { CreateApplicationDialog } from "@/pages/dialog/CreateApplicationDialog";

export default function ViewApplication() {
  const { user } = useAuth();

  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
  fetchApplications();
};

  const statusBadgeMap: Record<ApplicationStatusType, Status> = {
    [ApplicationStatus.Pending]:   "pending",
    [ApplicationStatus.InReview]:  "pending",
    [ApplicationStatus.Approved]:  "active",
    [ApplicationStatus.Rejected]:  "error",
  };

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const isAdminOrStaff = ["Admin", "Staff"].includes(user?.role || "");

      // Chuẩn bị params
      const params = {
        PageNumber: page,
        PageSize: pageSize,
      };

      // Truyền id chỉ khi KHÔNG phải Admin/Staff
      const userId = isAdminOrStaff ? undefined : user?.id;

      // Gọi API với 2 tham số (nếu id optional thì backend xử lý)
      const response: ApplicationListResponse = await getListApplications(params, userId);

      setApplications(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (err: any) {
      console.error("Lỗi tải danh sách đơn:", err);
      setError("Không thể tải danh sách đơn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) { // Chỉ fetch khi có user
      fetchApplications();
    }
  }, [page, pageSize, user?.id, user?.role]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div className="p-10 space-y-10 min-h-full">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Đơn đã gửi
          </h1>
          <p className="text-slate-400">
            Xem tất cả các đơn lỗi kỹ thuật, tố cáo mentor, tố cáo rating
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

      {/* Bảng */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Đang tải...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Chưa có đơn nào</div>
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
                <TableCell>{new Date(app.dateSent).toLocaleDateString("vi-VN")}</TableCell>
                <TableCell>{app.title}</TableCell>
                <TableCell>
                  <StatusBadge status={statusBadgeMap[app.status as ApplicationStatusType] || "inactive"}>
                    {APPLICATION_STATUS_OPTIONS.find(opt => opt.value === app.status)?.label || app.status}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-slate-400 truncate max-w-xs">
                  {app.responseNote || "Chưa có phản hồi"}
                </TableCell>
                <TableCell className="text-slate-400 truncate max-w-xs">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={app.reviewer?.avatarUrl} alt={app.reviewer?.fullName} />
                      <AvatarFallback>
                        {app.reviewer?.fullName?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{app.reviewer?.fullName || "Chưa xử lý"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={<Eye size={14} />}
                            />
                          </TooltipTrigger>
                          <TooltipContent>Xem chi tiết</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
      )}
      {
        <CreateApplicationDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleCreateSuccess}
        />
      }
    </div>
  );
}
