import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Bookmark, Save, Send, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import {
    createComment,
    deleteComment,
    getContributedQuestionDetail,
    sortCommentsByTotalVotesDesc,
    updateComment,
    voteComment,
} from '@/services/questionService';
import type { CommentItem, ContributedQuestionDetail } from '@/types/common/question';
import { DIFFICULTY_MAP, LEVEL_MAP } from '@/constants/common';
import { toast } from 'react-toastify';
import { StatusBadge } from '@/components/ui/status-badge';

interface ViewContributeQuestionModalProps {
    questionId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isSaved?: boolean;
    onSaveToggle?: () => void;
}

type VoteType = 'upvote' | 'downvote' | null;

const getInitialVoteType = (comment: CommentItem): VoteType => {
    if (comment.currentUserVoteType === 'upvote' || comment.currentUserVoteType === 'downvote') {
        return comment.currentUserVoteType;
    }

    if (comment.currentUserVoteIsUpvote === true) {
        return 'upvote';
    }

    if (comment.currentUserVoteIsUpvote === false) {
        return 'downvote';
    }

    return null;
};

const formatCommentDate = (value?: string): string => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleString('vi-VN');
};

export function ViewContributeQuestionModal({
    questionId,
    open,
    onOpenChange,
    isSaved = false,
    onSaveToggle,
}: ViewContributeQuestionModalProps) {
    const [loadingData, setLoadingData] = useState(true);
    const [questionData, setQuestionData] = useState<ContributedQuestionDetail | null>(null);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [isCreatingComment, setIsCreatingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
    const [commentToDeleteId, setCommentToDeleteId] = useState<number | null>(null);
    const [votingCommentId, setVotingCommentId] = useState<number | null>(null);
    const [localVoteByCommentId, setLocalVoteByCommentId] = useState<Record<number, VoteType>>({});
    
    // Track if data has been fetched to prevent duplicate calls
    const hasFetchedRef = useRef(false);

    const currentUser = useMemo(() => {
        try {
            const userRaw = localStorage.getItem('user');
            return userRaw ? JSON.parse(userRaw) : null;
        } catch {
            return null;
        }
    }, []);

    const currentUserId = currentUser?.id !== undefined && currentUser?.id !== null
        ? String(currentUser.id)
        : null;
    const isLoggedIn = Boolean(localStorage.getItem('authToken') && currentUserId);

    const sortedComments = useMemo(() => {
        return sortCommentsByTotalVotesDesc(questionData?.comments || []);
    }, [questionData?.comments]);

    useEffect(() => {
        if (open && questionId && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
        }
        
        // Reset when modal closes
        if (!open) {
            hasFetchedRef.current = false;
            setEditingCommentId(null);
            setEditingCommentContent('');
            setNewCommentContent('');
            setCommentToDeleteId(null);
            setLocalVoteByCommentId({});
        }
    }, [open, questionId]);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const questionDetail = await getContributedQuestionDetail(questionId);
            setQuestionData(questionDetail);

            const nextVoteMap: Record<number, VoteType> = {};
            (questionDetail.comments || []).forEach((comment) => {
                nextVoteMap[comment.id] = getInitialVoteType(comment);
            });
            setLocalVoteByCommentId(nextVoteMap);
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

    const isOwnComment = (commentUserId: string | number): boolean => {
        if (!currentUserId) return false;
        return String(commentUserId) === currentUserId;
    };

    const handleCreateComment = async () => {
        if (!isLoggedIn) {
            toast.info('Vui lòng đăng nhập để bình luận.');
            return;
        }

        const content = newCommentContent.trim();
        if (!content) {
            toast.warning('Vui lòng nhập nội dung bình luận.');
            return;
        }

        try {
            setIsCreatingComment(true);
            const commentId = await createComment(questionId, content);

            if (commentId === null || commentId <= 0) {
                await fetchData();
                setNewCommentContent('');
                toast.success('Bình luận đã được tạo.');
                return;
            }

            const newComment: CommentItem = {
                id: commentId,
                userId: currentUser?.id ?? '',
                userName: currentUser?.name || currentUser?.fullName || currentUser?.userName || 'Bạn',
                userAvatarUrl: currentUser?.avatar || currentUser?.avatarUrl || '',
                userRole: currentUser?.role || '',
                content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                upvoteCount: 0,
                downvoteCount: 0,
                totalVotes: 0,
                currentUserVoteType: null,
            };

            setQuestionData((prev) => {
                if (!prev) return prev;
                const nextComments = [...(prev.comments || []), newComment];
                return { ...prev, comments: nextComments };
            });

            setLocalVoteByCommentId((prev) => ({
                ...prev,
                [newComment.id]: null,
            }));

            setNewCommentContent('');
            toast.success('Bình luận đã được tạo.');
        } catch (error) {
            console.error('Failed to create comment:', error);
            toast.error('Không thể tạo bình luận. Vui lòng thử lại.');
        } finally {
            setIsCreatingComment(false);
        }
    };

    const handleStartEditComment = (comment: CommentItem) => {
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.content || '');
    };

    const handleCancelEditComment = () => {
        setEditingCommentId(null);
        setEditingCommentContent('');
    };

    const handleSaveEditComment = async (commentId: number) => {
        if (!isLoggedIn) {
            toast.info('Vui lòng đăng nhập để chỉnh sửa bình luận.');
            return;
        }

        const content = editingCommentContent.trim();
        if (!content) {
            toast.warning('Nội dung bình luận không được để trống.');
            return;
        }

        try {
            setIsSavingEdit(true);
            await updateComment(commentId, content);

            setQuestionData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    comments: (prev.comments || []).map((comment) =>
                        comment.id === commentId
                            ? {
                                ...comment,
                                content,
                                updatedAt: new Date().toISOString(),
                            }
                            : comment
                    ),
                };
            });

            setEditingCommentId(null);
            setEditingCommentContent('');
            toast.success('Đã cập nhật bình luận.');
        } catch (error) {
            console.error('Failed to update comment:', error);
            toast.error('Không thể cập nhật bình luận. Vui lòng thử lại.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!isLoggedIn) {
            toast.info('Vui lòng đăng nhập để xoá bình luận.');
            return;
        }

        try {
            setDeletingCommentId(commentId);
            await deleteComment(commentId);

            setQuestionData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    comments: (prev.comments || []).filter((comment) => comment.id !== commentId),
                };
            });

            setLocalVoteByCommentId((prev) => {
                const next = { ...prev };
                delete next[commentId];
                return next;
            });

            if (editingCommentId === commentId) {
                handleCancelEditComment();
            }

            toast.success('Đã xoá bình luận.');
        } catch (error) {
            console.error('Failed to delete comment:', error);
            toast.error('Không thể xoá bình luận. Vui lòng thử lại.');
        } finally {
            setDeletingCommentId(null);
            setCommentToDeleteId(null);
        }
    };

    const handleVoteComment = async (comment: CommentItem, isUpvote: boolean) => {
        if (!isLoggedIn) {
            toast.info('Vui lòng đăng nhập để vote bình luận.');
            return;
        }

        const requestedVote: VoteType = isUpvote ? 'upvote' : 'downvote';
        const previousVote = localVoteByCommentId[comment.id] ?? getInitialVoteType(comment);
        const nextVote: VoteType = previousVote === requestedVote ? null : requestedVote;

        try {
            setVotingCommentId(comment.id);
            await voteComment(comment.id, isUpvote);

            setQuestionData((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    comments: (prev.comments || []).map((item) => {
                        if (item.id !== comment.id) return item;

                        let nextUpvoteCount = item.upvoteCount;
                        let nextDownvoteCount = item.downvoteCount;

                        if (previousVote === 'upvote') nextUpvoteCount = Math.max(0, nextUpvoteCount - 1);
                        if (previousVote === 'downvote') nextDownvoteCount = Math.max(0, nextDownvoteCount - 1);

                        if (nextVote === 'upvote') nextUpvoteCount += 1;
                        if (nextVote === 'downvote') nextDownvoteCount += 1;

                        return {
                            ...item,
                            upvoteCount: nextUpvoteCount,
                            downvoteCount: nextDownvoteCount,
                            totalVotes: nextUpvoteCount - nextDownvoteCount,
                            currentUserVoteIsUpvote: nextVote === 'upvote' ? true : nextVote === 'downvote' ? false : null,
                            currentUserVoteType: nextVote,
                        };
                    }),
                };
            });

            setLocalVoteByCommentId((prev) => ({
                ...prev,
                [comment.id]: nextVote,
            }));
        } catch (error) {
            console.error('Failed to vote comment:', error);
            toast.error('Không thể vote bình luận. Vui lòng thử lại.');
        } finally {
            setVotingCommentId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4">
                    <DialogHeader className="flex-1">
                        <DialogTitle className="text-xl font-semibold text-white">
                            Chi tiết câu hỏi đóng góp #{questionId}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Xem thông tin chi tiết câu hỏi phỏng vấn được đóng góp.
                        </DialogDescription>
                    </DialogHeader>
                    {onSaveToggle && (
                        <button
                            onClick={onSaveToggle}
                            className={`p-2 rounded-lg transition-colors mt-1 ${
                                isSaved
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
                            <div className="w-full min-h-32 rounded-lg px-4 py-3 bg-slate-800/40 border border-slate-700 text-slate-100 text-sm whitespace-pre-wrap">
                                {questionData.content || 'Không có nội dung'}
                            </div>
                        </div>

                        {/* Sample Answer */}
                        {questionData.sampleAnswer && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Câu trả lời
                                </label>
                                <div className="w-full min-h-40 rounded-lg px-4 py-3 bg-slate-800/40 border border-slate-700 text-slate-100 text-sm whitespace-pre-wrap">
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

                        {/* Comments */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-200">
                                    Bình luận
                                </label>
                                <span className="text-xs text-slate-400">
                                    {sortedComments.length} bình luận
                                </span>
                            </div>

                            {isLoggedIn ? (
                                <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 space-y-2">
                                    <Textarea
                                        value={newCommentContent}
                                        onChange={(event) => setNewCommentContent(event.target.value)}
                                        placeholder="Viết bình luận của bạn..."
                                        className="min-h-24 bg-slate-900/60 border-slate-700 text-slate-100"
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={handleCreateComment}
                                            disabled={isCreatingComment || !newCommentContent.trim()}
                                        >
                                            <Send className="w-4 h-4" />
                                            {isCreatingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 text-sm text-slate-300">
                                    Vui lòng đăng nhập để sử dụng chức năng bình luận.
                                </div>
                            )}

                            <div className="space-y-3">
                                {sortedComments.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400 text-center">
                                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận.
                                    </div>
                                ) : (
                                    sortedComments.map((comment) => {
                                        const isOwn = isOwnComment(comment.userId);
                                        const isEditing = editingCommentId === comment.id;
                                        const currentVote = localVoteByCommentId[comment.id] ?? getInitialVoteType(comment);

                                        return (
                                            <div
                                                key={comment.id}
                                                className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 space-y-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-200">
                                                            {comment.userName || 'Ẩn danh'}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {formatCommentDate(comment.createdAt)}
                                                            {comment.updatedAt && comment.updatedAt !== comment.createdAt ? ' (đã chỉnh sửa)' : ''}
                                                        </p>
                                                    </div>

                                                    {isLoggedIn && isOwn && (
                                                        <div className="flex items-center gap-2">
                                                            {!isEditing ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStartEditComment(comment)}
                                                                        className="text-xs text-slate-400 hover:text-sky-300 transition-colors"
                                                                    >
                                                                        Chỉnh sửa
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setCommentToDeleteId(comment.id)}
                                                                        disabled={deletingCommentId === comment.id}
                                                                        className="text-xs text-slate-400 hover:text-red-300 transition-colors disabled:opacity-60"
                                                                    >
                                                                        Xoá
                                                                    </button>
                                                                </>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </div>

                                                {!isEditing ? (
                                                    <p className="text-sm text-slate-100 whitespace-pre-wrap">
                                                        {comment.content}
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            value={editingCommentContent}
                                                            onChange={(event) => setEditingCommentContent(event.target.value)}
                                                            className="min-h-20 bg-slate-900/60 border-slate-700 text-slate-100"
                                                        />
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleCancelEditComment}
                                                                disabled={isSavingEdit}
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Huỷ
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => handleSaveEditComment(comment.id)}
                                                                disabled={isSavingEdit || !editingCommentContent.trim()}
                                                            >
                                                                <Save className="w-4 h-4" />
                                                                {isSavingEdit ? 'Đang lưu...' : 'Lưu'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVoteComment(comment, true)}
                                                        disabled={!isLoggedIn || votingCommentId === comment.id}
                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs transition-colors ${
                                                            currentVote === 'upvote'
                                                                ? 'border-emerald-400/60 text-emerald-300 bg-emerald-500/10'
                                                                : 'border-slate-600 text-slate-300 hover:border-emerald-500/50'
                                                        } disabled:opacity-60`}
                                                    >
                                                        <ThumbsUp className="w-3.5 h-3.5" />
                                                        {comment.upvoteCount}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleVoteComment(comment, false)}
                                                        disabled={!isLoggedIn || votingCommentId === comment.id}
                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs transition-colors ${
                                                            currentVote === 'downvote'
                                                                ? 'border-rose-400/60 text-rose-300 bg-rose-500/10'
                                                                : 'border-slate-600 text-slate-300 hover:border-rose-500/50'
                                                        } disabled:opacity-60`}
                                                    >
                                                        <ThumbsDown className="w-3.5 h-3.5" />
                                                        {comment.downvoteCount}
                                                    </button>

                                                    <span className="text-sm font-semibold text-violet-400 ml-1">
                                                        {comment.totalVotes}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Footer with Close Button */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                            {onSaveToggle ? (
                                <button
                                    onClick={onSaveToggle}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                                        isSaved
                                            ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10'
                                            : 'border-slate-600 text-slate-400 hover:border-yellow-500/50 hover:text-yellow-400'
                                    }`}
                                >
                                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                    {isSaved ? 'Đã lưu' : 'Lưu câu hỏi'}
                                </button>
                            ) : <div />}
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

                <AlertDialog open={commentToDeleteId !== null} onOpenChange={(openState) => {
                    if (!openState && deletingCommentId === null) {
                        setCommentToDeleteId(null);
                    }
                }}>
                    <AlertDialogContent className="border-slate-700 bg-slate-900 text-slate-100">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Xoá bình luận?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-300">
                                Hành động này không thể hoàn tác. Bình luận của bạn sẽ bị xoá vĩnh viễn.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-slate-600 text-slate-200 hover:bg-slate-800">
                                Huỷ
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-500/20 border border-red-500/50 text-red-200 hover:bg-red-500/30"
                                disabled={commentToDeleteId === null || deletingCommentId !== null}
                                onClick={() => {
                                    if (commentToDeleteId !== null) {
                                        void handleDeleteComment(commentToDeleteId);
                                    }
                                }}
                            >
                                {deletingCommentId !== null ? 'Đang xoá...' : 'Xoá bình luận'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogContent>
        </Dialog>
    );
}
