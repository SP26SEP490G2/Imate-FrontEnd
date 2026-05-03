import * as React from "react";
import { Search, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getPositionSkills, updatePositionSkills } from "@/services/positionService";
import { getAllSkill } from "@/services/skillService";

import { toast } from "react-toastify";

interface ManagePositionSkillsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: {
    id: number;
    name: string;
  } | null;
  onSuccess?: () => void;
}

type SkillOption = {
  id: number;
  name: string;
  isActive: boolean;
};

export function ManagePositionSkillsDialog({
  open,
  onOpenChange,
  position,
  onSuccess,
}: ManagePositionSkillsDialogProps) {
  const [allSkills, setAllSkills] = React.useState<SkillOption[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = React.useState<Set<number>>(new Set());
  const [initialSkillIds, setInitialSkillIds] = React.useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Fetch all skills + currently mapped skills when dialog opens
  React.useEffect(() => {
    if (!open || !position) return;

    const fetchData = async () => {
      setLoading(true);
      setSearchTerm("");
      try {
        // Fetch all skills (active ones, large page size)
        const [skillsResponse, mappedSkills] = await Promise.all([
          getAllSkill(1, 200, true, "", "name", "asc", null),
          getPositionSkills(position.id),
        ]);

        const skills = (skillsResponse?.items || []).map((s) => ({
          id: s.id,
          name: s.name,
          isActive: s.isActive,
        }));

        setAllSkills(skills);

        const mappedIds = new Set(mappedSkills.map((s) => s.id));
        setSelectedSkillIds(mappedIds);
        setInitialSkillIds(new Set(mappedIds));
      } catch (err) {
        console.error("Error fetching skills data:", err);
        toast.error("Không thể tải dữ liệu kĩ năng");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, position]);

  const toggleSkill = (skillId: number) => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    const filtered = filteredSkills;
    const allSelected = filtered.every((s) => selectedSkillIds.has(s.id));
    setSelectedSkillIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filtered.forEach((s) => next.delete(s.id));
      } else {
        filtered.forEach((s) => next.add(s.id));
      }
      return next;
    });
  };

  const hasChanges = React.useMemo(() => {
    if (selectedSkillIds.size !== initialSkillIds.size) return true;
    for (const id of selectedSkillIds) {
      if (!initialSkillIds.has(id)) return true;
    }
    return false;
  }, [selectedSkillIds, initialSkillIds]);

  const handleSave = async () => {
    if (!position) return;
    setSaving(true);
    try {
      await updatePositionSkills(position.id, Array.from(selectedSkillIds));
      toast.success("Cập nhật kĩ năng cho vị trí thành công!");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const filteredSkills = React.useMemo(() => {
    if (!searchTerm.trim()) return allSkills;
    const term = searchTerm.toLowerCase().trim();
    return allSkills.filter((s) => s.name.toLowerCase().includes(term));
  }, [allSkills, searchTerm]);

  if (!position) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Quản lý kĩ năng
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Chọn các kĩ năng cho vị trí{" "}
            <span className="font-semibold text-purple-400">{position.name}</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Tìm kĩ năng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Select all / counter */}
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={toggleAll}
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                {filteredSkills.length > 0 && filteredSkills.every((s) => selectedSkillIds.has(s.id))
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </button>
              <span className="text-slate-400">
                Đã chọn:{" "}
                <span className="font-semibold text-white">{selectedSkillIds.size}</span>
                /{allSkills.length}
              </span>
            </div>

            {/* Skills list */}
            <div className="max-h-[320px] overflow-y-auto rounded-lg border border-slate-700/60 bg-slate-800/40 divide-y divide-slate-700/40">
              {filteredSkills.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  {searchTerm ? "Không tìm thấy kĩ năng phù hợp" : "Chưa có kĩ năng nào"}
                </div>
              ) : (
                filteredSkills.map((skill) => {
                  const isChecked = selectedSkillIds.has(skill.id);
                  return (
                    <label
                      key={skill.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-700/30 ${
                        isChecked ? "bg-purple-500/5" : ""
                      }`}
                    >
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSkill(skill.id)}
                          className="sr-only"
                        />
                        <div
                          className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? "border-purple-500 bg-purple-500"
                              : "border-slate-600 bg-slate-800 hover:border-slate-500"
                          }`}
                        >
                          {isChecked && (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-slate-200 font-medium">{skill.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Hủy
            </Button>
          </DialogClose>

          <Button
            type="button"
            variant="primary"
            disabled={saving || loading || !hasChanges}
            onClick={handleSave}
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
