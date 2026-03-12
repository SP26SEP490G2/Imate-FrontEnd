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
import { toast } from "react-toastify";

import { addCompany } from "@/services/companyService"; // ← import từ service bạn đã có
import type { FormAddCompanyRequest } from "@/types/request/company.request";

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCompanyDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCompanyDialogProps) {
  const [name, setName] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Optional: kiểm tra loại file (image only)
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh (jpg, png, ...)");
        return;
      }
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên công ty");
      setLoading(false);
      return;
    }

    // Nếu muốn bắt buộc ảnh thì uncomment
    // if (!imageFile) {
    //   toast.error("Vui lòng chọn logo công ty");
    //   setLoading(false);
    //   return;
    // }

    const payload: FormAddCompanyRequest = {
      name: name.trim(),
      imageFile, // File | null
    };

    try {
      await addCompany(payload);
      toast.success("Thêm công ty thành công!");
      setName("");
      setImageFile(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || "Thêm công ty thất bại. Vui lòng thử lại.";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Thêm công ty mới
          </DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên công ty */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-200">
              Tên công ty <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên công ty..."
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-primary/50"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo" className="text-sm font-medium text-slate-200">
              Logo công ty (tùy chọn)
            </Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              className="bg-slate-800 border-slate-700 text-slate-100 file:bg-slate-700 file:text-slate-100 file:border-0 file:rounded file:px-3 file:py-1.5 cursor-pointer"
            />
            {imageFile && (
              <p className="text-xs text-slate-400 mt-1">
                Đã chọn: {imageFile.name}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Hủy
              </Button>
            </DialogClose>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? "Đang thêm..." : "Thêm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}