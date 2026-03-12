import React, { useEffect, useState } from 'react';
import {
  getAllSystemQuestionsForStaff,
  getAllContributedQuestionsForStaff,
  getListQuestionCategories
} from '@/services/questionService';
import { getListPosition } from '@/services/positionService';
import { getAllSkill } from '@/services/skillService';
import { DIFFICULTY_OPTIONS } from '@/constants/enum';
import { UpdateSystemQuestionModal } from '@/dialog/management/question/UpdateSystemQuestionModal';
import { CreateSystemQuestionDialog } from '@/dialog/management/question/CreateSystemQuestionDialog';
import { CreateContributeQuestionDialog } from '@/dialog/main/question/CreateContributeQuestionDialog';
import { ViewContributeQuestionModal } from '@/dialog/main/question/ViewContributeQuestionModal';
import type {
  StaffSystemQuestionItem,
  StaffContributedQuestionItem,
  GetSystemQuestionParams,
  GetContributedQuestionParams,
  DifficultyLevel,
  CategoryItem,
  PositionItem,
  SkillItem
} from '@/types/common/question';
import {DIFFICULTY_MAP } from '@/constants/common';
import {
  Eye,
  Pencil,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AppTabs } from '@/components/ui/tabs';

type TabType = 'system' | 'contributed';

