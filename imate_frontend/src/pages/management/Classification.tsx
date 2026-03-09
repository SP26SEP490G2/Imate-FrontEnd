import { useState, useEffect } from "react";
import { Plus, Pencil, Trash, ChevronDown, Search } from "lucide-react";

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

import { getListDetailCategory } from "@/services/categoryService";
import type { ListCategoryResponse } from "@/types/response/category.response";
import { CreateCategoryDialog } from "@/pages/management/dialog/CreateCategoryDialog";
import { UpdateCategoryDialog } from "./dialog/UpdateCategoryDialog";
import { Input } from "@/components/ui/input";

const tabs = [
  { label: "Thể loại", value: "categories" },
  { label: "Vị trí", value: "positions" },
  { label: "Kĩ năng", value: "skills" },
  { label: "Công ty", value: "companies" },
];

export default function Classification() {
  const [tab, setTab] = useState("categories");

  // Dữ liệu & trạng thái
  const [categories, setCategories] = useState<ListCategoryResponse["items"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Tìm kiếm & sắp xếp
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);

  // BỘ LỌC TRẠNG THÁI MỚI
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null); // null = tất cả, true = hoạt động, false = vô hiệu

  // Modal
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: number;
    name: string;
    isActive: boolean;
  } | null>(null);

  const handleEdit = (cat: { id: number; name: string; isActive: boolean }) => {
    setSelectedCategory(cat);
    setOpenUpdateDialog(true);
  };

  // Fetch danh sách category
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getListDetailCategory(
        page,
        pageSize,
        searchTerm,
        isActiveFilter,   // ← truyền bộ lọc trạng thái
        sortBy,
        sortOrder
      );

      if (response) {
        setCategories(response.items || []);
        setTotalPages(response.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Lỗi tải danh sách thể loại:", err);
      setError("Không thể tải danh sách thể loại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "categories") {
      fetchCategories();
    }
  }, [tab, page, pageSize, searchTerm, sortBy, sortOrder, isActiveFilter]); // ← thêm isActiveFilter

  const handleAddSuccess = () => {
    fetchCategories(); // refresh để thấy category mới
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
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
            Quản lý chuyên môn, vị trí, và kỹ năng đặc thù ngành CNTT
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Thêm thể loại mới
        </Button>
      </div>

      {/* Tabs */}
      <AppTabs
        tabs={tabs}
        value={tab}
        onChange={(value) => {
          setTab(value);
          setPage(1);
        }}
      />

      {tab === "categories" && (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-xl font-semibold text-white">Danh sách thể loại</h2>
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-4 text-sm text-slate-400">
              {/* Ô tìm kiếm */}
              <div className="relative min-w-[240px]">
                <Input
                  placeholder="Tìm theo tên thể loại..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 pr-4 py-2 w-full bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Bộ lọc trạng thái */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 whitespace-nowrap">Trạng thái:</span>
                <select
                  value={isActiveFilter === null ? "all" : isActiveFilter.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIsActiveFilter(val === "all" ? null : val === "true");
                    setPage(1);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
                >
                  <option value="all">Tất cả</option>
                  <option value="true">Hoạt động</option>
                  <option value="false">Vô hiệu</option>
                </select>
              </div>
              <span className="whitespace-nowrap">Sắp xếp theo:</span>

              <div className="relative inline-block">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split("-");
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder as "asc" | "desc");
                    setPage(1);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 pr-10 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[200px]"
                >
                  <option value="createdat-desc">Mới nhất</option>
                  <option value="createdat-asc">Cũ nhất</option>
                  <option value="name-asc">Tên A → Z</option>
                  <option value="name-desc">Tên Z → A</option>
                  <option value="questioncount-asc">Số câu hỏi ít nhất</option>
                  <option value="questioncount-desc">Số câu hỏi nhiều nhất</option>
                </select>

                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Bảng dữ liệu */}
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              Đang tải danh sách thể loại...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error}</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Chưa có thể loại nào
            </div>
          ) : (
            <Table
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setPage}
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
                              onClick={() => handleEdit(cat)}
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

      {tab !== "categories" && (
        <div className="text-center py-20 text-slate-500">
          Chức năng đang được phát triển...
        </div>
      )}

      {/* Modal thêm mới */}
      <CreateCategoryDialog
        open={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
        onSuccess={handleAddSuccess}
      />

      {selectedCategory && (
        <UpdateCategoryDialog
          open={openUpdateDialog}
          onOpenChange={setOpenUpdateDialog}
          category={selectedCategory}
          onSuccess={() => {
            fetchCategories();
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
}