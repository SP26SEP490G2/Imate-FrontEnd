import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "@/components/Footer";
import type { JobItem, JobResponse } from "@/types/common/recruiter";
import { getRecruiterJobApplications } from "@/services/recruiterService_PhuDK/recruiterService";

const JobPostingList: React.FC = () => {
    const [data, setData] = useState<JobResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [location, setLocation] = useState<string | undefined>();
    const [employmentType, setEmploymentType] = useState<string | undefined>();

    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 5;


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
                jobs: result.data,
            });

        } catch (err) {
            console.error("Error fetching jobs:", err);
        } finally {
            setLoading(false);
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
                                onChange={(e) => setEmploymentType(e.target.value)}
                            >
                                <option value="">All</option>
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Internship</option>
                            </select>
                        </div>

                        {/* Button */}

                        <button
                            onClick={fetchJobs}
                            className="bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-sm"
                        >
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
                                    data?.jobs.map((job) => (

                                        <tr
                                            key={job.id}
                                            className="hover:bg-white/5 transition-all"
                                        >

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
                                                    )}`}
                                                >
                                                    {job.status}
                                                </span>
                                            </td>

                                            {/* ACTION */}

                                            <td className="px-8 py-6 text-right flex justify-end gap-2">

                                                {/* Edit */}

                                                <button
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500 text-slate-400 hover:text-white"
                                                >
                                                    <span className="material-symbols-outlined">
                                                        edit
                                                    </span>
                                                </button>

                                                {/* View Candidates */}

                                                <button
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-green-500 text-slate-400 hover:text-white"
                                                >
                                                    <span className="material-symbols-outlined">
                                                        group
                                                    </span>
                                                </button>

                                            </td>
                                        </tr>

                                    ))
                                )}

                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

        </div>
    );
};

export default JobPostingList;