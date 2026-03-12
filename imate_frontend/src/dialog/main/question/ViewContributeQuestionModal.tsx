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
import { getContributedQuestionDetail } from '@/services/questionService';
import type { ContributedQuestionDetail } from '@/types/common/question';
import { DIFFICULTY_MAP, LEVEL_MAP } from '@/constants/common';
import { toast } from 'react-toastify';
import { StatusBadge } from '@/components/ui/status-badge';

interface ViewContributeQuestionModalProps {
    questionId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewContributeQuestionModal({
    questionId,
    open,
    onOpenChange
}: ViewContributeQuestionModalProps) {
    const [loadingData, setLoadingData] = useState(true);
    const [questionData, setQuestionData] = useState<ContributedQuestionDetail | null>(null);
    
    // Track if data has been fetched to prevent duplicate calls
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (open && questionId && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
        }
        
        // Reset when modal closes
        if (!open) {
            hasFetchedRef.current = false;
        }
    }, [open, questionId]);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const questionDetail = await getContributedQuestionDetail(questionId);
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

    const getLevelStatus = (level: number | null): "active" | "pending" | "error" | "inactive" | "draft" => {
        if (level === 0 || level === 1) return 'active';
        if (level === 2 || level === 3) return 'pending';
        if (level === 4 || level === 5) return 'error';
        return 'inactive';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white">
                        Chi tiết câu hỏi đóng góp #{questionId}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Xem thông tin chi tiết câu hỏi phỏng vấn được đóng góp.
                    </DialogDescription>
                </DialogHeader>

                {loadingData ? (
                    <div className="py-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-slate-400">Đang tải dữ liệu...</p>
                    </div>
                ) : questionData ? (
                    <div className="space-y-6">
                        {/* Contributor Info */}
                        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                                        Người đóng góp
                                    </label>
                                    <p className="text-sm text-slate-200 font-medium">
                                        {questionData.creatorName || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                                        Công ty
                                    </label>
                                    <p className="text-sm text-slate-200 font-medium">
                                        {questionData.companyName || 'N/A'}
                                    </p>
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
                            <div className="w-full min-h-[8rem] rounded-lg px-4 py-3 bg-slate-800/40 border border-slate-700 text-slate-100 text-sm whitespace-pre-wrap">
                                {questionData.content || 'Không có nội dung'}
                            </div>
                        </div>

                        {/* Sample Answer */}
                        {questionData.sampleAnswer && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Câu trả lời
                                </label>
                                <div className="w-full min-h-[10rem] rounded-lg px-4 py-3 bg-slate-800/40 border border-slate-700 text-slate-100 text-sm whitespace-pre-wrap">
                                    {questionData.sampleAnswer}
                                </div>
                            </div>
                        )}

                        {/* Difficulty and Level */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Độ khó
                                </label>
                                <div>
                                    <StatusBadge status={getDifficultyStatus(questionData.difficulty)}>
                                        {questionData.difficulty !== null ? DIFFICULTY_MAP[questionData.difficulty as 0 | 1 | 2] : 'N/A'}
                                    </StatusBadge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Cấp độ
                                </label>
                                <div>
                                    <StatusBadge status={getLevelStatus(questionData.level)}>
                                        {questionData.level !== null ? LEVEL_MAP[questionData.level as 0 | 1 | 2 | 3 | 4 | 5] : 'N/A'}
                                    </StatusBadge>
                                </div>
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

                        {/* Footer with Close Button */}
                        <div className="flex justify-end pt-4 border-t border-slate-700">
                            <DialogClose asChild>
                                <Button variant="outline">
                                    Đóng
                                </Button>
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
