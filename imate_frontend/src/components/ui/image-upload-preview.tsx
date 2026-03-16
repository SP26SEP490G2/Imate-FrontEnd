import * as React from "react";
import { UploadCloud, Eye, Download, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageUploadPreviewProps {
  imageUrl?: string | null;
  selectedFile?: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  shape?: "square" | "circle";
  className?: string;
  allowView?: boolean;
  allowDownload?: boolean;
  allowChange?: boolean;
}

export function ImageUploadPreview({
  imageUrl,
  selectedFile,
  onFileChange,
  disabled = false,
  size = "md",
  shape = "square",
  className,
  allowView = true,
  allowDownload = true,
  allowChange = true,
}: ImageUploadPreviewProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(imageUrl || null);

React.useEffect(() => {
  if (!selectedFile) {
    setPreviewUrl(imageUrl || null);
    return;
  }

  const url = URL.createObjectURL(selectedFile);
  setPreviewUrl(url);

  return () => {
    URL.revokeObjectURL(url);
  };
}, [selectedFile, imageUrl]);

  const sizePx = {
    sm: 80,
    md: 96,
    lg: 150,
  }[size];

  const shapeClasses = {
    square: "rounded-md",
    circle: "rounded-full",
  }[shape];

  const hasImage = !!previewUrl;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh (jpg, png, gif, ...)");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Kích thước file tối đa là 5MB. Vui lòng chọn file nhỏ hơn!");
      return;
    }

    onFileChange(file);
  };

  const handleView = () => {
    if (previewUrl) window.open(previewUrl, "_blank");
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = selectedFile?.name || "company-logo.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const effectiveAllowChange = allowChange && !disabled;

  return (
    <div className={cn("space-y-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            style={{ width: sizePx, height: sizePx }}
            className={cn(
                "relative overflow-hidden bg-slate-800 border border-slate-700 cursor-pointer transition-all hover:border-primary/50 group",
                shapeClasses,
                disabled && "cursor-not-allowed opacity-70"
            )}
            >
            {/* Ảnh preview */}
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-500">
                <UploadCloud size={sizePx / 3} />
              </div>
            )}

            {/* Overlay hover */}
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <UploadCloud className="text-white" size={sizePx / 3} />
              </div>
            )}
          </div>
        </DropdownMenuTrigger>

        {/* Dropdown menu khi click */}
        <DropdownMenuContent align="start" className="w-48">
          {allowView && hasImage && (
            <DropdownMenuItem onClick={handleView}>
              <Eye size={16} className="mr-2" /> Xem ảnh
            </DropdownMenuItem>
          )}

          {allowDownload && hasImage && (
            <DropdownMenuItem onClick={handleDownload}>
              <Download size={16} className="mr-2" /> Tải ảnh
            </DropdownMenuItem>
          )}

          {effectiveAllowChange && (
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Edit size={16} className="mr-2" /> Chọn ảnh mới
            </DropdownMenuItem>
          )}

          {!hasImage && !effectiveAllowChange && (
            <DropdownMenuItem disabled>
              Không có quyền thay đổi
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}