import React, { useState, useEffect } from "react";
import { X, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { getAllPositions, getAllSkills } from "@/services/commonService";
import type { PositionItem, SkillItem } from "@/types/common/question";
import { Badge } from "@/components/ui/badge";
import { CreateJobPost } from "@/services/recruiterService_PhuDK/recruiterService";
import { toast } from "react-toastify";

const CreateJobApplication: React.FC = () => {
  const [form, setForm] = useState({
    title: "",
    employmentType: "Full-time",
    location: "",
    minSalary: "",
    maxSalary: "",
    description: "",
    applicationDeadline: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<PositionItem[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillItem[]>([]);

  const [availablePositions, setAvailablePositions] = useState<PositionItem[]>([]);
  const [availableSkills, setAvailableSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [positionSearch, setPositionSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [positionsRes, skillsRes] = await Promise.all([
          getAllPositions({ pageSize: 100, isActive: true }),
          getAllSkills({ pageSize: 100 }),
        ]);
        setAvailablePositions(positionsRes.data);
        setAvailableSkills(skillsRes.data);
        console.log("Fetched skillsRes:", skillsRes);
      } catch (error) {
        console.error("Failed to fetch skills/positions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const togglePosition = (pos: PositionItem) => {
    if (selectedPositions.find(p => p.id === pos.id)) {
      setSelectedPositions(selectedPositions.filter(p => p.id !== pos.id));
    } else {
      setSelectedPositions([...selectedPositions, pos]);
    }
    setPositionSearch("");
  };

  const toggleSkill = (skill: SkillItem) => {
    if (selectedSkills.find(s => s.id === skill.id)) {
      setSelectedSkills(selectedSkills.filter(s => s.id !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSkillSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        JobPositions: selectedPositions.map(p => p.id),
        JobSkills: selectedSkills.map(s => s.id),
      };
      setIsSubmitting(true);

      await CreateJobPost(payload);
      setIsSubmitting(false);

      toast.success("Tạo Job thành công!");

      // reset form
      setForm({
        title: "",
        employmentType: "Full-time",
        location: "",
        minSalary: "",
        maxSalary: "",
        description: "",
        applicationDeadline: "",
      });

      // clear positions + skills
      setSelectedPositions([]);
      setSelectedSkills([]);

      setPositionSearch("");
      setSkillSearch("");

    } catch (error) {
      console.error(error);
      toast.error("Tạo Job thất bại. Vui lòng thử lại.");
      setIsSubmitting(false);

    }
  };

  const filteredPositions = availablePositions.filter(p =>
    p.name.toLowerCase().includes(positionSearch.toLowerCase()) &&
    !selectedPositions.find(sp => sp.id === p.id)
  );

  const filteredSkills = availableSkills.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.find(ss => ss.id === s.id)
  );

  return (
    <div className="min-h-screen w-full bg-[#050816] text-white flex justify-center px-6 py-16 relative overflow-hidden">

      {/* Glow background */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/20 blur-[140px] rounded-full top-[-120px] left-[-120px]" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/20 blur-[140px] rounded-full bottom-[-120px] right-[-120px]" />

      <div className="w-full max-w-[900px] relative">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-[36px] font-bold tracking-[-0.5px]">
            Create Job Posting
          </h1>

          <p className="text-[#A0A3BD] mt-3 text-[16px]">
            Publish a new opportunity and connect with talented developers.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#11142D] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Job Title */}
            <div className="space-y-2">
              <label className="text-[#A0A3BD] text-sm">
                Job Title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Senior Backend Developer"
                className="w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border border-[rgba(255,255,255,0.1)] focus:border-[#8B5CF6] outline-none placeholder-[#6B6F8E]"
              />
            </div>

            {/* Job Position (Multi-select) */}
            <div className="space-y-2 relative">
              <label className="text-[#A0A3BD] text-sm">
                Job Positions
              </label>

              <div
                className="min-h-[48px] flex flex-wrap gap-2 p-2 rounded-[12px] bg-[#0F1333] border border-[rgba(255,255,255,0.1)] cursor-text"
                onClick={() => setShowPositionDropdown(!showPositionDropdown)}
              >
                {selectedPositions.map((pos) => (
                  <Badge
                    key={pos.id}
                    variant="secondary"
                    className="flex items-center gap-1 bg-[#161A3F] text-[#A0A3BD] border-none px-3 py-1 rounded-full"
                  >
                    {pos.name}
                    <span
                      className="ml-1 p-0.5 rounded-full hover:bg-red-500/20 cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePosition(pos);
                      }}
                    >
                      <X size={14} className="hover:text-red-400" />
                    </span>
                  </Badge>
                ))}
                <input
                  placeholder={selectedPositions.length === 0 ? "Select positions..." : ""}
                  className="flex-1 bg-transparent outline-none text-sm placeholder-[#6B6F8E] min-w-[120px]"
                  value={positionSearch}
                  onChange={(e) => {
                    setPositionSearch(e.target.value);
                    setShowPositionDropdown(true);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <ChevronsUpDown size={18} className="text-[#6B6F8E] self-center ml-auto" />
              </div>

              {showPositionDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-[#11142D] border border-[rgba(255,255,255,0.1)] rounded-[12px] shadow-xl max-h-[200px] overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-[#8B5CF6]" /></div>
                  ) : filteredPositions.length > 0 ? (
                    filteredPositions.map(pos => (
                      <div
                        key={pos.id}
                        className="px-4 py-2 hover:bg-[#161A3F] cursor-pointer transition text-sm flex items-center justify-between"
                        onClick={() => togglePosition(pos)}
                      >
                        {pos.name}
                        {selectedPositions.find(p => p.id === pos.id) && <Check size={14} className="text-[#8B5CF6]" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-[#6B6F8E]">No positions found</div>
                  )}
                </div>
              )}
            </div>

            {/* Employment + Location */}
            <div className="grid grid-cols-2 gap-6">

              <div className="space-y-2">
                <label className="text-[#A0A3BD] text-sm">
                  Employment Type
                </label>

                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                  className="w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border border-[rgba(255,255,255,0.1)] focus:border-[#8B5CF6] outline-none"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[#A0A3BD] text-sm">
                  Job Location
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Remote / Ho Chi Minh City"
                  className="w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border border-[rgba(255,255,255,0.1)] focus:border-[#8B5CF6] outline-none placeholder-[#6B6F8E]"
                />
              </div>

            </div>

            {/* Job Skills (Multi-select) */}
            <div className="space-y-2 relative">
              <label className="text-[#A0A3BD] text-sm">
                Job Skills
              </label>

              <div
                className="min-h-[48px] flex flex-wrap gap-2 p-2 rounded-[12px] bg-[#0F1333] border border-[rgba(255,255,255,0.1)] cursor-text"
                onClick={() => setShowSkillDropdown(!showSkillDropdown)}
              >
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="flex items-center gap-1 bg-[#161A3F] text-[#A0A3BD] border-none px-3 py-1 rounded-full"
                  >
                    {skill.name}
                    <span
                      className="ml-1 p-0.5 rounded-full hover:bg-red-500/20 cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSkill(skill);
                      }}
                    >
                      <X size={14} className="hover:text-red-400" />
                    </span>
                  </Badge>
                ))}
                <input
                  placeholder={selectedSkills.length === 0 ? "Type skill..." : ""}
                  className="flex-1 bg-transparent outline-none text-sm placeholder-[#6B6F8E] min-w-[120px]"
                  value={skillSearch}
                  onChange={(e) => {
                    setSkillSearch(e.target.value);
                    setShowSkillDropdown(true);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <ChevronsUpDown size={18} className="text-[#6B6F8E] self-center ml-auto" />
              </div>

              {showSkillDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-[#11142D] border border-[rgba(255,255,255,0.1)] rounded-[12px] shadow-xl max-h-[200px] overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-[#8B5CF6]" /></div>
                  ) : filteredSkills.length > 0 ? (
                    filteredSkills.map(skill => (
                      <div
                        key={skill.id}
                        className="px-4 py-2 hover:bg-[#161A3F] cursor-pointer transition text-sm flex items-center justify-between"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill.name}
                        {selectedSkills.find(s => s.id === skill.id) && <Check size={14} className="text-[#8B5CF6]" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-[#6B6F8E]">No skills found</div>
                  )}
                </div>
              )}
            </div>

            {/* Salary */}
            <div className="grid grid-cols-2 gap-6">

              <div className="space-y-2">
                <label className="text-[#A0A3BD] text-sm">
                  Minimum Salary
                </label>

                <input
                  name="minSalary"
                  type="number"
                  value={form.minSalary}
                  onChange={handleChange}
                  placeholder="1000"
                  className="w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border border-[rgba(255,255,255,0.1)] focus:border-[#8B5CF6] outline-none placeholder-[#6B6F8E]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[#A0A3BD] text-sm">
                  Maximum Salary
                </label>

                <input
                  name="maxSalary"
                  type="number"
                  value={form.maxSalary}
                  onChange={handleChange}
                  placeholder="4000"
                  className="w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border border-[rgba(255,255,255,0.1)] focus:border-[#8B5CF6] outline-none placeholder-[#6B6F8E]"
                />
              </div>

            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-[#A0A3BD] text-sm">
                Application Deadline
              </label>

              <input
                name="applicationDeadline"
                type="date"
                value={form.applicationDeadline}
                onChange={handleChange}
                className="w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border border-[rgba(255,255,255,0.1)] focus:border-[#8B5CF6] outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[#A0A3BD] text-sm">
                Job Description
              </label>

              <textarea
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe responsibilities, requirements, and technologies..."
                className="w-full p-4 rounded-[12px] bg-[#0F1333] border border-[rgba(255,255,255,0.1)] focus:border-[#8B5CF6] outline-none placeholder-[#6B6F8E]"
              />
            </div>

            {/* Actions */}
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex justify-end gap-4">

              <button
                type="button"
                className="h-[48px] px-6 rounded-[12px] text-[#A0A3BD] hover:text-white transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-[48px] px-8 rounded-[12px] font-semibold bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6]"
              >
                {isSubmitting ? "Creating..." : "Create Job"}
              </button>

            </div>

          </form>
        </div>

      </div>
      {/* Click outside to close dropdowns */}
      {(showPositionDropdown || showSkillDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowPositionDropdown(false);
            setShowSkillDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default CreateJobApplication;
