import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  getPublicContributedQuestionBankList,
  getQuestionBankList,
  getSavedContributedQuestions,
  getSavedSystemQuestions,
  saveQuestion,
} from '../../../services/questionService';
import type {
  CategoryItem,
  CompanyItem,
  GetPublicContributedQuestionBankListRequest,
  GetQuestionBankListRequest,
  PositionItem,
  PublicContributedQuestionBankItem,
  PublicContributedQuestionBankListResponse,
  PublicSystemQuestionBankItem,
  QuestionBankListResponse,
  SavedContributedQuestionItem,
  SavedSystemQuestionItem,
  SkillItem,
} from '../../../types/common/question';
import { COMMON_DATE, DIFFICULTY_LEVEL, LEVEL_MAP } from '@/constants/common';
import { getAllCategories, getAllCompanies, getAllPositions, getAllSkills } from '@/services/commonService';
import QuestionContributedCard from '@/components/custom/QuestionContributedCard';
import { CreateContributeQuestionDialog } from '@/dialog/main/question/CreateContributeQuestionDialog';
import { ViewSystemQuestionModal } from '@/dialog/main/question/ViewSystemQuestionModal';
import { ViewContributeQuestionModal } from '@/dialog/main/question/ViewContributeQuestionModal';
import { toast } from 'react-toastify';

type TabType = 'system' | 'contributed' | 'saved';
type SavedTabType = 'system' | 'contributed';

