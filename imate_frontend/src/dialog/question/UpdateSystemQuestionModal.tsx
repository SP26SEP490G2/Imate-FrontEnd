import React, { useEffect, useState } from 'react';
import {
    updateSystemQuestionForStaff,
    getSystemQuestionDetail
} from '@/services/questionService';
import {
    getAllPositions,
    getAllSkills
} from '@/services/commonService';
import { getListQuestionCategories } from '@/services/questionService';
import type {
    UpdateSystemQuestionRequest,
    DifficultyLevel,
    PositionItem,
    SkillItem,
    CategoryItem
} from '@/types/common/question';
import { DIFFICULTY_MAP, DIFFICULTY_LEVEL } from '@/constants/common';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface UpdateSystemQuestionModalProps {
    questionId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateSystemQuestionModal: React.FC<UpdateSystemQuestionModalProps> = ({
    questionId,
    isOpen,
    onClose,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // Form state
    const [formData, setFormData] = useState<UpdateSystemQuestionRequest>({
        content: '',
        difficulty: DIFFICULTY_LEVEL.EASY,
        sampleAnswer: '',
        isActive: true,
        categoryIds: [],
        skillIds: [],
        positionIds: []
    });

    // Dropdown options
    const [positions, setPositions] = useState<PositionItem[]>([]);
    const [skills, setSkills] = useState<SkillItem[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);

    // Form errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && questionId) {
            fetchData();
        }
    }, [isOpen, questionId]);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const [questionDetail, positionsRes, skillsRes, categoriesRes] = await Promise.all([
                getSystemQuestionDetail(questionId),
                getAllPositions({ pageSize: 100, isActive: true }),
                getAllSkills({ pageSize: 100, isActive: true }),
                getListQuestionCategories()
            ]);

            console.log('Question Detail:', questionDetail);

            setPositions(positionsRes.data);
            setSkills(skillsRes.data);
            setCategories(categoriesRes);

            // Match names to IDs since API returns names instead of IDs
            const categoryIds = categoriesRes
                .filter(c => questionDetail.categoriesName?.includes(c.name))
                .map(c => c.id);
            
            const skillIds = skillsRes.data
                .filter(s => questionDetail.skillsName?.includes(s.name))
                .map(s => s.id);
            
            const positionIds = positionsRes.data
                .filter(p => questionDetail.positionsName?.includes(p.name))
                .map(p => p.id);

            // Populate form with question details
            setFormData({
                content: questionDetail.content || '',
                difficulty: questionDetail.difficulty,
                sampleAnswer: questionDetail.sampleAnswer || '',
                isActive: questionDetail.isActive,
                categoryIds: categoryIds,
                skillIds: skillIds,
                positionIds: positionIds
            });
        } catch (error) {
            console.error('Failed to fetch question data:', error);
            toast.error('Không thể tải dữ liệu câu hỏi. Vui lòng thử lại sau.');
            onClose();
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
            await updateSystemQuestionForStaff(questionId, formData);
            toast.success('Cập nhật câu hỏi thành công!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to update question:', error);
            toast.error(error?.response?.data?.message || 'Không thể cập nhật câu hỏi. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleDifficultyChange = (difficulty: DifficultyLevel) => {
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#0a0b14]/90 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-[900px] max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0b14]/95 backdrop-blur-xl z-10">
                    <h2 className="text-white text-xl font-bold font-display tracking-tight">
                        Chi tiết câu hỏi số {questionId}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[calc(90vh-180px)] overflow-y-auto">
                    {loadingData ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                            <p className="text-slate-400">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
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
                                    Nội dung gợi ý trả lời câu hỏi <span className="text-red-400">*</span>
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

                            {/* Is Active */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-white/80 cursor-pointer">
                                    Kích hoạt câu hỏi
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            Đang cập nhật...
                                        </span>
                                    ) : (
                                        'Cập nhật'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateSystemQuestionModal;
