import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  Upload,
  Link2,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  File,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { getListCV } from "@/services/cvService";
import {
  checkInterviewCost,
  setupInterview,
  createInterviewSession,
  type SetupInterviewResponse,
} from "@/services/interviewService";
import type { CvItem } from "@/types/common/cv";
import { MSG26, MSG27, MSG29, MSG30 } from "@/constants/messages";
import {
  USE_MOCK,
  MOCK_CV_LIST,
  MOCK_SETUP_RESPONSE,
  MOCK_SESSION,
} from "@/mocks/interviewMockData";

/* ------------------------------------------------------------------ */
/*  Tab types                                                          */
/* ------------------------------------------------------------------ */
type JdTab = "text" | "file" | "link";

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function InterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  // Read prefilled JD from navigation state (e.g. coming from ViewJobApplicationDetail)
  const prefillJd = (location.state as { prefillJd?: string } | null)?.prefillJd ?? "";

  // CV state
  const [cvList, setCvList] = useState<CvItem[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [cvLoading, setCvLoading] = useState(true);

  // JD state — default tab to "text" and prefill if JD was passed in
  const [jdTab, setJdTab] = useState<JdTab>("text");
  const [jdText, setJdText] = useState(prefillJd);
  const [jdLink, setJdLink] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);

  // Duration
  const [duration, setDuration] = useState("30");

  // Flow state
  const [submitting, setSubmitting] = useState(false);
  const [setupResult, setSetupResult] = useState<SetupInterviewResponse | null>(null);
  const [step, setStep] = useState<"config" | "review">("config");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch CV list on mount
  useEffect(() => {
    const fetchCvs = async () => {
      try {
        setCvLoading(true);
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 500));
          setCvList(MOCK_CV_LIST);
          setSelectedCvId(MOCK_CV_LIST[0].cvId);
          return;
        }
        const cvs = await getListCV();
        const validCvs = cvs.filter((c) => c.status === "Valid");
        setCvList(validCvs);
        if (validCvs.length > 0) {
          setSelectedCvId(validCvs[0].cvId);
        }
      } catch {
        // Lỗi load CV không chặn UI
      } finally {
        setCvLoading(false);
      }
    };
    fetchCvs();
  }, []);

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setJdFile(file);
  };

  // Handle confirm config
  const handleConfirm = async () => {
    if (!selectedCvId) {
      toast.error(MSG29);
      return;
    }

    const hasJdInput =
      (jdTab === "text" && jdText.trim().length > 10) ||
      (jdTab === "file" && jdFile) ||
      (jdTab === "link" && jdLink.trim().length > 5);

    if (!hasJdInput) {
      toast.error(MSG30);
      return;
    }

    try {
      setSubmitting(true);

      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 1000));
        setSetupResult(MOCK_SETUP_RESPONSE);
        setStep("review");
        return;
      }

      const cost = await checkInterviewCost();
      if (cost.requiresPayment && !cost.hasEnoughBalance) {
        toast.error(MSG26);
        return;
      }

      const request = {
        method: "jd" as const,
        cvId: parseInt(selectedCvId),
        jobDescriptionSourceType: jdTab as "text" | "url" | "file",
        jobDescriptionText: jdTab === "text" ? jdText : undefined,
        jobDescriptionUrl: jdTab === "link" ? jdLink : undefined,
      };

      const result = await setupInterview(
        request,
        jdTab === "file" ? jdFile! : undefined
      );
      setSetupResult(result);
      setStep("review");
    } catch {
      toast.error(MSG30);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle start interview (after review)
  const handleStartInterview = async () => {
    if (!setupResult) return;

    try {
      setSubmitting(true);

      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        navigate(`/interview-chat/${MOCK_SESSION.sessionId}`);
        return;
      }

      const sessionReq = {
        positionName: setupResult.position,
        skillName: setupResult.skill,
        skillNames: setupResult.skills,
        levelName: setupResult.level,
        companyName: setupResult.company ?? undefined,
        cvId: parseInt(selectedCvId),
        jobDescriptionText: jdTab === "text" ? jdText : undefined,
      };

      const session = await createInterviewSession(sessionReq);
      navigate(`/interview-chat/${session.sessionId}`);
    } catch {
      toast.error(MSG27);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Step 1: Config Form                                              */
  /* ---------------------------------------------------------------- */
  if (step === "config") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
          <span
            className="cursor-pointer transition-colors hover:text-slate-300"
            onClick={() => navigate("/home")}
          >
            Trang chủ
          </span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span
            className="cursor-pointer transition-colors hover:text-slate-300"
            onClick={() => navigate("/practice-ai")}
          >
            Luyện tập AI
          </span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-purple-400">Thiết lập phỏng vấn</span>
        </nav>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8">
          {/* Title */}
          <h1 className="mb-2 text-center text-2xl font-bold text-white">
            Thiết lập Buổi Phỏng vấn AI
          </h1>
          <p className="mb-8 text-center text-sm text-slate-400">
            Cấu hình thông tin để AI tạo ra kịch bản phỏng vấn tối ưu nhất cho bạn
          </p>

          {/* Prefill notice */}
          {prefillJd && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/5 px-4 py-3 text-sm text-purple-300">
              <FileText className="h-4 w-4 shrink-0 text-purple-400" />
              Mô tả công việc đã được điền tự động từ tin tuyển dụng.
            </div>
          )}

          {/* CV Selector */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chọn CV sử dụng
            </label>
            {cvLoading ? (
              <div className="flex h-12 items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải danh sách CV...
              </div>
            ) : cvList.length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {MSG29}
              </div>
            ) : (
              <select
                value={selectedCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-purple-500/50"
              >
                {cvList.map((cv) => (
                  <option key={cv.cvId} value={cv.cvId}>
                    {cv.fileName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* JD Input */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Thông tin mô tả công việc (JD)
            </label>

            {/* JD Tabs */}
            <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-900/60 p-1">
              {[
                { key: "text" as JdTab, label: "Dán mô tả", icon: FileText },
                { key: "file" as JdTab, label: "Tải lên tệp", icon: Upload },
                { key: "link" as JdTab, label: "Dán link", icon: Link2 },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setJdTab(key)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    jdTab === key
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* JD Content */}
            {jdTab === "text" && (
              <div className="relative">
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Dán nội dung mô tả công việc (JD) tại đây. Càng chi tiết, AI sẽ phỏng vấn bạn càng sát thực tế..."
                  rows={6}
                  maxLength={5000}
                  className="w-full resize-none rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-500/50"
                />
                <span className="absolute bottom-3 right-3 text-xs text-slate-600">
                  {jdText.length} / 5000 ký tự
                </span>
              </div>
            )}

            {jdTab === "file" && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700/60 bg-slate-900/40 px-6 py-10 transition-colors hover:border-purple-500/40"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setJdFile(f);
                  }}
                />
                {jdFile ? (
                  <div className="flex items-center gap-3">
                    <File className="h-8 w-8 text-purple-400" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {jdFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(jdFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setJdFile(null);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-slate-500" />
                    <p className="text-sm text-slate-400">
                      Kéo thả file hoặc{" "}
                      <span className="font-medium text-purple-400">
                        Chọn file
                      </span>
                    </p>
                    <p className="text-xs text-slate-600">
                      PDF, DOCX, DOC, TXT
                    </p>
                  </>
                )}
              </div>
            )}

            {jdTab === "link" && (
              <input
                type="url"
                value={jdLink}
                onChange={(e) => setJdLink(e.target.value)}
                placeholder="https://example.com/job/senior-backend-developer"
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-500/50"
              />
            )}
          </div>

          {/* Duration */}
          <div className="mb-8">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Thời gian ước tính
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3">
                <Clock className="h-4 w-4 text-purple-400" />
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-12 bg-transparent text-center text-sm font-semibold text-white outline-none"
                />
                <span className="text-sm text-slate-400">Phút</span>
              </div>
              <p className="text-xs text-slate-500">
                Gợi ý: 30 - 45 phút cho một buổi phỏng vấn hiệu quả.
                <br />
                Số lượng câu hỏi AI sẽ được điều chỉnh phù hợp với khung thời gian này.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={submitting || cvList.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Xác nhận cấu hình
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Step 2: Review classified data → Start interview                 */
  /* ---------------------------------------------------------------- */
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8">
        <h2 className="mb-2 text-center text-xl font-bold text-white">
          Xác nhận thông tin phỏng vấn
        </h2>
        <p className="mb-6 text-center text-sm text-slate-400">
          AI đã phân loại JD của bạn. Vui lòng kiểm tra thông tin trước khi bắt đầu.
        </p>

        {setupResult && (
          <div className="mb-6 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoCard label="Vị trí" value={setupResult.position} />
              <InfoCard label="Cấp độ" value={setupResult.level} />
              <InfoCard
                label="Kỹ năng"
                value={setupResult.skills.join(", ")}
              />
              {setupResult.company && (
                <InfoCard label="Công ty" value={setupResult.company} />
              )}
            </div>

            {setupResult.requirements &&
              setupResult.requirements.length > 0 && (
                <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Yêu cầu công việc
                  </p>
                  <ul className="space-y-1">
                    {setupResult.requirements.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-300"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-purple-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {setupResult.levelMismatchWarning && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {setupResult.levelMismatchWarning}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setStep("config")}
            disabled={submitting}
          >
            Quay lại
          </Button>
          <Button
            variant="primary"
            onClick={handleStartInterview}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo phiên...
              </>
            ) : (
              <>
                Bắt đầu Phỏng vấn
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small info card                                                    */
/* ------------------------------------------------------------------ */
function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 px-4 py-3">
      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}