import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import {
  getPendingMentorApplications,
  getPendingRecruiterApplications,
  reviewMentorApplication,
  reviewRecruiterApplication,
} from "@/services/staffReviewService";
import type { StaffMentorApplication } from "@/types/response/staffReview.response";
import type { StaffRecruiterApplication } from "@/types/response/staffReview.response";
import { toast } from "react-toastify";

const PAGE_SIZE = 6;
type Tab = "mentor" | "recruiter";

/* ─── helpers ─── */
function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

const COLORS = ["bg-purple-500", "bg-blue-500", "bg-pink-500", "bg-amber-500", "bg-emerald-500", "bg-indigo-400"];

function Avatar({ name, url, className }: { name: string; url?: string | null; className?: string }) {
  if (url)
    return <img src={url} alt={name} className={`h-12 w-12 shrink-0 rounded-full object-cover ${className ?? ""}`} />;
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${COLORS[name.length % COLORS.length]} ${className ?? ""}`}
    >
      {getInitials(name)}
    </div>
  );
}

/* ─── Review Modal ─── */
interface ReviewModalProps {
  name: string;
  onClose: () => void;
  onSubmit: (approved: boolean, note: string) => Promise<void>;
  loading: boolean;
}
function ReviewModal({ name, onClose, onSubmit, loading }: ReviewModalProps) {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a22] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Duyệt hồ sơ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-3 text-sm text-gray-300">
          Bạn đang xét duyệt hồ sơ của <span className="font-semibold text-white">{name}</span>
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú (tuỳ chọn)..."
          rows={3}
          className="mb-4 w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        <div className="flex gap-3">
          <button
            disabled={loading}
            onClick={() => onSubmit(true, note)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            <CheckCircle className="h-4 w-4" /> Duyệt
          </button>
          <button
            disabled={loading}
            onClick={() => onSubmit(false, note)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          >
            <XCircle className="h-4 w-4" /> Từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
const ReviewMentorApplication: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("mentor");
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // mentor
  const [mentorData, setMentorData] = useState<{
    items: StaffMentorApplication[];
    totalCount: number;
    totalPages: number;
  } | null>(null);

  // recruiter
  const [recruiterData, setRecruiterData] = useState<StaffRecruiterApplication[] | null>(null);

  // review modal
  const [reviewTarget, setReviewTarget] = useState<{ id: number; name: string; type: Tab } | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  /* fetch */
  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPendingMentorApplications({
        pageNumber,
        pageSize: PAGE_SIZE,
        searchTerm: submittedSearch || undefined,
      });
      setMentorData({ items: result.items, totalCount: result.totalCount, totalPages: result.totalPages });
    } catch {
      setError("Không tải được danh sách đơn Mentor.");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, submittedSearch]);

  const fetchRecruiters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPendingRecruiterApplications();
      // client-side search filter
      const filtered = submittedSearch
        ? result.filter((r) => r.fullName.toLowerCase().includes(submittedSearch.toLowerCase()) || r.companyName.toLowerCase().includes(submittedSearch.toLowerCase()))
        : result;
      setRecruiterData(filtered);
    } catch {
      setError("Không tải được danh sách đơn Recruiter.");
    } finally {
      setLoading(false);
    }
  }, [submittedSearch]);

  useEffect(() => {
    if (tab === "mentor") fetchMentors();
    else fetchRecruiters();
  }, [tab, fetchMentors, fetchRecruiters]);

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setPageNumber(1);
    setSearchTerm("");
    setSubmittedSearch("");
    setError(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(searchTerm.trim());
    setPageNumber(1);
  };

  const handleReviewSubmit = async (approved: boolean, note: string) => {
    if (!reviewTarget) return;
    setReviewLoading(true);
    try {
      if (reviewTarget.type === "mentor") {
        await reviewMentorApplication(reviewTarget.id, { isApproved: approved, note });
      } else {
        await reviewRecruiterApplication(reviewTarget.id, { isApproved: approved, note });
      }
      toast.success(approved ? "Duyệt hồ sơ thành công!" : "Đã từ chối hồ sơ.");
      setReviewTarget(null);
      if (tab === "mentor") fetchMentors();
      else fetchRecruiters();
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setReviewLoading(false);
    }
  };

  /* paged recruiter items */
  const recruiterPaged = recruiterData
    ? recruiterData.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE)
    : [];
  const recruiterTotalPages = recruiterData ? Math.ceil(recruiterData.length / PAGE_SIZE) : 1;

  const totalPages = tab === "mentor" ? (mentorData?.totalPages ?? 1) : recruiterTotalPages;

  return (
    <div className="min-h-screen bg-[#0f0f14] px-4 py-8 text-white md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Quản lý hồ sơ ứng tuyển</h1>
          <p className="mt-1 text-sm text-gray-400">Xem và phê duyệt hồ sơ Mentor & Recruiter</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-xl border border-white/10 bg-[#1a1a22] p-1 w-fit">
          <button
            onClick={() => handleTabChange("mentor")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${
              tab === "mentor" ? "bg-[#5D5FEF] text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" />
            Mentor
            {mentorData && (
              <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{mentorData.totalCount}</span>
            )}
          </button>
          <button
            onClick={() => handleTabChange("recruiter")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${
              tab === "recruiter" ? "bg-[#5D5FEF] text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Recruiter
            {recruiterData && (
              <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{recruiterData.length}</span>
            )}
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="mb-6 flex w-full items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={tab === "mentor" ? "Tìm theo tên Mentor..." : "Tìm theo tên hoặc công ty..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#1a1a22] py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-[#5D5FEF] focus:outline-none focus:ring-1 focus:ring-[#5D5FEF]"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[#5D5FEF] px-4 py-2.5 font-medium text-white hover:bg-[#4a4cc9]"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#5D5FEF] border-t-transparent" />
          </div>
        )}

        {/* Error */}
        {error && <div className="rounded-lg bg-red-500/10 px-4 py-3 text-red-400">{error}</div>}

        {/* ── MENTOR CARDS ── */}
        {!loading && !error && tab === "mentor" && mentorData && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mentorData.items.map((app) => (
                <div
                  key={app.accountId}
                  className="flex flex-col rounded-xl border border-gray-800 bg-[#1a1a22] p-4 shadow-lg transition hover:border-gray-700"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={app.fullName} url={app.avatarUrl} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{app.fullName}</p>
                        <p className="truncate text-sm text-gray-400">{app.email}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">
                      Chờ duyệt
                    </span>
                  </div>
                  <p className="mb-1 text-sm font-semibold text-indigo-300">
                    {app.positions?.[0] ?? "Mentor"}
                    {app.companies?.[0] ? ` @ ${app.companies[0]}` : ""}
                  </p>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-400">{app.bio || "Chưa có mô tả."}</p>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {(app.skills ?? []).slice(0, 4).map((skill) => (
                      <span key={skill} className="rounded-md bg-gray-700/60 px-2 py-0.5 text-xs text-gray-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => navigate(`/management/applications/mentor/${app.accountId}`)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#5D5FEF]/60 py-2 text-sm font-medium text-[#8889f5] hover:bg-[#5D5FEF]/10"
                    >
                      Chi tiết <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setReviewTarget({ id: app.accountId, name: app.fullName, type: "mentor" })}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#5D5FEF] py-2 text-sm font-semibold text-white hover:bg-[#4a4cc9]"
                    >
                      Xét duyệt
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {mentorData.items.length === 0 && (
              <div className="rounded-xl border border-gray-800 bg-[#1a1a22] py-12 text-center text-gray-400">
                Không có hồ sơ Mentor nào đang chờ duyệt.
              </div>
            )}
          </>
        )}

        {/* ── RECRUITER CARDS ── */}
        {!loading && !error && tab === "recruiter" && recruiterData && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recruiterPaged.map((app) => (
                <div
                  key={app.accountId}
                  className="flex flex-col rounded-xl border border-gray-800 bg-[#1a1a22] p-4 shadow-lg transition hover:border-gray-700"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={app.fullName} url={app.avatarUrl} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{app.fullName}</p>
                        <p className="truncate text-sm text-gray-400">{app.email}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">
                      Chờ duyệt
                    </span>
                  </div>
                  <p className="mb-1 text-sm font-semibold text-indigo-300">
                    {app.companyName || "—"}
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {app.industry && (
                      <span className="rounded-md bg-gray-700/60 px-2 py-0.5 text-xs text-gray-300">
                        {app.industry}
                      </span>
                    )}
                    {app.companySize && (
                      <span className="rounded-md bg-gray-700/60 px-2 py-0.5 text-xs text-gray-300">
                        {app.companySize}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => navigate(`/management/applications/recruiter/${app.accountId}`)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#5D5FEF]/60 py-2 text-sm font-medium text-[#8889f5] hover:bg-[#5D5FEF]/10"
                    >
                      Chi tiết <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setReviewTarget({ id: app.accountId, name: app.fullName, type: "recruiter" })}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#5D5FEF] py-2 text-sm font-semibold text-white hover:bg-[#4a4cc9]"
                    >
                      Xét duyệt
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {recruiterPaged.length === 0 && (
              <div className="rounded-xl border border-gray-800 bg-[#1a1a22] py-12 text-center text-gray-400">
                Không có hồ sơ Recruiter nào đang chờ duyệt.
              </div>
            )}
          </>
        )}


        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-400">
              Trang {pageNumber} / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="rounded-lg border border-gray-700 bg-[#1a1a22] p-2 text-gray-400 hover:bg-[#252530] disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) page = i + 1;
                else if (pageNumber <= 3) page = i + 1;
                else if (pageNumber >= totalPages - 2) page = totalPages - 4 + i;
                else page = pageNumber - 2 + i;
                return (
                  <button
                    key={page}
                    onClick={() => setPageNumber(page)}
                    className={`h-10 w-10 rounded-lg text-sm font-medium transition ${
                      pageNumber === page
                        ? "bg-[#5D5FEF] text-white"
                        : "border border-gray-700 bg-[#1a1a22] text-gray-400 hover:bg-[#252530] hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber >= totalPages}
                className="rounded-lg border border-gray-700 bg-[#1a1a22] p-2 text-gray-400 hover:bg-[#252530] disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          name={reviewTarget.name}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleReviewSubmit}
          loading={reviewLoading}
        />
      )}
    </div>
  );
};

export default ReviewMentorApplication;
