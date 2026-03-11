import { Eye, EyeOff, CheckCircle2, Quote, Banknote } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerWithEmail, generateActionCode, sendActionEmail } from "@/services/authService";
import type { RegisterEmailData, UserRole, User } from "@/types/common/auth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";
import { useAuth } from "@/store/AuthContext";
import { managementRoutes } from "@/config/managementRoutes";
function SignUp() {
  var navigate = useNavigate();
  const { refetchUser } = useAuth();
  // Khởi tạo role với giá trị "Candidate" (Ứng viên)
  const [role, setRole] = useState<UserRole>("Candidate");
  const [viewPassword, setViewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<RegisterEmailData, "role">>({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Hàm navigate theo role
  const handleNavigation = (user: User) => {
    switch (user?.role) {
      case "Admin":
        navigate(`/management-dashboard/${managementRoutes[0].path}`);
        break;
      case "Staff":
        navigate("/staff/manage-question");
        break;
      case "Mentor":
        if (user.isNewAccount && user.verificationStatus !== "Rejected") {
          navigate("/submit-mentor-application");
        } else if (user.accountStatus === "Active") {
          navigate("/mentor/interview-schedule");
        } else if (user.verificationStatus === "Rejected") {
          toast.error("Hồ sơ Mentor của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và nộp lại.");
          navigate("/submit-mentor-application");
        } else if (user.verificationStatus === "Approved") {
          navigate("/mentor/interview-schedule");
        } else if (user.verificationStatus === "Pending" || user.accountStatus === "PendingVerification") {
          navigate("/pending-application");
        } else {
          navigate("/submit-mentor-application");
        }
        break;
      case "Recruiter":
        if (user.isNewAccount && user.verificationStatus !== "Rejected") {
          navigate("/submit-recruiter-application");
        } else if (user.accountStatus === "Active") {
          navigate("/management/recruiter-dashboard/create-job-posting");
        } else if (user.verificationStatus === "Rejected") {
          toast.error("Hồ sơ Nhà tuyển dụng của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và nộp lại.");
          navigate("/submit-recruiter-application");
        } else if (user.verificationStatus === "Approved") {
          navigate("/management/recruiter-dashboard/create-job-posting");
        } else if (user.verificationStatus === "Pending" || user.accountStatus === "PendingVerification") {
          navigate("/recruiter-pending-application");
        } else {
          navigate("/submit-recruiter-application");
        }
        break;
      case "Candidate":
        navigate("/system-question-bank");
        break;
      default:
        navigate("/");
        break;
    }
  };

  const toogleViewPassword = () => {
    setViewPassword(!viewPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null); // Xóa lỗi khi người dùng bắt đầu nhập lại
  };



  const selectRole = (nextRole: UserRole) => {
    setRole(nextRole);
    setError(null);
  };

  // Hàm ánh xạ role frontend sang role backend/hiển thị
  // const getRoleLabel = (r: UserRole) => (r === "Candidate" ? "Ứng viên" : "Mentor");
const getRoleLabel = (r: UserRole) => {
  switch (r) {
    case "Candidate":
      return "Ứng viên";
    case "Mentor":
      return "Mentor";
    case "Recruiter":
      return "Recruiter";
    default:
      return r;
  }
};
  // --- LOGIC GỌI API ĐĂNG KÝ EMAIL/PASSWORD ---
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.fullName) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }


    setError(null);
    setIsLoading(true);
    try {
      // Gộp formData với role hiện tại
      const dataToSend: RegisterEmailData = { ...formData, role };

      const responseData = await registerWithEmail(dataToSend);
      
      // LƯU LOCAL TOKEN VÀ REFETCH USER
      localStorage.setItem("authToken", responseData.token);
      localStorage.setItem("user", JSON.stringify(responseData.user));
      await refetchUser();

      const auth = getAuth();
      try {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const oobCode = await generateActionCode(formData.email, "VERIFY_EMAIL");
        await sendActionEmail(oobCode, formData.email, "VERIFY_EMAIL");
      } catch (emailError: any) {
        console.error("Failed to send verification email:", emailError);
      }

      // Sử dụng role đã chọn trong thông báo
      const roleLabel = getRoleLabel(role);
      toast.success(`Đăng ký thành công vai trò ${roleLabel}!`);
      
      handleNavigation(responseData.user);
    } catch (err: any) {
      console.error("Lỗi đăng ký:", err);

      // Backend trả về Message (chữ M hoa) hoặc message (chữ m nhỏ)
      // apiClient interceptor đã normalize thành err.message, nhưng cần check cả response.data
      let errorMessage = "Có lỗi xảy ra, vui lòng thử lại.";

      if (err.response?.data) {
        // Ưu tiên lấy từ response.data (Message hoặc message)
        errorMessage = err.response.data.Message || err.response.data.message || errorMessage;
      } else if (err.message) {
        // Nếu không có response.data, lấy từ err.message (đã được apiClient normalize)
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC ĐĂNG KÝ/ĐĂNG NHẬP VỚI GOOGLE ---


  return (
  <div className="flex min-h-screen w-full bg-[#020617] text-white overflow-hidden">

    {/* LEFT PANEL */}
    <div className="hidden lg:flex w-[45%] relative flex-col items-center justify-center p-12 border-r border-white/5">

      <div className="absolute inset-0 grid-pattern"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 max-w-xl">
        <div className="flex items-center justify-start gap-3 mb-10">
          <div className="size-12 logo-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-black text-2xl">I</span>
          </div>
          <span className="text-3xl font-black tracking-tighter">IMATE</span>
        </div>

        {role === "Mentor" ? (
          <div className="space-y-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-300 mb-4">
                <CheckCircle2 className="h-4 w-4" />
                Mentor Onboarding
              </p>
              <h1 className="text-[40px] font-bold leading-[1.1] mb-4">
                Trở thành Mentor<br />đồng hành cùng thế hệ IT mới
              </h1>
              <p className="text-slate-300 text-base">
                Chia sẻ kinh nghiệm thực chiến, xây dựng thương hiệu cá nhân và tạo thêm nguồn thu nhập bền vững.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Xây dựng thương hiệu cá nhân</p>
                  <p className="text-sm text-slate-400">
                    Xuất hiện như chuyên gia trong lĩnh vực, kết nối với hàng trăm mentee tiềm năng.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 flex items-start gap-3">
                <div className="mt-1">
                  <Banknote className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Thu nhập hấp dẫn & linh hoạt</p>
                  <p className="text-sm text-slate-400">
                    Chủ động chọn lịch dạy, tối ưu thời gian rảnh với các buổi mentoring chất lượng cao.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-sky-500/5 p-4 flex gap-3">
                <div className="mt-1">
                  <Quote className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-200 italic">
                    &quot;IMATE giúp mình vừa chia sẻ kinh nghiệm, vừa xây dựng được network chất lượng trong cộng đồng developer.&quot;
                  </p>
                  <p className="text-xs text-slate-400">
                    — Minh Anh, Tech Lead @ Google
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-[44px] font-bold leading-[1.1] mb-6">
              Bắt đầu hành trình chinh phục sự nghiệp IT
            </h1>
            <p className="text-slate-400 text-lg">
              Nâng tầm kỹ năng phỏng vấn cùng AI Mentor hàng đầu.
            </p>
          </div>
        )}
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative">

      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[480px] relative z-10">

        <div className="mb-10">
          <div className="mb-8 flex bg-slate-900/50 p-1 rounded-xl border border-white/10">
  
            <button
              type="button"
              onClick={() => selectRole("Candidate")}
              className={`flex-1 h-11 rounded-lg text-sm font-semibold transition cursor-pointer ${
                role === "Candidate"
                  ? "bg-white text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Ứng viên
            </button>

            <button
              type="button"
              onClick={() => selectRole("Mentor")}
              className={`flex-1 h-11 rounded-lg text-sm font-semibold transition cursor-pointer ${
                role === "Mentor"
                  ? "bg-white text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Mentor
            </button>

            <button
              type="button"
              onClick={() => selectRole("Recruiter")}
              className={`flex-1 h-11 rounded-lg text-sm font-semibold transition cursor-pointer ${
                role === "Recruiter"
                  ? "bg-white text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Recruiter
            </button>
          </div>
          <h2 className="text-3xl font-bold mb-3">Đăng ký tài khoản</h2>
          <p className="text-slate-400">
            Trở thành thành viên và bắt đầu luyện tập ngay hôm nay
          </p>
          {(role === "Mentor" || role === "Recruiter") && (
            <p className="mt-2 text-xs text-indigo-300/90">
              Sau khi đăng ký, hệ thống sẽ tự động đăng nhập và chuyển hướng bạn đến trang nộp hồ sơ {role}.
            </p>
          )}
        </div>

        <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">
          {/* FORM FIELDS FOR ALL ROLES */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl h-14 px-5 focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl h-14 px-5 focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Mật khẩu</label>
            <div className="relative">
              <input
                type={viewPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl h-14 px-5 pr-12 focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="button"
                onClick={toogleViewPassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {viewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Xác nhận Mật khẩu</label>
            <div className="relative">
              <input
                type={viewPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl h-14 px-5 pr-12 focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="button"
                onClick={toogleViewPassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {viewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* ACTION BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-brand-gradient rounded-full font-bold shadow-lg shadow-indigo-500/25 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
          >
            {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
          </button>
        </form>

        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm">
            Đã có tài khoản?
            <Link to="/sign-in" className="text-indigo-400 font-bold ml-1 cursor-pointer hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

      </div>
    </div>
  </div>
);
}
export default SignUp;
