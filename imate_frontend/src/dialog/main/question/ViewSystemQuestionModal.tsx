import { useEffect, useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bookmark, Eye, EyeOff } from 'lucide-react';
import { getSystemQuestionDetail } from '@/services/questionService';
import type { SystemQuestionDetail } from '@/types/common/question';
import { DIFFICULTY_MAP } from '@/constants/common';
import { toast } from 'react-toastify';
import { StatusBadge } from '@/components/ui/status-badge';

interface ViewSystemQuestionModalProps {
    questionId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isSaved?: boolean;
    onSaveToggle?: () => void;
}

export function ViewSystemQuestionModal({
    questionId,
    open,
    onOpenChange,
    isSaved = false,
    onSaveToggle,
}: ViewSystemQuestionModalProps) {
    const [loadingData, setLoadingData] = useState(true);
    const [questionData, setQuestionData] = useState<SystemQuestionDetail | null>(null);
    const [isSampleAnswerVisible, setIsSampleAnswerVisible] = useState(false);

    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (open && questionId && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
        }

        if (!open) {
            hasFetchedRef.current = false;
            setQuestionData(null);
            setIsSampleAnswerVisible(false);
        }
    }, [open, questionId]);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const questionDetail = await getSystemQuestionDetail(questionId);
            setQuestionData(questionDetail);
        } catch (error) {
            console.error('Failed to fetch question data:', error);
            toast.error('Không thể tải dữ liệu câu hỏi. Vui lòng thử lại sau.');
            onOpenChange(false);
        } finally {
            setLoadingData(false);
        }
    };

    const getDifficultyStatus = (difficulty: number | null): "active" | "pending" | "error" | "inactive" | "draft" => {
        if (difficulty === 0) return 'active';
        if (difficulty === 1) return 'pending';
        if (difficulty === 2) return 'error';
        return 'inactive';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4">
                    <DialogHeader className="flex-1">
                        <DialogTitle className="text-xl font-semibold text-white">
                            Chi tiết câu hỏi hệ thống #{questionId}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Xem thông tin chi tiết câu hỏi phỏng vấn từ hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    {onSaveToggle && (
                        <button
                            onClick={onSaveToggle}
                            className={`p-2 rounded-lg transition-colors mt-1 ${isSaved
                                ? 'text-yellow-400 hover:text-yellow-300'
                                : 'text-slate-500 hover:text-yellow-400'
                                }`}
                            title={isSaved ? 'Bỏ lưu' : 'Lưu câu hỏi'}
                        >
                            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>

                {loadingData ? (
                    <div className="py-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-slate-400">Đang tải dữ liệu...</p>
                    </div>
                ) : questionData ? (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                                        Nguồn
                                    </label>
                                    <StatusBadge status="draft">Hệ thống</StatusBadge>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                                        Trạng thái
                                    </label>
                                    <StatusBadge status={questionData.isActive ? "active" : "inactive"}>
                                        {questionData.isActive ? "Hoạt động" : "Vô hiệu"}
                                    </StatusBadge>
                                </div>
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-200">
                                Nội dung câu hỏi
                            </label>
                            <div className="w-full min-h-32 rounded-lg px-4 py-3 bg-slate-800/40 border border-slate-700 text-slate-100 text-sm whitespace-pre-wrap">
                                {questionData.content || 'Không có nội dung'}
                            </div>
                        </div>

                        {/* Sample Answer */}
                        {questionData.sampleAnswer && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Câu trả lời mẫu
                                </label>
                                <div className="relative w-full min-h-40 rounded-lg px-4 py-3 bg-slate-800/40 border border-slate-700 text-sm">
                                    {isSampleAnswerVisible ? (
                                        <>
                                            <div className="text-slate-100 whitespace-pre-wrap">
                                                {questionData.sampleAnswer}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsSampleAnswerVisible(false)}
                                                className="absolute top-3 right-3 inline-flex items-center gap-2 text-xs text-slate-300 hover:text-slate-100 transition-colors"
                                                aria-label="Ẩn câu trả lời"
                                            >
                                                <EyeOff className="w-4 h-4" />
                                                Ẩn
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setIsSampleAnswerVisible(true)}
                                            className="absolute inset-0 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-100 transition-colors"
                                            aria-label="Hiện câu trả lời"
                                        >
                                            <Eye className="w-5 h-5" />
                                            Hiện câu trả lời
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Difficulty */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-200">
                                Độ khó
                            </label>
                            <div>
                                <StatusBadge status={getDifficultyStatus(questionData.difficulty)}>
                                    {questionData.difficulty !== null && questionData.difficulty !== undefined
                                        ? DIFFICULTY_MAP[questionData.difficulty as 0 | 1 | 2]
                                        : 'N/A'}
                                </StatusBadge>
                            </div>
                        </div>

                        {/* Categories */}
                        {questionData.categoriesName && questionData.categoriesName.length > 0 && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Danh mục
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {questionData.categoriesName.map((category, idx) => (
                                        <StatusBadge key={idx} status="inactive">
                                            {category}
                                        </StatusBadge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Positions */}
                        {questionData.positionsName && questionData.positionsName.length > 0 && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Vị trí
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {questionData.positionsName.map((position, idx) => (
                                        <StatusBadge key={idx} status="inactive">
                                            {position}
                                        </StatusBadge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {questionData.skillsName && questionData.skillsName.length > 0 && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Kỹ năng
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {questionData.skillsName.map((skill, idx) => (
                                        <StatusBadge key={idx} status="inactive">
                                            {skill}
                                        </StatusBadge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                            <button
                                onClick={onSaveToggle}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${isSaved
                                    ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10'
                                    : 'border-slate-600 text-slate-400 hover:border-yellow-500/50 hover:text-yellow-400'
                                    }`}
                            >
                                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                {isSaved ? 'Đã lưu' : 'Lưu câu hỏi'}
                            </button>
                            <DialogClose asChild>
                                <Button variant="outline">Đóng</Button>
                            </DialogClose>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center text-slate-400">
                        Không tìm thấy dữ liệu câu hỏi.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
