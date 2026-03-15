import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    MapPin,
    DollarSign,
    Calendar,
    Building2,
    Globe,
    Phone,
    MapPinned,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

// Mock Data for Job Applications
const MOCK_JOBS = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    title: `Senior Software Engineer ${i + 1}`,
    jobDescription: "Join our dynamic team to build cutting-edge web applications using React, Node.js, and cloud technologies. You will be responsible for designing scalable systems and mentoring junior developers.",
    employmentType: i % 2 === 0 ? "Full-time" : "Contract",
    location: i % 3 === 0 ? "Ho Chi Minh City" : "Hanoi",
    minSalary: 1500 + i * 50,
    maxSalary: 3500 + i * 100,
    applicationDeadline: "2026-12-30",
    skills: ["React", "TypeScript", "Node.js", "AWS"],
    positions: ["Frontend", "Backend", "Fullstack"],
    company: {
        name: "TechNova Solutions",
        logo: "https://api.dicebear.com/7.x/initials/svg?seed=TN",
        website: "https://technova.io",
        size: "50-150 employees",
        phone: "+84 28 1234 5678",
        address: "72 Le Thanh Ton, District 1, HCMC"
    }
}));

const ViewJobApplications: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [location, setLocation] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 10;

    // Pagination logic
    const totalPages = Math.ceil(MOCK_JOBS.length / jobsPerPage);
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = MOCK_JOBS.slice(indexOfFirstJob, indexOfLastJob);

    return (
        <div className="min-h-screen bg-[#050816] text-white p-6 md:p-10 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/10 blur-[110px] rounded-full" />

            <div className="max-w-[1400px] mx-auto relative z-10">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Khám phá cơ hội nghề nghiệp
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        Tìm kiếm hàng nghìn tin tuyển dụng từ các công ty hàng đầu. Kết nối với nhà tuyển dụng và ứng tuyển ngay hôm nay.
                    </p>
                </div>

                {/* Search Bar Section */}
                <div className="bg-[#11142D] border border-white/10 rounded-2xl p-6 mb-12 shadow-2xl backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Search size={14} /> Chức danh, từ khóa...
                            </label>
                            <Input
                                placeholder="Ví dụ: React Developer"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-[#0F1333] border-white/5 focus:border-purple-500/50 h-12 rounded-xl text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <MapPin size={14} /> Địa điểm
                            </label>
                            <Input
                                placeholder="Toàn quốc / Remote"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="bg-[#0F1333] border-white/5 focus:border-purple-500/50 h-12 rounded-xl text-slate-200"
                            />
                        </div>
                        <Button className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold shadow-lg shadow-indigo-600/20 cursor-pointer">
                            Tìm kiếm ngay
                        </Button>
                    </div>
                </div>

                {/* Job Listing Grid (2x5 per page as per request) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                    {currentJobs.map((job) => (
                        <div key={job.id} className="group bg-[#11142D] border border-white/10 rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-300 flex flex-col h-full shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 relative overflow-hidden">
                            {/* Card Glow Effect */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 blur-2xl group-hover:bg-purple-600/10 transition-all" />

                            {/* Header: Logo + Basic Info */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-white p-1 overflow-hidden shadow-inner flex items-center justify-center shrink-0">
                                    <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain" />
                                </div>
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-none text-[10px] py-0 px-2">
                                    {job.employmentType}
                                </Badge>
                            </div>

                            {/* Job Details */}
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1 line-clamp-1 text-slate-100 group-hover:text-purple-400 transition-colors" title={job.title}>
                                    {job.title}
                                </h3>
                                <p className="text-purple-400 text-xs font-semibold mb-3 flex items-center gap-1.5">
                                    <Building2 size={12} /> {job.company.name}
                                </p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                                        <MapPin size={12} className="shrink-0" />
                                        <span className="truncate">{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                                        <DollarSign size={12} className="shrink-0" />
                                        <span>${job.minSalary} - ${job.maxSalary}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                        <Calendar size={12} className="shrink-0" />
                                        <span>Hạn: {new Date(job.applicationDeadline).toLocaleDateString("vi-VN")}</span>
                                    </div>
                                </div>

                                {/* Skills & Positions Tags */}
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {job.skills.map((skill, idx) => (
                                        <span key={idx} className="bg-[#0F1333] text-slate-400 px-2 py-0.5 rounded text-[10px] border border-white/5">
                                            {skill}
                                        </span>
                                    ))}
                                    {job.positions.map((pos, idx) => (
                                        <span key={idx} className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-[10px]">
                                            {pos}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Company Detail Accordion/Expand Pattern (Simplified for Card) */}
                            <div className="pt-4 border-t border-white/5 space-y-2 mt-auto">
                                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                                    <Globe size={11} className="text-slate-500" />
                                    <a href={job.company.website} target="_blank" className="hover:text-purple-400 transition underline truncate">
                                        Website
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                                    <Phone size={11} className="text-slate-500" />
                                    <span>{job.company.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                                    <MapPinned size={11} className="text-slate-500 shrink-0" />
                                    <span className="truncate">{job.company.address}</span>
                                </div>
                            </div>

                            {/* Action Overlay or Button */}
                            <Button 
                                onClick={() => navigate(`/view-job-applications/${job.id}`)}
                                className="w-full mt-4 h-9 rounded-lg bg-slate-800 hover:bg-purple-600 transition-colors text-xs font-bold border border-white/5 group-hover:border-purple-500/50 cursor-pointer"
                            >
                                Xem chi tiết
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center">
                    <Pagination>
                        <PaginationContent className="gap-2">
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className={`cursor-pointer bg-[#11142D] border-white/10 text-slate-400 hover:bg-purple-600 hover:text-white transition ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        isActive={currentPage === page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`cursor-pointer rounded-lg border-white/10 ${currentPage === page ? 'bg-purple-600 text-white border-purple-500' : 'bg-[#11142D] text-slate-400 hover:bg-slate-800'}`}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    className={`cursor-pointer bg-[#11142D] border-white/10 text-slate-400 hover:bg-purple-600 hover:text-white transition ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
};

export default ViewJobApplications;
