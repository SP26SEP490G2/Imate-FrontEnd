import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { z } from "zod";
import { toast } from "react-toastify";
import { updateRecruiterProfile } from "@/services/recruiterService_PhuDK/recruiterService";
import type { User } from "@/types/common/auth";

const recruiterSchema = z.object({
    companyName: z.string().min(2),
    website: z.string().optional(),
    industry: z.string().min(2),
    companySize: z.string().min(1),
    address: z.string().min(2),
});

interface Props {
    data: User;
    onSubmit?: () => void;
}

const UpdateRecruiterDialog: React.FC<Props> = ({ data, onSubmit }) => {
    const [open, setOpen] = useState(false);

    const [formData, setFormData] = useState({
        companyName: "",
        website: "",
        industry: "",
        companySize: "",
        address: "",
    });

    useEffect(() => {
        if (open && data) {
            setFormData({
                companyName: data.companyName || "",
                website: data.website || "",
                industry: data.industry || "",
                companySize: data.companySize || "",
                address: data.address || "",
            });
        }
    }, [open, data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            recruiterSchema.parse(formData);

            await updateRecruiterProfile({
                ...data,
                ...formData,
            });

            toast.success("Cập nhật thông tin công ty thành công");

            await onSubmit?.();

            setOpen(false);
        } catch (err: any) {
            toast.error("Dữ liệu không hợp lệ: " + err.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-7 w-7 bg-gray-400 hover:bg-gray-500 cursor-pointer">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-[#11142D] text-white border border-white/10 [&>button]:cursor-pointer">
                <DialogHeader>
                    <DialogTitle>Cập nhật thông tin công ty</DialogTitle>
                    <DialogDescription>
                        Chỉnh sửa thông tin công ty của bạn
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">

                    <div>
                        <Label>Tên công ty</Label>
                        <Input
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Label>Website</Label>
                        <Input
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Label>Lĩnh vực</Label>
                        <Input
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Label>Quy mô công ty</Label>
                        <Input
                            name="companySize"
                            value={formData.companySize}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Label>Địa chỉ</Label>
                        <Input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] cursor-pointer"
                    >
                        Lưu thay đổi
                    </Button>

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateRecruiterDialog;