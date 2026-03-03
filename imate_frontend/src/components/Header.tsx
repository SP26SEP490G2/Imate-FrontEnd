import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="glass-header sticky top-0 z-50 w-full">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between whitespace-nowrap">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
              I
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">IMATE</span>
          </div>
          <nav className="hidden xl:flex items-center gap-6">
            <a className="text-sm font-semibold text-slate-300 hover:text-white transition-colors" href="#">
              Ngân hàng câu hỏi
            </a>
            <a className="text-sm font-semibold text-slate-300 hover:text-white transition-colors" href="#">
              Luyện tập AI
            </a>
            <a className="text-sm font-semibold text-slate-300 hover:text-white transition-colors" href="#">
              Kết nối Mentor
            </a>
            <a className="text-sm font-semibold text-slate-300 hover:text-white transition-colors" href="#">
              Bảng giá
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3" href="#">
            Đăng nhập
          </a>
          <a className="text-sm font-bold text-[#020617] bg-white hover:bg-slate-100 px-5 py-2.5 rounded-full transition-all" href="#">
            Đăng ký
          </a>
          <a className="text-sm font-bold text-white px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform" href="#">
            Trở thành Mentor
          </a>
          <a className="text-sm font-bold text-white px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform" href="#">
            Liên kết với chúng tôi
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
