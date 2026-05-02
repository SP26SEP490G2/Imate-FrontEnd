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
import type {
  CurrentSubscriptionDetail,
  UpgradePreview,
} from "@/types/response/userSubscription.response";

interface PreviewPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  upgradePreview?: UpgradePreview | null;
  currentSubscription?: CurrentSubscriptionDetail | null;
  onConfirm?: () => void;
  viewOnly?: boolean;
}

const formatPrice = (price: number) =>
  price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}đ`;

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
};

const formatLimit = (used: number, limit: number) => {
  if (limit === 2147483647) return `${used} / Không giới hạn`;
  return `${used} / ${limit}`;
};

export function PreviewPackageDialog({
  open,
  onOpenChange,
  upgradePreview,
  currentSubscription,
  onConfirm,
  viewOnly = false,
}: PreviewPackageDialogProps) {
  const hasActivePaidPlan =
    currentSubscription && currentSubscription.rank > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-slate-900 border-slate-800 text-white">
        
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {viewOnly ? "Thông tin gói hiện tại của bạn" : "Xác nhận nâng cấp"}
          </DialogTitle>

          {!viewOnly && hasActivePaidPlan && (
            <DialogDescription className="text-sm text-amber-400 leading-relaxed">
              Nâng cấp sẽ hủy gói{" "}
              <span className="text-white font-medium">
                {currentSubscription.packageName}
              </span> hiện tại của bạn.
              <br />
              Thời gian và AI Credit còn lại sẽ không được hoàn.
            </DialogDescription>
          )}
        </DialogHeader>

        {/* BODY */}
        <div className="space-y-4 text-sm">
          <div className="h-px bg-slate-700" />
          {/* VIEW ONLY */}
          {viewOnly && currentSubscription && (
            <div className="space-y-2 text-slate-300">
              <Row label="Tên gói" value={currentSubscription.packageName} />
              <Row label="Ngày đăng ký" value={formatDate(currentSubscription.startedAt)} />
              <Row label="Hết hạn" value={formatDate(currentSubscription.expiresAt)} />
              <Row
                label="Còn lại"
                value={
                  currentSubscription.remainingDays != null
                    ? `${currentSubscription.remainingDays} ngày`
                    : "—"
                }
                highlight
              />
              <Row
                label="AI Credit đã dùng"
                value={formatLimit(
                  currentSubscription.mockInterviewUsed,
                  currentSubscription.initialMockLimit
                )}
              />
            </div>
          )}

          {/* UPGRADE */}
          {!viewOnly && upgradePreview && (
            <>
              <div className="space-y-2 text-slate-300">
                <Row label="Gói mới" value={upgradePreview.newPackageName} />
                <Row
                  label="Giá"
                  value={formatPrice(upgradePreview.newPackagePrice)}
                  highlight
                />
              </div>

              {hasActivePaidPlan && (
                <div className="pt-3 border-t border-slate-800 space-y-2 text-slate-400">
                  <Row label="Gói hiện tại" value={currentSubscription.packageName} />
                  <Row label="Hết hạn" value={formatDate(currentSubscription.expiresAt)} />
                </div>
              )}
            </>
          )}
        </div>
        <div className="h-px bg-slate-700" />

        {/* FOOTER */}
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              {viewOnly ? "Đóng" : "Hủy"}
            </Button>
          </DialogClose>

          {!viewOnly && (
            <Button onClick={onConfirm}>
              Xác nhận
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===== helper row ===== */
function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? "text-white font-medium" : "text-white"}>
        {value}
      </span>
    </div>
  );
}