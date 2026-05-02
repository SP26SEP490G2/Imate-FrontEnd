import { useState, useEffect } from "react";
import { Pencil, TrendingUp, TrendingDown, Crown, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import { getSubscriptionOverview, updateSubscriptionPackagePrice, updateSubscriptionPackageBenefits, updateSubscriptionPackageName, createSubscriptionPackage, deactivateSubscriptionPackage } from "@/services/subscriptionPackageService";
import type { SubscriptionOverviewResponse } from "@/services/subscriptionPackageService";
import type { SubscriptionPackageItem } from "@/types/common/subscriptionPackage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MSG06, MSG07, MSG09, MSG10, MSG36 } from "@/constants/messages";

// ─── Helpers ────────────────────────────────────────────────
const formatPrice = (price: number) =>
  price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}`;

// Tier-specific color configs
const tierColors: Record<number, { gradient: string; badge: string; border: string; text: string }> = {
  0: {
    gradient: "from-slate-700/60 to-slate-800/60",
    badge: "bg-slate-600/80 text-slate-200",
    border: "border-slate-700/60",
    text: "text-white",
  },
  1: {
    gradient: "from-emerald-900/40 to-emerald-950/40",
    badge: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
  },
  2: {
    gradient: "from-rose-900/30 to-rose-950/30",
    badge: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
    border: "border-rose-500/30",
    text: "text-rose-400",
  },
};

const getTierColor = (index: number) => tierColors[index] ?? tierColors[0];

// ─── SVG Area Chart ─────────────────────────────────────────
interface AreaChartProps {
  monthlySales: SubscriptionOverviewResponse["monthlySales"];
  packageNames: string[];
}

function AreaChart({ monthlySales, packageNames }: AreaChartProps) {
  const width = 700;
  const height = 260;
  const padX = 40;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;
  const chartMonths = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
  const colors = ["#10b981", "#f43f5e", "#a855f7"];

  // Extract data arrays for each package
  const seriesData = packageNames.map((name) =>
    monthlySales.map((m) => m.packageSales[name] ?? 0)
  );

  const maxVal = Math.max(1, ...seriesData.flat());
  const toX = (i: number) => padX + (i / (chartMonths.length - 1)) * chartW;
  const toY = (v: number) => padY + chartH - (v / maxVal) * chartH;

  const buildPath = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");

  const buildArea = (data: number[]) =>
    `${buildPath(data)} L${toX(data.length - 1)},${padY + chartH} L${toX(0)},${padY + chartH} Z`;

  // Y-axis labels
  const ySteps = 5;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) =>
    Math.round((maxVal / ySteps) * i)
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yLabels.map((val) => {
        const y = toY(val);
        return (
          <g key={val}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#334155" strokeWidth="0.5" />
            <text x={padX - 6} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">{val}</text>
          </g>
        );
      })}

      {/* Series */}
      {seriesData.map((data, si) => (
        <g key={si}>
          <path d={buildArea(data)} fill={colors[si]} opacity="0.15" />
          <path d={buildPath(data)} fill="none" stroke={colors[si]} strokeWidth="2" />
          {data.map((v, i) => (
            <circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill={colors[si]} />
          ))}
        </g>
      ))}

      {/* X-axis labels */}
      {chartMonths.map((m, i) => (
        <text key={m} x={toX(i)} y={height - 4} textAnchor="middle" fill="#64748b" fontSize="10">{m}</text>
      ))}

      <defs>
        {colors.map((c, i) => (
          <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}

// ─── Mini Sparkline for Overview Cards ──────────────────────
function Sparkline({ up }: { up: boolean }) {
  const color = up ? "#a855f7" : "#f43f5e";
  const d = up
    ? "M0,20 Q10,18 20,12 T40,8 T60,4 T80,2"
    : "M0,4 Q10,6 20,10 T40,14 T60,16 T80,20";
  return (
    <svg viewBox="0 0 80 24" className="w-20 h-6">
      <path d={d} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

// ─── Pricing Card ───────────────────────────────────────────
interface PricingCardProps {
  pkg: SubscriptionPackageItem;
  index: number;
  onEdit: (pkg: SubscriptionPackageItem) => void;
  onEditBenefits: (pkg: SubscriptionPackageItem) => void;
  onDelete: (pkg: SubscriptionPackageItem) => void;
}

function PricingCard({ pkg, index, onEdit, onEditBenefits, onDelete }: PricingCardProps) {
  const tier = getTierColor(index);
  return (
    <div
      className={`relative rounded-lg border ${tier.border} bg-gradient-to-b ${tier.gradient} p-6 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold text-lg">{pkg.name}</h3>
        {index > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(pkg)}
              title="Chỉnh sửa giá"
              className={`p-1.5 rounded-md ${tier.badge} hover:opacity-80 transition-opacity`}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onEditBenefits(pkg)}
              title="Chỉnh sửa tính năng"
              className={`p-1.5 rounded-md ${tier.badge} hover:opacity-80 transition-opacity`}
            >
              <Plus size={14} />
            </button>
            <button
              onClick={() => onDelete(pkg)}
              title="Xóa gói"
              className={`p-1.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>


      {/* Price */}
      <div className="mb-4">
        <p className={`text-3xl font-bold ${tier.text}`}>
          {formatPrice(pkg.price)}
        </p>
      </div>

      {/* Features */}
      <div className="mt-auto">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Tính năng</p>
        <ul className="space-y-2">
          {pkg.benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-purple-400 mt-0.5 shrink-0">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Edit Package Modal (tên + giá) ─────────────────────────
interface EditPriceModalProps {
  open: boolean;
  pkg: SubscriptionPackageItem | null;
  onClose: () => void;
  onUpdated: () => void;
}

function EditPriceModal({ open, pkg, onClose, onUpdated }: EditPriceModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill khi dialog mở — dùng useEffect thay handleOpen để tránh timing issue
  useEffect(() => {
    if (open && pkg) {
      setName(pkg.name);
      setPrice(pkg.price.toLocaleString("vi-VN"));
      setNameError("");
      setPriceError("");
    }
  }, [open, pkg]);

  const handleSubmit = async () => {
    let hasError = false;
    if (!name.trim()) { setNameError("Tên gói không được để trống."); hasError = true; }
    const numericStr = price.replace(/\./g, "").replace(/,/g, "");
    const numericVal = parseInt(numericStr, 10);
    if (isNaN(numericVal) || numericVal <= 0) { setPriceError(MSG36); hasError = true; }
    if (hasError || !pkg) return;

    setLoading(true);
    try {
      const tasks: Promise<void>[] = [];
      if (name.trim() !== pkg.name)
        tasks.push(updateSubscriptionPackageName(pkg.id, name.trim()));
      if (numericVal !== pkg.price)
        tasks.push(updateSubscriptionPackagePrice(pkg.id, numericVal));
      await Promise.all(tasks);
      toast.success(MSG09);
      onUpdated();
      onClose();
    } catch {
      toast.error(MSG10);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-[#111827] border-slate-800 text-slate-200 sm:max-w-[440px] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-white">Chỉnh sửa gói dịch vụ</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Tên gói */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-300">
              Tên gói<span className="text-red-400">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameError) setNameError(""); }}
              placeholder="VD: Gói Cơ Bản"
              className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-purple-500/50"
            />
            {nameError && <p className="text-xs text-red-400">{nameError}</p>}
          </div>

          {/* Giá */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-300">
              Giá dịch vụ<span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Input
                value={price}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  const formatted = raw ? Number(raw).toLocaleString("vi-VN") : "";
                  setPrice(formatted);
                  if (priceError) setPriceError("");
                }}
                placeholder="100.000"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 pr-14 focus-visible:ring-purple-500/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">VNĐ</span>
            </div>
            {priceError && <p className="text-xs text-red-400">{priceError}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button variant="secondary" onClick={onClose} disabled={loading}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Package Modal ───────────────────────────────────────
interface CreatePackageModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function CreatePackageModal({ open, onClose, onCreated }: CreatePackageModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setPrice("");
      setDurationDays("30");
      setBenefits([""]);
      setNameError("");
      setPriceError("");
    }
  }, [open]);

  const handleBenefitChange = (idx: number, val: string) => {
    setBenefits((prev) => prev.map((b, i) => (i === idx ? val : b)));
  };

  const handleAddBenefit = () => setBenefits((prev) => [...prev, ""]);
  const handleRemoveBenefit = (idx: number) => setBenefits((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    let hasError = false;
    if (!name.trim()) { setNameError("Tên gói không được để trống."); hasError = true; }
    
    const numericStr = price.replace(/\./g, "").replace(/,/g, "");
    const numericVal = parseInt(numericStr, 10);
    if (isNaN(numericVal) || numericVal < 0) { setPriceError("Giá trị không hợp lệ."); hasError = true; }
    
    if (hasError) return;

    setLoading(true);
    try {
      const filteredBenefits = benefits.map((b) => b.trim()).filter(Boolean);
      await createSubscriptionPackage(name.trim(), numericVal, parseInt(durationDays, 10), filteredBenefits, false);
      toast.success("Tạo gói dịch vụ thành công!");
      onCreated();
      onClose();
    } catch {
      toast.error("Tạo gói dịch vụ thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-[#111827] border-slate-800 text-slate-200 sm:max-w-[520px] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-white">Thêm gói dịch vụ mới</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Tên gói */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-300">
              Tên gói<span className="text-red-400">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameError) setNameError(""); }}
              placeholder="VD: Gói Mở Rộng"
              className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-purple-500/50"
            />
            {nameError && <p className="text-xs text-red-400">{nameError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Giá */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-300">
                Giá dịch vụ<span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Input
                  value={price}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    const formatted = raw ? Number(raw).toLocaleString("vi-VN") : "";
                    setPrice(formatted);
                    if (priceError) setPriceError("");
                  }}
                  placeholder="100.000"
                  className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 pr-14 focus-visible:ring-purple-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">VNĐ</span>
              </div>
              {priceError && <p className="text-xs text-red-400">{priceError}</p>}
            </div>

            {/* Thời hạn */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-300">
                Thời hạn (ngày)
              </Label>
              <Input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="30"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-purple-500/50"
              />
            </div>
          </div>

          {/* Tính năng */}
          <div className="space-y-2 pt-2">
            <Label className="text-sm font-medium text-slate-300">Tính năng</Label>
            {benefits.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleBenefitChange(idx, e.target.value)}
                  placeholder={`Tính năng ${idx + 1}`}
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 flex-1 focus-visible:ring-purple-500/50"
                />
                <button
                  onClick={() => handleRemoveBenefit(idx)}
                  className="p-2 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddBenefit}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors mt-2"
            >
              <Plus size={15} /> Thêm tính năng
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={onClose} disabled={loading}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo gói"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Benefits Modal ────────────────────────────────────
interface EditBenefitsModalProps {
  open: boolean;
  pkg: SubscriptionPackageItem | null;
  onClose: () => void;
  onUpdated: () => void;
}

function EditBenefitsModal({ open, pkg, onClose, onUpdated }: EditBenefitsModalProps) {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && pkg) setItems([...pkg.benefits]);
  }, [open, pkg]);

  const handleChange = (idx: number, val: string) => {
    setItems((prev) => prev.map((b, i) => (i === idx ? val : b)));
  };

  const handleAdd = () => setItems((prev) => [...prev, ""]);

  const handleRemove = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    const filtered = items.map((b) => b.trim()).filter(Boolean);
    if (!pkg) return;
    setLoading(true);
    try {
      await updateSubscriptionPackageBenefits(pkg.id, filtered);
      toast.success("Cập nhật tính năng thành công!");
      onUpdated();
      onClose();
    } catch {
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-[#111827] border-slate-800 text-slate-200 sm:max-w-[520px] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-white">
            Chỉnh sửa tính năng — {pkg?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  placeholder={`Tính năng ${idx + 1}`}
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 flex-1 focus-visible:ring-purple-500/50"
                />
                <button
                  onClick={() => handleRemove(idx)}
                  className="p-2 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Plus size={15} /> Thêm tính năng
          </button>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function SubscriptionManagement() {
  const { data: packages = [], isLoading, error, refetch: refetchPackages } = useSubscriptionPackages();
  const [editPkg, setEditPkg] = useState<SubscriptionPackageItem | null>(null);
  const [editBenefitsPkg, setEditBenefitsPkg] = useState<SubscriptionPackageItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [overview, setOverview] = useState<SubscriptionOverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const fetchOverview = async () => {
    setOverviewLoading(true);
    try {
      const data = await getSubscriptionOverview();
      setOverview(data);
    } catch {
      setOverview(null);
    } finally {
      setOverviewLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Featured package (from API or fallback)
  const featured = overview?.featuredPackageName
    ?? packages.find((p) => p.isRecommended)?.name
    ?? packages[1]?.name
    ?? null;

  // Get paid package names for chart legend
  const paidPackageNames = packages.filter((p) => p.price > 0).map((p) => p.name);
  const chartColors: Record<number, string> = { 0: "#10b981", 1: "#f43f5e", 2: "#a855f7" };

  const handlePriceUpdated = () => {
    refetchPackages();
    fetchOverview();
  };

  const handleDeletePackage = async (pkg: SubscriptionPackageItem) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa/ẩn gói "${pkg.name}" không? Gói này sẽ không hiển thị với người dùng nữa.`)) {
      try {
        await deactivateSubscriptionPackage(pkg.id);
        toast.success("Đã ẩn gói dịch vụ thành công.");
        handlePriceUpdated();
      } catch (error: any) {
        toast.error("Không thể ẩn gói dịch vụ.");
      }
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Quản lý gói đăng ký
          </h1>
          <p className="text-slate-400">
            Quản lý và cập nhật các gói đăng ký dịch vụ.
          </p>
        </div>
        <Button variant="primary" className="gap-2" onClick={() => setCreateModalOpen(true)}>
          <Plus size={16} /> Thêm gói mới
        </Button>
      </div>

      {/* ── Overview Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 — Total sold */}
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-400">Tổng số gói bán được</p>
            <TrendingUp size={16} className="text-purple-400" />
          </div>
          <div className="flex items-center gap-2">
            {overviewLoading ? (
              <div className="h-8 w-16 bg-slate-700 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-3xl font-bold text-white">{overview?.totalSold ?? 0}</p>
                <Sparkline up />
              </>
            )}
          </div>
        </div>

        {/* Card 2 — Revenue */}
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-400">Doanh thu</p>
            <TrendingDown size={16} className="text-rose-400" />
          </div>
          {overviewLoading ? (
            <div className="h-8 w-28 bg-slate-700 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">
              {(overview?.totalRevenue ?? 0).toLocaleString("vi-VN")}
              <span className="text-sm font-normal text-slate-400 ml-2">VNĐ</span>
            </p>
          )}
        </div>

        {/* Card 3 — Featured package */}
        <div className="rounded-lg border border-purple-500/30 bg-purple-900/20 p-5 flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-400 mb-3">Gói đăng ký nổi bật</p>
          <div className="flex items-center gap-2">
            <Crown size={18} className="text-purple-400" />
            <p className="text-2xl font-bold text-purple-300">{featured ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* ── Chart Section ── */}
      <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Thống kê doanh thu</h2>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            {paidPackageNames.map((name, i) => (
              <span key={name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[i] ?? "#a855f7" }} />
                <span className="text-slate-300">{name}</span>
              </span>
            ))}
          </div>
        </div>
        {overview?.monthlySales ? (
          <AreaChart monthlySales={overview.monthlySales} packageNames={paidPackageNames} />
        ) : overviewLoading ? (
          <div className="h-64 bg-slate-700 rounded animate-pulse" />
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500">Không có dữ liệu thống kê</div>
        )}
      </div>

      {/* ── Pricing Cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse rounded-lg border border-slate-700 bg-slate-800/40 p-6 h-72" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-6 py-10 text-center text-rose-300">
          {MSG07}
        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 px-6 py-10 text-center text-slate-400">
          {MSG06}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages.map((pkg, i) => (
            <PricingCard
              key={pkg.id}
              pkg={pkg}
              index={i}
              onEdit={setEditPkg}
              onEditBenefits={setEditBenefitsPkg}
              onDelete={handleDeletePackage}
            />
          ))}
        </div>
      )}

      {/* ── Edit Price Modal ── */}
      <EditPriceModal
        open={!!editPkg}
        pkg={editPkg}
        onClose={() => setEditPkg(null)}
        onUpdated={handlePriceUpdated}
      />

      {/* ── Edit Benefits Modal ── */}
      <EditBenefitsModal
        open={!!editBenefitsPkg}
        pkg={editBenefitsPkg}
        onClose={() => setEditBenefitsPkg(null)}
        onUpdated={handlePriceUpdated}
      />

      {/* ── Create Package Modal ── */}
      <CreatePackageModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handlePriceUpdated}
      />
    </div>
  );
}
