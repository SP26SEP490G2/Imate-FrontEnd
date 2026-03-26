import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getListPreviewMentors } from '@/services/mentorService';
import { getAllPositions, getAllSkills, getAllCompanies } from '@/services/commonService';
import type { ListPreviewMentorResponse } from '@/types/common/mentor';
import type { PositionItem, SkillItem, CompanyItem } from '@/types/common/question';
import { Search, Star } from 'lucide-react';

const PAGE_SIZE = 8;

const MentorList: React.FC = () => {
  const [mentors, setMentors] = useState<ListPreviewMentorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  const [filterPosition, setFilterPosition] = useState<string>('');
  const [filterSkill, setFilterSkill] = useState<string>('');
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getListPreviewMentors({ 
        pageNumber, 
        pageSize: PAGE_SIZE,
        positionName: activeTag || filterPosition,
        skillName: filterSkill,
        companyName: filterCompany
      });
      setMentors(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to fetch mentors:', err);
      setError('Không thể tải danh sách mentor. Vui lòng thử lại sau.');
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, filterPosition, filterSkill, filterCompany, activeTag]);

  const fetchFilters = useCallback(async () => {
    setFiltersLoading(true);
    try {
      const [posRes, skillRes, companyRes] = await Promise.all([
        getAllPositions({ pageNumber: 1, pageSize: 100, isActive: true }),
        getAllSkills({ pageNumber: 1, pageSize: 100, isActive: true }),
        getAllCompanies({ pageNumber: 1, pageSize: 100, isActive: true }),
      ]);
      setPositions(Array.isArray(posRes?.data) ? posRes.data : []);
      setSkills(Array.isArray(skillRes?.data) ? skillRes.data : []);
      setCompanies(Array.isArray(companyRes?.data) ? companyRes.data : []);
    } catch (err) {
      console.error('Failed to load filter options (positions/skills/companies):', err);
      setPositions([]);
      setSkills([]);
      setCompanies([]);
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  // Server handles filtering now, so we just return the fetched mentors.
  // We keep this useMemo to maintain compatibility with the rest of the component.
  const filteredMentors = useMemo(() => {
    return mentors;
  }, [mentors]);

  const visibleMentors = filteredMentors;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
  };

  const getAvatarUrl = (mentor: ListPreviewMentorResponse) => {
    if (mentor.avatarUrl) return mentor.avatarUrl;
    const seed = mentor.accountId ?? mentor.fullName ?? 'mentor';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(seed))}`;
  };

  const displayBio = (mentor: ListPreviewMentorResponse) => {
    return mentor.bio?.trim() || '—';
  };

  const popularPositionNames = useMemo(() => positions.slice(0, 6).map((p) => p.name), [positions]);

  return (
    <div className="font-sans min-h-screen bg-[#0a0b14]">
      <main>
        {/* Hero */}
        <section className="relative pt-16 pb-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-transparent to-purple-950/30" />
          <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                Kết nối với chuyên gia hàng đầu
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
                Học hỏi từ những người đi trước để bứt phá sự nghiệp IT của bạn thông qua các buổi cố vấn 1:1 chuyên sâu.
              </p>
              {!loading && mentors.length > 0 && (
                <p className="text-sm text-slate-400">{mentors.length} mentor sẵn sàng đồng hành</p>
              )}
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#11142D]">
              <div className="w-full h-80 flex items-center justify-center text-slate-500">
                <span className="text-sm">Kết nối Mentor</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="px-6 pb-8 -mt-4">
          <div className="max-w-7xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 mb-4">
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="h-11 px-4 rounded-xl bg-[#11142D] border border-white/10 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[160px]"
                disabled={filtersLoading}
              >
                <option value="">{filtersLoading && positions.length === 0 ? 'Đang tải...' : 'Vị trí'}</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="h-11 px-4 rounded-xl bg-[#11142D] border border-white/10 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[160px]"
                disabled={filtersLoading}
              >
                <option value="">{filtersLoading && skills.length === 0 ? 'Đang tải...' : 'Kỹ năng'}</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="h-11 px-4 rounded-xl bg-[#11142D] border border-white/10 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[160px]"
                disabled={filtersLoading}
              >
                <option value="">{filtersLoading && companies.length === 0 ? 'Đang tải...' : 'Công ty'}</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="h-11 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold flex items-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                Tìm kiếm
              </button>
            </form>
            {popularPositionNames.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Vị trí:</span>
              {popularPositionNames.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTag === tag
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            )}
          </div>
        </section>

        {/* Mentor grid */}
        <section className="px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            {loading && (
              <div className="flex justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-center">
                {error}
              </div>
            )}
            {!loading && !error && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {visibleMentors.map((mentor, index) => {
                    const detailHref = mentor.accountId != null ? `/view-mentor/${mentor.accountId}` : '#';
                    return (
                      <div
                        key={`${mentor.fullName}-${index}`}
                        className="rounded-2xl border border-white/10 bg-[#11142D] p-5 flex flex-col hover:border-indigo-500/30 transition-all duration-300"
                      >
                        <Link
                          to={detailHref}
                          className="flex flex-col flex-1 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                        >
                          <div className="relative mb-4">
                            <span className="absolute top-0 left-0 z-10 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0a0b14]">
                              Mentor hàng đầu
                            </span>
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 mx-auto mt-2">
                              <img
                                src={getAvatarUrl(mentor)}
                                alt={mentor.fullName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-white text-center mb-1 hover:text-indigo-300 transition-colors">{mentor.fullName}</h3>
                          <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-semibold">{mentor.avgRatings?.toFixed(1) ?? '0.0'}</span>
                          </div>
                          <p className="text-sm font-medium text-indigo-400 text-center mb-1">{mentor.position || 'Mentor'}</p>
                          <p className="text-xs text-slate-400 text-center mb-3">{mentor.company || '—'}</p>
                          <p className="text-sm text-slate-300 line-clamp-3 flex-1 mb-3">{displayBio(mentor)}</p>
                          <p className="text-xs text-slate-500 mb-4">{mentor.totalRatingCount ?? 0} đánh giá</p>
                        </Link>
                        <Link
                          to={mentor.accountId ? `/view-mentor/${mentor.accountId}?book=true` : '/sign-in'}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-center hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20"
                        >
                          Đặt lịch
                        </Link>
                      </div>
                    );
                  })}
                </div>
                {filteredMentors.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    Không tìm thấy mentor nào phù hợp với bộ lọc.
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-10 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setPageNumber(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          pageNumber === page
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MentorList;
