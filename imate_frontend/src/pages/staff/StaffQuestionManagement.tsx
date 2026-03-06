import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllSystemQuestionsForStaff,
  getAllContributedQuestionsForStaff,
  getListQuestionCategories
} from '@/services/questionService';
import UpdateSystemQuestionModal from '@/components/staff/UpdateSystemQuestionModal';
import type {
  StaffSystemQuestionItem,
  StaffContributedQuestionItem,
  GetSystemQuestionParams,
  GetContributedQuestionParams,
  DifficultyLevel,
  Level,
  CategoryItem,
  PositionItem,
  SkillItem
} from '@/types/common/question';
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

type TabType = 'system' | 'contributed';

const StaffQuestionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update modal state
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // System Questions State
  const [systemQuestions, setSystemQuestions] = useState<StaffSystemQuestionItem[]>([]);
  const [systemPagination, setSystemPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0
  });

  // Contributed Questions State
  const [contributedQuestions, setContributedQuestions] = useState<StaffContributedQuestionItem[]>([]);
  const [contributedPagination, setContributedPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0
  });

  // Filter State for System Questions
  const [systemFilters, setSystemFilters] = useState<GetSystemQuestionParams>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Filter State for Contributed Questions
  const [contributedFilters, setContributedFilters] = useState<GetContributedQuestionParams>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Dropdown options (mock data - replace with API calls)
  const [positions] = useState<PositionItem[]>([
    { id: 1, name: 'Frontend Developer' },
    { id: 2, name: 'Backend Developer' },
    { id: 3, name: 'UI/UX Designer' }
  ]);

  const [skills] = useState<SkillItem[]>([
    { id: 1, name: 'ReactJS' },
    { id: 2, name: 'NodeJS' },
    { id: 3, name: 'Python' },
    { id: 4, name: 'JavaScript' },
    { id: 5, name: 'TypeScript' }
  ]);

  const [_categories, setCategories] = useState<CategoryItem[]>([]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'system') {
      fetchSystemQuestions();
    } else {
      fetchContributedQuestions();
    }
  }, [activeTab, systemFilters, contributedFilters]);

  const fetchCategories = async () => {
    try {
      const result = await getListQuestionCategories();
      setCategories(result);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSystemQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllSystemQuestionsForStaff(systemFilters);
      setSystemQuestions(result.data);
      setSystemPagination({
        totalCount: result.totalCount,
        pageNumber: result.pageNumber,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      });
    } catch (error) {
      console.error('Failed to fetch system questions:', error);
      setError('Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContributedQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllContributedQuestionsForStaff(contributedFilters);
      setContributedQuestions(result.data);
      setContributedPagination({
        totalCount: result.totalCount,
        pageNumber: result.pageNumber,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      });
    } catch (error) {
      console.error('Failed to fetch contributed questions:', error);
      setError('Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemFilterChange = (key: keyof GetSystemQuestionParams, value: any) => {
    setSystemFilters(prev => ({
      ...prev,
      [key]: value,
      pageNumber: key !== 'pageNumber' ? 1 : prev.pageNumber // Reset to page 1 when changing filters
    }));
  };

  const handleContributedFilterChange = (key: keyof GetContributedQuestionParams, value: any) => {
    setContributedFilters(prev => ({
      ...prev,
      [key]: value,
      pageNumber: key !== 'pageNumber' ? 1 : prev.pageNumber
    }));
  };

  const handlePageChange = (pageNumber: number) => {
    if (activeTab === 'system') {
      handleSystemFilterChange('pageNumber', pageNumber);
    } else {
      handleContributedFilterChange('pageNumber', pageNumber);
    }
  };

  const handleEditQuestion = (questionId: number) => {
    setSelectedQuestionId(questionId);
    setUpdateModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    // Refresh the question list after successful update
    if (activeTab === 'system') {
      fetchSystemQuestions();
    } else {
      fetchContributedQuestions();
    }
  };

  const renderPagination = () => {
    const pagination = activeTab === 'system' ? systemPagination : contributedPagination;
    const { pageNumber, totalPages, totalCount, pageSize } = pagination;

    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (pageNumber <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (pageNumber >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', pageNumber - 1, pageNumber, pageNumber + 1, '...', totalPages);
      }
    }

    const startItem = (pageNumber - 1) * pageSize + 1;
    const endItem = Math.min(pageNumber * pageSize, totalCount);

    return (
      <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-slate-500 text-sm">
          Hiển thị <span className="text-white font-bold">{startItem}-{endItem}</span> trên{' '}
          <span className="text-white font-bold">{totalCount.toLocaleString()}</span> câu hỏi
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#1e293b]/40 border border-white/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {pages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="text-slate-600 px-2 font-bold">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page as number)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${pageNumber === page
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-[#1e293b]/40 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber === totalPages}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#1e293b]/40 border border-white/5"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const getLevelBadgeClass = (level: string) => {
    const levelLower = level.toLowerCase();
    switch (levelLower) {
      case 'junior':
      case 'fresher':
      case 'intern':
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'middle':
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'senior':
      case 'hard':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getPositionBadgeClass = (position: string) => {
    if (position?.toLowerCase().includes('frontend') || position?.toLowerCase().includes('front-end')) {
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    } else if (position?.toLowerCase().includes('backend') || position?.toLowerCase().includes('back-end')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (position?.toLowerCase().includes('design') || position?.toLowerCase().includes('ui')) {
      return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    }
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  };

  return (
    <div className="font-sans bg-[#020617] min-h-screen">
      {/* Main Content */}
      <main className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <header className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
              </span>
              STAFF PANEL
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Quản lý câu hỏi
                </h1>
                <p className="text-slate-400 max-w-2xl">
                  Quản lý và cập nhật ngân hàng câu hỏi hệ thống.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                  <Download className="w-4 h-4" />
                  Export câu hỏi
                </button>
                <button className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                  <Upload className="w-4 h-4" />
                  Import câu hỏi
                </button>
                <button
                  onClick={() => navigate('/staff/add-system-question')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all text-white"
                >
                  <Plus className="w-4 h-4" />
                  Thêm câu hỏi
                </button>
              </div>
            </div>
          </header>

          {/* Filter & Tab Section */}
          <section className="space-y-6 mb-8">
            {/* Tabs */}
            <div className="flex border-b border-white/10 gap-8">
              <button
                onClick={() => setActiveTab('system')}
                className={`pb-4 font-bold text-xs uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'system'
                  ? 'text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-white'
                  }`}
              >
                Câu hỏi hệ thống
              </button>
              <button
                onClick={() => setActiveTab('contributed')}
                className={`pb-4 font-bold text-xs uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'contributed'
                  ? 'text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-white'
                  }`}
              >
                Câu hỏi đóng góp
              </button>
            </div>

            {/* Filters Row */}
            <div className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Position Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Vị trí</label>
                  <select
                    value={activeTab === 'system' ? systemFilters.positionId || '' : contributedFilters.positionId || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      if (activeTab === 'system') {
                        handleSystemFilterChange('positionId', value);
                      } else {
                        handleContributedFilterChange('positionId', value);
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none transition-all"
                  >
                    <option value="">Tất cả</option>
                    {positions.map(pos => (
                      <option key={pos.id} value={pos.id}>{pos.name}</option>
                    ))}
                  </select>
                </div>

                {/* Skill Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Kỹ năng</label>
                  <select
                    value={activeTab === 'system' ? systemFilters.skillId || '' : contributedFilters.skillId || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      if (activeTab === 'system') {
                        handleSystemFilterChange('skillId', value);
                      } else {
                        handleContributedFilterChange('skillId', value);
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none transition-all"
                  >
                    <option value="">Tất cả kỹ năng</option>
                    {skills.map(skill => (
                      <option key={skill.id} value={skill.id}>{skill.name}</option>
                    ))}
                  </select>
                </div>

                {/* Level/Difficulty Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Cấp độ</label>
                  <select
                    value={
                      activeTab === 'system'
                        ? systemFilters.difficulty || ''
                        : contributedFilters.level || ''
                    }
                    onChange={(e) => {
                      const value = e.target.value || undefined;
                      if (activeTab === 'system') {
                        handleSystemFilterChange('difficulty', value as DifficultyLevel);
                      } else {
                        handleContributedFilterChange('level', value as Level);
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none transition-all"
                  >
                    <option value="">Tất cả</option>
                    {activeTab === 'system' ? (
                      <>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </>
                    ) : (
                      <>
                        <option value="Intern">Intern</option>
                        <option value="Fresher">Fresher</option>
                        <option value="Junior">Junior</option>
                        <option value="Middle">Middle</option>
                        <option value="Senior">Senior</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Sắp xếp</label>
                  <select
                    value={activeTab === 'system' ? systemFilters.sortOrder || 'desc' : contributedFilters.sortOrder || 'desc'}
                    onChange={(e) => {
                      const value = e.target.value as 'asc' | 'desc';
                      if (activeTab === 'system') {
                        handleSystemFilterChange('sortOrder', value);
                      } else {
                        handleContributedFilterChange('sortOrder', value);
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none transition-all"
                  >
                    <option value="desc">Mới nhất</option>
                    <option value="asc">Cũ nhất</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Data Table Section */}
          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full text-left border-collapse bg-[#1e293b]/40 backdrop-blur-sm">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-white/10">
                  <th className="px-8 py-5">STT</th>
                  <th className="px-8 py-5">Câu hỏi</th>
                  <th className="px-6 py-5">Vị trí</th>
                  <th className="px-6 py-5">Kỹ năng</th>
                  <th className="px-6 py-5">Cấp độ</th>
                  <th className="px-8 py-5 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  // Loading skeleton
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-8 py-6">
                          <div className="h-4 bg-slate-700 rounded w-8"></div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-800 rounded w-32"></div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-6 bg-slate-700 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-4 bg-slate-700 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-6 bg-slate-700 rounded w-16"></div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <div className="h-8 w-8 bg-slate-700 rounded-lg"></div>
                            <div className="h-8 w-8 bg-slate-700 rounded-lg"></div>
                            <div className="h-8 w-8 bg-slate-700 rounded-lg"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : error ? (
                  // Error state
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center">
                      <p className="text-red-400 mb-4">{error}</p>
                      <button
                        onClick={() => {
                          if (activeTab === 'system') {
                            fetchSystemQuestions();
                          } else {
                            fetchContributedQuestions();
                          }
                        }}
                        className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all font-medium"
                      >
                        Thử lại
                      </button>
                    </td>
                  </tr>
                ) : activeTab === 'system' ? (
                  systemQuestions.length > 0 ? (
                    systemQuestions.map((question, index) => (
                      <tr key={question.id} className="group hover:bg-white/5 transition-all">
                        <td className="px-8 py-6 text-sm text-slate-400">
                          {String((systemPagination.pageNumber - 1) * systemPagination.pageSize + index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors cursor-pointer">
                            {question.content}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getPositionBadgeClass(question.positionName || '')}`}>
                            {question.positionName || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-sm text-slate-400">
                          {question.skillName || 'N/A'}
                        </td>
                        <td className="px-6 py-6">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getLevelBadgeClass(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-500 transition-all"
                              title="Xem"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditQuestion(question.id)}
                              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-500 transition-all"
                              title="Sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                        Không có câu hỏi nào
                      </td>
                    </tr>
                  )
                ) : (
                  contributedQuestions.length > 0 ? (
                    contributedQuestions.map((question, index) => (
                      <tr key={question.id} className="group hover:bg-white/5 transition-all">
                        <td className="px-8 py-6 text-sm text-slate-400">
                          {String((contributedPagination.pageNumber - 1) * contributedPagination.pageSize + index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors cursor-pointer">
                            {question.content}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getPositionBadgeClass(question.positionName || '')}`}>
                            {question.positionName || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-sm text-slate-400">
                          {question.skillName || 'N/A'}
                        </td>
                        <td className="px-6 py-6">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getLevelBadgeClass(question.level)}`}>
                            {question.level}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-500 transition-all"
                              title="Xem"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-500 transition-all"
                              title="Sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                        Không có câu hỏi nào
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {((activeTab === 'system' && systemQuestions.length > 0) ||
            (activeTab === 'contributed' && contributedQuestions.length > 0)) &&
            renderPagination()}
        </div>
      </main>

      {/* Update Question Modal */}
      {selectedQuestionId && (
        <UpdateSystemQuestionModal
          questionId={selectedQuestionId}
          isOpen={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setSelectedQuestionId(null);
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default StaffQuestionManagement;
