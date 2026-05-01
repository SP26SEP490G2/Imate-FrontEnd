import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "react-toastify";
import { ImageUploadPreview } from "@/components/ui/image-upload-preview";
import { AlertTriangle, Info, ThumbsDown, ThumbsUp, History, Flag, ExternalLink, Eye } from "lucide-react";

import {
  addApplicationTechnical,
  addApplicationMentor,
  addReportCommentApplication,
  addOtherApplication,
} from "@/services/applicationService";

import { useAuth } from "@/store/AuthContext";
import {
  ApplicationType,
  APPLICATION_TYPE_OPTIONS,
  type ApplicationTypeEnum
} from "@/constants/enum";

interface CreateApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultType?: ApplicationTypeEnum;
  defaultBookingId?: string | number;
}

export function CreateApplicationDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultType,
  defaultBookingId,
}: CreateApplicationDialogProps) {
  const { user } = useAuth();

  const [type, setType] = React.useState<ApplicationTypeEnum>(defaultType || ApplicationType.TechnicalError);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [bookingId, setBookingId] = React.useState(defaultBookingId?.toString() || "");
  // ...existing code...

  // Update values if props change (useful when opening for different sessions)
  React.useEffect(() => {
    if (open) {
      if (defaultType) setType(defaultType);
      if (defaultBookingId) setBookingId(defaultBookingId.toString());
    }
  }, [open, defaultType, defaultBookingId]);

  const [evidenceFiles, setEvidenceFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);

  const isReportComment = type === ApplicationType.ReportComment;
  const isReportMentorGuide = type === ApplicationType.ReportMentor && defaultType !== ApplicationType.ReportMentor;
  const isReportRatingGuide = type === ApplicationType.ReportRating && defaultType !== ApplicationType.ReportRating;
  const showGuide = isReportComment || isReportMentorGuide || isReportRatingGuide;

  const filteredOptions = React.useMemo(() => {
    return APPLICATION_TYPE_OPTIONS.filter((option) => {
      if (user?.role === "Candidate") {
        // Candidate không được Report Rating (Voting)
        return option.value !== ApplicationType.ReportRating;
      }
      if (user?.role === "Mentor") {
        // Mentor không được report comment và report mentor
        return (
          option.value !== ApplicationType.ReportComment &&
          option.value !== ApplicationType.ReportMentor
        );
      }
      return true;
    });
  }, [user?.role]);

  const resetForm = () => {
    setType(defaultType || ApplicationType.TechnicalError);
    setTitle("");
    setContent("");
    setBookingId(defaultBookingId?.toString() || "");
    setEvidenceFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung chi tiết");
      return;
    }
    if (evidenceFiles.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 bằng chứng");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    evidenceFiles.forEach((file) => formData.append("evidenceFiles", file));

    try {
      // ...existing code...

      switch (type) {
        case ApplicationType.TechnicalError:
          await addApplicationTechnical(formData, user.id);
          break;
        case ApplicationType.ReportMentor:
        case ApplicationType.ReportRating:
          if (!bookingId || isNaN(Number(bookingId))) {
            toast.error("Vui lòng chọn thông tin hợp lệ để báo cáo");
            setLoading(false);
            return;
          }
          formData.append("bookingId", bookingId.trim());
          await addApplicationMentor(formData, user.id);
          break;
        case ApplicationType.ReportComment:
          // Report Comment có thể cần bookingId hoặc commentId, tùy backend
          if (bookingId) {
            formData.append("bookingId", bookingId.trim());
          }
          await addReportCommentApplication(formData, user.id);
          break;
        case ApplicationType.Other:
          await addOtherApplication(formData, user.id);
          break;
        default:
          toast.error("Loại đơn không hợp lệ");
          setLoading(false);
          return;
      }

      toast.success("Gửi đơn thành công!");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Gửi đơn thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesChange = (files: File[]) => {
    if (files.length > 5) {
      toast.warn("Chỉ được tải lên tối đa 5 file");
      setEvidenceFiles(files.slice(0, 5));
    } else {
      setEvidenceFiles(files);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-slate-900 border-slate-700 text-slate-100 max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Tạo đơn mới
          </DialogTitle>
          <DialogDescription className="sr-only">Form tạo đơn mới</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="h-px bg-slate-700" />
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Thông tin đơn <span className="text-red-400">*</span>
            </h3>

            {/* Loại đơn — luôn hiển thị */}
            <div className="space-y-2">
              <Label className="text-slate-200">
                Loại đơn <span className="text-red-400">*</span>
              </Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ApplicationTypeEnum)}
                disabled={loading || !!defaultType}
              >
                <SelectTrigger className="w-full bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Chọn loại đơn" />
                </SelectTrigger>
                <SelectContent>
                  {filteredOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hướng dẫn khi chọn ReportComment */}
            {isReportComment && (
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 text-indigo-300">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-semibold">Hướng dẫn báo cáo bình luận</span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Để báo cáo một bình luận cụ thể, vui lòng thực hiện theo các bước sau:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 border border-indigo-500/30">1</div>
                    <p className="text-sm text-slate-300">Tìm đến bài viết hoặc khóa học có chứa bình luận bạn muốn báo cáo.</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 border border-indigo-500/30">2</div>
                    <div className="space-y-3 flex-1">
                      <p className="text-sm text-slate-300">
                        Nhấn vào icon{" "}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700 border border-slate-600">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                        </span>{" "}
                        ở góc trên bên phải của bình luận đó.
                      </p>

                      {/* Comment mô phỏng */}
                      <div className="rounded-lg border border-slate-600 bg-slate-800/60 p-3 space-y-3">
                        {/* Header comment */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-[10px] font-medium text-indigo-200 flex-shrink-0">
                              NV
                            </div>
                            <div>
                              <p className="text-[11px] font-medium text-slate-200">Nguyễn Văn A</p>
                              <p className="text-[9px] text-slate-400">28/03/2026, 09:14</p>
                            </div>
                          </div>

                          {/* Icon báo cáo với highlight */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[9px] text-red-400 font-bold bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded animate-pulse">
                              Bấm tại đây
                            </span>
                            <div className="relative">
                              <span className="absolute inset-0 rounded-full border border-red-400 animate-ping opacity-75" />
                              <div className="relative w-6 h-6 rounded-full border border-red-500 bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 italic">"Nội dung bình luận cần báo cáo..."</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 border border-indigo-500/30">3</div>
                    <p className="text-sm text-slate-300">Hệ thống sẽ tự động điền thông tin liên quan, bạn chỉ cần nhập lý do và gửi đơn.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-500/20">
                  <p className="text-[11px] text-slate-500 italic">
                    * Việc báo cáo trực tiếp giúp chúng tôi xác định chính xác bình luận vi phạm.
                  </p>
                </div>
              </div>
            )}

            {/* Hướng dẫn khi chọn ReportMentor từ màn view-application */}
            {isReportMentorGuide && (
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 text-indigo-300">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-semibold">Hướng dẫn báo cáo Mentor</span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Để báo cáo một Mentor từ một buổi học cụ thể, vui lòng thực hiện các bước sau:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 border border-indigo-500/30">1</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 mb-2">Truy cập vào mục <b>Lịch sử Mentor</b>.</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                        <History size={14} className="text-indigo-400" />
                        <span>Lịch sử phỏng vấn</span>
                        <span className="text-slate-500">/</span>
                        <span>Lịch sử Mentor</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 border border-indigo-500/30">2</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 mb-2">Chọn buổi học với Mentor cần báo cáo và nhấn <b>Xem chi tiết</b>.</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                        <Eye size={14} className="text-indigo-400" />
                        <span>Chi tiết</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 border border-indigo-500/30">3</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 mb-2">Tại màn hình chi tiết, nhấn vào nút <b>Báo cáo Mentor</b>.</p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/30 text-xs font-bold text-rose-400 animate-pulse">
                        <Flag size={14} />
                        <span>Báo cáo Mentor</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-500/20">
                  <p className="text-[11px] text-slate-500 italic">
                    * Báo cáo từ chi tiết buổi học giúp hệ thống ghi nhận chính xác mã buổi học (Booking ID).
                  </p>
                </div>
              </div>
            )}

            {/* Hướng dẫn khi chọn ReportRating từ màn view-application */}
            {isReportRatingGuide && (
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 text-indigo-300">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-semibold">Hướng dẫn báo cáo đánh giá</span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Để báo cáo một đánh giá không hợp lệ từ học viên, vui lòng thực hiện các bước sau:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 border border-indigo-500/30">1</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 mb-2">Truy cập vào mục <b>Đánh giá từ học viên</b>.</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                        <ThumbsUp size={14} className="text-indigo-400" />
                        <span>Cá nhân</span>
                        <span className="text-slate-500">/</span>
                        <span>Đánh giá từ học viên</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 border border-indigo-500/30">2</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 mb-2">Tìm đến đánh giá cần báo cáo và nhấn vào icon <b>Cảnh báo</b>.</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                        <div className="relative">
                          <span className="absolute inset-0 rounded-full border border-red-400 animate-ping opacity-75" />
                          <AlertTriangle size={14} className="text-red-400 relative" />
                        </div>
                        <span className="text-red-400 font-bold ml-1">Bấm tại đây</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 border border-indigo-500/30">3</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">Hệ thống sẽ tự động lấy thông tin đánh giá, bạn chỉ cần nhập nội dung chi tiết và gửi.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-500/20">
                  <p className="text-[11px] text-slate-500 italic">
                    * Việc báo cáo từ danh sách đánh giá giúp chúng tôi xác định chính xác đánh giá vi phạm.
                  </p>
                </div>
              </div>
            )}

            {/* Các field chỉ hiện khi KHÔNG phải chế độ hướng dẫn */}
            {!showGuide && (
              <>

                <div className="space-y-2">
                  <Label className="text-slate-200">
                    Tiêu đề <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Lỗi không tải được video bài học"
                    className="bg-slate-800 border-slate-700"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">
                    Nội dung chi tiết <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Mô tả rõ ràng vấn đề bạn đang gặp phải..."
                    className="bg-slate-800 border-slate-700 min-h-[110px] resize-y"
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>

          {/* Bằng chứng — ẩn khi ở chế độ hướng dẫn */}
          {!showGuide && (
            <div className="space-y-4">
              <div className="h-px bg-slate-700" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Bằng chứng đính kèm <span className="text-red-400">*</span>
              </h3>
              <ImageUploadPreview
                multiple={true}
                currentFiles={evidenceFiles}
                onFilesChange={handleFilesChange}
                disabled={loading}
                size="lg"
                shape="square"
                maxFiles={5}
                accept="image/*,video/mp4"
                label="Tải lên ảnh, video minh chứng"
                allowRemove={true}
                allowDownload={false}
              />
              <div className="h-px bg-slate-700" />
            </div>
          )}

          <DialogFooter className="gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={resetForm}
              >
                {showGuide ? "Đóng" : "Hủy"}
              </Button>
            </DialogClose>

            {/* Nút Gửi đơn — ẩn khi ở chế độ hướng dẫn */}
            {!showGuide && (
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !title.trim() || !content.trim() || evidenceFiles.length === 0}
                className="min-w-[130px]"
              >
                {loading ? "Đang gửi đơn..." : "Gửi đơn"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}