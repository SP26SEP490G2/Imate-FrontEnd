import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

// --- Thêm các import ---
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { auth as firebaseAuth } from "@/lib/firebaseConfig";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { changePassword as changePasswordService } from "@/services/authService";
import { toast } from "react-toastify";

// 1. Định nghĩa schema validation
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"], // Gắn lỗi vào trường confirmPassword
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const SettingTab = () => {
  // State cho ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);

  // Check xem user có đăng nhập bằng Google không
  useEffect(() => {
    const checkGoogleAccount = () => {
      const user = firebaseAuth.currentUser;
      if (user && user.providerData) {
        // Check xem có provider nào là Google không
        const hasGoogleProvider = user.providerData.some((provider) => provider.providerId === "google.com");
        setIsGoogleAccount(hasGoogleProvider);
      }
    };

    checkGoogleAccount();

    // Listen to auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged(() => {
      checkGoogleAccount();
    });

    return () => unsubscribe();
  }, []);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  // 2. Hàm xử lý submit
  const onSubmit: SubmitHandler<PasswordFormData> = async (data) => {
    setIsLoading(true);

    try {
      // BƯỚC 1: Lấy user hiện tại từ Firebase Client SDK
      const user = firebaseAuth.currentUser;
      if (!user || !user.email) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      }

      // BƯỚC 2: Re-authenticate (Đây là lúc xác thực "mật khẩu hiện tại")
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // BƯỚC 3: Nếu (2) thành công, lấy Firebase ID Token MỚI
      const firebaseIdToken = await user.getIdToken(true); // true = force refresh

      // BƯỚC 4: Gọi API backend đã tạo
      await changePasswordService({
        newPassword: data.newPassword,
        firebaseIdToken: firebaseIdToken,
      });

      // BƯỚC 5: Thành công
      toast.success("Đổi mật khẩu thành công!");
      reset();
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại.";
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Mật khẩu hiện tại không đúng.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="max-w-2xl">
    <div className="
    rounded-3xl p-8 md:p-10
    bg-[rgba(30,41,59,0.4)]
    backdrop-blur-xl
    border border-white/10
    shadow-[0_20px_50px_rgba(0,0,0,0.5)]
    ">      
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Đổi mật khẩu
            </h2>

            {isGoogleAccount ? (
              <p className="text-sm text-slate-400">
                Tài khoản đăng nhập bằng Google không thể đổi mật khẩu.
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Cập nhật mật khẩu để bảo mật tài khoản của bạn
              </p>
            )}
          </div>

          {isGoogleAccount ? (
            <div className="bg-navy-lighter/40 border border-white/10 rounded-xl p-5 text-sm text-slate-300">
              Để thay đổi mật khẩu, vui lòng truy cập{" "}
              <a
                href="https://myaccount.google.com/personal-info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                Google Account Security
              </a>
            </div>
          ) : (
            <>
              {/* Current Password */}
              <FormField
                control={control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Mật khẩu hiện tại
                    </label>

                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu hiện tại"
                          className="input-field"
                          {...field}
                        />
                      </FormControl>

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <FormMessage className="text-red-400 text-xs mt-2" />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Mật khẩu mới
                    </label>

                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu mới"
                          className="input-field"
                          {...field}
                        />
                      </FormControl>

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword(!showNewPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <FormMessage className="text-red-400 text-xs mt-2" />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Xác nhận mật khẩu mới
                    </label>

                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Xác nhận mật khẩu mới"
                          className="input-field"
                          {...field}
                        />
                      </FormControl>

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <FormMessage className="text-red-400 text-xs mt-2" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-8 py-3.5
bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#22d3ee]
text-white font-bold rounded-full
shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                  {isLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
                </button>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  </div>
);
};

export default SettingTab;