const ViewQuestions: React.FC = () => {
  const [tab, setTab] = useState("system");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update modal state
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Create question modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Create contribute question modal state
  const [contributeModalOpen, setContributeModalOpen] = useState(false);

  // View contribute question modal state
  const [viewContributeModalOpen, setViewContributeModalOpen] = useState(false);
  const [selectedContributeQuestionId, setSelectedContributeQuestionId] = useState<number | null>(null);

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
    if (tab === 'system') {
      fetchSystemQuestions();
    } else {
      fetchContributedQuestions();
    }
  }, [tab, systemFilters, contributedFilters]);

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
    if (tab === 'system') {
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
    if (tab === 'system') {
      fetchSystemQuestions();
    } else {
      fetchContributedQuestions();
    }
  };

  const handleViewContributeQuestion = (questionId: number) => {
    setSelectedContributeQuestionId(questionId);
    setViewContributeModalOpen(true);
  };

  const getDifficultyStatus = (difficulty: string): "active" | "pending" | "error" | "inactive" | "draft" => {
    const diffLower = difficulty?.toLowerCase();
    if (diffLower === 'easy') return 'active';
    if (diffLower === 'medium') return 'pending';
    if (diffLower === 'hard') return 'error';
    return 'inactive';
  };

  const tabs = [
  { label: "Câu hỏi hệ thống", value: "system" },
  { label: "Câu hỏi đóng góp", value: "contributed" },
];

  return (
    <div>
      {/* Main Content */}
      <main>
        <div className="p-6 space-y-6 min-h-full">
          {/* Header Section */}
          <header className="mb-10">

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
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
                  onClick={() => tab === 'system' ? setCreateModalOpen(true) : setContributeModalOpen(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all text-white"
                >
                  <Plus className="w-4 h-4" />
                  Thêm câu hỏi
                </button>
              </div>
            </div>
          </header>

          <AppTabs
            tabs={tabs}
            value={tab}
            onChange={(value) => {
              setTab(value);
            }}
          />


          {/* Filter & Tab Section */}
          <section className="space-y-6 mb-8">

            {/* Filters Row */}
            <div className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Position Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Vị trí</label>
                  <select
                    value={tab === 'system' ? systemFilters.positionId || '' : contributedFilters.positionId || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      if (tab === 'system') {
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
                    value={tab === 'system' ? systemFilters.skillId || '' : contributedFilters.skillId || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      if (tab === 'system') {
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
                      tab === 'system'
                        ? (systemFilters.difficulty !== undefined ? String(systemFilters.difficulty) : '')
                        : (contributedFilters.difficulty !== undefined ? String(contributedFilters.difficulty) : '')
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value ? parseInt(value) as DifficultyLevel : undefined;
                      if (tab === 'system') {
                        handleSystemFilterChange('difficulty', numValue);
                      } else {
                        handleContributedFilterChange('difficulty', numValue);
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none transition-all"
                  >
                    <option value="">Tất cả</option>
                    {DIFFICULTY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Sắp xếp</label>
                  <select
                    value={tab === 'system' ? systemFilters.sortOrder || 'desc' : contributedFilters.sortOrder || 'desc'}
                    onChange={(e) => {
                      const value = e.target.value as 'asc' | 'desc';
                      if (tab === 'system') {
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
            page={tab === 'system' ? systemPagination.pageNumber : contributedPagination.pageNumber}
            totalPages={tab === 'system' ? systemPagination.totalPages : contributedPagination.totalPages}
            pageSize={tab === 'system' ? systemPagination.pageSize : contributedPagination.pageSize}
            totalCount={tab === 'system' ? systemPagination.totalCount : contributedPagination.totalCount}
            onPageChange={(page) => {
              if (tab === 'system') {
                handleSystemFilterChange('pageNumber', page);
              } else {
                handleContributedFilterChange('pageNumber', page);
              }
            }}
            onPageSizeChange={handlePageSizeChange}
          >
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Câu hỏi</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Kỹ năng</TableHead>
                <TableHead>Cấp độ</TableHead>
                {tab === 'contributed' && (
                  <TableHead>Người đăng</TableHead>
                )}
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[140px] text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                  // Loading skeleton
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell>
                          <div className="h-4 bg-slate-700 rounded w-8"></div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-800 rounded w-32"></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="h-6 bg-slate-700 rounded w-20"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-slate-700 rounded w-24"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-6 bg-slate-700 rounded w-16"></div>
                        </TableCell>
                        {tab === 'contributed' && (
                          <TableCell>
                            <div className="h-4 bg-slate-700 rounded w-24"></div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="h-6 bg-slate-700 rounded w-20"></div>
                        </TableCell>
                        <TableCell>
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
                    <TableCell colSpan={tab === 'contributed' ? 8 : 7} className="px-8 py-12 text-center">
                      <p className="text-red-400 mb-4">{error}</p>
                      <button
                        onClick={() => {
                          if (tab === 'system') {
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
                ) : tab === 'system' ? (
                  systemQuestions.length > 0 ? (
                    systemQuestions.map((question, index) => (
                      <TableRow key={question.id} className="group hover:bg-white/5 transition-all">
                        <TableCell className="text-sm text-slate-400">
                          {String((systemPagination.pageNumber - 1) * systemPagination.pageSize + index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell>
                          <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors cursor-pointer">
                            {question.content}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status="inactive">
                            {question.positionsName || 'N/A'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          {question.skillsName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={getDifficultyStatus(DIFFICULTY_MAP[question.difficulty as 0 | 1 | 2] || 'Easy')}>
                            {DIFFICULTY_MAP[question.difficulty as 0 | 1 | 2] || 'N/A'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={question.isActive ? "active" : "inactive"}>
                            {question.isActive ? "Hoạt động" : "Vô hiệu"}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <div className="text-right">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  onClick={() => handleEditQuestion(question.id)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Sửa</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="px-8 py-12 text-center text-slate-400">
                        Không có câu hỏi nào
                      </TableCell>
                    </TableRow>
                  )
                ) : (
                  contributedQuestions.length > 0 ? (
                    contributedQuestions.map((question, index) => (
                      <TableRow key={question.id} className="group hover:bg-white/5 transition-all">
                        <TableCell>
                          {String((contributedPagination.pageNumber - 1) * contributedPagination.pageSize + index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell>
                          <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors cursor-pointer">
                            {question.content}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status="inactive">
                            {question.positionsName?.length > 0 ? question.positionsName.join(', ') : 'N/A'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          {question.skillsName?.length > 0 ? question.skillsName.join(', ') : 'N/A'}
                        </TableCell>
                        <TableCell >
                          <StatusBadge status={getDifficultyStatus(question.difficulty !== null ? DIFFICULTY_MAP[question.difficulty] : 'N/A')}>
                            {question.difficulty !== null ? DIFFICULTY_MAP[question.difficulty] : 'N/A'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          {question.creatorName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={question.isActive ? "active" : "inactive"}>
                            {question.isActive ? "Hoạt động" : "Vô hiệu"}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="w-[140px] text-right">
                          <div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  className="p-2 h-8 w-8"
                                  onClick={() => handleViewContributeQuestion(question.id)}
                                >
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
                    <TableRow>
                      <TableCell colSpan={8} className="px-8 py-12 text-center text-slate-400">
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
          open={updateModalOpen}
          onOpenChange={(open: boolean) => {
            setUpdateModalOpen(open);
            if (!open) {
              setSelectedQuestionId(null);
            }
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Create Question Modal */}
      <CreateSystemQuestionDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          if (tab === 'system') {
            fetchSystemQuestions();
          }
        }}
      />

      {/* Contribute Question Modal */}
      <CreateContributeQuestionDialog
        open={contributeModalOpen}
        onOpenChange={setContributeModalOpen}
        onSuccess={() => {
          if (tab === 'contributed') {
            fetchContributedQuestions();
          }
        }}
      />

      {/* View Contribute Question Modal */}
      {selectedContributeQuestionId && (
        <ViewContributeQuestionModal
          questionId={selectedContributeQuestionId}
          open={viewContributeModalOpen}
          onOpenChange={(open: boolean) => {
            setViewContributeModalOpen(open);
            if (!open) {
              setSelectedContributeQuestionId(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default ViewQuestions;