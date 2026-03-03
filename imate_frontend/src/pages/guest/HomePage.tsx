import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { getListPreviewMentors } from '../../services/mentorService';
import type { ListPreviewMentor } from '../../types/common/mentor';

const HomePage: React.FC = () => {
  const [mentors, setMentors] = useState<ListPreviewMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const data = await getListPreviewMentors();
        setMentors(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch mentors:', err);
        setError('Không thể tải danh sách mentor. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // Placeholder images cho mentors
  const placeholderImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAui6WN99bSHHdAQTGwuwQDYHov1eX3WALp5S5HHLTgzlJedK-QJ-WP77gKJkSnrulmZlanCUymhkc3gtJAiRCovmqDEqrmKTuvJRiUo4JFPeSsXLxL4YopTlLq55RoGiGiajPJrcYLpjRBT3z3bfQO47xUOd1ySztn4mdORWo7AJR4JR5FoQseiKMhm0PfqgzCbVtdwe8RVqcW9fI7B5t-fx32qh7_V9mUOMM8fd_rgrZyC2h9-jdaZVziXSOicHTj4jOl-hLxbro",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBL2D_YXsRQ6VyKpNSQnagL0rWekTiTpgT_2JCqxSzvWsNBeZi7xdMQVKiPCIEgr9dhs0q8ufT8MqAtj6hR9ewQ2oxEcBM7lpj8Fnj5fde0IbZpqRv2hVBu1QdtEITt_VcvHuqhmmYQD9Z1UAscGQdniBLEO5OwY7Ai-ZsjkvZPoFIfjTJi0KlGwBGqx_EzQsqoPaa69qUckH2wMuqu9t9ro0_reZyPoO1l4lI4mSBvzU5F1getk7ZwWtfb4x0t3VI9YgJXovNUdYM",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDsoCoFXkDjfMs3rYoRWIoPQpPG-2BB_vxo05Zp31-sAu-sKtMjdwevcYsQQ5pkojJbGkLmkqS2vnN1kRvdd9VgH-dBbsr0eBY2p6DvCSVAEBhKYo_MsQ3Lqw1C8J4HU1d9wtnP8V4NfGA9oHnnSffBoq99dckDMCq6dyxO4u7M2fF55BBSk3LVEKlMCoUF4U6CmNqrRnKENao6nCZPnBjV_SgpAnrpaxYQeREOrd1QTrg0cj_o8QBtjI1d9S1vr8aA4ljfuejYtk0",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD-Jkv4rzYbi9tmfVoNtvttHZDzng6n-ASUtofoXhDlQ4snpUcq6yZkXKI4F83MyeMttEwjYzBaXSHrW6eR23wd3cHHJbuALuGRpqCBOlmt6Ut_B2ws_sQecCsDT6OFCdpnMZF4HVNdxjxSuFgt2D7oBtbYVXXBMt3Lojpfu8-8paZeCqaAp23Duo978OAu0-tuYmpOgKm4vB6OfpXX-QNKegJgz_dl8QOUrMjvb5OyCjKhLL8hCKlTGEpz0bmSNz0aDm9rkrBIYkY"
  ];

  return (
    <div className="font-sans">
      <Header />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 px-6 overflow-hidden">
          <div className="hero-glow"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">AI-Powered Tech Interviews</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight">
              Chinh phục mọi cuộc <br />
              <span className="neon-gradient-text">phỏng vấn IT với AI</span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Nền tảng luyện tập phỏng vấn thông minh, kết nối chuyên gia hàng đầu giúp bạn bứt phá sự nghiệp công nghệ.
            </p>
            <div className="flex justify-center mb-20">
              <button className="w-full sm:w-auto px-12 py-4 bg-white text-[#0f172a] font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-xl">
                Luyện tập ngay <span className="material-symbols-outlined">rocket_launch</span>
              </button>
            </div>
            <div className="pt-12 border-t border-slate-800/50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-8">
                Học viên của chúng tôi đang làm việc tại
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all">
                <span className="text-2xl font-bold text-white tracking-tighter">TECHCOM</span>
                <span className="text-2xl font-bold text-white tracking-tighter">VNG</span>
                <span className="text-2xl font-bold text-white tracking-tighter">FPT</span>
                <span className="text-2xl font-bold text-white tracking-tighter">VIETTEL</span>
                <span className="text-2xl font-bold text-white tracking-tighter">MOMO</span>
              </div>
            </div>
          </div>
        </section>

        {/* AI Interview Mockup Section */}
        <section className="py-24 px-6 bg-[#020617] relative">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 perspective-card relative">
              <div className="tilted-mockup bg-[#1e293b] rounded-3xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                  </div>
                  <div className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] text-slate-400 font-mono">
                    localhost:3000/ai-interview
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <img
                      alt="AI Avatar"
                      className="w-16 h-16 rounded-full border-2 border-indigo-500 shadow-xl shadow-indigo-500/20"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF7lIZxbcXYMA55MyRh0LQthnEuT0cVgPib20pt2a8MgMIEMgiModrWhfi1xF9C7-aA8huFzP6Q84eylE41XTL5Bds3iqGZ1l3KZh0_IjECf2XBBMRe1fEGdb9SxTqZN33bcY6VqjxP_BQJbwbmeYfdOmW_LKc1MeqtKFc7LvW1HqxSgRvS2y54B_p0OaTTcp0XHYNaW5FyTDFQDLeMoRtZMpCOyZBXvTQcVXa-6OBGlOGiaAu_sLbqPW34087wMn-n_Qjj3ph6bA"
                    />
                    <div>
                      <div className="h-2 w-32 bg-slate-700 rounded-full mb-2"></div>
                      <div className="h-2 w-20 bg-slate-800 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-[#020617] rounded-2xl p-6 h-48 flex items-center justify-center border border-white/5">
                    <div className="flex items-end gap-1 h-12">
                      <div className="w-1 bg-indigo-500 rounded-full h-8 animate-[pulse_1s_infinite]"></div>
                      <div className="w-1 bg-indigo-500 rounded-full h-12 animate-[pulse_1.2s_infinite]"></div>
                      <div className="w-1 bg-indigo-500 rounded-full h-6 animate-[pulse_0.8s_infinite]"></div>
                      <div className="w-1 bg-purple-500 rounded-full h-10 animate-[pulse_1.1s_infinite]"></div>
                      <div className="w-1 bg-purple-500 rounded-full h-4 animate-[pulse_0.9s_infinite]"></div>
                      <div className="w-1 bg-cyan-400 rounded-full h-8 animate-[pulse_1s_infinite]"></div>
                      <div className="w-1 bg-cyan-400 rounded-full h-12 animate-[pulse_1.2s_infinite]"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-500 mb-1">Confidence Score</div>
                      <div className="text-xl font-bold text-cyan-400">92%</div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-500 mb-1">Keywords Used</div>
                      <div className="text-xl font-bold text-purple-500">14/15</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 floating p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="material-symbols-outlined text-cyan-400">check_circle</span> Phản hồi 1:1
                </span>
              </div>
              <div className="absolute -bottom-10 -left-6 floating [animation-delay:1.5s] p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="material-symbols-outlined text-purple-500">analytics</span> Chấm điểm tự động
                </span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
                Môi trường giả lập <br />
                phòng phỏng vấn thực tế
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Thuật toán AI thế hệ mới sẽ đóng vai trò là Senior Interviewer, đưa ra các câu hỏi hóc búa và phân tích sâu
                sắc về thái độ, kiến thức cũng như cách diễn đạt của bạn.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-indigo-500 text-sm">bolt</span>
                  </div>
                  <p className="text-slate-300 font-medium">Nhận xét chi tiết ngay sau khi kết thúc buổi phỏng vấn.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-purple-500 text-sm">psychology</span>
                  </div>
                  <p className="text-slate-300 font-medium">Tự động gợi ý những lỗ hổng kiến thức cần bổ sung.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-cyan-400 text-sm">history</span>
                  </div>
                  <p className="text-slate-300 font-medium">Lưu trữ lịch sử và theo dõi tiến độ phát triển mỗi ngày.</p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Top Mentors Section */}
        <section className="py-24 px-6 bg-[#020617]/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-4">Top chuyên gia hàng đầu</h2>
                <p className="text-slate-400">Kết nối trực tiếp với các Mentor đang làm việc tại các tập đoàn lớn.</p>
              </div>
              <div className="flex gap-2">
                <button className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-all">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-all">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar scroll-smooth">
              {loading ? (
                // Loading skeleton
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="min-w-[300px] flex-none bg-[#1e293b] rounded-3xl border border-white/5 p-6 animate-pulse">
                      <div className="relative mb-6 overflow-hidden rounded-2xl aspect-[4/5] bg-slate-700"></div>
                      <div className="space-y-4">
                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        <div className="h-10 bg-slate-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </>
              ) : error ? (
                // Error state
                <div className="w-full text-center py-12">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all"
                  >
                    Thử lại
                  </button>
                </div>
              ) : mentors.length > 0 ? (
                // Mentor cards from API
                mentors.map((mentor, index) => (
                  <div
                    key={index}
                    className="min-w-[300px] flex-none bg-[#1e293b] rounded-3xl border border-white/5 p-6 group hover:border-indigo-500/50 transition-all duration-300"
                  >
                    <div className="relative mb-6 overflow-hidden rounded-2xl aspect-[4/5]">
                      <img
                        alt={mentor.fullName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src={placeholderImages[index % placeholderImages.length]}
                      />
                      <div className="absolute bottom-4 left-4 right-4 p-3 bg-[#020617]/80 backdrop-blur-md rounded-xl border border-white/10">
                        <div className="text-white font-bold">{mentor.fullName}</div>
                        <div className="text-xs text-slate-400">{mentor.position || 'Mentor'}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Kinh nghiệm</span>
                        <span className="text-white font-semibold">{mentor.yoe} năm</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Nơi làm việc</span>
                        <span className="text-white font-semibold">{mentor.company || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <span className="material-symbols-outlined text-sm fill-1">star</span>
                        <span className="text-xs font-bold">
                          {mentor.avgRatings?.toFixed(1) || '0.0'} ({mentor.totalRatingCount || 0} đánh giá)
                        </span>
                      </div>
                      <button className="w-full py-3 bg-white text-[#0f172a] font-bold rounded-xl hover:bg-slate-100 transition-all">
                        Đặt lịch
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                // No mentors available
                <div className="w-full text-center py-12">
                  <p className="text-slate-400">Chưa có mentor nào khả dụng.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Community Questions Section */}
        <section className="py-24 px-6 bg-[#020617]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-white mb-4">Câu hỏi hot từ cộng đồng</h2>
              <p className="text-slate-400">Tham gia thảo luận và giải đáp thắc mắc cùng hàng ngàn Developers khác.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Question Card 1 */}
              <div className="bg-white rounded-3xl p-6 shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase">
                    Node.js
                  </span>
                  <span className="px-3 py-1 bg-cyan-50 text-cyan-600 text-[10px] font-bold rounded-full uppercase">
                    Architecture
                  </span>
                </div>
                <h3 className="text-[#0f172a] text-lg font-bold mb-6 leading-snug hover:text-indigo-500 cursor-pointer transition-colors">
                  Làm thế nào để triển khai kiến trúc Microservices tối ưu với Node.js?
                </h3>
                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">visibility</span>
                    <span className="text-xs text-slate-500 font-medium">1.2k lượt xem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">chat_bubble</span>
                    <span className="text-xs text-slate-500 font-medium">24 thảo luận</span>
                  </div>
                </div>
              </div>

              {/* Question Card 2 */}
              <div className="bg-white rounded-3xl p-6 shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-full uppercase">
                    System Design
                  </span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase">
                    High Traffic
                  </span>
                </div>
                <h3 className="text-[#0f172a] text-lg font-bold mb-6 leading-snug hover:text-indigo-500 cursor-pointer transition-colors">
                  Các câu hỏi System Design phổ biến nhất khi phỏng vấn Senior tại FAANG?
                </h3>
                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">visibility</span>
                    <span className="text-xs text-slate-500 font-medium">3.5k lượt xem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">chat_bubble</span>
                    <span className="text-xs text-slate-500 font-medium">56 thảo luận</span>
                  </div>
                </div>
              </div>

              {/* Question Card 3 */}
              <div className="bg-white rounded-3xl p-6 shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase">
                    React
                  </span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full uppercase">
                    Performance
                  </span>
                </div>
                <h3 className="text-[#0f172a] text-lg font-bold mb-6 leading-snug hover:text-indigo-500 cursor-pointer transition-colors">
                  Kỹ thuật Memoization trong React: Khi nào nên và không nên dùng?
                </h3>
                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">visibility</span>
                    <span className="text-xs text-slate-500 font-medium">890 lượt xem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">chat_bubble</span>
                    <span className="text-xs text-slate-500 font-medium">12 thảo luận</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 text-center">
              <button className="px-8 py-3 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all">
                Xem thêm câu hỏi
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#020617] border-t border-white/5 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-black">
                  I
                </div>
                <span className="text-xl font-black text-white">IMATE</span>
              </div>
              <p className="text-slate-400 mb-8 max-w-sm">
                Nâng tầm sự nghiệp IT của bạn thông qua luyện tập phỏng vấn với AI và sự dẫn dắt từ các chuyên gia hàng đầu
                thế giới.
              </p>
              <div className="flex gap-4">
                <a
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  href="#"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                  </svg>
                </a>
                <a
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  href="#"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Khám phá</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li>
                  <a className="hover:text-indigo-500 transition-colors" href="#">
                    Ngân hàng câu hỏi
                  </a>
                </li>
                <li>
                  <a className="hover:text-indigo-500 transition-colors" href="#">
                    Luyện tập AI
                  </a>
                </li>
                <li>
                  <a className="hover:text-indigo-500 transition-colors" href="#">
                    Mentor Hub
                  </a>
                </li>
                <li>
                  <a className="hover:text-indigo-500 transition-colors" href="#">
                    Bảng xếp hạng
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Về chúng tôi</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li>
                  <a className="hover:text-indigo-500 transition-colors" href="#">
                    Giới thiệu
                  </a>
                </li>
                <li>
                  <a className="hover:text-indigo-500 transition-colors" href="#">
                    Tuyển dụng
                  </a>
                </li>
                <li>
                  <a className="hover:text-indigo-500 transition-colors" href="#">
                    Liên hệ
                  </a>
                </li>
                <li>
                  <a className="hover:text-indigo-500 transition-colors" href="#">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <h4 className="text-white font-bold mb-6">Bản tin công nghệ</h4>
              <p className="text-sm text-slate-400 mb-4">Nhận thông tin mới nhất về thị trường tuyển dụng IT.</p>
              <div className="flex gap-2">
                <input
                  className="bg-[#1e293b] border-white/10 rounded-xl px-4 py-2 text-sm w-full focus:ring-indigo-500 focus:border-indigo-500 text-white"
                  placeholder="Email của bạn"
                  type="email"
                />
                <button className="bg-indigo-500 text-white p-2 rounded-xl">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© 2024 IMATE. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-6">
              <a className="hover:text-white transition-colors" href="#">
                Điều khoản dịch vụ
              </a>
              <a className="hover:text-white transition-colors" href="#">
                Chính sách bảo mật
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
