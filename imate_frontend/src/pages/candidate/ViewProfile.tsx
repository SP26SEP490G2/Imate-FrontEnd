import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Camera, Star, ArrowUpCircle, Briefcase, Code2, Award, Phone, Mail, FileText, BookA, Building, CreditCard, CircleUser, Landmark, Edit } from "lucide-react";
import SettingTab from "@/components/custom/ViewProfileTabs/SettingTab";
import { updateMyProfile } from "@/services/accountService";
import { toast } from "react-toastify";
import { calculateAge, formatPrice, getAvatarColor, getInitials } from "@/helpers/common";


const nameSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
});

const ViewProfile = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state loading
  const [bank, setBank] = useState<any>({});
  const navigate = useNavigate();
  const { user, refetchUser, isLoading } = useAuth(); // Lấy cả isLoading để điều khiển render
  const [loaded, setLoaded] = useState(false);
  // --- Lấy bank detail ---

  // --- State mới để quản lý file và ảnh preview ---
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Lưu File object để upload
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar || undefined); // Lưu URL để hiển thị
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      fullName: user?.fullName,
    },
  });

  useEffect(() => {
    if (!isEditMode) {
      setAvatarPreview(user?.avatar || undefined);
    }
  }, [user, isEditMode]);

  useEffect(() => {
    form.reset({ fullName: user?.fullName });
  }, [user, form]);

  useEffect(() => {
    if (!user?.avatarUrl) return;
    const img = new Image();
    img.src = user.avatarUrl;

    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(false);
  }, [user?.avatarUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Thêm type
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || undefined);
    form.reset({ fullName: user?.fullName });
  };

  const handleSaveProfile = async (values: z.infer<typeof nameSchema>) => {
    setIsSubmitting(true);
    try {
      await updateMyProfile({
        fullName: values.fullName,
        avatarFile: avatarFile,
      });
      await refetchUser();
      setIsEditMode(false);
      setAvatarFile(null);
      toast.success("Cập nhật profile thành công!");
    } catch (error) {
      toast.error("Cập nhật profile thất bại");
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const didRefetch = useRef(false);
  useEffect(() => {
    if (!didRefetch.current && !user) {
      didRefetch.current = true;
      refetchUser();
    }
  }, [user, refetchUser]);

  const currentPlan = user?.subscription || "Gói Thường";
  const isMentor = user?.role === "Mentor";
  const isAdmin = user?.role === "Admin";
  const isStaff = user?.role === "Staff";
  // Guard render: đang tải
  if (isLoading) {
    return (
      <div className="mx-auto mt-5 max-w-7xl px-4 pb-12 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <p className="text-sm text-gray-500">Đang tải thông tin người dùng...</p>
          </div>
        </div>
      </div>
    );
  }
  // Sau khi tải xong nhưng không có user
  if (!user) {
    return (
      <div className="mx-auto mt-5 max-w-7xl px-4 pb-12 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <p className="text-sm text-gray-500">Không tìm thấy thông tin người dùng.</p>
          </div>
        </div>
      </div>
    );
  }
  return (
<div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 space-y-16">
      
      {/* ================= PROFILE HEADER ================= */}
      <section className="
  relative
  rounded-3xl
  p-10 md:p-14
  flex flex-col md:flex-row
  items-center md:items-end
  justify-between gap-10

  bg-gradient-to-br from-white/5 to-white/[0.02]
  backdrop-blur-2xl
  border border-white/10
  shadow-[0_20px_60px_rgba(0,0,0,0.6)]
  ring-1 ring-white/5
  ">

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
          accept="image/png, image/jpeg, image/gif"
        />

        <div className="flex flex-col md:flex-row items-center gap-10">
          
          {/* Avatar */}
         <div className="relative group">

  {/* Glow background (z-0) */}
  <div className="
    absolute inset-0
    bg-gradient-to-tr from-[#6366f1] to-[#a855f7]
    rounded-full blur-3xl opacity-25
    group-hover:opacity-40
    transition-opacity
    z-0
  " />

  {/* Avatar (z-10) */}
  <div className="
    relative z-10
    w-40 h-40
    rounded-full
    border-4 border-[#1e293b]
    bg-slate-800
    flex items-center justify-center
    overflow-hidden
    shadow-2xl
  ">
    {loaded ? (
      <img src={avatarPreview} className="w-full h-full object-cover" />
    ) : (
      <span className="text-4xl font-bold text-white">
        {getInitials(user.fullName || "User")}
      </span>
    )}
  </div>

  {/* Camera button (z-20) */}
  {isEditMode && (
    <button
      onClick={handleCameraClick}
      className="
        absolute bottom-3 right-3
        z-20
        w-12 h-12
        bg-white text-[#020617]
        rounded-full
        flex items-center justify-center
        shadow-xl
        hover:scale-110
        transition-transform cursor-pointer
      "
    >
      <Camera size={18} />
    </button>
  )}
</div>

          {/* Info */}
          <div className="text-center md:text-left max-w-xl">
            {isEditMode ? (
              <Form {...form}>
                <form
                  id="updateProfileForm"
                  onSubmit={form.handleSubmit(handleSaveProfile)}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Họ và tên
                    </label>
                    <Input
                      {...form.register("fullName")}
                      className="input-glass text-lg"
                    />
                  </div>
                </form>
              </Form>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                  {user.fullName}
                </h1>

                <p className="text-slate-400 text-lg flex items-center justify-center md:justify-start gap-2">
                  <Mail size={18} className="text-slate-500" />
                  {user.email}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Buttons */}
        {!isEditMode ? (
          <button
            onClick={() => setIsEditMode(true)}
className="flex items-center gap-2 px-8 py-3.5
bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#22d3ee]
rounded-2xl font-bold text-white
shadow-lg hover:scale-105 transition-all cursor-pointer">
            <Edit size={18} />
            Chỉnh sửa hồ sơ
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              type="submit"
              form="updateProfileForm"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3.5
bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#22d3ee]
rounded-2xl font-bold text-white
shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>

            <button
              onClick={handleCancelEdit}
              className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              Hủy
            </button>
          </div>
        )}
      </section>

      {/* ================= PERSONAL INFO ================= */}
<section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl">
  
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-white">
      Thông tin cá nhân
    </h2>
    <p className="text-slate-400 text-sm mt-1">
      Các thông tin cơ bản của tài khoản
    </p>
  </div>

  <div className="grid md:grid-cols-2 gap-8">
    
    {/* Họ tên */}
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">
        Họ và tên
      </label>
      <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
        {user.fullName}
      </div>
    </div>

    {/* Email */}
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">
        Email
      </label>
      <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white flex items-center gap-3">
        <Mail size={18} className="text-slate-400" />
        {user.email}
      </div>
    </div>

    {/* Vai trò */}
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">
        Vai trò
      </label>
      <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
        {user.role}
      </div>
    </div>

    {/* Gói hiện tại */}
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">
        Gói hiện tại
      </label>
      <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
        {currentPlan}
      </div>
    </div>

  </div>
</section>

      {/* ================= SETTINGS SECTION ================= */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Cài đặt tài khoản
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Quản lý mật khẩu và bảo mật tài khoản của bạn
          </p>
        </div>

        <SettingTab />
      </section>

    </div>
  </div>
);
};

export default ViewProfile;
