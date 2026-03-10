import { useState, useEffect } from "react";
import { Pencil, Package, TrendingUp, TrendingDown, Crown } from "lucide-react";
import { toast } from "sonner";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import { getSubscriptionOverview, updateSubscriptionPackagePrice } from "@/services/subscriptionPackageService";
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
}

function PricingCard({ pkg, index, onEdit }: PricingCardProps) {
  const tier = getTierColor(index);
  return (
    <div
      className={`relative rounded-2xl border ${tier.border} bg-gradient-to-b ${tier.gradient} backdrop-blur-sm p-6 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-bold text-lg">{pkg.name}</h3>
        {index > 0 && (
          <button
            onClick={() => onEdit(pkg)}
            className={`p-1.5 rounded-lg ${tier.badge} hover:opacity-80 transition-opacity`}
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
      <p className="text-xs text-slate-400 mb-4 italic">
        {pkg.duration || "Esse magna sunt proident cupitat dolor."}
      </p>

      {/* Price */}
      <p className={`text-3xl font-extrabold mb-1 ${tier.text}`}>
        {formatPrice(pkg.price)}
        {pkg.price > 0 && <span className="text-base font-normal text-slate-400 ml-1">VNĐ</span>}
      </p>
      {pkg.price > 0 && (
        <p className="text-xs text-slate-500 mb-4">{pkg.duration || "5 phiên phỏng vấn"}</p>
      )}
      {pkg.price === 0 && <div className="mb-4" />}

      {/* Features */}
      <div className="mt-auto">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Features</p>
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

// ─── Edit Price Modal ───────────────────────────────────────
interface EditPriceModalProps {
  open: boolean;
  pkg: SubscriptionPackageItem | null;
  onClose: () => void;
  onUpdated: () => void;
}

function EditPriceModal({ open, pkg, onClose, onUpdated }: EditPriceModalProps) {
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset when package changes
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && pkg) {
      setPrice(pkg.price.toLocaleString("vi-VN"));
      setError("");
    }
    if (!isOpen) onClose();
  };

  const handleSubmit = async () => {
    const numericStr = price.replace(/\./g, "").replace(/,/g, "");
    const numericVal = parseInt(numericStr, 10);
    if (isNaN(numericVal) || numericVal <= 0) {
      setError(MSG36);
      return;
    }
    if (!pkg) return;

    setLoading(true);
    try {
      await updateSubscriptionPackagePrice(pkg.id, numericVal);
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
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="bg-[#111827] border-slate-800 text-slate-200 sm:max-w-[440px] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-white">Chỉnh sửa giá dịch vụ</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300">
              Giá dịch vụ cho một phiên phỏng vấn<span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Input
                value={price}
                onChange={(e) => {
                  // Xóa tất cả ký tự không phải số
                  const raw = e.target.value.replace(/\D/g, "");
                  // Format với dấu chấm phân cách hàng nghìn
                  const formatted = raw ? Number(raw).toLocaleString("vi-VN") : "";
                  setPrice(formatted);
                  if (error) setError("");
                }}
                placeholder="100.000"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 pr-14 focus-visible:ring-purple-500/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">VNĐ</span>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3">
            <p className="text-xs text-slate-500">
              <strong className="text-slate-400">Điều khoản liên quan:</strong> Giá dịch vụ sẽ được áp dụng cho tất cả các phiên phỏng vấn mới. 
              Giá sẽ được reset theo chu kỳ gói đăng ký của người dùng.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white px-6"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 shadow-lg shadow-purple-900/20"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
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

  return (
    <div className="p-8 space-y-8 bg-[#0a0f1c] min-h-screen text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center text-sm text-slate-400 mb-1">
            <span>Dashboard</span>
            <span className="mx-2">&gt;</span>
            <span className="text-slate-300">Quản lý gói đăng ký</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Quản lý gói đăng ký</h1>
        </div>
      </div>

      {/* ── Overview Section ── */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Package size={18} className="text-purple-400" /> Tổng quan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 — Total sold */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs text-slate-400 mb-2">Tổng số gói bán được</p>
            <div className="flex items-end justify-between">
              <div>
                {overviewLoading ? (
                  <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-extrabold text-white">{overview?.totalSold ?? 0}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center text-xs gap-1 text-purple-400 font-semibold">
                  <TrendingUp size={12} />
                </span>
                <Sparkline up />
              </div>
            </div>
          </div>

          {/* Card 2 — Revenue */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs text-slate-400 mb-2">Doanh thu</p>
            <div className="flex items-end justify-between">
              <div>
                {overviewLoading ? (
                  <div className="h-8 w-28 bg-slate-800 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-extrabold text-white">
                    {(overview?.totalRevenue ?? 0).toLocaleString("vi-VN")}
                    <span className="text-base font-normal text-slate-400 ml-1">VNĐ</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center text-xs gap-1 text-rose-400 font-semibold">
                  <TrendingDown size={12} />
                </span>
                <Sparkline up={false} />
              </div>
            </div>
          </div>

          {/* Card 3 — Featured package */}
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-slate-900/60 p-5 flex flex-col justify-between">
            <p className="text-xs text-slate-400 mb-2">Gói đăng ký nổi bật</p>
            <div className="flex items-center gap-2">
              <Crown size={20} className="text-purple-400" />
              <p className="text-2xl font-extrabold text-purple-300">{featured ?? "—"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Chart Section ── */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Thống kê</h2>
          <div className="flex items-center gap-4 text-xs">
            {paidPackageNames.map((name, i) => (
              <span key={name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[i] ?? "#a855f7" }} />
                {name}
              </span>
            ))}
          </div>
        </div>
        {overview?.monthlySales ? (
          <AreaChart monthlySales={overview.monthlySales} packageNames={paidPackageNames} />
        ) : overviewLoading ? (
          <div className="h-64 bg-slate-800/30 rounded animate-pulse" />
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500">Không có dữ liệu thống kê</div>
        )}
      </section>

      {/* ── Pricing Cards ── */}
      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40 p-6 h-72">
                <div className="h-5 w-28 bg-slate-800 rounded mb-3" />
                <div className="h-8 w-36 bg-slate-800 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-800 rounded" />
                  <div className="h-3 w-4/5 bg-slate-800 rounded" />
                  <div className="h-3 w-3/5 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-10 text-center text-rose-300">
            {MSG07}
          </div>
        ) : packages.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-10 text-center text-slate-400">
            {MSG06}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.slice(0, 3).map((pkg, i) => (
              <PricingCard key={pkg.id} pkg={pkg} index={i} onEdit={setEditPkg} />
            ))}
          </div>
        )}
      </section>

      {/* ── Edit Price Modal ── */}
      <EditPriceModal
        open={!!editPkg}
        pkg={editPkg}
        onClose={() => setEditPkg(null)}
        onUpdated={handlePriceUpdated}
      />
    </div>
  );
}
