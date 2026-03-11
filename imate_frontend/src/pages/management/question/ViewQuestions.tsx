import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllSystemQuestionsForStaff,
  getAllContributedQuestionsForStaff,
  getListQuestionCategories
} from '@/services/questionService';
import { getListPosition } from '@/services/positionService';
import { getAllSkill } from '@/services/skillService';
import { DIFFICULTY_OPTIONS } from '@/constants/enum';
import UpdateSystemQuestionModal from '@/dialog/question/UpdateSystemQuestionModal';
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
import {DIFFICULTY_MAP } from '@/constants/common';
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type TabType = 'system' | 'contributed';

const ViewQuestions: React.FC = () => {
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

  // Dropdown options from API
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [_categories, setCategories] = useState<CategoryItem[]>([]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchCategories();
    fetchPositions();
    fetchSkills();
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

  const fetchPositions = async () => {
    try {
      const result = await getListPosition(1, null, true, '', 'name', 'asc');
      if (result && result.items) {
        setPositions(result.items.map(item => ({ id: item.id, name: item.name })));
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  };

  const fetchSkills = async () => {
    try {
      const result = await getAllSkill(1, null, true, '', 'name', 'asc');
      if (result && result.items) {
        setSkills(result.items.map(item => ({ id: item.id, name: item.name })));
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  };

  const fetchSystemQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllSystemQuestionsForStaff(systemFilters);
      setSystemQuestions(result.items || []);
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
      console.log('Fetched contributed questions:', result);
      setContributedQuestions(result.items || []);
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

  const handlePageSizeChange = (pageSize: number) => {
    if (activeTab === 'system') {
      handleSystemFilterChange('pageSize', pageSize);
      handleSystemFilterChange('pageNumber', 1);
    } else {
      handleContributedFilterChange('pageSize', pageSize);
      handleContributedFilterChange('pageNumber', 1);
    }
  };

  const handleEditQuestion = (questionId: number) => {
    console.log('handleEditQuestion called with ID:', questionId);
    setSelectedQuestionId(questionId);
    setUpdateModalOpen(true);
    console.log('Modal should open now');
  };

  const handleUpdateSuccess = () => {
    // Refresh the question list after successful update
    if (activeTab === 'system') {
      fetchSystemQuestions();
    } else {
      fetchContributedQuestions();
    }
  };

  const getDifficultyStatus = (difficulty: string): "active" | "pending" | "error" | "inactive" | "draft" => {
    const diffLower = difficulty.toLowerCase();
    if (diffLower === 'easy' || diffLower === 'intern' || diffLower === 'fresher') return 'active';
    if (diffLower === 'medium' || diffLower === 'junior' || diffLower === 'middle') return 'pending';
    if (diffLower === 'hard' || diffLower === 'senior') return 'error';
    return 'inactive';
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
                  onClick={() => navigate('/management/add-question')}
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
                        handleSystemFilterChange('difficulty', value as DifficultyLevel | undefined);
                      } else {
                        handleContributedFilterChange('level', value as Level);
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none transition-all"
                  >
                    <option value="">Tất cả</option>
                    {activeTab === 'system' ? (
                      DIFFICULTY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))
                    ) : null}
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
          <Table
            page={activeTab === 'system' ? systemPagination.pageNumber : contributedPagination.pageNumber}
            totalPages={activeTab === 'system' ? systemPagination.totalPages : contributedPagination.totalPages}
            pageSize={activeTab === 'system' ? systemPagination.pageSize : contributedPagination.pageSize}
            totalItems={activeTab === 'system' ? systemPagination.totalCount : contributedPagination.totalCount}
            onPageChange={(page) => {
              if (activeTab === 'system') {
                handleSystemFilterChange('pageNumber', page);
              } else {
                handleContributedFilterChange('pageNumber', page);
              }
            }}
            onPageSizeChange={handlePageSizeChange}
          >
            <TableHeader>
              <TableRow>
                <TableHead className="px-8 py-5">STT</TableHead>
                <TableHead className="px-8 py-5">Câu hỏi</TableHead>
                <TableHead className="px-6 py-5">Vị trí</TableHead>
                <TableHead className="px-6 py-5">Kỹ năng</TableHead>
                <TableHead className="px-6 py-5">Cấp độ</TableHead>
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
                          <div className="h-4 bg-slate-700 rounded w-24"></div>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <div className="h-6 bg-slate-700 rounded w-16"></div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <div className="h-8 w-8 bg-slate-700 rounded-lg"></div>
                            <div className="h-8 w-8 bg-slate-700 rounded-lg"></div>
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
                    </TableCell>
                  </TableRow>
                ) : activeTab === 'system' ? (
                  systemQuestions.length > 0 ? (
                    systemQuestions.map((question, index) => (
                      <TableRow key={question.id} className="group hover:bg-white/5 transition-all">
                        <TableCell className="px-8 py-6 text-sm text-slate-400">
                          {String((systemPagination.pageNumber - 1) * systemPagination.pageSize + index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors cursor-pointer">
                            {question.content}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <StatusBadge status="inactive">
                            {question.positionsName || 'N/A'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="px-6 py-6 text-sm text-slate-400">
                          {question.skillsName || 'N/A'}
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <StatusBadge status={getDifficultyStatus(DIFFICULTY_MAP[question.difficulty as 0 | 1 | 2] || 'Easy')}>
                            {DIFFICULTY_MAP[question.difficulty as 0 | 1 | 2] || 'N/A'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" className="p-2 h-8 w-8">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Xem</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="p-2 h-8 w-8"
                                  onClick={() => handleEditQuestion(question.id)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Sửa</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" className="p-2 h-8 w-8 text-red-400 hover:text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Xóa</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="px-8 py-12 text-center text-slate-400">
                        Không có câu hỏi nào
                      </TableCell>
                    </TableRow>
                  )
                ) : (
                  contributedQuestions.length > 0 ? (
                    contributedQuestions.map((question, index) => (
                      <TableRow key={question.id} className="group hover:bg-white/5 transition-all">
                        <TableCell className="px-8 py-6 text-sm text-slate-400">
                          {String((contributedPagination.pageNumber - 1) * contributedPagination.pageSize + index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors cursor-pointer">
                            {question.content}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <StatusBadge status="inactive">
                            {question.positionsName || 'N/A'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="px-6 py-6 text-sm text-slate-400">
                          {question.skillsName || 'N/A'}
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <StatusBadge status={getDifficultyStatus(question.level)}>
                            {question.level}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" className="p-2 h-8 w-8">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Xem</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" className="p-2 h-8 w-8">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Sửa</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" className="p-2 h-8 w-8 text-red-400 hover:text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Xóa</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="px-8 py-12 text-center text-slate-400">
                        Không có câu hỏi nào
                      </TableCell>
                    </TableRow>
                  )
                )}
            </TableBody>
          </Table>
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

export default ViewQuestions;
