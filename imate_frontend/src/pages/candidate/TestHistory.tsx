import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Loader2,
  History,
  Eye,
  BookOpen,
  Languages,
  Trophy,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  getTestHistory,
  type TestHistoryItem,
} from "@/services/geminiService";
import {
  getInterviewHistory,
  type InterviewHistoryItem,
} from "@/services/interviewService";
import { MSG07, MSG31 } from "@/constants/messages";

/* ------------------------------------------------------------------ */
/*  Score Badge                                                        */
/* ------------------------------------------------------------------ */
function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
      : score >= 50
      ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
      : "border-red-500/40 bg-red-500/15 text-red-400";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${color}`}
    >
      {score}/100
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Category Tag                                                       */
/* ------------------------------------------------------------------ */
function CategoryTag({ testType }: { testType: string }) {
  const isLang = testType === "Language";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
        isLang
          ? "bg-cyan-500/15 text-cyan-400"
          : "bg-purple-500/15 text-purple-400"
      }`}
    >
      {isLang ? (
        <Languages className="h-3 w-3" />
      ) : (
        <BookOpen className="h-3 w-3" />
      )}
      {isLang ? "Đánh giá ngoại ngữ" : "Kiến thức chuyên môn"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */
function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
        <Trophy className="h-8 w-8 text-slate-500" />
      </div>
      <p className="mb-2 text-lg font-semibold text-white">
        Chưa có lịch sử
      </p>
      <p className="mb-6 max-w-md text-sm text-slate-400">{MSG31}</p>
      <Button
        variant="primary"
        size="lg"
        onClick={() => navigate("/practice-test")}
      >
        Bắt đầu làm bài test
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab Navigation                                                     */
/* ------------------------------------------------------------------ */
const TABS = [
  { id: "test", label: "Bài test năng lực" },
  { id: "interview", label: "Phỏng vấn AI" },
  { id: "mentor", label: "Lịch sử Mentor" },
];

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/*  Interview Status Badge                                             */
/* ------------------------------------------------------------------ */
function InterviewStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    Completed: {
      color: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
      label: "Hoàn thành",
    },
    InProgress: {
      color: "border-amber-500/40 bg-amber-500/15 text-amber-400",
      label: "Đang diễn ra",
    },
    Cancelled: {
      color: "border-red-500/40 bg-red-500/15 text-red-400",
      label: "Đã hủy",
    },
  };
  const c = config[status] || config["Cancelled"];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${c.color}`}
    >
      {c.label}
    </span>
  );
}

export default function TestHistory() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("test");
  const [history, setHistory] = useState<TestHistoryItem[]>([]);
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [interviewLoading, setInterviewLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getTestHistory();
        setHistory(data);
      } catch {
        toast.error(MSG07);
      } finally {
        setLoading(false);
      }
    };

    const fetchInterviewHistory = async () => {
      try {
        setInterviewLoading(true);
        const data = await getInterviewHistory();
        setInterviewHistory(data);
      } catch {
        toast.error(MSG07);
      } finally {
        setInterviewLoading(false);
      }
    };

    if (activeTab === "test") {
      fetchHistory();
    } else if (activeTab === "interview") {
      fetchInterviewHistory();
    }
  }, [activeTab]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
        <span
          className="cursor-pointer transition-colors hover:text-slate-300"
          onClick={() => navigate("/home")}
        >
          Trang chủ
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="transition-colors hover:text-slate-300 cursor-pointer">
          Luyện tập AI
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-purple-400">Lịch sử bài test</span>
      </nav>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Lịch sử bài test năng lực
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Theo dõi tiến trình và xem lại nhận xét chi tiết từ AI cho các bài
          đánh giá trước đây
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-1 rounded-xl bg-slate-800/60 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "test" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : history.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 border-b border-slate-700/40 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-4">Tên bài test</div>
                <div className="col-span-2">Phân loại</div>
                <div className="col-span-2">Ngày hoàn thành</div>
                <div className="col-span-2 text-center">Điểm số</div>
                <div className="col-span-2 text-center">Thao tác</div>
              </div>

              {/* Table Body */}
              {history.map((item, idx) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-800/50 ${
                    idx < history.length - 1
                      ? "border-b border-slate-700/30"
                      : ""
                  }`}
                >
                  {/* Test Name */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/15">
                      <History className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="font-medium text-white">
                      {item.testTitle}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <CategoryTag testType={item.testType} />
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-sm text-slate-400">
                    {formatDate(item.completedAt)}
                  </div>

                  {/* Score */}
                  <div className="col-span-2 text-center">
                    <ScoreBadge score={item.score} />
                  </div>

                  {/* Action */}
                  <div className="col-span-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="h-4 w-4" />}
                      onClick={() =>
                        navigate(`/test-history/${item.id}`)
                      }
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Interview History Tab */}
      {activeTab === "interview" && (
        <>
          {interviewLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : interviewHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                <MessageSquare className="h-8 w-8 text-slate-500" />
              </div>
              <p className="mb-2 text-lg font-semibold text-white">
                Chưa có lịch sử
              </p>
              <p className="mb-6 max-w-md text-sm text-slate-400">
                Bạn chưa có buổi phỏng vấn AI nào. Hãy bắt đầu buổi phỏng vấn đầu tiên!
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 border-b border-slate-700/40 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-3">Phiên phỏng vấn</div>
                <div className="col-span-3">Vị trí</div>
                <div className="col-span-2">Thời gian</div>
                <div className="col-span-2 text-center">Trạng thái</div>
                <div className="col-span-2 text-center">Thao tác</div>
              </div>

              {/* Table Body */}
              {interviewHistory.map((item, idx) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-800/50 ${
                    idx < interviewHistory.length - 1
                      ? "border-b border-slate-700/30"
                      : ""
                  }`}
                >
                  {/* Session Name */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/15">
                      <Briefcase className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <span className="font-medium text-white">
                        Phiên #{item.id}
                      </span>
                      {item.totalQuestionsAnswered > 0 && (
                        <p className="text-xs text-slate-500">
                          {item.totalQuestionsAnswered} câu hỏi
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Position */}
                  <div className="col-span-3">
                    <span className="text-sm text-slate-300">
                      {item.positionName || item.questionContent?.substring(0, 40) || "N/A"}
                    </span>
                    {item.levelName && (
                      <p className="text-xs text-slate-500">{item.levelName}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-sm text-slate-400">
                    {formatDate(item.startTime)}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 text-center">
                    <InterviewStatusBadge status={item.status} />
                  </div>

                  {/* Action */}
                  <div className="col-span-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="h-4 w-4" />}
                      onClick={() =>
                        navigate(`/interview-history/${item.id}`)
                      }
                      disabled={item.status !== "Completed"}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {activeTab === "mentor" && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-400">Tính năng đang phát triển...</p>
        </div>
      )}
    </div>
  );
}
