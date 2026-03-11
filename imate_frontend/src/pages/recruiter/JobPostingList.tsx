import React, { useEffect, useState } from "react";
import type { JobItem, JobResponse } from "@/types/common/recruiter";
import { getRecruiterJobApplications } from "@/services/recruiterService_PhuDK/recruiterService";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination";
import UpdateJobPostModal from "@/dialog/recruiter/UpdateJobPostModal";
const JobPostingList: React.FC = () => {
    const [data, setData] = useState<JobResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [location, setLocation] = useState<string | undefined>();
    const [employmentType, setEmploymentType] = useState<string | undefined>();

    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 5;

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

    const handleEdit = (job: JobItem) => {
        setSelectedJob(job);
        setShowEditModal(true);
    };


    const fetchJobs = async () => {
        try {
            setLoading(true);

            const result = await getRecruiterJobApplications({
                pageNumber,
                pageSize,
                searchTerm,
                location,
                employmentType,
            });

            setData({
                pageNumber: result.pageNumber,
                totalPages: result.totalPages,
                totalCount: result.totalCount,
                items: result.items,
            });
        } catch (err) {
            console.error("Error fetching jobs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (pageNumber === 1) {
            fetchJobs();
        } else {
            setPageNumber(1);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [pageNumber]);

    const formatSalary = (min: number, max: number) => {
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Open":
                return "bg-green-500/10 text-green-400 border-green-500/20";
            case "Closed":
                return "bg-red-500/10 text-red-400 border-red-500/20";
            default:
                return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    return (
        <div className="bg-[#020617] min-h-screen font-sans">
            <main className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">

                    {/* HEADER */}

                    <div className="mb-10">
                        <h1 className="text-4xl font-extrabold text-white mb-3">
                            Recruiter Job Management
                        </h1>

                        <p className="text-slate-400">
                            Quản lý danh sách công việc mà bạn đã đăng tuyển.
                        </p>
                    </div>

                    {/* FILTER */}

                    <section className="bg-[#1e293b]/40 p-6 rounded-2xl border border-white/5 mb-8 flex flex-col lg:flex-row gap-4 items-end">

                        {/* Search */}

                        <div className="flex-1 space-y-2 w-full">
                            <label className="text-xs font-bold text-slate-400 uppercase">
                                Search Job
                            </label>

                            <input
                                type="text"
                                placeholder="Search by title..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Location */}

                        <div className="w-full lg:w-48 space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">
                                Location
                            </label>

                            <input
                                type="text"
                                placeholder="Search by location..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        {/* Employment Type */}

                        <div className="w-full lg:w-48 space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">
                                Employment
                            </label>

                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300"
                                onChange={(e) => setEmploymentType(e.target.value)}>
                                <option value="">All</option>
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Internship</option>
                            </select>
                        </div>

                        {/* Button */}

                        <button
                            onClick={handleSearch}
                            className="bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-sm">
                            Search
                        </button>
                    </section>

                    {/* TABLE */}

                    <div className="overflow-x-auto rounded-2xl border border-white/5">
                        <table className="w-full text-left bg-[#1e293b]/40">

                            <thead>
                                <tr className="bg-white/5 text-slate-400 text-xs uppercase border-b border-white/10">
                                    <th className="px-8 py-5">Title</th>
                                    <th className="px-6 py-5">Employment</th>
                                    <th className="px-6 py-5">Location</th>
                                    <th className="px-6 py-5">Salary</th>
                                    <th className="px-6 py-5">Deadline</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-white/5">

                                {loading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-6">
                                                <div className="h-4 bg-slate-700 rounded w-40" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    data?.items.map((job) => (

                                        <tr key={job.id} className="hover:bg-white/5 transition-all">

                                            <td className="px-8 py-6 text-white font-semibold">
                                                {job.title}
                                            </td>

                                            <td className="px-6 py-6 text-slate-300">
                                                {job.employmentType}
                                            </td>

                                            <td className="px-6 py-6 text-slate-300">
                                                {job.location}
                                            </td>

                                            <td className="px-6 py-6 text-slate-300">
                                                {formatSalary(job.minSalary, job.maxSalary)}
                                            </td>

                                            <td className="px-6 py-6 text-slate-300">
                                                {new Date(job.applicationDeadline).toLocaleDateString()}
                                            </td>

                                            <td className="px-6 py-6">
                                                <span
                                                    className={`px-3 py-1 rounded-md text-xs font-bold border ${getStatusColor(
                                                        job.status
                                                    )}`}>
                                                    {job.status}
                                                </span>
                                            </td>

                                            {/* ACTION */}

                                            <td className="px-8 py-6 text-right flex justify-end gap-2">

                                                {/* Edit */}

                                                <button onClick={() => handleEdit(job)}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500 text-slate-400 hover:text-white cursor-pointer">
                                                    <span className="material-symbols-outlined">
                                                        edit
                                                    </span>
                                                </button>

                                                {/* View Candidates */}

                                                <button
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-green-500 text-slate-400 hover:text-white cursor-pointer">
                                                    <span className="material-symbols-outlined">
                                                        group
                                                    </span>
                                                </button>

                                                {/* Close Job */}

                                                <button
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500 text-slate-400 hover:text-white cursor-pointer">
                                                    <span className="material-symbols-outlined">
                                                        Cancel
                                                    </span>
                                                </button>

                                            </td>
                                        </tr>

                                    ))
                                )}

                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {data && data.totalPages > 0 && (
                        <div className="flex items-center justify-between pb-10 mt-8">
                            <p className="text-sm text-[#6B6F8E]">
                                Hiển thị <span className="text-white font-medium">{(pageNumber - 1) * pageSize + 1}-{Math.min(pageNumber * pageSize, data.totalCount)}</span> trên <span className="text-white font-medium">{data.totalCount}</span> kết quả
                            </p>
                            <Pagination className="justify-end w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <button
                                            disabled={pageNumber === 1}
                                            className="h-9 w-9 border border-white/10 bg-[#11142D] text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-lg flex items-center justify-center transition-all"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (pageNumber > 1) setPageNumber(pageNumber - 1);
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                                        </button>
                                    </PaginationItem>

                                    {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => {
                                        const isNearCurrent = Math.abs(page - pageNumber) <= 1;
                                        const isFirstOrLast = page === 1 || page === data.totalPages;

                                        if (data.totalPages <= 5 || isFirstOrLast || isNearCurrent) {
                                            return (
                                                <PaginationItem key={page}>
                                                    <button
                                                        className={`h-9 w-9 cursor-pointer rounded-lg text-xs font-bold transition-all ${pageNumber === page
                                                                ? "bg-[#6C63FF] text-white hover:bg-[#5D54E5]"
                                                                : "bg-transparent text-[#6B6F8E] hover:text-white hover:bg-white/5 border border-transparent"
                                                            }`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setPageNumber(page);
                                                        }}
                                                    >
                                                        {page}
                                                    </button>
                                                </PaginationItem>
                                            );
                                        }

                                        if (page === 2 && pageNumber > 3) {
                                            return (
                                                <PaginationItem key="ellipsis-start">
                                                    <span className="text-[#6B6F8E] px-2">...</span>
                                                </PaginationItem>
                                            );
                                        }
                                        if (page === data.totalPages - 1 && pageNumber < data.totalPages - 2) {
                                            return (
                                                <PaginationItem key="ellipsis-end">
                                                    <span className="text-[#6B6F8E] px-2">...</span>
                                                </PaginationItem>
                                            );
                                        }

                                        return null;
                                    })}

                                    <PaginationItem>
                                        <button
                                            disabled={pageNumber === data.totalPages}
                                            className="h-9 w-9 border border-white/10 bg-[#11142D] text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-lg flex items-center justify-center transition-all"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (pageNumber < data.totalPages) setPageNumber(pageNumber + 1);
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                                        </button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </main>
            {showEditModal && selectedJob && (
                <UpdateJobPostModal
                    open={showEditModal}
                    job={selectedJob}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={fetchJobs}
                />
            )}
        </div>

    );

};
export default JobPostingList;