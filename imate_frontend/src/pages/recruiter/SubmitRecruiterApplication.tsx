import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/store/AuthContext";
import { submitRecruiterProfile } from "@/services/recruiterService";
import type { SubmitRecruiterProfileRequest } from "@/types/request/recruiter.request";
import { Briefcase } from "lucide-react";

export default function SubmitRecruiterApplication() {
  const navigate = useNavigate();
  const { user, refetchUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SubmitRecruiterProfileRequest>({
    companyName: "",
    companyAddress: "",
    companyWebsite: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName?.trim() || !formData.companyAddress?.trim() || !formData.phone?.trim()) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const payload: SubmitRecruiterProfileRequest = {
        companyName: formData.companyName.trim(),
        companyAddress: formData.companyAddress.trim(),
        phone: formData.phone.trim(),
      };
      if (formData.companyWebsite?.trim()) payload.companyWebsite = formData.companyWebsite.trim();

      await submitRecruiterProfile(payload);
      await refetchUser();
      toast.success("Nộp hồ sơ Nhà Tuyển Dụng thành công. Vui lòng chờ hệ thống duyệt.");
      navigate("/recruiter-pending-application", { replace: true });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err && err.response && typeof (err.response as { data?: { message?: string; Message?: string } }).data === "object"
        ? ((err.response as { data: { message?: string; Message?: string } }).data?.Message ?? (err.response as { data: { message?: string } }).data?.message)
        : "Có lỗi xảy ra, vui lòng thử lại.";
      setError(msg ?? "Có lỗi xảy ra, vui lòng thử lại.");
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Dùng useEffect để redirect, tránh navigate() during render
  useEffect(() => {
    if (!user || user.role !== "Recruiter") {
      navigate("/", { replace: true });
    } else if (user.accountStatus === "Active") {
      navigate("/recruiter/dashboard", { replace: true });
    }
    // Không redirect PendingVerification – recruiter mới chưa nộp hồ sơ cần ở lại trang này
  }, [user, navigate]);

  // Hiển thị null trong khi đang redirect
  if (!user || user.role !== "Recruiter" || user.accountStatus === "Active") {
    return null;
  }


  const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-500";
  const labelClass = "text-sm text-slate-300 font-medium mb-1 block";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#020617]">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <Briefcase className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Nộp hồ sơ Nhà Tuyển Dụng</h1>
            <p className="text-sm text-slate-400">Điền thông tin để hoàn tất đăng ký Recruiter</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Tên công ty *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="VD: Công ty TNHH Imate"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Địa chỉ công ty *</label>
            <textarea
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              placeholder="Nhập địa chỉ chi tiết công ty..."
              rows={2}
              className={`${inputClass} h-auto py-3 resize-none`}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Số điện thoại liên hệ *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="VD: 0987 654 321"
              className={inputClass}
              required
            />
          </div>



          <div>
            <label className={labelClass}>Website công ty (tùy chọn)</label>
            <input
              type="url"
              name="companyWebsite"
              value={formData.companyWebsite ?? ""}
              onChange={handleChange}
              placeholder="https://vidu.com"
              className={inputClass}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition disabled:opacity-50"
          >
            {isLoading ? "Đang gửi..." : "Nộp hồ sơ"}
          </button>
        </form>
      </div>
    </div>
  );
}
