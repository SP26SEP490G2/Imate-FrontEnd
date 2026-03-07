import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { getPendingMentorApplications } from "@/services/staffReviewService";
import type { StaffMentorApplication } from "@/types/response/staffReview.response";

const PAGE_SIZE = 6;

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

function AvatarPlaceholder({ name, className }: { name: string; className?: string }) {
  const colors = ["bg-purple-500", "bg-blue-500", "bg-pink-500", "bg-amber-500", "bg-emerald-500", "bg-indigo-400"];
  const idx = name.length % colors.length;
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${colors[idx]} ${className ?? ""}`}
    >
      {getInitials(name)}
    </div>
  );
}

const ReviewMentorApplication: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    items: StaffMentorApplication[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  } | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPendingMentorApplications({
        pageNumber,
        pageSize: PAGE_SIZE,
        searchTerm: submittedSearch || undefined,
      });
      setData({
        items: result.items,
        totalCount: result.totalCount,
        pageNumber: result.pageNumber,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách đơn ứng tuyển.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, submittedSearch]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(searchTerm.trim());
    setPageNumber(1);
  };

  const handleViewDetails = (accountId: number) => {
    navigate(`/staff/manage-application/mentor/${accountId}`);
  };

  return (
    <div className="min-h-screen bg-[#0f0f14] px-4 py-8 text-white md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Quản lý đơn ứng tuyển</h1>
          <p className="mt-1 text-sm text-gray-400">
            Xem và phê duyệt các đơn đăng ký trở thành Mentor từ người dùng
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-6 flex w-full items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#1a1a22] py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-[#5D5FEF] focus:outline-none focus:ring-1 focus:ring-[#5D5FEF]"
            />
          </div>
          <button
            type="button"
            className="rounded-lg border border-gray-700 bg-[#1a1a22] p-2.5 text-gray-400 hover:bg-[#252530] hover:text-white"
            title="Bộ lọc"
          >
            <Filter className="h-5 w-5" />
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#5D5FEF] px-4 py-2.5 font-medium text-white hover:bg-[#4a4cc9]"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Content */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#5D5FEF] border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Applicant Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((app) => (
                <div
                  key={app.accountId}
                  className="flex flex-col rounded-xl border border-gray-800 bg-[#1a1a22] p-4 shadow-lg transition hover:border-gray-700"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {app.avatarUrl ? (
                        <img
                          src={app.avatarUrl}
                          alt={app.fullName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <AvatarPlaceholder name={app.fullName} />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{app.fullName}</p>
                        <p className="truncate text-sm text-gray-400">
                          {app.companies?.length ? `${app.positions?.[0] ?? "Mentor"} @ ${app.companies[0]}` : app.positions?.[0] ?? "Mentor"}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-gray-700/80 px-2 py-1 text-xs font-medium uppercase text-gray-300">
                      Chờ duyệt
                    </span>
                  </div>

                  <p className="mb-2 font-semibold text-white">
                    {app.positions?.[0] ?? "Mentor"}
                  </p>
                  <p className="mb-3 line-clamp-3 text-sm text-gray-400">
                    {app.bio || "Chưa có mô tả."}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {(app.skills ?? []).slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-gray-700/60 px-2 py-0.5 text-xs text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleViewDetails(app.accountId)}
                    className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5D5FEF] to-[#4a4cc9] py-2.5 font-medium text-white transition hover:opacity-90"
                  >
                    Xem chi tiết <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {data.items.length === 0 && (
              <div className="rounded-xl border border-gray-800 bg-[#1a1a22] py-12 text-center text-gray-400">
                Không có đơn ứng tuyển nào đang chờ duyệt.
              </div>
            )}

            {/* Pagination */}
            {data.totalCount > 0 && (
              <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-gray-400">
                  Hiển thị {data.items.length} trên {data.totalCount} đơn ứng tuyển đang chờ
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1}
                    className="rounded-lg border border-gray-700 bg-[#1a1a22] p-2 text-gray-400 hover:bg-[#252530] disabled:opacity-50 disabled:hover:bg-[#1a1a22]"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                    let page: number;
                    if (data.totalPages <= 5) page = i + 1;
                    else if (pageNumber <= 3) page = i + 1;
                    else if (pageNumber >= data.totalPages - 2) page = data.totalPages - 4 + i;
                    else page = pageNumber - 2 + i;
                    return (
                      <button
                        key={page}
                        type="button"
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
                    type="button"
                    onClick={() => setPageNumber((p) => Math.min(data.totalPages, p + 1))}
                    disabled={pageNumber >= data.totalPages}
                    className="rounded-lg border border-gray-700 bg-[#1a1a22] p-2 text-gray-400 hover:bg-[#252530] disabled:opacity-50 disabled:hover:bg-[#1a1a22]"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewMentorApplication;
