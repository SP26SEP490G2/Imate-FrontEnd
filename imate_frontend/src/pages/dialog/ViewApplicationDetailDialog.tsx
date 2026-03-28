// ViewApplicationDetailDialog.tsx
import * as React from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { User, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  getApplicationTechnicalDetails,
  getApplicationMentorDetails,
  getApplicationRatingDetails,
  approveApplicationStaff,
  rejectApplicationStaff,
} from "@/services/applicationService";

import {
  ApplicationType, ApplicationStatus, getApplicationTypeLabel,
  APPLICATION_STATUS_OPTIONS, type ApplicationStatusType,
} from "@/constants/enum";

import type {
  ApplicationTechnicalDetailResponse,
  ApplicationMentorDetailResponse,
  ApplicationRatingDetailResponse,
} from "@/types/response/application.response";
import type { Status } from "@/components/ui/status-badge";
import { toast } from "react-toastify";

interface ViewApplicationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: number | null;
  applicationType?: string;
  /** Khi true (màn staff), hiển thị textarea phản hồi + nút Duyệt/Hủy */
  canReview?: boolean;
  /** Callback sau khi duyệt/hủy thành công */
  onReviewSuccess?: () => void;
}

const statusBadgeMap: Record<string, Status> = {
  [ApplicationStatus.Pending]: "pending",
  [ApplicationStatus.InReview]: "pending",
  [ApplicationStatus.Approved]: "active",
  [ApplicationStatus.Rejected]: "error",
};

function ReadonlyField({ label, value, multiline = false }: {
  label: string; value?: string | null; multiline?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-200">{label}</Label>
      {multiline ? (
        <div className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-300 text-sm min-h-[90px] whitespace-pre-wrap">
          {value || <span className="text-slate-500 italic">Không có</span>}
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-300 text-sm h-10 flex items-center">
          {value || <span className="text-slate-500 italic">Không có</span>}
        </div>
      )}
    </div>
  );
}

