import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import { useAuth } from "@/store/AuthContext";
import {
  createUserSubscription,
  getCurrentPackage,
  getCurrentSubscriptionDetail,
  getUpgradePreview,
} from "@/services/userSubscriptionService";
import { PreviewPackageDialog } from "@/pages/dialog/main/payment/PreviewPackageDialog";
import type {
  CurrentPackage,
  CurrentSubscriptionDetail,
} from "@/types/response/userSubscription.response";

const formatPrice = (price: number) => {
  if (price === 0) return "Miễn phí";
  return `${price.toLocaleString("vi-VN")}đ`;
};

const ViewSubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");
  const [viewOnly, setViewOnly] = React.useState(false);
  const { data: packages = [], isLoading, error, refetch } = useSubscriptionPackages();

  const [currentPackage, setCurrentPackage] = React.useState<CurrentPackage | null>(null);
  const [currentDetail, setCurrentDetail] = React.useState<CurrentSubscriptionDetail | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [upgradePreview, setUpgradePreview] = React.useState<any>(null);
  const [selectedPackageId, setSelectedPackageId] = React.useState<number | null>(null);

  // ===== FETCH =====
  const fetchSubscriptionInfo = async () => {
    if (!user) return;
    try {
      const [pkg, detail] = await Promise.all([
        getCurrentPackage(),
        getCurrentSubscriptionDetail(),
      ]);
      setCurrentPackage(pkg);
      setCurrentDetail(detail);
    } catch (err) {
      console.log("Cannot get subscription info", err);
    }
  };

  useEffect(() => {
    fetchSubscriptionInfo();
  }, [user]);

  // ===== HANDLE CLICK =====
  const handleUpgradeClick = async (pkg: any) => {
    if (!user) {
      navigate("/sign-in");
      return;
    }
    setSelectedPackageId(pkg.id);

    try {
      const preview = await getUpgradePreview(pkg.id);
      setUpgradePreview(preview);
      setDialogOpen(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ===== CONFIRM =====
  const handleConfirm = async () => {
    if (!selectedPackageId) return;
    try {
      await createUserSubscription(selectedPackageId);
      toast.success("Nâng cấp gói thành công!");
      setDialogOpen(false);
      await fetchSubscriptionInfo();
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="font-sans bg-[#020617]">
      <main className="px-6 pb-6 pt-16">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              {from === "premium"
                ? "Bạn cần nâng cấp gói để sử dụng tính năng này"
                : "Chọn gói dịch vụ phù hợp với bạn"}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Mở khóa nhiều quyền lợi hơn để tăng tốc hành trình luyện phỏng
              vấn IT cùng Imate.
            </p>
          </div>

          {/* LOADING */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-white/10 bg-[#1e293b]/50 p-8"
                >
                  <div className="h-5 w-24 bg-slate-700 rounded mb-4" />
                  <div className="h-10 w-36 bg-slate-700 rounded mb-6" />
                  <div className="space-y-3 mb-8">
                    <div className="h-4 w-full bg-slate-800 rounded" />
                    <div className="h-4 w-4/5 bg-slate-800 rounded" />
                    <div className="h-4 w-3/5 bg-slate-800 rounded" />
                  </div>
                  <div className="h-11 w-full bg-slate-700 rounded-xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-10 text-center">
              <p className="text-red-300 mb-4">
                {error instanceof Error
                  ? error.message
                  : "Không thể tải danh sách gói dịch vụ."}
              </p>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : packages.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#1e293b]/40 px-6 py-10 text-center text-slate-300">
              Hiện chưa có gói dịch vụ khả dụng.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.slice(0, 3).map((subscriptionPackage) => {
                const isCurrent =
                  currentPackage?.packageId === subscriptionPackage.id;
                const isUpgradable =
                  currentPackage &&
                  subscriptionPackage.rank > currentPackage.rank;
                const isLowerRank =
                  currentPackage &&
                  subscriptionPackage.rank < currentPackage.rank;

                let cardStyle = "bg-[#1e293b]/45 border-white/10";
                const highlightStyle =
                  "bg-gradient-to-b from-indigo-500/20 to-purple-500/10 border-indigo-400/50 shadow-xl shadow-indigo-900/30 scale-105";

                if (!user && subscriptionPackage.isRecommended)
                  cardStyle = highlightStyle;
                if (user && isCurrent) cardStyle = highlightStyle;

                return (
                  <article
                    key={subscriptionPackage.id}
                    className={`relative rounded-3xl border p-8 backdrop-blur-sm transition-all ${cardStyle}`}
                  >
                    {/* Badge */}
                    {user && isCurrent && (
                      <span className="absolute top-5 right-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-[11px] font-bold text-white">
                        GÓI CỦA BẠN
                      </span>
                    )}
                    {!user && subscriptionPackage.isRecommended && (
                      <span className="absolute top-5 right-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-[11px] font-bold text-white">
                        KHUYÊN DÙNG
                      </span>
                    )}

                    <h2 className="text-white text-2xl font-bold mb-2">
                      {subscriptionPackage.name}
                    </h2>
                    <p className="text-3xl font-extrabold text-white mb-1">
                      {formatPrice(subscriptionPackage.price)}
                    </p>
                    <p className="text-sm text-slate-400 mb-2">
                      {subscriptionPackage.duration}
                    </p>
                    {subscriptionPackage.totalInterviewLimit != null && subscriptionPackage.totalInterviewLimit > 0 && (
                      <p className="text-sm text-indigo-400 font-semibold mb-6">
                        Được nhận {subscriptionPackage.totalInterviewLimit.toLocaleString("vi-VN")} AI Credits
                      </p>
                    )}
                    {(subscriptionPackage.totalInterviewLimit == null || subscriptionPackage.totalInterviewLimit <= 0) && (
                      <div className="mb-6" />
                    )}

                    <ul className="space-y-3 mb-8 min-h-[120px]">
                      {subscriptionPackage.benefits.map(
                        (benefit: string, index: number) => (
                          <li
                            key={`${subscriptionPackage.id}-${index}`}
                            className="flex items-start gap-2 text-slate-200 text-sm"
                          >
                            <span className="text-indigo-400 mt-0.5">✓</span>
                            <span>{benefit}</span>
                          </li>
                        )
                      )}
                    </ul>

                    {/* Buttons */}
                    <div className="flex flex-col gap-2">

                      {isCurrent && subscriptionPackage.price > 0 && (
                        <button
                          onClick={() => {
                            setViewOnly(true);
                            setUpgradePreview(null);
                            setDialogOpen(true);
                          }}
                          className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
                        >
                          Thông tin gói
                        </button>
                      )}

                      {/* Gói cao hơn → Nâng cấp */}
                      {isUpgradable && (
                        <button
                          onClick={() => handleUpgradeClick(subscriptionPackage)}
                          className="w-full py-3 rounded-xl font-bold bg-white text-[#0f172a] hover:bg-slate-100 transition-all"
                        >
                          Nâng cấp gói
                        </button>
                      )}

                      {/* Chưa đăng nhập, gói có phí → Mua ngay */}
                      {!user && subscriptionPackage.price > 0 && (
                        <button
                          onClick={() => navigate("/sign-in")}
                          className={`w-full py-3 rounded-xl font-bold transition-all ${
                            subscriptionPackage.isRecommended
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
                              : "bg-white text-[#0f172a] hover:bg-slate-100"
                          }`}
                        >
                          Mua ngay
                        </button>
                      )}

                      {/* Gói thấp hơn hiện tại → ẩn button */}
                      {isLowerRank && !isCurrent && null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <PreviewPackageDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setViewOnly(false);
        }}
        upgradePreview={upgradePreview}
        currentSubscription={currentDetail}
        onConfirm={handleConfirm}
        viewOnly={viewOnly}
      />
    </div>
  );
};

export default ViewSubscriptionPage;