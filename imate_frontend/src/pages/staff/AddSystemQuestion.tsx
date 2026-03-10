import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createSystemQuestionForStaff
} from '@/services/questionService';
import {
    getAllCategories,
    getAllPositions,
    getAllSkills
} from '@/services/commonService';
import { getListQuestionCategories } from '@/services/questionService';
import type {
    CreateSystemQuestionRequest,
    PositionItem,
    SkillItem,
    CategoryItem
} from '@/types/common/question';
import { DIFFICULTY_LEVEL, DIFFICULTY_MAP } from '@/constants/common';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const AddSystemQuestion: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // Form state
    const [formData, setFormData] = useState<CreateSystemQuestionRequest>({
        content: '',
        difficulty: DIFFICULTY_LEVEL.EASY, // Changed to number
        sampleAnswer: '',
        categoryIds: [],
        skillIds: [],
        positionIds: [],
        creatorId: 0 // Will be set from auth context
    });

    // Dropdown options
    const [positions, setPositions] = useState<PositionItem[]>([]);
    const [skills, setSkills] = useState<SkillItem[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);

    // Form errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            setLoadingData(true);
            const [positionsRes, skillsRes, categoriesRes] = await Promise.all([
                getAllPositions({ pageSize: 100, isActive: true }),
                getAllSkills({ pageSize: 100, isActive: true }),
                getAllCategories({ pageSize: 100, isActive: true }),
                getListQuestionCategories()
            ]);

            setPositions(positionsRes.data);
            setSkills(skillsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Failed to fetch dropdown data:', error);
            toast.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setLoadingData(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate content
        if (!formData.content.trim()) {
            newErrors.content = 'Nội dung câu hỏi không được để trống.';
        } else if (formData.content.length > 500) {
            newErrors.content = 'Nội dung câu hỏi tối đa 500 ký tự.';
        }

        // Validate sample answer
        if (!formData.sampleAnswer.trim()) {
            newErrors.sampleAnswer = 'Câu trả lời mẫu không được để trống.';
        } else if (formData.sampleAnswer.length > 2000) {
            newErrors.sampleAnswer = 'Câu trả lời mẫu tối đa 2000 ký tự.';
        }

        // Validate categories
        if (formData.categoryIds.length === 0) {
            newErrors.categoryIds = 'Phải chọn ít nhất một danh mục.';
        }

        // Validate skills
        if (formData.skillIds.length === 0) {
            newErrors.skillIds = 'Phải chọn ít nhất một kỹ năng.';
        }

        // Validate positions
        if (formData.positionIds.length === 0) {
            newErrors.positionIds = 'Phải chọn ít nhất một vị trí.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin.');
            return;
        }

        try {
            setLoading(true);

            // TODO: Get creatorId from auth context
            const requestData = {
                ...formData,
                creatorId: 1 // Replace with actual user ID from auth
            };

            await createSystemQuestionForStaff(requestData);
            toast.success('Thêm câu hỏi thành công!');
            navigate('/staff/question-management');
        } catch (error: any) {
            console.error('Failed to create question:', error);
            toast.error(error?.response?.data?.message || 'Không thể tạo câu hỏi. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleDifficultyChange = (difficulty: 0 | 1 | 2) => {
        setFormData(prev => ({ ...prev, difficulty }));
        if (errors.difficulty) {
            setErrors(prev => ({ ...prev, difficulty: '' }));
        }
    };

    const toggleSelection = (
        type: 'categoryIds' | 'skillIds' | 'positionIds',
        id: number
    ) => {
        setFormData(prev => {
            const currentIds = prev[type];
            const newIds = currentIds.includes(id)
                ? currentIds.filter(item => item !== id)
                : [...currentIds, id];

            return { ...prev, [type]: newIds };
        });

        // Clear error for this field
        if (errors[type]) {
            setErrors(prev => ({ ...prev, [type]: '' }));
        }
    };

    if (loadingData) {
        return (
            <div className="font-sans bg-[#020617] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans bg-[#020617] min-h-screen">
            <main className="pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <header className="mb-10 pt-8">
                        <button
                            onClick={() => navigate('/staff/question-management')}
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm font-medium">Quay lại quản lý câu hỏi</span>
                        </button>

                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Thêm câu hỏi hệ thống
                        </h1>
                        <p className="text-slate-400">
                            Tạo câu hỏi phỏng vấn mới cho ngân hàng câu hỏi hệ thống.
                        </p>
                    </header>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-[#1e293b]/40 backdrop-blur-sm p-8 rounded-2xl border border-white/5 space-y-6">
                            {/* Question Content */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-white/80">
                                    Nội dung câu hỏi <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, content: e.target.value }));
                                        if (errors.content) setErrors(prev => ({ ...prev, content: '' }));
                                    }}
                                    className={`w-full h-32 rounded-xl px-5 py-4 bg-white/5 border ${errors.content ? 'border-red-500' : 'border-white/10'
                                        } text-white text-sm placeholder:text-white/20 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
                                    placeholder="Viết câu hỏi phỏng vấn của bạn ở đây..."
                                />
                                {errors.content && (
                                    <p className="text-red-400 text-xs mt-1">{errors.content}</p>
                                )}
                                <p className="text-xs text-slate-500">
                                    {formData.content.length}/500 ký tự
                                </p>
                            </div>

                            {/* Sample Answer */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-white/80">
                                    Câu trả lời mẫu <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={formData.sampleAnswer}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, sampleAnswer: e.target.value }));
                                        if (errors.sampleAnswer) setErrors(prev => ({ ...prev, sampleAnswer: '' }));
                                    }}
                                    className={`w-full h-40 rounded-xl px-5 py-4 bg-white/5 border ${errors.sampleAnswer ? 'border-red-500' : 'border-white/10'
                                        } text-white text-sm placeholder:text-white/20 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
                                    placeholder="Viết câu trả lời gợi ý cho câu hỏi của bạn ở đây..."
                                />
                                {errors.sampleAnswer && (
                                    <p className="text-red-400 text-xs mt-1">{errors.sampleAnswer}</p>
                                )}
                                <p className="text-xs text-slate-500">
                                    {formData.sampleAnswer.length}/2000 ký tự
                                </p>
                            </div>

                            {/* Difficulty Level */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-white/80">
                                    Cấp độ <span className="text-red-400">*</span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {([DIFFICULTY_LEVEL.EASY, DIFFICULTY_LEVEL.MEDIUM, DIFFICULTY_LEVEL.HARD] as const).map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => handleDifficultyChange(level)}
                                            className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-all ${formData.difficulty === level
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,68,242,0.2)]'
                                                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                                                }`}
                                        >
                                            {DIFFICULTY_MAP[level]}
                                        </button>
                                    ))}
                                </div>
                                {errors.difficulty && (
                                    <p className="text-red-400 text-xs">{errors.difficulty}</p>
                                )}
                            </div>

                            {/* Categories */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-white/80">
                                    Danh mục <span className="text-red-400">*</span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => toggleSelection('categoryIds', category.id)}
                                            className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-all ${formData.categoryIds.includes(category.id)
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,68,242,0.2)]'
                                                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                                                }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                                {errors.categoryIds && (
                                    <p className="text-red-400 text-xs">{errors.categoryIds}</p>
                                )}
                            </div>

                            {/* Positions */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-white/80">
                                    Vị trí <span className="text-red-400">*</span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {positions.map((position) => (
                                        <button
                                            key={position.id}
                                            type="button"
                                            onClick={() => toggleSelection('positionIds', position.id)}
                                            className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-all ${formData.positionIds.includes(position.id)
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,68,242,0.2)]'
                                                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                                                }`}
                                        >
                                            {position.name}
                                        </button>
                                    ))}
                                </div>
                                {errors.positionIds && (
                                    <p className="text-red-400 text-xs">{errors.positionIds}</p>
                                )}
                            </div>

                            {/* Skills */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-white/80">
                                    Kỹ năng <span className="text-red-400">*</span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {skills.map((skill) => (
                                        <button
                                            key={skill.id}
                                            type="button"
                                            onClick={() => toggleSelection('skillIds', skill.id)}
                                            className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-all ${formData.skillIds.includes(skill.id)
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,68,242,0.2)]'
                                                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                                                }`}
                                        >
                                            {skill.name}
                                        </button>
                                    ))}
                                </div>
                                {errors.skillIds && (
                                    <p className="text-red-400 text-xs">{errors.skillIds}</p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/staff/question-management')}
                                disabled={loading}
                                className="px-8 py-3 rounded-xl bg-[#1e293b]/40 border border-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        Đang tạo...
                                    </span>
                                ) : (
                                    'Tạo câu hỏi'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddSystemQuestion;
