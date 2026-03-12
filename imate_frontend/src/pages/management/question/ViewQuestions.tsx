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
  Upload,
  ChevronDown,
  Search
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AppTabs } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type TabType = 'system' | 'contributed';

const ViewQuestions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update modal state
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Create question modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);

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
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Quản lý câu hỏi
          </h1>
          <p className="text-slate-400">
            Quản lý và cập nhật ngân hàng câu hỏi hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Download size={16} />} onClick={() => {}}>
            Export câu hỏi
          </Button>
          <Button variant="outline" icon={<Upload size={16} />} onClick={() => {}}>
            Import câu hỏi
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Thêm câu hỏi
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <AppTabs
        tabs={[
          { label: 'Câu hỏi hệ thống', value: 'system' },
          { label: 'Câu hỏi đóng góp', value: 'contributed' },
        ]}
        value={activeTab}
        onChange={(value) => {
          setActiveTab(value as TabType);
          setSystemFilters((prev) => ({ ...prev, pageNumber: 1 }));
          setContributedFilters((prev) => ({ ...prev, pageNumber: 1 }));
        }}
      />

      {/* Toolbar with Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-xl font-semibold text-white">Danh sách câu hỏi</h2>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
          {/* Position Filter */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 whitespace-nowrap">Vị trí:</span>
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
              className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="">Tất cả</option>
              {positions.map(pos => (
                <option key={pos.id} value={pos.id}>{pos.name}</option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 whitespace-nowrap">Kỹ năng:</span>
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
              className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="">Tất cả</option>
              {skills.map(skill => (
                <option key={skill.id} value={skill.id}>{skill.name}</option>
              ))}
            </select>
          </div>

          {/* Level/Difficulty Filter */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 whitespace-nowrap">Cấp độ:</span>
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
              className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
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
          <span className="whitespace-nowrap">Sắp xếp theo:</span>
          <div className="relative inline-block">
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
              className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 pr-10 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[200px]"
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Đang tải...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : (
        <Table
          page={activeTab === 'system' ? systemPagination.pageNumber : contributedPagination.pageNumber}
          totalPages={activeTab === 'system' ? systemPagination.totalPages : contributedPagination.totalPages}
          pageSize={activeTab === 'system' ? systemPagination.pageSize : contributedPagination.pageSize}
          totalCount={activeTab === 'system' ? systemPagination.totalCount : contributedPagination.totalCount}
          onPageChange={(page) => {
            if (activeTab === 'system') {
              handleSystemFilterChange('pageNumber', page);
            } else {
              handleContributedFilterChange('pageNumber', page);
            }
          }}
          onPageSizeChange={handlePageSizeChange}
          maxHeight="55vh"
        >
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Câu hỏi</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Kỹ năng</TableHead>
                <TableHead>Cấp độ</TableHead>
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
                    <TableCell colSpan={7} className="px-8 py-12 text-center">
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
                        <TableCell>
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
                          <div className="flex gap-2 justify-end">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  className="p-2 h-8 w-8"
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
                        <TableCell className="px-6 py-6">
                          <StatusBadge status={question.isActive ? "active" : "inactive"}>
                            {question.isActive ? "Hoạt động" : "Vô hiệu"}
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
                                <Button size="sm" variant="secondary" className="p-2 h-8 w-8">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Sửa</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="danger" className="p-2 h-8 w-8 text-red-400 hover:text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                </Button>7
                              </TooltipTrigger>
                              <TooltipContent>Xóa</TooltipContent>
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
                )}
            </TableBody>
          </Table>
      )}

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
          if (activeTab === 'system') {
            fetchSystemQuestions();
          }
        }}
      />
    </div>
  );
};

export default ViewQuestions;
