import React, { useEffect, useState } from 'react';
import { getQuestionBankList } from '../../../services/questionService';
import type { QuestionBankListResponse, CategoryItem, GetQuestionBankListRequest } from '../../../types/common/question';
import { COMMON_CODE, COMMON_DATE } from '@/constants/common';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Eye, Plus } from 'lucide-react';
import QuestionContributedCard from '@/components/custom/QuestionContributedCard';
import { getAllCategories } from '@/services/categoryService';

type TabType = 'system' | 'contributed';

const ViewQuestionBank: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('system');
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
  }, []);

  useEffect(() => {
    // Auto-fetch when filters change
    const timer = setTimeout(() => {
      fetchQuestions();
    }, searchTerm ? 500 : 0); // 500ms debounce for search term, immediate for others

    return () => clearTimeout(timer);
  }, [pageNumber, sortBy, searchTerm, categoryId, difficulty, activeTab]);

  const fetchCategories = async () => {
    try {
      const result = await getAllCategories(1, null, true, '', 'name', 'asc');
      if (result && result.items) {
        setCategories(result.items.map(item => ({ id: item.id, name: item.name })));
      }
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

  const handleReset = () => {
    setSearchTerm('');
    setCategoryId(undefined);
    setDifficulty(undefined);
    setSortBy(COMMON_CODE.NEWEST);
    setPageNumber(1);
  };

  const getDifficultyStatus = (difficulty: string | null): "active" | "pending" | "error" | "inactive" | "draft" => {
    const diffLower = difficulty?.toLowerCase();
    if (diffLower === 'easy') return 'active';
    if (diffLower === 'medium') return 'pending';
    if (diffLower === 'hard') return 'error';
    return 'inactive';
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

  const handlePageSizeChange = (_newPageSize: number) => {
    setPageNumber(1);
    // Note: pageSize is const, you may need to update this to be stateful if you want dynamic page size
  };

  return (
    <div className="font-sans bg-[#020617] min-h-screen">

      <main className="pb-20 px-6">
        
        <div className="max-w-7xl mx-auto">
           {/* Tabs */}
          <section className="mb-8 mt-6">
            <div className="flex border-b border-white/10 gap-8">
              <button
                onClick={() => setActiveTab('system')}
                className={`pb-4 font-bold text-xs uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === 'system'
                    ? 'text-indigo-400 border-indigo-500'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Câu hỏi hệ thống
              </button>
              <button
                onClick={() => setActiveTab('contributed')}
                className={`pb-4 font-bold text-xs uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === 'contributed'
                    ? 'text-indigo-400 border-indigo-500'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Câu hỏi đóng góp
              </button>
            </div>
          </section>
          {/* Breadcrumb & Header */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
              <div>
                
                <h1 className="text-4xl pb-2 md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  {activeTab === 'system' ? 'Ngân Hàng Câu Hỏi Hệ Thống' : 'Cộng Đồng Chia Sẻ Câu Hỏi'}
                </h1>
                <p className="text-slate-400 max-w-2xl">
                  {activeTab === 'system'
                    ? 'Khám phá kho tàng kiến thức với hàng ngàn câu hỏi phỏng vấn thực tế từ các tập đoàn công nghệ hàng đầu, được chọn lọc bởi đội ngũ Mentor dày dạn kinh nghiệm.'
                    : 'Nơi các ứng viên chia sẻ trải nghiệm phỏng vấn thực tế từ các công ty.'}
                </p>
              </div>
              
              {activeTab === 'contributed' && (
                <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 self-start md:self-auto">
                  <Plus className="w-4 h-4" />
                  Thêm câu hỏi
                </button>
              )}
            </div>
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPageNumber(1);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all outline-none text-white"
                  placeholder="Tìm kiếm câu hỏi (ví dụ: Microservices, React Hooks...)"
                />
              </div>
            </div>

            <div className="w-full lg:w-48 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Lĩnh vực</label>
              <select
                value={categoryId || ''}
                onChange={(e) => {
                  setCategoryId(e.target.value ? Number(e.target.value) : undefined);
                  setPageNumber(1);
                }}
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
                onChange={(e) => {
                  setDifficulty(e.target.value || undefined);
                  setPageNumber(1);
                }}
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
                onClick={handleReset}
                className="px-6 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-all flex items-center justify-center text-slate-300"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
              </button>
            </div>
          </section>

          {/* Content Section */}
          {activeTab === 'system' ? (
            <Table
              page={pageNumber}
              totalPages={data?.totalPages || 0}
              pageSize={pageSize}
              totalItems={data?.totalCount || 0}
              onPageChange={(page) => setPageNumber(page)}
              onPageSizeChange={handlePageSizeChange}
            >
              <TableHeader>
                <TableRow>
                  <TableHead className="px-8 py-5">STT</TableHead>
                  <TableHead className="px-8 py-5">Câu hỏi</TableHead>
                  <TableHead className="px-6 py-5">Lĩnh vực</TableHead>
                  <TableHead className="px-6 py-5">Độ khó</TableHead>
                  <TableHead className="px-6 py-5">Kỹ năng</TableHead>
                  <TableHead className="px-8 py-5 text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell className="px-8 py-6">
                          <div className="h-4 bg-slate-700 rounded w-8"></div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-800 rounded w-32"></div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <div className="h-6 bg-slate-700 rounded w-20"></div>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <div className="h-6 bg-slate-700 rounded w-16"></div>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <div className="h-4 bg-slate-700 rounded w-24"></div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <div className="h-8 w-8 bg-slate-700 rounded-lg"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : error ? (
                  // Error state
                  <TableRow>
                    <TableCell colSpan={6} className="px-8 py-12 text-center">
                      <p className="text-red-400 mb-4">{error}</p>
                      <button
                        onClick={() => fetchQuestions()}
                        className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all font-medium"
                      >
                        Thử lại
                      </button>
                    </TableCell>
                  </TableRow>
                ) : data && data.questions.length > 0 ? (
                  // Question rows from API
                  data.questions.map((question, index) => (
                    <TableRow key={question.id} className="group hover:bg-white/5 transition-all">
                      <TableCell className="px-8 py-6 text-sm text-slate-400">
                        {String((pageNumber - 1) * pageSize + index + 1).padStart(2, '0')}
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold mb-1 group-hover:text-indigo-400 transition-colors cursor-pointer">
                            {question.title}
                          </span>
                          <span className="text-slate-500 text-xs">
                            Cập nhật {formatDate(question.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="flex flex-wrap gap-1">
                          {question.categories.slice(0, 2).map((category, idx) => (
                            <StatusBadge key={idx} status="inactive">
                              {category}
                            </StatusBadge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <StatusBadge status={getDifficultyStatus(question.difficulty)}>
                          {question.difficulty || 'N/A'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-sm text-slate-400">
                        {question.skills.join(', ') || 'Không có'}
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="ghost" className="p-2 h-8 w-8">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // No data
                  <TableRow>
                    <TableCell colSpan={6} className="px-8 py-12 text-center text-slate-400">
                      Không tìm thấy câu hỏi nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            // Contributed questions tab with card layout
            <div className="space-y-6">
              {/* Mock data for contributed questions - will be replaced with API */}
              <QuestionContributedCard
                id={1}
                title="Trải nghiệm phỏng vấn vị trí Senior Frontend với các câu hỏi về Module Federation"
                description="Câu hỏi chính xoay quanh việc thiết kế kiến trúc Micro-frontend sử dụng Webpack Module Federation, cách xử lý share state giữa các remote app..."
                author="Tuấn Anh"
                company="FPT Software"
                timeAgo="2 giờ trước"
                skills={['React', 'Webpack', 'Micro-frontend']}
                position="Frontend"
                level="Senior"
                rating={4}
                onView={() => console.log('View question 1')}
                onSave={() => console.log('Save question 1')}
              />
              <QuestionContributedCard
                id={2}
                title="Các câu hỏi về SQL Optimization tại VNG Corp"
                description="Làm thế nào để optimize một query chạy chậm? Giải thích về Indexing (B-Tree vs Hash), Execution Plan và cách xử lý Deadlock trong Postgres..."
                author="Minh Nhật"
                company="VNG"
                timeAgo="5 giờ trước"
                skills={['SQL', 'PostgreSQL', 'Database']}
                position="Backend"
                level="Senior"
                rating={5}
                onView={() => console.log('View question 2')}
                onSave={() => console.log('Save question 2')}
              />
              <QuestionContributedCard
                id={3}
                title="Phỏng vấn vị trí Junior Backend - Câu hỏi về REST API"
                description="Các câu hỏi xoay quanh thiết kế RESTful API, authentication với JWT, và cách handle error trong Express.js..."
                author="Hồng Anh"
                company="Viettel"
                timeAgo="1 ngày trước"
                skills={['Node.js', 'Express', 'REST API']}
                position="Backend"
                level="Junior"
                rating={4}
                onView={() => console.log('View question 3')}
                onSave={() => console.log('Save question 3')}
              />

              {/* Pagination for contributed */}
              <div className="mt-10 flex items-center justify-center gap-2">
                <button className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30" disabled>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="w-10 h-10 rounded-xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/30">1</button>
                <button className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">2</button>
                <button className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">3</button>
                <span className="text-slate-600 px-2 font-bold">...</span>
                <button className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">12</button>
                <button className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewQuestionBank;