const ViewQuestionBank: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [data, setData] = useState<QuestionBankListResponse | null>(null);
  const [contributedData, setContributedData] = useState<PublicContributedQuestionBankListResponse | null>(null);
  const [savedSystemData, setSavedSystemData] = useState<SavedSystemQuestionItem[]>([]);
  const [savedContributedData, setSavedContributedData] = useState<SavedContributedQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewModalId, setViewModalId] = useState<number>(0);
  const [viewModalType, setViewModalType] = useState<'system' | 'contributed'>('system');
  const [savedTab, setSavedTab] = useState<SavedTabType>('system');

  // Saved overrides (optimistic toggle on top of API-returned isSaved)
  const [savedOverrides, setSavedOverrides] = useState<Map<string, boolean>>(new Map());
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [skillId, setSkillId] = useState<number | undefined>(undefined);
  const [positionId, setPositionId] = useState<number | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [companyId, setCompanyId] = useState<number | undefined>(undefined);
  const [companyName, setCompanyName] = useState<string>('');
  const [level, setLevel] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchLookupData();
  }, []);

  useEffect(() => {
    if (activeTab === 'saved') {
      return undefined;
    }

    // Auto-fetch when filters change
    const timer = setTimeout(() => {
      if (activeTab === 'system') {
        fetchQuestions();
      } else {
        fetchContributedQuestions();
      }
    }, searchTerm ? 500 : 0); // 500ms debounce for search term, immediate for others

    return () => clearTimeout(timer);
  }, [
    activeTab,
    pageNumber,
    searchTerm,
    skillId,
    positionId,
    categoryId,
    companyId,
    companyName,
    level,
    difficulty,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedQuestions();
    }
  }, [activeTab]);

  const fetchLookupData = async () => {
    try {
      const [categoryResult, positionResult, skillResult] = await Promise.all([
        getAllCategories({ pageNumber: 1, pageSize: 10, isActive: true, sortBy: 'name', sortOrder: 'asc' }),
        getAllPositions({ pageNumber: 1, pageSize: 10, isActive: true, sortBy: 'name', sortOrder: 'asc' }),
        getAllSkills({ pageNumber: 1, pageSize: 10, isActive: true, sortBy: 'name', sortOrder: 'asc' }),
      ]);

      const companiesResult = await getAllCompanies({ pageNumber: 1, pageSize: 10, sortBy: 'name', sortOrder: 'asc' });

      setCategories(categoryResult.data || []);
      setPositions(positionResult.data || []);
      setSkills(skillResult.data || []);
      setCompanies(companiesResult.data || []);
    } catch (err) {
      console.error('Failed to fetch lookup data:', err);
    }
  };

  const fetchQuestions = async (overrideParams?: Partial<GetQuestionBankListRequest>) => {
    try {
      setLoading(true);
      const params = overrideParams || {
        searchTerm: searchTerm || undefined,
        skillId,
        positionId,
        categoryId,
        difficulty,
        sortBy,
        sortOrder,
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

  const fetchContributedQuestions = async (overrideParams?: Partial<GetPublicContributedQuestionBankListRequest>) => {
    try {
      setLoading(true);
      const params = overrideParams || {
        searchTerm: searchTerm || undefined,
        skillId,
        positionId,
        categoryId,
        companyId,
        companyName: companyName || undefined,
        level,
        difficulty,
        sortBy,
        sortOrder,
        pageNumber,
        pageSize,
      };
      const result = await getPublicContributedQuestionBankList(params);
      setContributedData(result);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch contributed questions:', err);
      setError('Không thể tải danh sách câu hỏi đóng góp. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedQuestions = async () => {
    try {
      setLoading(true);
      const [savedSystemResult, savedContributedResult] = await Promise.all([
        getSavedSystemQuestions(),
        getSavedContributedQuestions(),
      ]);
      setSavedSystemData(savedSystemResult);
      setSavedContributedData(savedContributedResult);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch saved questions:', err);
      setError('Không thể tải danh sách câu hỏi đã lưu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSkillId(undefined);
    setPositionId(undefined);
    setCategoryId(undefined);
    setCompanyId(undefined);
    setCompanyName('');
    setLevel(undefined);
    setDifficulty(undefined);
    setSortBy('createdAt');
    setSortOrder('desc');
    setPageNumber(1);
  };

  const getQuestionKey = (type: 'system' | 'contributed', id: number) => `${type}-${id}`;

  const isSavedFor = (type: 'system' | 'contributed', id: number, defaultValue: boolean): boolean => {
    const questionKey = getQuestionKey(type, id);
    return savedOverrides.has(questionKey) ? savedOverrides.get(questionKey)! : defaultValue;
  };

  const handleSave = async (type: 'system' | 'contributed', id: number, currentSaved: boolean) => {
    const newSaved = !currentSaved;
    const questionKey = getQuestionKey(type, id);
    setSavedOverrides(prev => new Map(prev).set(questionKey, newSaved));

    if (currentSaved) {
      if (type === 'system') {
        setSavedSystemData(prev => prev.filter((item) => item.id !== id));
      } else {
        setSavedContributedData(prev => prev.filter((item) => item.id !== id));
      }
    }

    try {
      await saveQuestion(id);
    } catch {
      setSavedOverrides(prev => new Map(prev).set(questionKey, currentSaved));
      if (currentSaved) {
        fetchSavedQuestions();
      }
      toast.error('Không thể lưu câu hỏi. Vui lòng thử lại.');
    }
  };

  const handleView = (id: number, type: 'system' | 'contributed', currentSaved: boolean) => {
    setViewModalId(id);
    setViewModalType(type);
    setViewModalOpen(true);
    // Seed the override map so the modal has the correct initial value
    const questionKey = getQuestionKey(type, id);
    if (!savedOverrides.has(questionKey)) {
      setSavedOverrides(prev => new Map(prev).set(questionKey, currentSaved));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.startsWith('0001-01-01')) {
      return 'Không rõ thời gian';
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'Không rõ thời gian';
    }

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

  const buildCardData = (question: PublicSystemQuestionBankItem) => {
    const difficultyText = question.difficulty || 'N/A';
    const rating = difficultyText.toLowerCase() === 'hard'
      ? 5
      : difficultyText.toLowerCase() === 'medium'
        ? 4
        : 3;

    return {
      id: question.id,
      title: question.content,
      description: question.sampleAnswer || 'Chưa có câu trả lời mẫu.',
      author: 'Hệ thống',
      company: 'Hệ thống',
      timeAgo: formatDate(question.createdAt),
      skills: question.skills.map((item) => item.name),
      position: question.positions.map((item) => item.name).join(', ') || 'N/A',
      level: difficultyText,
      rating,
    };
  };

  const buildContributedCardData = (question: PublicContributedQuestionBankItem) => {
    const difficultyText = question.difficulty || 'N/A';
    const rating = difficultyText.toLowerCase() === 'hard'
      ? 5
      : difficultyText.toLowerCase() === 'medium'
        ? 4
        : 3;

    return {
      id: question.id,
      title: question.content,
      description: question.sampleAnswer || 'Chưa có câu trả lời mẫu.',
      author: question.creatorName || 'Ẩn danh',
      company: question.contributedDetail?.company || 'Cộng đồng',
      timeAgo: formatDate(question.createdAt),
      skills: question.skills.map((item) => item.name),
      position: question.positions.map((item) => item.name).join(', ') || 'N/A',
      level: question.contributedDetail?.level || 'N/A',
      rating,
    };
  };

  const filterSavedSystemQuestions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return savedSystemData;
    }

    return savedSystemData.filter((question) => {
      return [
        question.content,
        question.sampleAnswer,
        ...question.categories.map((item) => item.name),
        ...question.skills.map((item) => item.name),
        ...question.positions.map((item) => item.name),
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch));
    });
  }, [savedSystemData, searchTerm]);

  const filterSavedContributedQuestions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return savedContributedData;
    }

    return savedContributedData.filter((question) => {
      return [
        question.content,
        question.sampleAnswer,
        question.creatorName,
        question.contributedDetail?.company,
        question.contributedDetail?.level,
        ...question.categories.map((item) => item.name),
        ...question.skills.map((item) => item.name),
        ...question.positions.map((item) => item.name),
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch));
    });
  }, [savedContributedData, searchTerm]);

  const paginateSavedItems = <T,>(items: T[]) => {
    const totalCount = items.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePageNumber = Math.min(pageNumber, totalPages);
    const startIndex = (safePageNumber - 1) * pageSize;

    return {
      items: items.slice(startIndex, startIndex + pageSize),
      totalCount,
      totalPages,
      pageNumber: safePageNumber,
      hasPreviousPage: safePageNumber > 1,
      hasNextPage: safePageNumber < totalPages,
    };
  };

  const savedSystemPage = useMemo(() => paginateSavedItems(filterSavedSystemQuestions), [filterSavedSystemQuestions, pageNumber]);
  const savedContributedPage = useMemo(() => paginateSavedItems(filterSavedContributedQuestions), [filterSavedContributedQuestions, pageNumber]);

  const activeData = activeTab === 'system'
    ? data
    : activeTab === 'contributed'
      ? contributedData
      : savedTab === 'system'
        ? savedSystemPage
        : savedContributedPage;

  const currentPage = activeData?.pageNumber || pageNumber;

  const visiblePages = useMemo(() => {
    const totalPages = activeData?.totalPages || 0;
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  }, [activeData?.totalPages, currentPage]);

  return (
    <div className="font-sans bg-[#020617] min-h-screen">

      <main className="pb-20 px-6">
        
        <div className="max-w-7xl mx-auto">
           {/* Tabs */}
          <section className="mb-8 mt-6">
            <div className="flex border-b border-white/10 gap-8">
              <button
                onClick={() => {
                  setActiveTab('system');
                  setPageNumber(1);
                }}
                className={`pb-4 font-bold text-xs uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === 'system'
                    ? 'text-indigo-400 border-indigo-500'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Câu hỏi hệ thống
              </button>
              <button
                onClick={() => {
                  setActiveTab('contributed');
                  setPageNumber(1);
                }}
                className={`pb-4 font-bold text-xs uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === 'contributed'
                    ? 'text-indigo-400 border-indigo-500'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Câu hỏi đóng góp
              </button>
              <button
                onClick={() => {
                  setActiveTab('saved');
                  setPageNumber(1);
                }}
                className={`pb-4 font-bold text-xs uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === 'saved'
                    ? 'text-indigo-400 border-indigo-500'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Câu hỏi đã lưu
              </button>
            </div>
          </section>
          {/* Breadcrumb & Header */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
              <div>
                
                <h1 className="text-4xl pb-2 md:text-5xl font-extrabold mb-4 bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  {activeTab === 'system'
                    ? 'Ngân Hàng Câu Hỏi Hệ Thống'
                    : activeTab === 'contributed'
                      ? 'Cộng Đồng Chia Sẻ Câu Hỏi'
                      : 'Kho Câu Hỏi Đã Lưu'}
                </h1>
                <p className="text-slate-400 max-w-2xl">
                  {activeTab === 'system'
                    ? 'Khám phá kho tàng kiến thức với hàng ngàn câu hỏi phỏng vấn thực tế từ các tập đoàn công nghệ hàng đầu, được chọn lọc bởi đội ngũ Mentor dày dạn kinh nghiệm.'
                    : activeTab === 'contributed'
                      ? 'Nơi các ứng viên chia sẻ trải nghiệm phỏng vấn thực tế từ các công ty.'
                      : 'Tổng hợp các câu hỏi bạn đã đánh dấu lưu, gom chung trong một không gian nhưng vẫn tách rõ hệ thống và đóng góp.'}
                </p>
              </div>
              
              {activeTab === 'contributed' && (
                <button 
                  onClick={() => setContributeModalOpen(true)}
                  className="bg-linear-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 self-start md:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Thêm câu hỏi
                </button>
              )}
            </div>
          </div>

         

          {/* Filter Section */}
          {activeTab !== 'saved' && (
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Vị trí</label>
              <select
                value={positionId || ''}
                onChange={(e) => {
                  setPositionId(e.target.value ? Number(e.target.value) : undefined);
                  setPageNumber(1);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
              >
                <option value="">Tất cả</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-48 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Kỹ năng</label>
              <select
                value={skillId || ''}
                onChange={(e) => {
                  setSkillId(e.target.value ? Number(e.target.value) : undefined);
                  setPageNumber(1);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
              >
                <option value="">Tất cả</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
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
                  setDifficulty(e.target.value ? Number(e.target.value) : undefined);
                  setPageNumber(1);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
              >
                <option value="">Mọi cấp độ</option>
                <option value={DIFFICULTY_LEVEL.EASY}>Easy</option>
                <option value={DIFFICULTY_LEVEL.MEDIUM}>Medium</option>
                <option value={DIFFICULTY_LEVEL.HARD}>Hard</option>
              </select>
            </div>

            {activeTab === 'contributed' && (
              <>
                <div className="w-full lg:w-48 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Công ty</label>
                  <select
                    value={companyId || ''}
                    onChange={(e) => {
                      setCompanyId(e.target.value ? Number(e.target.value) : undefined);
                      setPageNumber(1);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
                  >
                    <option value="">Tất cả</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full lg:w-48 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Level</label>
                  <select
                    value={level ?? ''}
                    onChange={(e) => {
                      setLevel(e.target.value ? Number(e.target.value) : undefined);
                      setPageNumber(1);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
                  >
                    <option value="">Tất cả</option>
                    {Object.entries(LEVEL_MAP).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full lg:w-48 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tên công ty</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      setPageNumber(1);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all outline-none text-white"
                    placeholder="Ví dụ: FPT"
                  />
                </div>
              </>
            )}

            <div className="w-full lg:w-44 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Sắp xếp theo</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPageNumber(1);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
              >
                <option value="createdAt">Ngày tạo</option>
                <option value="difficulty">Độ khó</option>
              </select>
            </div>

            <div className="w-full lg:w-44 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Thứ tự</label>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder((e.target.value as 'asc' | 'desc') || 'desc');
                  setPageNumber(1);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-300 outline-none"
              >
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
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
          )}

          {/* Content Section */}
          {activeTab === 'system' ? (
            <div className="space-y-6">
              {loading ? (
                <>
                  {[1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 animate-pulse"
                    >
                      <div className="h-4 bg-slate-700 rounded w-48 mb-4"></div>
                      <div className="h-6 bg-slate-700 rounded w-2/3 mb-3"></div>
                      <div className="h-4 bg-slate-800 rounded w-full mb-2"></div>
                      <div className="h-4 bg-slate-800 rounded w-4/5"></div>
                    </div>
                  ))}
                </>
              ) : error ? (
                <div className="text-center bg-[#1e293b]/40 backdrop-blur-sm p-10 rounded-2xl border border-white/5">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => fetchQuestions()}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all font-medium"
                  >
                    Thử lại
                  </button>
                </div>
              ) : data && data.items.length > 0 ? (
                <>
                  {data.items.map((question) => {
                    const card = buildCardData(question);
                    const saved = isSavedFor('system', question.id, question.isSaved);
                    return (
                      <QuestionContributedCard
                        key={card.id}
                        id={card.id}
                        title={card.title}
                        description={card.description}
                        author={card.author}
                        company={card.company}
                        timeAgo={card.timeAgo}
                        skills={card.skills}
                        position={card.position}
                        level={card.level}
                        rating={card.rating}
                        isSaved={saved}
                        onView={() => handleView(question.id, 'system', saved)}
                        onSave={() => handleSave('system', question.id, saved)}
                      />
                    );
                  })}

                  <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                    <button
                      className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                      disabled={!activeData?.hasPreviousPage}
                      onClick={() => activeData?.hasPreviousPage && setPageNumber((prev) => prev - 1)}
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>

                    {visiblePages.map((page) => (
                      <button
                        key={page}
                        onClick={() => setPageNumber(page)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                          currentPage === page
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 font-bold'
                            : 'bg-[#1e293b]/40 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                      disabled={!activeData?.hasNextPage}
                      onClick={() => activeData?.hasNextPage && setPageNumber((prev) => prev + 1)}
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center bg-[#1e293b]/40 backdrop-blur-sm p-10 rounded-2xl border border-white/5 text-slate-400">
                  Không tìm thấy câu hỏi nào.
                </div>
              )}
            </div>
          ) : activeTab === 'contributed' ? (
            <div className="space-y-6">
              {loading ? (
                <>
                  {[1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 animate-pulse"
                    >
                      <div className="h-4 bg-slate-700 rounded w-48 mb-4"></div>
                      <div className="h-6 bg-slate-700 rounded w-2/3 mb-3"></div>
                      <div className="h-4 bg-slate-800 rounded w-full mb-2"></div>
                      <div className="h-4 bg-slate-800 rounded w-4/5"></div>
                    </div>
                  ))}
                </>
              ) : error ? (
                <div className="text-center bg-[#1e293b]/40 backdrop-blur-sm p-10 rounded-2xl border border-white/5">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => fetchContributedQuestions()}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all font-medium"
                  >
                    Thử lại
                  </button>
                </div>
              ) : contributedData && contributedData.items.length > 0 ? (
                <>
                  {contributedData.items.map((question) => {
                    const card = buildContributedCardData(question);
                    const saved = isSavedFor('contributed', question.id, question.isSaved);
                    return (
                      <QuestionContributedCard
                        key={card.id}
                        id={card.id}
                        title={card.title}
                        description={card.description}
                        author={card.author}
                        company={card.company}
                        timeAgo={card.timeAgo}
                        skills={card.skills}
                        position={card.position}
                        level={card.level}
                        rating={card.rating}
                        isSaved={saved}
                        onView={() => handleView(question.id, 'contributed', saved)}
                        onSave={() => handleSave('contributed', question.id, saved)}
                      />
                    );
                  })}

                  <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                    <button
                      className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                      disabled={!activeData?.hasPreviousPage}
                      onClick={() => activeData?.hasPreviousPage && setPageNumber((prev) => prev - 1)}
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>

                    {visiblePages.map((page) => (
                      <button
                        key={page}
                        onClick={() => setPageNumber(page)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                          currentPage === page
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 font-bold'
                            : 'bg-[#1e293b]/40 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                      disabled={!activeData?.hasNextPage}
                      onClick={() => activeData?.hasNextPage && setPageNumber((prev) => prev + 1)}
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center bg-[#1e293b]/40 backdrop-blur-sm p-10 rounded-2xl border border-white/5 text-slate-400">
                  Không tìm thấy câu hỏi đóng góp nào.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <section className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5">
                <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between">
                  <div className="space-y-3">
                    <div className="flex border border-white/10 rounded-xl p-1 bg-black/10 w-fit">
                      <button
                        onClick={() => {
                          setSavedTab('system');
                          setPageNumber(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          savedTab === 'system' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Hệ thống đã lưu ({savedSystemData.length})
                      </button>
                      <button
                        onClick={() => {
                          setSavedTab('contributed');
                          setPageNumber(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          savedTab === 'contributed' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Đóng góp đã lưu ({savedContributedData.length})
                      </button>
                    </div>
                    <p className="text-sm text-slate-400">
                      Giữ chung một tab để gọn giao diện, còn tách dữ liệu bằng switch con vì backend đang trả về 2 API khác nhau.
                    </p>
                  </div>

                  <div className="w-full lg:w-80 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tìm trong câu hỏi đã lưu</label>
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
                        placeholder="Tìm theo nội dung, kỹ năng, công ty..."
                      />
                    </div>
                  </div>
                </div>
              </section>

              {loading ? (
                <>
                  {[1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 animate-pulse"
                    >
                      <div className="h-4 bg-slate-700 rounded w-48 mb-4"></div>
                      <div className="h-6 bg-slate-700 rounded w-2/3 mb-3"></div>
                      <div className="h-4 bg-slate-800 rounded w-full mb-2"></div>
                      <div className="h-4 bg-slate-800 rounded w-4/5"></div>
                    </div>
                  ))}
                </>
              ) : error ? (
                <div className="text-center bg-[#1e293b]/40 backdrop-blur-sm p-10 rounded-2xl border border-white/5">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => fetchSavedQuestions()}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all font-medium"
                  >
                    Thử lại
                  </button>
                </div>
              ) : savedTab === 'system' && savedSystemPage.items.length > 0 ? (
                <>
                  {savedSystemPage.items.map((question) => {
                    const card = buildCardData(question);
                    const saved = isSavedFor('system', question.id, question.isSaved);
                    return (
                      <QuestionContributedCard
                        key={`saved-system-${card.id}`}
                        id={card.id}
                        title={card.title}
                        description={card.description}
                        author={card.author}
                        company={card.company}
                        timeAgo={card.timeAgo}
                        skills={card.skills}
                        position={card.position}
                        level={card.level}
                        rating={card.rating}
                        isSaved={saved}
                        onView={() => handleView(question.id, 'system', saved)}
                        onSave={() => handleSave('system', question.id, saved)}
                      />
                    );
                  })}

                  <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                    <button
                      className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                      disabled={!activeData?.hasPreviousPage}
                      onClick={() => activeData?.hasPreviousPage && setPageNumber((prev) => prev - 1)}
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>

                    {visiblePages.map((page) => (
                      <button
                        key={page}
                        onClick={() => setPageNumber(page)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                          currentPage === page
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 font-bold'
                            : 'bg-[#1e293b]/40 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                      disabled={!activeData?.hasNextPage}
                      onClick={() => activeData?.hasNextPage && setPageNumber((prev) => prev + 1)}
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </>
              ) : savedTab === 'contributed' && savedContributedPage.items.length > 0 ? (
                <>
                  {savedContributedPage.items.map((question) => {
                    const card = buildContributedCardData(question);
                    const saved = isSavedFor('contributed', question.id, question.isSaved);
                    return (
                      <QuestionContributedCard
                        key={`saved-contributed-${card.id}`}
                        id={card.id}
                        title={card.title}
                        description={card.description}
                        author={card.author}
                        company={card.company}
                        timeAgo={card.timeAgo}
                        skills={card.skills}
                        position={card.position}
                        level={card.level}
                        rating={card.rating}
                        isSaved={saved}
                        onView={() => handleView(question.id, 'contributed', saved)}
                        onSave={() => handleSave('contributed', question.id, saved)}
                      />
                    );
                  })}

                  <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                    <button
                      className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                      disabled={!activeData?.hasPreviousPage}
                      onClick={() => activeData?.hasPreviousPage && setPageNumber((prev) => prev - 1)}
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>

                    {visiblePages.map((page) => (
                      <button
                        key={page}
                        onClick={() => setPageNumber(page)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                          currentPage === page
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 font-bold'
                            : 'bg-[#1e293b]/40 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      className="w-10 h-10 rounded-xl bg-[#1e293b]/40 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                      disabled={!activeData?.hasNextPage}
                      onClick={() => activeData?.hasNextPage && setPageNumber((prev) => prev + 1)}
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center bg-[#1e293b]/40 backdrop-blur-sm p-10 rounded-2xl border border-white/5 text-slate-400">
                  {savedTab === 'system'
                    ? 'Không có câu hỏi hệ thống nào đã lưu.'
                    : 'Không có câu hỏi đóng góp nào đã lưu.'}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Contribute Question Modal */}
      <CreateContributeQuestionDialog
        open={contributeModalOpen}
        onOpenChange={setContributeModalOpen}
        onSuccess={() => {
          // Refresh contributed questions list if needed
          if (activeTab === 'contributed') {
            fetchContributedQuestions();
          }
        }}
      />

      {/* View System Question Modal */}
      {viewModalType === 'system' && (
        <ViewSystemQuestionModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          questionId={viewModalId}
          isSaved={isSavedFor('system', viewModalId, false)}
          onSaveToggle={() => {
            const currentSaved = isSavedFor('system', viewModalId, false);
            handleSave('system', viewModalId, currentSaved);
          }}
        />
      )}

      {/* View Contributed Question Modal */}
      {viewModalType === 'contributed' && (
        <ViewContributeQuestionModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          questionId={viewModalId}
          isSaved={isSavedFor('contributed', viewModalId, false)}
          onSaveToggle={() => {
            const currentSaved = isSavedFor('contributed', viewModalId, false);
            handleSave('contributed', viewModalId, currentSaved);
          }}
        />
      )}
    </div>
  );
};

export default ViewQuestionBank;