function EvidenceList({ urls }: { urls?: any }) {
  let list: string[] = [];
  if (Array.isArray(urls)) list = urls;
  else if (typeof urls === "string" && urls.trim().startsWith("[")) {
    try { list = JSON.parse(urls); } catch { list = []; }
  } else if (typeof urls === "string" && urls) list = [urls];

  if (list.length === 0) {
    return (
      <div className="bg-slate-800 border border-dashed border-slate-600 rounded-md px-4 py-4 text-center text-slate-500 text-sm italic">
        Không có bằng chứng đính kèm
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3">
      {list.map((url, i) => {
        const isVideo = url.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
        return isVideo ? (
          <video key={i} src={url} controls className="w-full rounded-lg border border-slate-700 object-cover aspect-square" />
        ) : (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
            <img src={url} alt={`Bằng chứng ${i + 1}`} className="w-full rounded-lg border border-slate-700 object-cover aspect-square hover:opacity-80 transition-opacity cursor-pointer" />
          </a>
        );
      })}
    </div>
  );
}

export function ViewApplicationDetailDialog({
  open, onOpenChange, applicationId, applicationType = "",
  canReview = false, onReviewSuccess,
}: ViewApplicationDetailDialogProps) {
  const [detail, setDetail] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Staff review state
  const [responseNote, setResponseNote] = React.useState("");
  const [reviewLoading, setReviewLoading] = React.useState(false);

  const fetchDetail = async () => {
    if (!applicationId) return;
    setLoading(true); setError(null);
    try {
      let data;
      if (applicationType === ApplicationType.TechnicalError) data = await getApplicationTechnicalDetails(applicationId);
      else if (applicationType === ApplicationType.ReportMentor) data = await getApplicationMentorDetails(applicationId);
      else if (applicationType === ApplicationType.ReportRating) data = await getApplicationRatingDetails(applicationId);
      else data = null;
      setDetail(data);
    } catch (err: any) {
      setError("Không thể tải chi tiết đơn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open && applicationId) { fetchDetail(); setResponseNote("");}
    else { setDetail(null); setError(null); }
  }, [open, applicationId, applicationType]);

  // Kiểm tra đơn còn có thể duyệt không (Pending / InReview)
  const isReviewable = canReview &&
    (detail?.status === ApplicationStatus.Pending || detail?.status === ApplicationStatus.InReview);

  const handleReview = async (action: "approve" | "reject") => {
    if (!applicationId) return;
    if (!responseNote.trim()) {
      toast.error("Vui lòng nhập phản hồi trước khi " + (action === "approve" ? "duyệt" : "hủy") + ".");
      return;
    }
    setReviewLoading(true);
    try {
      if (action === "approve") await approveApplicationStaff(applicationId, responseNote);
      else await rejectApplicationStaff(applicationId, responseNote);
      onOpenChange(false);
      onReviewSuccess?.();
    } catch (err: any) {
      toast.error("Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setReviewLoading(false);
    }
  };

  const statusLabel = APPLICATION_STATUS_OPTIONS.find((o) => o.value === detail?.status)?.label || detail?.status || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <div className="space-y-0.5 flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-white">Chi tiết đơn</DialogTitle>
            </div>
            {detail && (
              <div className="shrink-0 pt-1">
                <StatusBadge status={statusBadgeMap[detail.status] ?? "inactive"}>
                  {statusLabel || "Chưa xác định"}
                </StatusBadge>
              </div>
            )}
            <DialogDescription />
          </div>
          {detail && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Ngày gửi: {new Date(detail.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
          )}
        </DialogHeader>

        {loading && <div className="py-12 text-center text-slate-400">Đang tải chi tiết...</div>}
        {error && <div className="py-8 text-center text-red-400">{error}</div>}
        {!loading && !error && !detail && (
          <div className="py-8 text-center text-slate-500 italic">Chưa hỗ trợ xem chi tiết cho loại đơn này.</div>
        )}

        {!loading && !error && detail && (
          <div className="space-y-3">
            <div className="h-px bg-slate-700" />

            {/* Thông tin đơn */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Thông tin đơn</h3>
              <div className="grid grid-cols-2 gap-4">
                <ReadonlyField label="Loại đơn" value={getApplicationTypeLabel(applicationType)} />
                {detail.bookingId && <ReadonlyField label="Booking ID" value={String(detail.bookingId)} />}
                {detail.commentId && <ReadonlyField label="Comment ID" value={String(detail.commentId)} />}
              </div>
              <ReadonlyField label="Tiêu đề" value={detail.title} />
              <ReadonlyField label="Nội dung chi tiết" value={detail.content} multiline />
            </div>

            <div className="h-px bg-slate-700" />

            {/* Bằng chứng */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Bằng chứng đính kèm</h3>
              <EvidenceList urls={detail.evidenceUrls} />
            </div>

            <div className="h-px bg-slate-700" />

            {/* Xử lý & Phản hồi */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Trạng thái xử lý</h3>

              <div className="space-y-2">
                <Label className="text-slate-200">Người xử lý</Label>
                {detail.reviewerName ? (
                  <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-md px-3 py-2">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={detail.avatarUrl} alt={detail.reviewerName} />
                      <AvatarFallback>{detail.reviewerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-slate-200 text-sm font-medium">{detail.reviewerName}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 h-10">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-500 italic text-sm">Chưa có người xử lý</span>
                  </div>
                )}
              </div>

              {/* Phản hồi — readonly nếu đã có, textarea nếu staff + còn reviewable */}
              <div className="space-y-2">
                <Label className="text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  Phản hồi từ người xử lý
                </Label>

                {isReviewable ? (
                  /* Staff nhập phản hồi */
                  <Textarea
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    placeholder="Nhập phản hồi trước khi duyệt hoặc hủy đơn..."
                    className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 min-h-[100px] resize-none focus:border-primary"
                  />
                ) : (
                  /* Readonly */
                  <div className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm min-h-[80px] whitespace-pre-wrap">
                    {detail.response?.trim() ? (
                      <span className="text-slate-300">{detail.response}</span>
                    ) : (
                      <span className="text-slate-500 italic">Chưa có phản hồi</span>
                    )}
                  </div>
                )}
              </div>

              {/* Nút duyệt / hủy — chỉ khi staff và còn reviewable */}
              {isReviewable && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="danger"
                      icon={<XCircle size={16} />}
                      onClick={() => handleReview("reject")}
                      disabled={reviewLoading}
                    >
                      Từ chối
                    </Button>
                    <Button
                      variant="primary"
                      icon={<CheckCircle size={16} />}
                      onClick={() => handleReview("approve")}
                      disabled={reviewLoading}
                    >
                      Duyệt đơn
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}