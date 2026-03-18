import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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

interface CreateApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ApplicationType = "technical" | "mentor" | "comment";

export function CreateApplicationDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateApplicationDialogProps) {
  const { user } = useAuth();

  const [type, setType] = React.useState<ApplicationType>("technical");
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [bookingId, setBookingId] = React.useState<string>(""); // chỉ dùng cho tố cáo mentor
  const [commentId, setCommentId] = React.useState<string>(""); // chỉ dùng cho báo cáo comment (nếu có)

  const [evidenceFiles, setEvidenceFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);

  const resetForm = () => {
    setType("technical");
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

    evidenceFiles.forEach((file) => {
      formData.append("evidenceFiles", file);
    });

    try {
      let response;

      if (type === "technical") {
        response = await addApplicationTechnical(formData, user.id);
      } else if (type === "mentor") {
        if (!bookingId.trim() || isNaN(Number(bookingId))) {
          toast.error("Vui lòng nhập Booking ID hợp lệ");
          return;
        }
        formData.append("bookingId", bookingId.trim());
        response = await addApplicationMentor(formData, user.id);
      } else if (type === "comment") {
        if (!commentId.trim() || isNaN(Number(commentId))) {
          toast.error("Vui lòng nhập Comment ID hợp lệ");
          return;
        }
        formData.append("commentId", commentId.trim());
        // Giả sử bạn đã có reason (có thể thêm Select reason sau)
        // formData.append("reason", "Spam"); // hoặc lấy từ state
        response = await addReportCommentApplication(formData, user.id);
      }

      toast.success("Gửi đơn thành công!");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Gửi đơn thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesChange = (files: File[]) => {
    // Giới hạn số lượng file nếu cần, ví dụ 5 file
    if (files.length > 5) {
      toast.warn("Chỉ được tải lên tối đa 5 file");
      setEvidenceFiles(files.slice(0, 5));
    } else {
      setEvidenceFiles(files);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-primary">Tạo đơn mới</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* THÔNG TIN ĐƠN */}
          <div className="space-y-5 rounded-lg bg-slate-800/50 p-5 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="text-sm font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white">THÔNG TIN ĐƠN</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-200">
                  Loại đơn <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as ApplicationType)}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Chọn loại đơn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Báo lỗi kỹ thuật</SelectItem>
                    <SelectItem value="mentor">Tố cáo mentor / phiên phỏng vấn</SelectItem>
                    <SelectItem value="comment">Báo cáo bình luận</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "mentor" && (
                <div className="space-y-2">
                  <Label className="text-slate-200">
                    Booking ID <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="Nhập ID phiên đặt lịch..."
                    className="bg-slate-800 border-slate-700"
                    disabled={loading}
                  />
                </div>
              )}

              {type === "comment" && (
                <div className="space-y-2">
                  <Label className="text-slate-200">
                    Comment ID <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={commentId}
                    onChange={(e) => setCommentId(e.target.value)}
                    placeholder="Nhập ID bình luận..."
                    className="bg-slate-800 border-slate-700"
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">
                Tiêu đề <span className="text-red-400">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề đơn..."
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
                placeholder="Nhập chi tiết nội dung khiếu nại / báo lỗi của bạn..."
                className="bg-slate-800 border-slate-700 min-h-[120px]"
                disabled={loading}
              />
            </div>
          </div>

          {/* BẰNG CHỨNG */}
          <div className="space-y-5 rounded-lg bg-slate-800/50 p-5 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="text-sm font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white">BẰNG CHỨNG</h3>
              <span className="text-red-400 text-sm ml-1">(bắt buộc)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUploadPreview
                selectedFile={evidenceFiles[0] || null}
                onFileChange={(file) =>
                  setEvidenceFiles(file ? [file, ...evidenceFiles.slice(1)] : evidenceFiles.slice(1))
                }
                multiple={true}
                maxFiles={5}
                currentFiles={evidenceFiles}
                onFilesChange={handleFilesChange}
                disabled={loading}
                size="md"
                shape="square"
                label="TẢI LÊN ẢNH / VIDEO"
                subLabel="Chọn ảnh, video minh chứng"
                allowRemove={true}
              />
            </div>

            <p className="text-xs text-slate-400">
              Hỗ trợ: ảnh (jpg, png), video (mp4), tối đa 5 file, mỗi file ≤ 5MB
            </p>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
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
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? "Đang gửi..." : "Gửi đơn"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}