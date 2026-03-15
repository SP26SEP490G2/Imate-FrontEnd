import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Upload,
    FileText,
    CheckCircle2,
    X,
    Briefcase,
    Search,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

// Mock existing CVs for the candidate following UserCV entity structure
const MOCK_CVS = [
    {
        id: 1,
        accountId: 101,
        fileUrl: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf", // Sample PDF for preview
        fileName: "Le_Quang_Hieu_Software_Engineer.pdf",
        uploadDate: "2024-03-10T10:00:00Z",
        scannedData: "Software Engineer with 3 years experience...",
        createdAt: "2024-03-10T10:00:00Z"
    },
    {
        id: 2,
        accountId: 101,
        fileUrl: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
        fileName: "Product_Manager_CV_2023.pdf",
        uploadDate: "2023-11-15T14:30:00Z",
        scannedData: "Senior Product Manager...",
        createdAt: "2023-11-15T14:30:00Z"
    },
    {
        id: 3,
        accountId: 101,
        fileUrl: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
        fileName: "Frontend_Developer_Resume.pdf",
        uploadDate: "2024-01-20T09:15:00Z",
        scannedData: "Expert in React and Tailwind...",
        createdAt: "2024-01-20T09:15:00Z"
    }
];

interface CandidateApplyJobCvDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobTitle: string;
}

const CandidateApplyJobCvDialog: React.FC<CandidateApplyJobCvDialogProps> = ({
    open,
    onOpenChange,
    jobTitle
}) => {
    const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mode, setMode] = useState<"select" | "upload">("select");

    const handleApply = () => {
        if (mode === "select" && !selectedCvId) {
            toast.warning("Vui lòng chọn một CV từ hồ sơ của bạn.");
            return;
        }
        if (mode === "upload" && !uploadedFile) {
            toast.warning("Vui lòng tải lên một CV mới.");
            return;
        }

        toast.success("Hồ sơ đã được gửi thành công!");
        onOpenChange(false);
        // Reset state
        setSelectedCvId(null);
        setUploadedFile(null);
        setPreviewUrl(null);
    };

    const handleUnselect = () => {
        setSelectedCvId(null);
        setUploadedFile(null);
        setPreviewUrl(null);
        setMode("select");
        // Reset file input value
        const fileInput = document.getElementById('cv-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setMode("upload");
            setSelectedCvId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl border border-white/10 bg-[#11142D] text-white shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl rounded-3xl p-8">
                <DialogHeader className="mb-6 overflow-hidden">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3 truncate">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                            <Briefcase className="text-purple-400" size={20} />
                        </div>
                        <span className="truncate">Ứng tuyển công việc</span>
                    </DialogTitle>
                    <p className="text-slate-400 text-sm mt-2 truncate">
                        Vị trí hiện tại: <span className="text-purple-400 font-semibold">{jobTitle}</span>
                    </p>
                </DialogHeader>

                <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Top Section: Inputs Side-by-Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-3 min-w-0">
                            <Label className="text-slate-400 text-sm flex items-center gap-2">
                                <Search size={14} /> Chọn CV từ hồ sơ
                            </Label>
                            <Select
                                value={selectedCvId || ""}
                                onValueChange={(val) => {
                                    setSelectedCvId(val);
                                    setMode("select");
                                    setUploadedFile(null);
                                    const cv = MOCK_CVS.find(c => c.id.toString() === val);
                                    if (cv) setPreviewUrl(cv.fileUrl);
                                }}
                            >
                                <SelectTrigger className="w-full !h-12 bg-[#0F1333] border border-white/10 rounded-xl focus:ring-purple-500/20 hover:border-white/20 transition-all text-slate-200 cursor-pointer overflow-hidden px-4">
                                    <SelectValue placeholder="Chọn CV hiện có" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#11142D] border-white/10 text-white shadow-2xl rounded-xl">
                                    {MOCK_CVS.map((cv) => (
                                        <SelectItem key={cv.id} value={cv.id.toString()} className="focus:bg-purple-500/10 focus:text-purple-400 rounded-lg cursor-pointer">
                                            {cv.fileName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3 min-w-0">
                            <Label className="text-slate-400 text-sm flex items-center gap-2">
                                <Upload size={14} /> Tải lên CV mới
                            </Label>
                            <div className="relative h-12">
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="cv-upload"
                                />
                                <label
                                    htmlFor="cv-upload"
                                    className="flex items-center justify-center w-full h-full bg-[#0F1333] border border-dashed border-white/10 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-slate-400 text-sm font-medium cursor-pointer px-4 text-center truncate"
                                >
                                    {uploadedFile ? "Thay đổi CV" : "Chọn tệp tin (PDF, DOCX)"}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section: Selection Info & Preview */}
                    <div className="space-y-4">
                        <div className="bg-[#0F1333] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group max-w-full">
                            {/* Background Decor */}
                            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />

                            {(selectedCvId || uploadedFile) ? (
                                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-purple-500/30 transition-all shadow-inner shrink-0">
                                        <FileText size={24} className="text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-100 text-base mb-1 truncate" title={mode === "select" ? MOCK_CVS.find(cv => cv.id.toString() === selectedCvId)?.fileName : uploadedFile?.name}>
                                            {mode === "select"
                                                ? MOCK_CVS.find(cv => cv.id.toString() === selectedCvId)?.fileName
                                                : uploadedFile?.name}
                                        </p>
                                        <p className="text-slate-500 text-[10px] flex items-center gap-2 uppercase tracking-widest font-bold truncate">
                                            {mode === "select" ? (
                                                <>Đã chọn từ hồ sơ <CheckCircle2 size={10} className="text-emerald-500 shrink-0" /></>
                                            ) : (
                                                <>Mới tải lên <CheckCircle2 size={10} className="text-emerald-500 shrink-0" /></>
                                            )}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleUnselect();
                                        }}
                                        className="h-10 w-10 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 cursor-pointer shrink-0 transition-all z-20"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-4 opacity-30">
                                    <FileText size={32} className="mx-auto mb-2 text-slate-500" />
                                    <p className="text-xs font-medium">Chưa chọn nội dung hiển thị</p>
                                </div>
                            )}
                        </div>

                        {/* CV Preview Area */}
                        {previewUrl && (
                            <div className="w-full bg-[#0F1333] border border-white/10 rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                                <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Xem trước CV</span>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                    </div>
                                </div>
                                <div className="h-[400px] w-full">
                                    <iframe
                                        src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                        className="w-full h-full border-none"
                                        title="CV Preview"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-10 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            setSelectedCvId(null);
                            setUploadedFile(null);
                        }}
                        className="flex-1 h-12 rounded-xl border-white/10 hover:bg-white/5 text-slate-400 font-semibold cursor-pointer"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleApply}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold shadow-lg shadow-indigo-600/20 cursor-pointer transition-all hover:scale-[1.02]"
                    >
                        Ứng Tuyển
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CandidateApplyJobCvDialog;
