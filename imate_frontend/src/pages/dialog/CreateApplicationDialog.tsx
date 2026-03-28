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

import {
  addApplicationTechnical,
  addApplicationMentor,
  addReportCommentApplication,
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
}

export function CreateApplicationDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateApplicationDialogProps) {
  const { user } = useAuth();

  const [type, setType] = React.useState<ApplicationTypeEnum>(ApplicationType.TechnicalError);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [bookingId, setBookingId] = React.useState("");
  const [commentId, setCommentId] = React.useState("");

  const [evidenceFiles, setEvidenceFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);

  const resetForm = () => {
    setType(ApplicationType.TechnicalError);
    setTitle("");
    setContent("");
    setBookingId("");
    setCommentId("");
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
      let response;

      switch (type) {
        case ApplicationType.TechnicalError:
          response = await addApplicationTechnical(formData, user.id);
          break;
        case ApplicationType.ReportMentor:
          if (!bookingId || isNaN(Number(bookingId))) {
            toast.error("Vui lòng nhập Booking ID hợp lệ");
            setLoading(false);
            return;
          }
          formData.append("bookingId", bookingId.trim());
          response = await addApplicationMentor(formData, user.id);
          break;
        case ApplicationType.ReportComment:
          if (!commentId || isNaN(Number(commentId))) {
            toast.error("Vui lòng nhập Comment ID hợp lệ");
            setLoading(false);
            return;
          }
          formData.append("commentId", commentId.trim());
          response = await addReportCommentApplication(formData, user.id);
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
            {/* ── Thông tin đơn ── */}
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Thông tin đơn <span className="text-red-400">*</span>
              </h3>
            <div className="space-y-2">
              <Label className="text-slate-200">
                Loại đơn <span className="text-red-400">*</span>
              </Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ApplicationTypeEnum)}
                disabled={loading}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Chọn loại đơn" />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Field động */}
            {type === ApplicationType.ReportMentor && (
              <div className="space-y-2">
                <Label className="text-slate-200">
                  Booking ID <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="number"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Nhập Booking ID của phiên học"
                  className="bg-slate-800 border-slate-700"
                  disabled={loading}
                />
              </div>
            )}

            {type === ApplicationType.ReportComment && (
              <div className="space-y-2">
                <Label className="text-slate-200">
                  Comment ID <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="number"
                  value={commentId}
                  onChange={(e) => setCommentId(e.target.value)}
                  placeholder="Nhập ID của bình luận cần báo cáo"
                  className="bg-slate-800 border-slate-700"
                  disabled={loading}
                />
              </div>
            )}

            {/* Tiêu đề và Nội dung */}
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
          </div>

          {/* Bằng chứng */}
          <div className="space-y-4">
            <div className="h-px bg-slate-700" />
            {/* ── Thông tin đơn ── */}
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

          <DialogFooter className="gap-3 pt-6">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={resetForm}
              >
                Hủy
              </Button>
            </DialogClose>

            <Button
              type="submit"
              variant="primary"
              disabled={loading || !title.trim() || !content.trim() || evidenceFiles.length === 0}
              className="min-w-[130px]"
            >
              {loading ? "Đang gửi đơn..." : "Gửi đơn"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}