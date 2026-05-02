import { useState, useCallback } from "react";
import * as pdfjs from "pdfjs-dist";

// Chỉ thiết lập worker một lần (tránh set lại mỗi lần re-render)
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  // Dùng CDN để tránh bundle worker phức tạp
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

export type JdFileImportStatus = "idle" | "loading" | "success" | "error";

export interface JdFileImportResult {
  /** Kích hoạt khi user chọn file */
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Xóa file đã chọn */
  clearFile: () => void;
  /** Trạng thái đọc file */
  status: JdFileImportStatus;
  /** Tên file đã chọn */
  fileName: string | null;
  /** Thông báo lỗi (nếu có) */
  errorMsg: string | null;
}

const MAX_CHARS = 5000;
const ALLOWED_TYPES = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".txt", ".pdf", ".docx"];

async function readTxt(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) ?? "");
    reader.onerror = () => reject(new Error("Không thể đọc file .txt"));
    reader.readAsText(file, "utf-8");
  });
}

async function readPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }
  return pages.join("\n");
}

async function readDocx(file: File): Promise<string> {
  // Dynamic import để tránh bundle to
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Hook cung cấp logic import file JD và gọi callback `onExtracted`
 * khi text đã được trích xuất thành công.
 */
export function useJdFileImport(
  onExtracted: (text: string) => void
): JdFileImportResult {
  const [status, setStatus] = useState<JdFileImportStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const clearFile = useCallback(() => {
    setStatus("idle");
    setFileName(null);
    setErrorMsg(null);
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset input để cho phép chọn lại cùng file
      e.target.value = "";

      // Kiểm tra loại file
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
        setErrorMsg(
          `Định dạng không hỗ trợ. Vui lòng chọn: ${ALLOWED_EXTENSIONS.join(", ")}`
        );
        setStatus("error");
        return;
      }

      // Kiểm tra kích thước (max 10 MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("File quá lớn. Vui lòng chọn file nhỏ hơn 10 MB.");
        setStatus("error");
        return;
      }

      setStatus("loading");
      setFileName(file.name);
      setErrorMsg(null);

      try {
        let text = "";
        if (file.type === "application/pdf" || ext === ".pdf") {
          text = await readPdf(file);
        } else if (
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          ext === ".docx"
        ) {
          text = await readDocx(file);
        } else {
          text = await readTxt(file);
        }

        // Làm sạch khoảng trắng thừa
        text = text.replace(/\s+/g, " ").trim();

        if (!text) {
          throw new Error("Không trích xuất được nội dung từ file.");
        }

        // Cắt bớt nếu vượt quá giới hạn
        if (text.length > MAX_CHARS) {
          text = text.slice(0, MAX_CHARS);
        }

        onExtracted(text);
        setStatus("success");
      } catch (err: any) {
        setErrorMsg(err?.message ?? "Đọc file thất bại. Vui lòng thử lại.");
        setStatus("error");
        setFileName(null);
      }
    },
    [onExtracted]
  );

  return { handleFileChange, clearFile, status, fileName, errorMsg };
}
