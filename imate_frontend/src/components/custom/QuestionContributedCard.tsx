import React from 'react';
import { Eye, Bookmark } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';

interface QuestionContributedCardProps {
  id: number;
  title: string;
  description: string;
  author: string;
  company: string;
  timeAgo: string;
  skills: string[];
  position: string;
  level: string;
  rating: number; // 1-5
  onView?: () => void;
  onSave?: () => void;
}

const QuestionContributedCard: React.FC<QuestionContributedCardProps> = ({
  title,
  description,
  author,
  company,
  timeAgo,
  skills,
  position,
  level,
  rating,
  onView,
  onSave,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getLevelStatus = (level: string): "active" | "pending" | "error" | "inactive" | "draft" => {
    const levelLower = level.toLowerCase();
    if (levelLower === 'intern' || levelLower === 'fresher') return 'active';
    if (levelLower === 'junior' || levelLower === 'middle') return 'pending';
    if (levelLower === 'senior') return 'error';
    return 'inactive';
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`material-symbols-outlined text-sm ${
          index < rating ? 'text-yellow-500 fill-current' : 'text-slate-600'
        }`}
      >
        star
      </span>
    ));
  };

  return (
    <div className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
      {/* Header: Author & Company */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-indigo-400">
            {getInitials(author)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{author}</p>
            <p className="text-xs text-slate-500">
              Đăng bởi {author} • {timeAgo}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-400">
          {company}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors cursor-pointer">
        {title}
      </h3>

      {/* Description */}
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {skills.slice(0, 3).map((skill, idx) => (
          <StatusBadge key={idx} status="inactive">
            {skill}
          </StatusBadge>
        ))}
        <StatusBadge status="draft">{position}</StatusBadge>
        <StatusBadge status={getLevelStatus(level)}>{level}</StatusBadge>
      </div>

      {/* Footer: Rating & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          {/* Star Rating */}
          <div className="flex items-center gap-1">{renderStars()}</div>

          {/* Save Button */}
          <button
            onClick={onSave}
            className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors text-xs"
          >
            <Bookmark className="w-4 h-4" />
            Lưu
          </button>
        </div>

        {/* View Detail Button */}
        <button
          onClick={onView}
          className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-white/10 flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default QuestionContributedCard;
