import React, { useState } from "react";
import { X } from "lucide-react";

const CreateJobApplication: React.FC = () => {
  const [form, setForm] = useState({
    title: "",
    position: "",
    employmentType: "Full-time",
    location: "",
    minSalary: "",
    maxSalary: "",
    description: "",
    applicationDeadline: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();

      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }

      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      skills,
    };

    console.log("Create Job Payload:", payload);
  };

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

            {/* Job Position */}
            <div className="space-y-2">
              <label className="text-[#A0A3BD] text-sm">
                Job Position
              </label>

              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Backend Engineer / Frontend Engineer"
                className="w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border border-[rgba(255,255,255,0.1)] focus:border-[#8B5CF6] outline-none placeholder-[#6B6F8E]"
              />
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

            {/* Job Skills */}
            <div className="space-y-2">
              <label className="text-[#A0A3BD] text-sm">
                Job Skills
              </label>

              <div className="flex flex-wrap gap-2 p-3 rounded-[12px] bg-[#0F1333] border border-[rgba(255,255,255,0.1)]">

                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#161A3F] text-[#A0A3BD]"
                  >
                    {skill}

                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  placeholder="Type skill and press Enter"
                  className="flex-1 bg-transparent outline-none text-sm placeholder-[#6B6F8E]"
                />

              </div>
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
                className="h-[48px] px-8 rounded-[12px] font-semibold bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:brightness-110 transition shadow-lg"
              >
                Create Job
              </button>

            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default CreateJobApplication;