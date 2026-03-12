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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "react-toastify";

import { updateCompany } from "@/services/companyService"; // ← import từ service
import type { FormUpdateCompanyRequest } from "@/types/request/company.request";
import type { Company } from "@/types/model/company.model";

interface UpdateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
  onSuccess?: () => void;
}

export function UpdateCompanyDialog({
  open,
  onOpenChange,
  company,
  onSuccess,
}: UpdateCompanyDialogProps) {
  const [name, setName] = React.useState(company.name);
  const [isActive, setIsActive] = React.useState(company.isActive);
  const [loading, setLoading] = React.useState(false);

  // Đồng bộ state khi company thay đổi
  React.useEffect(() => {
    setName(company.name);
    setIsActive(company.isActive);
  }, [company, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên công ty");
      setLoading(false);
      return;
    }

    const payload: FormUpdateCompanyRequest = {
      name: name.trim(),
      newImageFile: null,
      isActive: isActive,
    };

    try {
      await updateCompany(company.id, payload);
      toast.success("Cập nhật công ty thành công!");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || "Cập nhật công ty thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Cập nhật công ty
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

          {/* Logo hiện tại (không cho thay) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-200">Logo hiện tại</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-slate-700 border border-slate-600 cursor-not-allowed opacity-70">
                    {company.imageUrl ? (
                      <img
                        src={company.imageUrl}
                        alt={company.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                        Chưa có logo
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-medium">
                      Không thể thay đổi
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Chức năng thay đổi logo đang được phát triển
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Trạng thái hoạt động */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-slate-200">
              Trạng thái hoạt động
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                {isActive ? "Hoạt động" : "Vô hiệu"}
              </span>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={loading}
                className="data-[state=checked]:bg-primary"
              />
            </div>
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
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}