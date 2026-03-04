import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '@/components/Footer';
import { getQuestionBankList, getListQuestionCategories } from '../../services/questionService';
import type { QuestionBankListResponse, CategoryItem, GetQuestionBankListRequest } from '../../types/common/question';
import { COMMON_CODE, COMMON_COLOR, COMMON_DATE } from '@/constants/common';

const SystemQuestionBank: React.FC = () => {
  const [data, setData] = useState<QuestionBankListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>(COMMON_CODE.NEWEST);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, [pageNumber, sortBy]);

  const fetchCategories = async () => {
    try {
      const result = await getListQuestionCategories();
      setCategories(result);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchQuestions = async (overrideParams?: Partial<GetQuestionBankListRequest>) => {
    try {
      setLoading(true);
      const params = overrideParams || {
        searchTerm: searchTerm || undefined,
        categoryId,
        difficulty,
        sortBy,
        pageNumber,
        pageSize,
      };
      const result = await getQuestionBankList(params);
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      setError('Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPageNumber(1);
    fetchQuestions();
  };

  const handleReset = () => {
    setSearchTerm('');
    setCategoryId(undefined);
    setDifficulty(undefined);
    setSortBy(COMMON_CODE.NEWEST);
    setPageNumber(1);
    // Gọi API ngay với giá trị mặc định thay vì đợi state update
    fetchQuestions({
      searchTerm: undefined,
      categoryId: undefined,
      difficulty: undefined,
      sortBy: COMMON_CODE.NEWEST,
      pageNumber: 1,
      pageSize,
    });
  };

  const getDifficultyColor = (diff: string | null) => {
    switch (diff) {
      case COMMON_CODE.EASY:
        return COMMON_COLOR.EASY_QUESTION;
      case COMMON_CODE.MEDIUM:
        return COMMON_COLOR.MEDIUM_QUESTION;
      case COMMON_CODE.HARD:
        return COMMON_COLOR.HARD_QUESTION;
      default:
        return COMMON_COLOR.DEFAULT_QUESTION;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return COMMON_DATE.JUST_NOW;
    if (diffHours < 24) return `${diffHours} ${COMMON_DATE.HOURS_AGO}`;
    if (diffDays === 1) return COMMON_DATE.ONE_DAY_AGO;
    if (diffDays < 7) return `${diffDays} ${COMMON_DATE.DAYS_AGO}`;
    return date.toLocaleDateString('vi-VN');
  };

  const renderPagination = () => {
    if (!data) return null;

    const { totalPages, pageNumber: currentPage } = data;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages.map((page, idx) => {
      if (page === '...') {
        return (
          <span key={`ellipsis-${idx}`} className="text-slate-600 px-2 font-bold">
            ...
          </span>
        );
      }

      return (
        <button
          key={page}
          onClick={() => setPageNumber(page as number)}
          className={`w-10 h-10 rounded-xl font-bold transition-all ${
            currentPage === page
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-[#1e293b]/40 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="font-sans bg-[#020617] min-h-screen">
      <Header />

      <main className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb & Header */}
          <div className="mb-10">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
              <a className="hover:text-indigo-500 transition-colors" href="#">
                Trang chủ
              </a>
              <span className="material-symbols-outlined text-sm opacity-50">chevron_right</span>
              <span className="text-slate-400">Ngân hàng câu hỏi hệ thống</span>
            </nav>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
              </span>
              SYSTEM QUESTION BANK
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Ngân Hàng Câu Hỏi Hệ Thống
            </h1>
            <p className="text-slate-400 max-w-2xl">
              Khám phá kho tàng kiến thức với hàng ngàn câu hỏi phỏng vấn thực tế từ các tập đoàn công nghệ hàng đầu, được chọn lọc bởi đội ngũ Mentor dày dạn kinh nghiệm.
            </p>
          </div>

          {/* Filter Section */}
          <section className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 mb-8 flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tìm kiếm</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all outline-none text-white"
                  placeholder="Tìm kiếm câu hỏi (ví dụ: Microservices, React Hooks...)"
                />
              </div>
            </div>

            <div className="w-full lg:w-48 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Lĩnh vực</label>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
              >
                <option value="">Tất cả</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-48 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Độ khó</label>
              <select
                value={difficulty || ''}
                onChange={(e) => setDifficulty(e.target.value || undefined)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
              >
                <option value="">Mọi cấp độ</option>
                <option value={COMMON_CODE.EASY}>{COMMON_CODE.EASY}</option>
                <option value={COMMON_CODE.MEDIUM}>{COMMON_CODE.MEDIUM}</option>
                <option value={COMMON_CODE.HARD}>{COMMON_CODE.HARD}</option>
              </select>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 flex-1 lg:flex-none shadow-lg shadow-indigo-500/20"
              >
                Tìm kiếm
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-all flex items-center justify-center text-slate-300"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
              </button>
            </div>
          </section>

          {/* Table Section */}
          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full text-left border-collapse bg-[#1e293b]/40 backdrop-blur-sm">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-white/10">
                  <th className="px-8 py-5">Tên câu hỏi</th>
                  <th className="px-6 py-5">Lĩnh vực</th>
                  <th className="px-6 py-5">Độ khó</th>
                  <th className="px-6 py-5">Gợi ý</th>
                  <th className="px-8 py-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  // Loading skeleton
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-8 py-6">
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-800 rounded w-20"></div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-6 bg-slate-700 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-6 bg-slate-700 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-4 bg-slate-700 rounded w-32"></div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="h-8 w-8 bg-slate-700 rounded-lg ml-auto"></div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : error ? (
                  // Error state
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center">
                      <p className="text-red-400 mb-4">{error}</p>
                      <button
                        onClick={() => fetchQuestions()}
                        className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all"
                      >
                        Thử lại
                      </button>
                    </td>
                  </tr>
                ) : data && data.questions.length > 0 ? (
                  // Question rows from API
                  data.questions.map((question) => (
                    <tr key={question.id} className="group hover:bg-white/5 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold mb-1 group-hover:text-indigo-400 transition-colors cursor-pointer">
                            {question.title}
                          </span>
                          <span className="text-slate-500 text-xs">
                            Cập nhật {formatDate(question.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-wrap gap-1">
                          {question.categories.slice(0, 2).map((category, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-slate-400 text-sm line-clamp-1 max-w-[200px]">
                          {question.skills.join(', ') || 'Không có gợi ý'}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-500 transition-all">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  // No data
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                      Không tìm thấy câu hỏi nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalCount > 0 && (
            <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-slate-500 text-sm">
                Hiển thị <span className="text-white font-bold">{data.questions.length}</span> trên{' '}
                <span className="text-white font-bold">{data.totalCount.toLocaleString()}</span> câu hỏi
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                  disabled={pageNumber === 1}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#1e293b]/40 border border-white/5"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {renderPagination()}
                <button
                  onClick={() => setPageNumber((prev) => Math.min(data.totalPages, prev + 1))}
                  disabled={pageNumber === data.totalPages}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#1e293b]/40 border border-white/5"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SystemQuestionBank;
