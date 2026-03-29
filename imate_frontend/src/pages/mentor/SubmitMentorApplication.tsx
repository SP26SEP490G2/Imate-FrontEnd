import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/store/AuthContext";
import { submitMentorProfile } from "@/services/mentorService";
import { getAllPositions, getAllSkills, getAllCompanies } from "@/services/commonService";
import type { PositionItem, SkillItem, CompanyItem } from "@/types/common/question";
import type { SubmitMentorProfileRequest } from "@/types/request/mentor.request";
import { FileText, ChevronRight, ChevronLeft, Check, Briefcase, Award, CreditCard, Building2, User } from "lucide-react";

export default function SubmitMentorApplication() {
  const navigate = useNavigate();
  const { user, refetchUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form data state
  const [formData, setFormData] = useState<SubmitMentorProfileRequest & { bankName: string }>({
    bio: "",
    phone: "",
    birthDate: "",
    bankAccountHolderName: "",
    bankAccountNumber: "",
    bankCode: "",
    bankName: "",
    pricePerSession: undefined,
    positionIds: [],
    skillIds: [],
    companyIds: [],
    yoe: 0,
  });

  // Master data state
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);

  // Fetch meta data
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const [posRes, skillRes, compRes] = await Promise.all([
          getAllPositions({ pageSize: 100, pageNumber: 1 }),
          getAllSkills({ pageSize: 100, pageNumber: 1 }),
          getAllCompanies({ pageSize: 100, pageNumber: 1 }),
        ]);
        setPositions(posRes.data);
        setSkills(skillRes.data);
        setCompanies(compRes.data);
      } catch (err) {
        console.error("Error fetching meta data:", err);
      }
    };
    fetchMetaData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    // Enforce digits only for phone and bank account
    if (name === "phone" || name === "bankAccountNumber") {
      value = value.replace(/\D/g, "");
    }

    // Force uppercase for bank account holder name
    if (name === "bankAccountHolderName") {
      value = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "bankName") setFormData((prev) => ({ ...prev, bankCode: value }));
    if (error) setError(null);
  };

  const handleToggleId = (name: "positionIds" | "skillIds" | "companyIds", id: number) => {
    setFormData((prev) => {
      const currentIds = prev[name];
      if (currentIds.includes(id)) {
        return { ...prev, [name]: currentIds.filter((item) => item !== id) };
      }
      return { ...prev, [name]: [...currentIds, id] };
    });
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.bio || formData.bio.length < 10) {
        setError("Giới thiệu bản thân phải có ít nhất 10 ký tự.");
        return false;
      }
      if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
        setError("Số điện thoại không hợp lệ (phải có 10 chữ số).");
        return false;
      }
      if (formData.birthDate) {
        const selectedDate = new Date(formData.birthDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
          setError("Ngày sinh không được ở trong tương lai.");
          return false;
        }
      }
    } else if (step === 2) {
      if (formData.positionIds.length === 0 || formData.skillIds.length === 0) {
        setError("Vui lòng chọn ít nhất một Vị trí và một Kỹ năng.");
        return false;
      }
    } else if (step === 3) {
      if (!formData.bankAccountHolderName?.trim() || !formData.bankAccountNumber?.trim() || !formData.bankCode?.trim()) {
        setError("Vui lòng điền đầy đủ thông tin tài khoản ngân hàng.");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsLoading(true);
    try {
      const payload: SubmitMentorProfileRequest = {
        bio: formData.bio.trim(),
        phone: formData.phone.trim(),
        bankAccountHolderName: formData.bankAccountHolderName.trim(),
        bankAccountNumber: formData.bankAccountNumber.trim(),
        bankCode: formData.bankCode.trim(),
        positionIds: formData.positionIds,
        skillIds: formData.skillIds,
        companyIds: formData.companyIds,
        yoe: formData.yoe,
      };
      if (formData.birthDate) payload.birthDate = formData.birthDate;
      if (formData.pricePerSession != null && formData.pricePerSession > 0) payload.pricePerSession = formData.pricePerSession;

      await submitMentorProfile(payload);
      await refetchUser();
      toast.success("Nộp hồ sơ Mentor thành công. Vui lòng chờ hệ thống duyệt.");
      navigate("/pending-application", { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.Message || err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "Mentor") {
      navigate("/", { replace: true });
    } else if (user.accountStatus === "Active") {
      navigate("/mentor/interview-schedule", { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.role !== "Mentor" || user.accountStatus === "Active") return null;

  const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-500 transition-all duration-200 outline-none hover:border-white/20";
  const labelClass = "text-sm text-slate-300 font-medium mb-1.5 block";
  const badgeClass = (isActive: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
      isActive
        ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500"
        : "bg-slate-800/50 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
    }`;

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-2 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
      <div className={`absolute top-1/2 left-0 h-0.5 bg-indigo-500 transition-all duration-300 -translate-y-1/2 z-0 ${currentStep === 1 ? "w-0" : currentStep === 2 ? "w-1/2" : "w-full"}`} />
      
      {[
        { step: 1, icon: User, label: "Cơ bản" },
        { step: 2, icon: Briefcase, label: "Chuyên môn" },
        { step: 3, icon: CreditCard, label: "Thanh toán" },
      ].map((item) => (
        <div key={item.step} className="relative z-10 flex flex-col items-center gap-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              currentStep >= item.step ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]" : "bg-slate-800 text-slate-500 border border-white/10"
            }`}
          >
            {currentStep > item.step ? <Check className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= item.step ? "text-indigo-400" : "text-slate-500"}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 bg-[#020617]">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/40 p-6 sm:p-10 backdrop-blur-xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/20 ring-1 ring-indigo-500/30">
              <FileText className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Hồ sơ Mentor</h1>
              <p className="text-sm text-slate-400">Bước {currentStep} của 3</p>
            </div>
          </div>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Giới thiệu bản thân (Bio) *</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Mô tả kỹ năng, thế mạnh và những giá trị bạn có thể mang lại cho học viên..."
                    rows={4}
                    className={`${inputClass} !h-auto py-3 resize-none`}
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
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className={labelClass}>Số năm kinh nghiệm</label>
                <input
                  type="number"
                  name="yoe"
                  value={formData.yoe}
                  onChange={handleChange}
                  min={0}
                  className={inputClass}
                  placeholder="VD: 5"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <label className={labelClass + " !mb-0"}>Lĩnh vực chuyên môn (Positions) *</label>
                </div>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-800/30 rounded-2xl border border-white/5 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {positions.map((pos) => (
                    <div key={pos.id} onClick={() => handleToggleId("positionIds", pos.id)} className={badgeClass(formData.positionIds.includes(pos.id))}>
                      {pos.name}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-indigo-400" />
                  <label className={labelClass + " !mb-0"}>Kỹ năng (Skills) *</label>
                </div>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-800/30 rounded-2xl border border-white/5 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {skills.map((skill) => (
                    <div key={skill.id} onClick={() => handleToggleId("skillIds", skill.id)} className={badgeClass(formData.skillIds.includes(skill.id))}>
                      {skill.name}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <label className={labelClass + " !mb-0"}>Công ty đang/đã làm việc (Companies)</label>
                </div>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-800/30 rounded-2xl border border-white/5 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {companies.map((comp) => (
                    <div key={comp.id} onClick={() => handleToggleId("companyIds", comp.id)} className={badgeClass(formData.companyIds.includes(comp.id))}>
                      {comp.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
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
                <div className="sm:col-span-2">
                  <label className={labelClass}>Chủ tài khoản ngân hàng *</label>
                  <input
                    type="text"
                    name="bankAccountHolderName"
                    value={formData.bankAccountHolderName}
                    onChange={handleChange}
                    placeholder="Họ và tên chủ tài khoản (in hoa không dấu)"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Ngân hàng *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="VD: Vietcombank"
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
                    placeholder="Nhập số tài khoản"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm animate-in fade-in zoom-in duration-200">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 h-12 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition font-semibold flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                Tiếp tục <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? "Đang xử lý..." : "Hoàn tất & Nộp hồ sơ"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
