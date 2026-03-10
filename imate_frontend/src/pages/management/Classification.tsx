import { useState, useEffect } from "react";
import { Plus, Pencil, ChevronDown, Search } from "lucide-react";

import { AppTabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";

import { getListDetailCategory } from "@/services/categoryService";
import type { ListCategoryResponse } from "@/types/response/category.response";

import { getAllSkill } from "@/services/skillService";
import type { Skill } from "@/types/model/skill.model";

import { getListPosition } from "@/services/positionService"; // ← import service vị trí
import type { ListPositionResponse, PositionResponse } from "@/types/response/position.response";

import { CreateCategoryDialog } from "@/pages/management/dialog/CreateCategoryDialog";
import { UpdateCategoryDialog } from "./dialog/UpdateCategoryDialog";
import { CreateSkillDialog } from "./dialog/CreateSkillDialog";
import { UpdateSkillDialog } from "./dialog/UpdateSkillDialog";
import { CreatePositionDialog } from "./dialog/CreatePositionDialog";     // ← thêm
import { UpdatePositionDialog } from "./dialog/UpdatePositionDialog";   // ← thêm

const tabs = [
  { label: "Thể loại", value: "categories" },
  { label: "Vị trí", value: "positions" },
  { label: "Kĩ năng", value: "skills" },
  { label: "Công ty", value: "companies" },
];

const SORT_OPTIONS = [
  { value: "createdat-desc", label: "Mới nhất" },
  { value: "createdat-asc", label: "Cũ nhất" },
  { value: "name-asc", label: "Tên A → Z" },
  { value: "name-desc", label: "Tên Z → A" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Vô hiệu" },
];

export default function Classification() {
  const [tab, setTab] = useState("categories");

  // --- THỂ LOẠI ---
  const [categories, setCategories] = useState<ListCategoryResponse["items"]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  const [catPage, setCatPage] = useState(1);
  const [catPageSize, setCatPageSize] = useState(10);
  const [catTotalPages, setCatTotalPages] = useState(1);

  const [catSearchTerm, setCatSearchTerm] = useState("");
  const [catSortBy, setCatSortBy] = useState<string>("createdat");
  const [catSortOrder, setCatSortOrder] = useState<"asc" | "desc">("desc");
  const [catIsActiveFilter, setCatIsActiveFilter] = useState<boolean | null>(null);

  const [openCreateCatDialog, setOpenCreateCatDialog] = useState(false);
  const [openUpdateCatDialog, setOpenUpdateCatDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: number;
    name: string;
    isActive: boolean;
  } | null>(null);

  // --- VỊ TRÍ ---
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [posLoading, setPosLoading] = useState(false);
  const [posError, setPosError] = useState<string | null>(null);

  const [posPage, setPosPage] = useState(1);
  const [posPageSize, setPosPageSize] = useState(10);
  const [posTotalPages, setPosTotalPages] = useState(1);

  const [posSearchTerm, setPosSearchTerm] = useState("");
  const [posSortBy, setPosSortBy] = useState<string>("createdat");
  const [posSortOrder, setPosSortOrder] = useState<"asc" | "desc">("desc");
  const [posIsActiveFilter, setPosIsActiveFilter] = useState<boolean | null>(null);

  const [openCreatePosDialog, setOpenCreatePosDialog] = useState(false);
  const [openUpdatePosDialog, setOpenUpdatePosDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<PositionResponse | null>(null);

  // --- KĨ NĂNG ---
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillLoading, setSkillLoading] = useState(false);
  const [skillError, setSkillError] = useState<string | null>(null);

  const [skillPage, setSkillPage] = useState(1);
  const [skillPageSize, setSkillPageSize] = useState(10);
  const [skillTotalPages, setSkillTotalPages] = useState(1);

  const [skillSearchTerm, setSkillSearchTerm] = useState("");
  const [skillSortBy, setSkillSortBy] = useState<string>("createdat");
  const [skillSortOrder, setSkillSortOrder] = useState<"asc" | "desc">("desc");
  const [skillIsActiveFilter, setSkillIsActiveFilter] = useState<boolean | null>(null);

  const [openCreateSkillDialog, setOpenCreateSkillDialog] = useState(false);
  const [openUpdateSkillDialog, setOpenUpdateSkillDialog] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Fetch Thể loại
  const fetchCategories = async () => {
    setCatLoading(true);
    setCatError(null);

    try {
      const response = await getListDetailCategory(
        catPage,
        catPageSize,
        catSearchTerm,
        catIsActiveFilter,
        catSortBy,
        catSortOrder
      );

      if (response) {
        setCategories(response.items || []);
        setCatTotalPages(response.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Lỗi tải danh sách thể loại:", err);
      setCatError("Không thể tải danh sách thể loại.");
    } finally {
      setCatLoading(false);
    }
  };

  // Fetch Vị trí
  const fetchPositions = async () => {
    setPosLoading(true);
    setPosError(null);

    try {
      const response = await getListPosition(
        posPage,
        posPageSize,
        posIsActiveFilter,
        posSearchTerm,
        posSortBy,
        posSortOrder
      );

      if (response) {
        setPositions(response.items || []);
        setPosTotalPages(response.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Lỗi tải danh sách vị trí:", err);
      setPosError("Không thể tải danh sách vị trí.");
    } finally {
      setPosLoading(false);
    }
  };

  // Fetch Kỹ năng
  const fetchSkills = async () => {
    setSkillLoading(true);
    setSkillError(null);

    try {
      const response = await getAllSkill(
        skillPage,
        skillPageSize,
        skillIsActiveFilter,
        skillSearchTerm,
        skillSortBy,
        skillSortOrder,
        null // PositionId nếu cần sau
      );

      if (response) {
        setSkills(response.items || []);
        setSkillTotalPages(response.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Lỗi tải danh sách kĩ năng:", err);
      setSkillError("Không thể tải danh sách kĩ năng.");
    } finally {
      setSkillLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "categories") fetchCategories();
    if (tab === "positions") fetchPositions();
    if (tab === "skills") fetchSkills();
  }, [
    tab,
    catPage, catPageSize, catSearchTerm, catSortBy, catSortOrder, catIsActiveFilter,
    posPage, posPageSize, posSearchTerm, posSortBy, posSortOrder, posIsActiveFilter,
    skillPage, skillPageSize, skillSearchTerm, skillSortBy, skillSortOrder, skillIsActiveFilter,
  ]);

  const handleAddCategorySuccess = () => fetchCategories();
  const handleAddPositionSuccess = () => fetchPositions();
  const handleAddSkillSuccess = () => fetchSkills();

  const handleEditCategory = (cat: { id: number; name: string; isActive: boolean }) => {
    setSelectedCategory(cat);
    setOpenUpdateCatDialog(true);
  };

  const handleEditPosition = (pos: PositionResponse) => {
    setSelectedPosition(pos);
    setOpenUpdatePosDialog(true);
  };

  const handleEditSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setOpenUpdateSkillDialog(true);
  };

  const handlePageSizeChange = (size: number) => {
    if (tab === "categories") {
      setCatPageSize(size);
      setCatPage(1);
    } else if (tab === "positions") {
      setPosPageSize(size);
      setPosPage(1);
    } else if (tab === "skills") {
      setSkillPageSize(size);
      setSkillPage(1);
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Quản lý hạng mục IT
          </h1>
          <p className="text-slate-400">
            Quản lý chuyên môn, vị trí, kỹ năng và công ty đặc thù ngành CNTT
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            if (tab === "categories") setOpenCreateCatDialog(true);
            else if (tab === "positions") setOpenCreatePosDialog(true);
            else if (tab === "skills") setOpenCreateSkillDialog(true);
          }}
        >
          Thêm{" "}
          {tab === "categories"
            ? "thể loại"
            : tab === "positions"
            ? "vị trí"
            : "kĩ năng"}{" "}
          mới
        </Button>
      </div>

      {/* Tabs */}
      <AppTabs
        tabs={tabs}
        value={tab}
        onChange={(value) => {
          setTab(value);
          setCatPage(1);
          setPosPage(1);
          setSkillPage(1);
        }}
      />

      {/* Nội dung tab */}
      {tab === "categories" && (
        <div className="space-y-6">
          {/* Toolbar thể loại */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-xl font-semibold text-white">Danh sách thể loại</h2>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="relative min-w-[240px]">
                <Input
                  placeholder="Tìm theo tên thể loại..."
                  value={catSearchTerm}
                  onChange={(e) => {
                    setCatSearchTerm(e.target.value);
                    setCatPage(1);
                  }}
                  className="pl-10 pr-4 py-2 w-full bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 whitespace-nowrap">Trạng thái:</span>
                <select
                  value={catIsActiveFilter === null ? "all" : catIsActiveFilter.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCatIsActiveFilter(val === "all" ? null : val === "true");
                    setCatPage(1);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <span className="whitespace-nowrap">Sắp xếp theo:</span>
              <div className="relative inline-block">
                <select
                  value={`${catSortBy}-${catSortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split("-");
                    setCatSortBy(newSortBy);
                    setCatSortOrder(newSortOrder as "asc" | "desc");
                    setCatPage(1);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 pr-10 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[200px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>
          </div>

          {/* Bảng thể loại */}
          {catLoading ? (
            <div className="text-center py-12 text-slate-400">Đang tải...</div>
          ) : catError ? (
            <div className="text-center py-12 text-red-400">{catError}</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Chưa có thể loại nào</div>
          ) : (
            <Table
              page={catPage}
              totalPages={catTotalPages}
              pageSize={catPageSize}
              onPageChange={setCatPage}
              onPageSizeChange={handlePageSizeChange}
              maxHeight="55vh"
            >
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Số câu hỏi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[140px] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>{cat.id}</TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>{cat.questionCount}</TableCell>
                    <TableCell>
                      <StatusBadge status={cat.isActive ? "active" : "inactive"}>
                        {cat.isActive ? "Hoạt động" : "Vô hiệu"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={<Pencil size={14} />}
                              onClick={() => handleEditCategory(cat)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>Sửa</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {tab === "positions" && (
        <div className="space-y-6">
          {/* Toolbar vị trí */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-xl font-semibold text-white">Danh sách vị trí</h2>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="relative min-w-[240px]">
                <Input
                  placeholder="Tìm theo tên vị trí..."
                  value={posSearchTerm}
                  onChange={(e) => {
                    setPosSearchTerm(e.target.value);
                    setPosPage(1);
                  }}
                  className="pl-10 pr-4 py-2 w-full bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 whitespace-nowrap">Trạng thái:</span>
                <select
                  value={posIsActiveFilter === null ? "all" : posIsActiveFilter.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPosIsActiveFilter(val === "all" ? null : val === "true");
                    setPosPage(1);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <span className="whitespace-nowrap">Sắp xếp theo:</span>
              <div className="relative inline-block">
                <select
                  value={`${posSortBy}-${posSortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split("-");
                    setPosSortBy(newSortBy);
                    setPosSortOrder(newSortOrder as "asc" | "desc");
                    setPosPage(1);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 pr-10 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[200px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>
          </div>

          {/* Bảng vị trí */}
          {posLoading ? (
            <div className="text-center py-12 text-slate-400">Đang tải...</div>
          ) : posError ? (
            <div className="text-center py-12 text-red-400">{posError}</div>
          ) : positions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Chưa có vị trí nào</div>
          ) : (
            <Table
              page={posPage}
              totalPages={posTotalPages}
              pageSize={posPageSize}
              onPageChange={setPosPage}
              onPageSizeChange={handlePageSizeChange}
              maxHeight="55vh"
            >
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Số câu hỏi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[140px] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((pos) => (
                  <TableRow key={pos.id}>
                    <TableCell>{pos.id}</TableCell>
                    <TableCell className="font-medium">{pos.name}</TableCell>
                    <TableCell>{pos.questionCount}</TableCell>
                    <TableCell>
                      <StatusBadge status={pos.isActive ? "active" : "inactive"}>
                        {pos.isActive ? "Hoạt động" : "Vô hiệu"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={<Pencil size={14} />}
                              onClick={() => handleEditPosition(pos)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>Sửa</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {tab === "skills" && (
        <div className="space-y-6">
          {/* Toolbar kỹ năng */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-xl font-semibold text-white">Danh sách kĩ năng</h2>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="relative min-w-[240px]">
                <Input
                  placeholder="Tìm theo tên kĩ năng..."
                  value={skillSearchTerm}
                  onChange={(e) => {
                    setSkillSearchTerm(e.target.value);
                    setSkillPage(1);
                  }}
                  className="pl-10 pr-4 py-2 w-full bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 whitespace-nowrap">Trạng thái:</span>
                <select
                  value={skillIsActiveFilter === null ? "all" : skillIsActiveFilter.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSkillIsActiveFilter(val === "all" ? null : val === "true");
                    setSkillPage(1);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <span className="whitespace-nowrap">Sắp xếp theo:</span>
              <div className="relative inline-block">
                <select
                  value={`${skillSortBy}-${skillSortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split("-");
                    setSkillSortBy(newSortBy);
                    setSkillSortOrder(newSortOrder as "asc" | "desc");
                    setSkillPage(1);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 pr-10 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[200px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>
          </div>

          {/* Bảng kỹ năng */}
          {skillLoading ? (
            <div className="text-center py-12 text-slate-400">Đang tải...</div>
          ) : skillError ? (
            <div className="text-center py-12 text-red-400">{skillError}</div>
          ) : skills.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Chưa có kĩ năng nào</div>
          ) : (
            <Table
              page={skillPage}
              totalPages={skillTotalPages}
              pageSize={skillPageSize}
              onPageChange={setSkillPage}
              onPageSizeChange={handlePageSizeChange}
              maxHeight="55vh"
            >
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Số câu hỏi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[140px] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skills.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell>{skill.id}</TableCell>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>{skill.questionCount}</TableCell>
                    <TableCell>
                      <StatusBadge status={skill.isActive ? "active" : "inactive"}>
                        {skill.isActive ? "Hoạt động" : "Vô hiệu"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={<Pencil size={14} />}
                              onClick={() => handleEditSkill(skill)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>Sửa</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {tab === "companies" && (
        <div className="text-center py-20 text-slate-500">
          Chức năng đang được phát triển...
        </div>
      )}

      {/* Dialogs */}
      <CreateCategoryDialog
        open={openCreateCatDialog}
        onOpenChange={setOpenCreateCatDialog}
        onSuccess={handleAddCategorySuccess}
      />

      {selectedCategory && (
        <UpdateCategoryDialog
          open={openUpdateCatDialog}
          onOpenChange={setOpenUpdateCatDialog}
          category={selectedCategory}
          onSuccess={() => {
            fetchCategories();
            setSelectedCategory(null);
          }}
        />
      )}

      <CreatePositionDialog
        open={openCreatePosDialog}
        onOpenChange={setOpenCreatePosDialog}
        onSuccess={handleAddPositionSuccess}
      />

      {selectedPosition && (
        <UpdatePositionDialog
          open={openUpdatePosDialog}
          onOpenChange={setOpenUpdatePosDialog}
          position={selectedPosition}
          onSuccess={() => {
            fetchPositions();
            setSelectedPosition(null);
          }}
        />
      )}

      <CreateSkillDialog
        open={openCreateSkillDialog}
        onOpenChange={setOpenCreateSkillDialog}
        onSuccess={handleAddSkillSuccess}
      />

      {selectedSkill && (
        <UpdateSkillDialog
          open={openUpdateSkillDialog}
          onOpenChange={setOpenUpdateSkillDialog}
          skill={selectedSkill}
          onSuccess={() => {
            fetchSkills();
            setSelectedSkill(null);
          }}
        />
      )}
    </div>
  );
}