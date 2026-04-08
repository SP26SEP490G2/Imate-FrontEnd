import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, FileText, Calendar, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { getListCV, deleteCV } from "@/services/cvService";
import { MSG07, MSG15, MSG17 } from "@/constants/messages";
import type { CvItem } from "@/types/common/cv";
import UploadCVModal from "./UploadCVModal";

export default function CVManagement() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const {
    data: cvList = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<CvItem[]>({
    queryKey: ["cv-list"],
    queryFn: getListCV,
  });

  const handleDelete = async (cvId: string) => {
    if (!window.confirm(MSG17)) return;

    try {
      await deleteCV(cvId);
      toast.success(MSG15);
      refetch();
    } catch {
      toast.error(MSG07);
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: CvItem["status"]) => {
    const styles: Record<CvItem["status"], string> = {
      Valid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Invalid: "bg-red-500/10 text-red-400 border-red-500/20",
      Processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    const labels: Record<CvItem["status"], string> = {
      Valid: "Hợp lệ",
      Invalid: "Không hợp lệ",
      Processing: "Đang xử lý",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">Hồ sơ ứng viên</p>
          <h1 className="text-2xl font-bold text-white">Quản lý CV</h1>
          <p className="mt-1 text-sm text-slate-400">
            Tải lên và quản lý CV của bạn để ứng tuyển nhanh hơn.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Upload className="h-4 w-4" />}
          onClick={() => setUploadModalOpen(true)}
        >
          Tải lên CV
        </Button>
      </div>

      {/* CV List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-slate-700 bg-slate-800/50 p-4"
            >
              <div className="h-5 w-48 rounded bg-slate-700" />
              <div className="mt-2 h-4 w-32 rounded bg-slate-700" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-red-400">{MSG07}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      ) : cvList.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
            <FileText className="h-8 w-8 text-slate-500" />
          </div>
          <p className="text-lg font-medium text-slate-300">Chưa có CV nào</p>
          <p className="mt-1 text-sm text-slate-500">
            Tải lên CV đầu tiên của bạn để bắt đầu.
          </p>
          <Button
            variant="primary"
            size="md"
            className="mt-6"
            icon={<Upload className="h-4 w-4" />}
            onClick={() => setUploadModalOpen(true)}
          >
            Tải lên CV
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {cvList.map((cv) => (
            <div
              key={cv.cvId}
              className="group flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition-colors hover:border-slate-600 hover:bg-slate-800"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <FileText className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{cv.fileName}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(cv.uploadDate)}
                    </span>
                    {getStatusBadge(cv.status)}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                className="text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                onClick={() => handleDelete(cv.cvId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadCVModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </div>
  );
}
