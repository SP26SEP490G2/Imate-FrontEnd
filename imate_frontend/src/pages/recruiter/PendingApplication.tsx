import { CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { useEffect } from "react";

export default function PendingApplication() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Nếu chưa đăng nhập hoặc không phải Recruiter thì đá về trang chủ 
    if (!user || user.role !== "Recruiter") {
      navigate("/", { replace: true });
      return;
    }

    // Nếu đã Active thì đá về dashboard hoặc trang chức năng của recruiter (giả định)
    if (user.accountStatus === "Active") {
      navigate("/recruiter/dashboard", { replace: true });
    }

    // Nếu chưa có sđt/thông tin (có thể chưa làm xong bước SubmitRecruiterApplication)
    if (!user.phone) {
      navigate("/submit-recruiter-application", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#020617]">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
          <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Đã nộp hồ sơ thành công!
          </h1>
          <p className="text-slate-400">
            Cảm ơn bạn đã đăng ký làm Nhà Tuyển Dụng. Chúng tôi đang xem xét hồ sơ của bạn.
            Quá trình này thường mất từ 1-2 ngày làm việc.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-white/10 p-4 rounded-xl space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Trạng thái</span>
            <span className="text-amber-400 font-medium bg-amber-400/10 px-2 py-1 rounded-md">
              Đang chờ duyệt
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
        >
          Trở về Trang chủ
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
