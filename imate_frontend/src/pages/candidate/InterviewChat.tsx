import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send,
  Mic,
  MicOff,
  Loader2,
  Bot,
  Volume2,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getWelcomeMessage,
  generateQuestion,
  submitAnswer,
  endInterview,
  resumeSession,
  transcribeWhisperBase64,
  correctTranscript,
  synthesizeSpeech,
  type GenerateQuestionResponse,
  type WelcomeMessageResponse,
} from "@/services/interviewService";
import { MSG28 } from "@/constants/messages";
import {
  USE_MOCK,
  MOCK_WELCOME,
  MOCK_QUESTIONS,
} from "@/mocks/interviewMockData";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ChatMessage {
  id: string;
  role: "ai" | "user";
  text: string;
  responseId?: number; // chỉ có ở câu hỏi AI
  audioBase64?: string | null;
  mimeType?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function InterviewChat() {
  const { sessionId: sessionIdParam } = useParams<{ sessionId: string }>();
  const sessionId = parseInt(sessionIdParam ?? "0");
  const navigate = useNavigate();

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentResponseId, setCurrentResponseId] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [totalQuestions] = useState(10);
  const mockQuestionIndex = useRef(0); // cho mock mode

  // Loading states
  const [initializing, setInitializing] = useState(true);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [ending, setEnding] = useState(false);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // End confirmation
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // TTS state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initCalledRef = useRef(false); // Ngăn StrictMode gọi init 2 lần

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generating]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Phát audio base64 inline (dùng cho auto-play và nút Nghe)
  const playAudioBase64 = useCallback((messageId: string, audioBase64: string, mimeType?: string | null) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingMessageId(messageId);

      const mime = mimeType || "audio/wav";
      const audio = new Audio(`data:${mime};base64,${audioBase64}`);
      audioRef.current = audio;
      audio.onended = () => {
        setPlayingMessageId(null);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setPlayingMessageId(null);
        audioRef.current = null;
      };
      audio.play();
    } catch {
      setPlayingMessageId(null);
    }
  }, []);

  // TTS: phát giọng nói cho tin nhắn AI (fallback khi không có audio inline)
  const playTTS = useCallback(async (messageId: string, text: string) => {
    try {
      // Dừng audio đang phát (nếu có)
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingMessageId(messageId);

      const result = await synthesizeSpeech(text);
      if (!result.audioBase64) {
        throw new Error("No audio data");
      }

      // Sử dụng mimeType từ API response (Gemini có thể trả audio/wav, audio/L16, etc.)
      const mime = result.mimeType || "audio/wav";
      const audio = new Audio(`data:${mime};base64,${result.audioBase64}`);
      audioRef.current = audio;
      audio.onended = () => {
        setPlayingMessageId(null);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setPlayingMessageId(null);
        audioRef.current = null;
      };
      await audio.play();
    } catch {
      setPlayingMessageId(null);
      // TTS lỗi thì im lặng, không chặn flow
    }
  }, []);

  // Add message helper
  const addMessage = useCallback(
    (role: "ai" | "user", text: string, responseId?: number, audioBase64?: string | null, mimeType?: string | null) => {
      const msgId = `${Date.now()}-${Math.random()}`;
      setMessages((prev) => [
        ...prev,
        { id: msgId, role, text, responseId, audioBase64, mimeType },
      ]);

      // Tự động phát audio nếu là tin nhắn AI và có audio inline
      if (role === "ai" && audioBase64) {
        // Delay nhỏ để UI render xong trước khi phát
        setTimeout(() => playAudioBase64(msgId, audioBase64, mimeType), 200);
      }
    },
    [playAudioBase64]
  );

  // Fetch next question
  const fetchNextQuestion = useCallback(async () => {
    try {
      setGenerating(true);

      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
        const idx = mockQuestionIndex.current;
        if (idx >= MOCK_QUESTIONS.length) {
          addMessage("ai", "Buổi phỏng vấn đã kết thúc. Cảm ơn bạn đã tham gia! Đang chuyển đến trang kết quả...");
          setTimeout(() => navigate(`/interview-history/${sessionId}`), 3000);
          return;
        }
        const q = MOCK_QUESTIONS[idx];
        mockQuestionIndex.current = idx + 1;
        setQuestionCount((c) => c + 1);
        setCurrentResponseId(q.interviewResponseId);
        addMessage("ai", q.questionText, q.interviewResponseId);
        return;
      }

      const q: GenerateQuestionResponse = await generateQuestion(sessionId);

      // Check if interview is over
      if (q.isTerminated) {
        addMessage(
          "ai",
          q.terminationMessage || "Buổi phỏng vấn đã kết thúc. Cảm ơn bạn!",
          undefined,
          q.audioBase64,
          q.mimeType
        );
        try {
          await endInterview(sessionId);
        } catch {
          // ignore
        }
        setTimeout(() => {
          navigate(`/interview-history/${sessionId}`);
        }, 3000);
        return;
      }

      setQuestionCount((c) => c + 1);
      setCurrentResponseId(q.interviewResponseId);
      addMessage("ai", q.questionText, q.interviewResponseId, q.audioBase64, q.mimeType);
    } catch {
      toast.error(MSG28);
      try {
        await endInterview(sessionId);
      } catch {
        // ignore
      }
      setTimeout(() => {
        navigate(`/interview-history/${sessionId}`);
      }, 3000);
    } finally {
      setGenerating(false);
    }
  }, [sessionId, addMessage, navigate]);

  // Initialize interview — kiểm tra resume trước khi bắt đầu mới
  useEffect(() => {
    if (!sessionId) return;
    // Ngăn React 18 StrictMode gọi 2 lần
    if (initCalledRef.current) return;
    initCalledRef.current = true;

    const init = async () => {
      try {
        setInitializing(true);

        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 800));
          addMessage("ai", MOCK_WELCOME);
          await fetchNextQuestion();
          return;
        }

        // Thử resume session từ DB trước
        try {
          const resumeData = await resumeSession(sessionId);

          // Nếu session đã hoàn thành, chuyển sang trang kết quả
          if (resumeData.session.status === "Completed") {
            toast.info("Phiên phỏng vấn này đã hoàn thành.");
            navigate(`/interview-history/${sessionId}`);
            return;
          }

          // Nếu session đã có tiến trình (có ít nhất 1 response), rebuild chat
          if (resumeData.responses.length > 0) {
            // Rebuild lịch sử chat từ các responses đã có
            for (const r of resumeData.responses) {
              // Thêm câu hỏi AI
              addMessage("ai", r.questionContent, r.id);
              // Thêm câu trả lời user (nếu đã trả lời)
              if (r.userAnswer) {
                addMessage("user", r.userAnswer);
              }
            }

            setQuestionCount(resumeData.responses.length);

            // Nếu câu hỏi cuối chưa có câu trả lời → user cần trả lời câu đó
            if (resumeData.hasUnansweredQuestion && resumeData.currentResponseId) {
              setCurrentResponseId(resumeData.currentResponseId);
            } else {
              // Tất cả đã trả lời → sinh câu hỏi mới
              await fetchNextQuestion();
            }
            return;
          }
        } catch {
          // Resume thất bại (session mới hoàn toàn) → bắt đầu fresh
        }

        // Fresh start: gọi welcome + câu hỏi đầu tiên
        const welcomeData: WelcomeMessageResponse = await getWelcomeMessage(sessionId);
        addMessage("ai", welcomeData.welcomeMessage, undefined, welcomeData.audioBase64, welcomeData.mimeType);
        await fetchNextQuestion();
      } catch {
        toast.error("Không thể khởi tạo buổi phỏng vấn.");
      } finally {
        setInitializing(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Send answer
  const handleSendAnswer = async () => {
    const answer = inputText.trim();
    if (!answer || !currentResponseId || sending) return;

    try {
      setSending(true);
      addMessage("user", answer);
      setInputText("");

      // Gửi câu trả lời → nhận phản hồi AI
      let aiReaction: string | undefined;
      let aiReactionAudioBase64: string | null | undefined;
      let reactionMimeType: string | null | undefined;
      if (!USE_MOCK) {
        const result = await submitAnswer({
          interviewSessionId: sessionId,
          interviewResponseId: currentResponseId,
          userAnswer: answer,
        });
        aiReaction = result.aiReaction;
        aiReactionAudioBase64 = result.aiReactionAudioBase64;
        reactionMimeType = result.mimeType;
      } else {
        await new Promise((r) => setTimeout(r, 300));
        aiReaction = "Cảm ơn câu trả lời! Để tôi hỏi tiếp nhé.";
      }

      // Hiển thị phản hồi AI (nếu có)
      if (aiReaction) {
        addMessage("ai", aiReaction, undefined, aiReactionAudioBase64, reactionMimeType);
        await new Promise((r) => setTimeout(r, 800)); // Delay nhỏ cho tự nhiên
      }

      // Generate next question
      await fetchNextQuestion();
    } catch {
      toast.error("Không gửi được câu trả lời. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        try {
          setIsTranscribing(true);
          // Convert to base64
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(audioBlob);
          });

          // Transcribe
          let transcript = await transcribeWhisperBase64(
            base64,
            "recording.webm"
          );

          // Correct IT terms
          try {
            transcript = await correctTranscript(transcript);
          } catch {
            // Use raw transcript if correction fails
          }

          setInputText((prev) =>
            prev ? `${prev} ${transcript}` : transcript
          );
        } catch {
          toast.error("Không thể nhận dạng giọng nói. Vui lòng thử lại.");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Không thể truy cập microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // End interview
  const handleEndInterview = async () => {
    try {
      setEnding(true);
      setShowEndConfirm(false);
      if (!USE_MOCK) {
        await endInterview(sessionId);
      } else {
        await new Promise((r) => setTimeout(r, 500));
      }
      toast.success(
        "Buổi phỏng vấn đã kết thúc. Đang chuyển sang trang kết quả..."
      );
      setTimeout(() => {
        navigate(`/interview-history/${sessionId}`);
      }, 2000);
    } catch {
      toast.error("Không thể kết thúc phỏng vấn. Vui lòng thử lại.");
      setEnding(false);
    }
  };

  // Key handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendAnswer();
    }
  };

  const isBusy = sending || generating || ending || initializing;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="flex h-screen flex-col bg-[#0a0b1a]">
      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between border-b border-slate-800/60 bg-[#0d0e21] px-6 py-3">
        {/* Question counter */}
        <div className="flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/60 px-4 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Câu hỏi
          </span>
          <span className="text-sm font-bold text-purple-400">
            {questionCount}/{totalQuestions}
          </span>
        </div>

        {/* Title + timer */}
        <div className="text-center">
          <h1 className="text-sm font-bold uppercase tracking-widest text-white">
            Luyện tập thử với AI
          </h1>
          <p className="mt-0.5 text-xs text-purple-400">
            ⏱ {formatTime(elapsedSeconds)}
          </p>
        </div>

        {/* End button */}
        <button
          onClick={() => setShowEndConfirm(true)}
          disabled={ending}
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        >
          {ending ? "Đang kết thúc..." : "Kết thúc"}
        </button>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — AI interviewer */}
        <aside className="hidden w-64 flex-col items-center border-r border-slate-800/40 bg-[#0d0e21]/60 px-4 py-6 lg:flex">
          <div className="mb-3 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-green-400">
              AI Interviewer Online
            </span>
          </div>

          {/* Avatar */}
          <div className="mb-4 overflow-hidden rounded-2xl border-2 border-purple-500/30 bg-gradient-to-b from-slate-800 to-slate-900 p-1 shadow-lg shadow-purple-500/10">
            <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700/80 to-slate-800/80">
              <Bot className="h-20 w-20 text-purple-400/60" />
            </div>
          </div>

          <h3 className="mb-1 text-center text-lg font-bold text-white">
            Bernie
          </h3>
          <p className="text-center text-xs leading-relaxed text-slate-500">
            Chuyên gia phỏng vấn AI với 10 năm kinh nghiệm tuyển dụng IT
          </p>
        </aside>

        {/* Chat area */}
        <div className="flex flex-1 flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-3xl space-y-4">
              {initializing && (
                <div className="flex items-center gap-3 text-purple-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">
                    Đang khởi tạo buổi phỏng vấn...
                  </span>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "ai" && (
                    <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600/20">
                      <Bot className="h-4 w-4 text-purple-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                      msg.role === "ai"
                        ? "rounded-tl-md bg-slate-800/80 text-slate-200"
                        : "rounded-tr-md bg-purple-600/20 text-white"
                    }`}
                  >
                    {msg.text.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>
                        {line}
                      </p>
                    ))}
                    {/* Nút nghe giọng nói (chỉ hiển thị cho AI) */}
                    {msg.role === "ai" && (
                      <button
                        onClick={() => {
                          if (msg.audioBase64) {
                            playAudioBase64(msg.id, msg.audioBase64, msg.mimeType);
                          } else {
                            playTTS(msg.id, msg.text);
                          }
                        }}
                        disabled={playingMessageId === msg.id}
                        className="mt-2 flex items-center gap-1.5 text-xs text-purple-400/70 transition-colors hover:text-purple-300 disabled:animate-pulse disabled:text-purple-400"
                        title="Nghe AI đọc"
                      >
                        {playingMessageId === msg.id ? (
                          <>
                            <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                            Đang phát...
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            Nghe lại
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* AI typing indicator */}
              {generating && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600/20">
                    <Bot className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-slate-800/80 px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* ===== INPUT AREA ===== */}
          <div className="border-t border-slate-800/60 bg-[#0d0e21]/80 px-6 py-4">
            <div className="mx-auto flex max-w-3xl items-end gap-3">
              {/* Mic button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isBusy || isTranscribing}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                  isRecording
                    ? "animate-pulse bg-red-500 text-white"
                    : isTranscribing
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
                } disabled:opacity-50`}
                title={
                  isRecording
                    ? "Dừng ghi âm"
                    : isTranscribing
                    ? "Đang chuyển giọng nói..."
                    : "Ghi âm giọng nói"
                }
              >
                {isTranscribing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>

              {/* Textarea */}
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập câu trả lời của bạn tại đây..."
                  rows={1}
                  disabled={isBusy}
                  className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-500/50 disabled:opacity-50"
                  style={{
                    maxHeight: "120px",
                    height: "auto",
                    minHeight: "44px",
                  }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = Math.min(t.scrollHeight, 120) + "px";
                  }}
                />
                <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-600">
                  Nhấn Shift + Enter để xuống dòng
                </span>
              </div>

              {/* Send button */}
              <button
                onClick={handleSendAnswer}
                disabled={!inputText.trim() || isBusy}
                className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white transition-all hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="hidden sm:block">Gửi câu trả lời</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== END CONFIRM MODAL ===== */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-800 p-6 shadow-2xl">
            <h3 className="mb-3 text-lg font-bold text-white">
              Kết thúc phỏng vấn?
            </h3>
            <p className="mb-6 text-sm text-slate-400">
              Bạn có chắc chắn muốn kết thúc buổi phỏng vấn sớm? AI sẽ tạo báo
              cáo phản hồi dựa trên các câu hỏi bạn đã trả lời.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-400 transition-colors hover:text-white"
              >
                Tiếp tục phỏng vấn
              </button>
              <button
                onClick={handleEndInterview}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-400"
              >
                Kết thúc ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
