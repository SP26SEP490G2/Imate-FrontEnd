import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    MapPin,
    DollarSign,
    Building2,
    Filter,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getListPosition } from "@/services/positionService";
import { getAllSkill } from "@/services/skillService";
import { getCandidateJobList } from "@/services/recruiterService";
import type { CandidateJobItem, CandidateJobListResponse } from "@/types/common/recruiter";


interface FilterState {
    searchTerm: string;
    location: string;
    employmentType: string;
    jobSkillIds: number[];
    jobPositionIds: number[];
}

const ViewJobApplications: React.FC = () => {
    const navigate = useNavigate();

    // Data States
    const [jobs, setJobs] = useState<CandidateJobItem[]>([]);
    const [positions, setPositions] = useState<{ id: number; name: string }[]>([]);
    const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [jobsPerPage, setJobsPerPage] = useState(10);

    // Filter States
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: "",
        location: "",
        employmentType: "All",
        jobSkillIds: [],
        jobPositionIds: [],
    });

    const [tempSearchTerm, setTempSearchTerm] = useState("");
    const [tempLocation, setTempLocation] = useState("");

    // Fetch Filter Options (Skills & Positions)
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [posRes, skillRes] = await Promise.all([
                    getListPosition(1, 100, true, ""),
                    getAllSkill(1, 100, true, "")
                ]);

                if (posRes) setPositions(posRes.items.map(p => ({ id: p.id, name: p.name })));
                if (skillRes) setSkills(skillRes.items.map(s => ({ id: s.id, name: s.name })));
            } catch (error) {
                console.error("Error fetching filters:", error);
            }
        };
        fetchFilters();
    }, []);

    // Fetch Jobs from API
    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = {
                pageNumber: currentPage,
                pageSize: jobsPerPage,
                searchTerm: filters.searchTerm || undefined,
                location: filters.location || undefined,
                employmentType: filters.employmentType === "All" ? undefined : filters.employmentType,
                jobSkillIds: filters.jobSkillIds.length > 0 ? filters.jobSkillIds : undefined,
                jobPositionIds: filters.jobPositionIds.length > 0 ? filters.jobPositionIds : undefined,
            };

            const response = await getCandidateJobList(queryParams);
            const data = response as CandidateJobListResponse;

            setJobs(data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalCount(data.totalCount || 0);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            setJobs([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, jobsPerPage]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleApplyFilters = () => {
        setFilters(prev => ({
            ...prev,
            searchTerm: tempSearchTerm,
            location: tempLocation
        }));
        setCurrentPage(1);
    };

    const toggleSkill = (id: number) => {
        setFilters(prev => ({
            ...prev,
            jobSkillIds: prev.jobSkillIds.includes(id)
                ? prev.jobSkillIds.filter(s => s !== id)
                : [...prev.jobSkillIds, id]
        }));
        setCurrentPage(1);
    };

    const togglePosition = (id: number) => {
        setFilters(prev => ({
            ...prev,
            jobPositionIds: prev.jobPositionIds.includes(id)
                ? prev.jobPositionIds.filter(p => p !== id)
                : [...prev.jobPositionIds, id]
        }));
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-[#050816] text-white p-6 md:p-10 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/10 blur-[110px] rounded-full" />

            <div className="max-w-[1400px] mx-auto relative z-10">
                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Khám phá cơ hội nghề nghiệp
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        Tìm kiếm hàng nghìn tin tuyển dụng từ các công ty hàng đầu. Kết nối với nhà tuyển dụng và ứng tuyển ngay hôm nay.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar Filters */}
                    <aside className="w-full lg:w-80 shrink-0 space-y-6">
                        <div className="bg-[#11142D] border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-sm sticky top-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Filter size={18} className="text-purple-400" /> Bộ lọc tìm kiếm
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-slate-400 hover:text-white"
                                    onClick={() => {
                                        setTempSearchTerm("");
                                        setTempLocation("");
                                        setFilters({
                                            searchTerm: "",
                                            location: "",
                                            employmentType: "All",
                                            jobSkillIds: [],
                                            jobPositionIds: [],
                                        });
                                        setCurrentPage(1);
                                    }}
                                >
                                    Xóa tất cả
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* Keyword */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Từ khóa</label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Tên công việc, skill..."
                                            value={tempSearchTerm}
                                            onChange={(e) => setTempSearchTerm(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                            className="bg-[#0F1333] border-white/5 border focus:border-purple-500/50 h-10 rounded-xl text-slate-200 pl-9"
                                        />
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Địa điểm</label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Thành phố, khu vực..."
                                            value={tempLocation}
                                            onChange={(e) => setTempLocation(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                            className="bg-[#0F1333] border-white/5 border focus:border-purple-500/50 h-10 rounded-xl text-slate-200 pl-9"
                                        />
                                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    </div>
                                </div>

                                {/* Employment Type */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Hình thức làm việc</label>
                                    <Select
                                        value={filters.employmentType}
                                        onValueChange={(val) => {
                                            setFilters(prev => ({ ...prev, employmentType: val }));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="bg-[#0F1333] border-white/5 h-10 rounded-xl text-slate-200">
                                            <SelectValue placeholder="Chọn hình thức" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#11142D] border-white/10 text-white">
                                            <SelectItem value="All">Tất cả hình thức</SelectItem>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                            <SelectItem value="Freelance">Freelance</SelectItem>
                                            <SelectItem value="Internship">Internship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Positions */}
                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Vị trí công việc</label>
                                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                                        {positions.map(pos => (
                                            <div key={pos.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${pos.id}`}
                                                    checked={filters.jobPositionIds.includes(pos.id)}
                                                    onCheckedChange={() => togglePosition(pos.id)}
                                                    className="border-white/20 data-[state=checked]:bg-purple-600"
                                                />
                                                <label htmlFor={`${pos.id}`} className="text-sm text-slate-300 cursor-pointer select-none">
                                                    {pos.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Kỹ năng</label>
                                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                                        {skills.map(skill => (
                                            <div key={skill.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${skill.id}`}
                                                    checked={filters.jobSkillIds.includes(skill.id)}
                                                    onCheckedChange={() => toggleSkill(skill.id)}
                                                    className="border-white/20 data-[state=checked]:bg-purple-600"
                                                />
                                                <label htmlFor={`${skill.id}`} className="text-sm text-slate-300 cursor-pointer select-none">
                                                    {skill.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleApplyFilters}
                                    className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold shadow-lg shadow-indigo-600/20 cursor-pointer"
                                >
                                    Áp dụng lọc
                                </Button>
                            </div>
                        </div>
                    </aside>

                    {/* Job listing area */}
                    <div className="flex-1">
                        {/* Loading State */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 size={40} className="animate-spin text-purple-500" />
                                <p className="text-slate-400 animate-pulse">Đang tải danh sách công việc...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="bg-[#11142D] border border-white/10 rounded-2xl p-20 text-center">
                                <Building2 size={60} className="mx-auto text-slate-700 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Không tìm thấy công việc phù hợp</h3>
                                <p className="text-slate-400">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                                <Button
                                    variant="ghost"
                                    className="text-purple-400 mt-4 hover:bg-purple-500/10"
                                    onClick={() => {
                                        setTempSearchTerm("");
                                        setTempLocation("");
                                        setFilters({
                                            searchTerm: "",
                                            location: "",
                                            employmentType: "All",
                                            jobSkillIds: [],
                                            jobPositionIds: [],
                                        });
                                    }}
                                >
                                    Đặt lại tất cả bộ lọc
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6 px-1">
                                    <p className="text-sm text-slate-400">
                                        Hiển thị <span className="text-white font-medium">{jobs.length}</span> công việc
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                    {jobs.map((job) => (
                                        <div key={job.id} className="group bg-[#11142D] border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300 flex flex-col h-full shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 relative overflow-hidden">
                                            {/* Card Glow Effect */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-2xl group-hover:bg-purple-600/10 transition-all" />

                                            {/* Header: Logo + Basic Info */}
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="w-14 h-14 rounded-2xl bg-white p-1.5 overflow-hidden shadow-inner flex items-center justify-center shrink-0 border border-white/10">
                                                    <img
                                                        src={job.companyRecruiter?.companyLogo || "https://api.dicebear.com/7.x/initials/svg?seed=Company"}
                                                        alt={job.companyRecruiter?.companyName || "Company"}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] py-1 px-3 rounded-full">
                                                    {job.employmentType}
                                                </Badge>
                                            </div>

                                            {/* Job Details */}
                                            <div className="flex-1">
                                                <h3 className="font-bold text-xl mb-1.5 line-clamp-1 text-slate-100 group-hover:text-purple-400 transition-colors" title={job.title}>
                                                    {job.title}
                                                </h3>
                                                <p className="text-purple-400 text-sm font-semibold mb-4 flex items-center gap-2">
                                                    <Building2 size={16} /> {job.companyRecruiter?.companyName || "Công ty chưa xác định"}
                                                </p>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                                    <div className="flex items-center gap-2.5 text-slate-400 text-xs py-1.5 px-3 rounded-lg bg-[#0F1333]">
                                                        <MapPin size={14} className="text-slate-500" />
                                                        <span className="truncate">{job.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-bold py-1.5 px-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                        <DollarSign size={14} className="shrink-0" />
                                                        <span>${job.minSalary.toLocaleString('en-US')} VNĐ - ${job.maxSalary.toLocaleString('en-US')} VNĐ</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {job.jobSkills.slice(0, 4).map((skill) => (
                                                        <span key={skill.id} className="bg-[#0F1333] text-slate-300 px-2.5 py-1 rounded-md text-[11px] border border-white/5 transition-colors hover:border-purple-500/30">
                                                            {skill.skillName}
                                                        </span>
                                                    ))}
                                                    {job.jobPositions.map((pos) => (
                                                        <span key={pos.id} className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md text-[11px] border border-indigo-500/20">
                                                            {pos.positionName}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <Button
                                                onClick={() => navigate(`/view-job-applications/${job.id}`)}
                                                className="w-full h-11 rounded-xl bg-slate-800/50 hover:bg-purple-600 transition-all text-sm font-bold border border-white/5 group-hover:border-purple-500/50 cursor-pointer shadow-lg"
                                            >
                                                Xem chi tiết công việc
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination - Matching JobPostingList (Table) Style */}
                                <div className="flex items-center justify-between border-t border-white/10 bg-[#11142D]/40 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-sm">
                                    {/* Result Info */}
                                    <div className="text-sm text-slate-400">
                                        {totalCount === 0 ? (
                                            <span>Không có kết quả</span>
                                        ) : (
                                            <>
                                                Hiển thị{" "}
                                                <span className="font-semibold text-slate-200">
                                                    {(currentPage - 1) * jobsPerPage + 1}
                                                </span>
                                                {" - "}
                                                <span className="font-semibold text-slate-200">
                                                    {Math.min(currentPage * jobsPerPage, totalCount)}
                                                </span>
                                                {" của "}
                                                <span className="font-semibold text-slate-200">
                                                    {totalCount}
                                                </span>{" "}
                                                kết quả
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {/* Page Size Selector */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Số lượng:</span>
                                            <select
                                                value={jobsPerPage}
                                                onChange={(e) => {
                                                    setJobsPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                                className="bg-[#0F1333] border border-white/10 text-sm rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                                            >
                                                <option value={5}>5</option>
                                                <option value={10}>10</option>
                                                <option value={20}>20</option>
                                                <option value={50}>50</option>
                                            </select>
                                        </div>

                                        {/* Navigation Buttons */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(1)}
                                                className="h-9 w-9 p-0 rounded-xl hover:bg-purple-600/20 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer"
                                            >
                                                <ChevronsLeft size={18} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                className="h-9 w-9 p-0 rounded-xl hover:bg-purple-600/20 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer"
                                            >
                                                <ChevronLeft size={18} />
                                            </Button>

                                            {/* Page Numbers Window */}
                                            <div className="flex items-center gap-1.5 px-2">
                                                {(() => {
                                                    const pages = [];
                                                    let startPage = Math.max(1, currentPage - 2);
                                                    let endPage = Math.min(totalPages, currentPage + 2);

                                                    if (currentPage <= 3) endPage = Math.min(5, totalPages);
                                                    if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - 4);

                                                    for (let i = startPage; i <= endPage; i++) {
                                                        pages.push(
                                                            <Button
                                                                key={i}
                                                                size="sm"
                                                                variant={i === currentPage ? "primary" : "ghost"}
                                                                onClick={() => setCurrentPage(i)}
                                                                className={`h-9 min-w-[36px] rounded-xl font-bold transition-all duration-300 ${i === currentPage
                                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-purple-600/20"
                                                                    : "hover:bg-purple-600/20 text-slate-400"
                                                                    } cursor-pointer`}
                                                            >
                                                                {i}
                                                            </Button>
                                                        );
                                                    }
                                                    return pages;
                                                })()}
                                            </div>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                className="h-9 w-9 p-0 rounded-xl hover:bg-purple-600/20 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer"
                                            >
                                                <ChevronRight size={18} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(totalPages)}
                                                className="h-9 w-9 p-0 rounded-xl hover:bg-purple-600/20 disabled:text-slate-600 disabled:hover:bg-transparent cursor-pointer"
                                            >
                                                <ChevronsRight size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewJobApplications;
