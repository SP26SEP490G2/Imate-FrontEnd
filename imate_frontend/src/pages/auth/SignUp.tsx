import { Mail, Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerWithEmail, registerWithGoogle, generateActionCode, sendActionEmail } from "@/services/authService";
import type { RegisterEmailData, UserRole, User } from "@/types/common/auth";
import { auth } from "@/lib/firebaseConfig";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, type UserCredential } from "firebase/auth";
import { toast } from "react-toastify";
import { useAuth } from "@/store/AuthContext";
function SignUp() {
  var navigate = useNavigate();
  const { refetchUser } = useAuth();
  // Khởi tạo role với giá trị "Candidate" (Ứng viên)
  const [role, setRole] = useState<UserRole>("Candidate");
  const [viewPassword, setViewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<RegisterEmailData, "role">>({ fullName: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Hàm navigate theo role
  const handleNavigation = (user: User) => {
    switch (user?.role) {
      case "Admin":
        navigate("/admin/manage-user");
        break;
      case "Staff":
        navigate("/staff/manage-question");
        break;
      case "Mentor":
        // Kiểm tra AccountStatus:
        // - Active: đã được duyệt → navigate đến trang mentor chính
        // - PendingVerification + có mentor profile (bio, phone, etc.): đã submit form, đang chờ duyệt → navigate đến pending-application
        // - PendingVerification + chưa có mentor profile: account mới chưa submit form → navigate đến submit-mentor-application
        if (user.accountStatus === "Active") {
          navigate("/mentor/interview-schedule");
        } else if (user.accountStatus === "PendingVerification") {
          // Kiểm tra xem đã có mentor profile chưa (có bio hoặc phone là đã submit form)
          if (user.bio || user.phone) {
            // Đã submit form, đang chờ duyệt
            navigate("/pending-application");
          } else {
            // Chưa submit form
            navigate("/submit-mentor-application");
          }
        } else {
          // AccountStatus không hợp lệ hoặc chưa set, điều hướng đến submit form
          navigate("/submit-mentor-application");
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

      await registerWithEmail(dataToSend);
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      if (userCredential.user) {
        // Use custom action handler instead of Firebase default
        try {
          const oobCode = await generateActionCode(formData.email, "VERIFY_EMAIL");
          //await sendActionEmail(oobCode, formData.email, "VERIFY_EMAIL");
          await sendActionEmail(oobCode, "startingimate@gmail.com", "VERIFY_EMAIL");
        } catch (emailError: any) {
          console.error("Failed to send verification email:", emailError);
          // Don't fail registration if email sending fails
        }
      }
      await signOut(auth);

      // Sử dụng role đã chọn trong thông báo
      const roleLabel = getRoleLabel(role);
      // Thay thế alert bằng một modal hoặc message box chuẩn hơn trong môi trường thực tế
      toast.success(`Đăng ký thành công vai trò ${roleLabel}! Vui lòng kiểm tra email của bạn để xác minh tài khoản trước khi đăng nhập.`);
      navigate("/sign-in");
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
  const handleGoogleSignUp = async () => {
    setError(null);
    setIsLoading(true);

    // MẸO: Tạo listener để bắt sự kiện người dùng quay lại tab (do tắt popup)
    // Giúp nút bấm sáng lại NGAY LẬP TỨC thay vì đợi Firebase polling (1-2s)
    const checkFocus = () => {
      setIsLoading(false);
      window.removeEventListener('focus', checkFocus);
    };
    window.addEventListener('focus', checkFocus);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      // Bước 1: Đăng nhập với Firebase
      const result: UserCredential = await signInWithPopup(auth, provider);

      // Nếu thành công, xóa listener đi để tránh conflict
      window.removeEventListener('focus', checkFocus);

      if (!result.user) {
        throw new Error("Không thể lấy thông tin người dùng từ Google.");
      }

      const idToken: string = await result.user.getIdToken();

      // Bước 2: Gửi ID Token VÀ role đến API Backend
      const responseData = await registerWithGoogle({ idToken, role }); // Truyền role đã chọn

      // 3. LƯU LOCAL TOKEN VÀ REFETCH USER
      localStorage.setItem("authToken", responseData.token);
      localStorage.setItem("user", JSON.stringify(responseData.user));

      // Refetch user để cập nhật context
      await refetchUser();

      // Kiểm tra xem đây có phải là account mới hay account đã tồn tại
      if (responseData.user.isNewAccount) {
        toast.success(`Đăng ký thành công với vai trò ${getRoleLabel(role)}!`);
      } else {
        toast.success("Đăng nhập thành công!");
      }

      // Navigate
      handleNavigation(responseData.user);

    } catch (err: any) {
      // Xóa listener nếu có lỗi xảy ra
      window.removeEventListener('focus', checkFocus);
      setIsLoading(false); // Đảm bảo tắt loading

      // --- BỘ LỌC LỖI (QUAN TRỌNG) ---
      // Bỏ qua các lỗi do người dùng tự tắt popup hoặc do hệ thống hủy
      if (
        err.code === "auth/popup-closed-by-user" || 
        err.code === "auth/cancelled-popup-request" ||
        err.message?.includes("closed-by-user") ||
        err.message?.includes("cancelled-popup-request")
      ) {
        setError(null);
        return; // Im lặng return, không hiện Toast lỗi
      }
      // -------------------------------

      let errorMessage = "Đăng nhập Google thất bại.";

      // Xử lý các trường hợp lỗi cụ thể từ Backend
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
        if (errorMessage.includes("đã được đăng ký bằng phương thức khác")) {
          errorMessage = "Email này đã được đăng ký bằng phương thức khác. Vui lòng đăng nhập bằng Email/Mật khẩu hoặc sử dụng tài khoản Google khác.";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.error("Lỗi Google Sign-up:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } 
    // Không cần finally setIsLoading(false) ở đây nữa vì đã xử lý kỹ ở trên
  };

  return (
  <div className="flex min-h-screen w-full bg-[#020617] text-white overflow-hidden">

    {/* LEFT PANEL */}
    <div className="hidden lg:flex w-[45%] relative flex-col items-center justify-center p-12 border-r border-white/5">

      <div className="absolute inset-0 grid-pattern"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 text-center max-w-xl">
        <div className="flex items-center justify-center gap-3 mb-16">
          <div className="size-12 logo-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-black text-2xl">I</span>
          </div>
          <span className="text-3xl font-black tracking-tighter">IMATE</span>
        </div>

        <h1 className="text-[44px] font-bold leading-[1.1] mb-10">
          Bắt đầu hành trình chinh phục sự nghiệp IT
        </h1>

        <p className="text-slate-400 text-lg">
          Nâng tầm kỹ năng phỏng vấn cùng AI Mentor hàng đầu.
        </p>
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
              onClick={() => setRole("Candidate")}
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
              onClick={() => setRole("Mentor")}
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
              onClick={() => setRole("Recruiter")}
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
        </div>

        <form className="space-y-6" onSubmit={handleEmailPasswordSubmit}>

          {/* GOOGLE BUTTON */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full h-14 bg-white text-slate-900 font-semibold rounded-full transition hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
          >
            Đăng ký bằng Google
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-slate-500 text-xs uppercase">
              Hoặc đăng ký bằng Email
            </span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          {/* FULL NAME */}
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

          {/* EMAIL */}
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

          {/* PASSWORD */}
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

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* SUBMIT */}
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
