import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/store/AuthContext";
import { submitMentorProfile } from "@/services/mentorService";
import type { SubmitMentorProfileRequest } from "@/types/request/mentor.request";
import { FileText } from "lucide-react";

export default function SubmitMentorApplication() {
  const navigate = useNavigate();
  const { user, refetchUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SubmitMentorProfileRequest & { bankName: string }>({
    bio: "",
    phone: "",
    birthDate: "",
    bankAccountHolderName: "",
    bankAccountNumber: "",
    bankCode: "",
    bankName: "",
    pricePerSession: undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "bankName") setFormData((prev) => ({ ...prev, bankCode: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bio?.trim() || !formData.phone?.trim() || !formData.bankAccountHolderName?.trim() || !formData.bankAccountNumber?.trim() || !formData.bankCode?.trim()) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const payload: SubmitMentorProfileRequest = {
        bio: formData.bio.trim(),
        phone: formData.phone.trim(),
        bankAccountHolderName: formData.bankAccountHolderName.trim(),
        bankAccountNumber: formData.bankAccountNumber.trim(),
        bankCode: formData.bankCode.trim(),
      };
      if (formData.birthDate) payload.birthDate = formData.birthDate;
      if (formData.pricePerSession != null && formData.pricePerSession > 0) payload.pricePerSession = formData.pricePerSession;

      await submitMentorProfile(payload);
      await refetchUser();
      toast.success("Nộp hồ sơ Mentor thành công. Vui lòng chờ hệ thống duyệt.");
      navigate("/pending-application", { replace: true });
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

  if (!user || user.role !== "Mentor") {
    navigate("/", { replace: true });
    return null;
  }
  if (user.accountStatus === "Active") {
    navigate("/mentor/interview-schedule", { replace: true });
    return null;
  }
  if (user.accountStatus === "PendingVerification") {
    navigate("/pending-application", { replace: true });
    return null;
  }

  const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-500";
  const labelClass = "text-sm text-slate-300 font-medium mb-1 block";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#020617]">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <FileText className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Nộp hồ sơ Mentor</h1>
            <p className="text-sm text-slate-400">Điền thông tin để hoàn tất đăng ký Mentor</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Giới thiệu bản thân (Bio) *</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Mô tả ngắn về kinh nghiệm, lĩnh vực hỗ trợ..."
              rows={3}
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
            <label className={labelClass}>Ngày sinh</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Chủ tài khoản ngân hàng *</label>
            <input
              type="text"
              name="bankAccountHolderName"
              value={formData.bankAccountHolderName}
              onChange={handleChange}
              placeholder="Họ và tên chủ tài khoản"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Ngân hàng (mã hoặc tên) *</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="VD: Vietcombank, Techcombank, HSBC..."
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Số tài khoản *</label>
            <input
              type="text"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleChange}
              placeholder="Nhập số tài khoản ngân hàng"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Giá mỗi buổi (VNĐ, tùy chọn)</label>
            <input
              type="number"
              name="pricePerSession"
              value={formData.pricePerSession ?? ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, pricePerSession: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="VD: 200000"
              min={0}
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
