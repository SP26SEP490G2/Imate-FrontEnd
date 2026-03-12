# CLAUDE.md

File này cung cấp hướng dẫn cho Claude Code (claude.ai/code) khi làm việc với code trong repository này.

## Cấu trúc Repository

- Thư mục gốc của Git repo chứa ứng dụng frontend trong `imate_frontend/`.
- Chạy các lệnh Node/Vite trong thư mục con đó (ví dụ bên dưới sử dụng `npm --prefix imate_frontend ...`).

## Các lệnh phát triển

- Cài đặt dependencies:
  - `npm --prefix imate_frontend install`
- Khởi chạy dev server cục bộ:
  - `npm --prefix imate_frontend run dev`
- Build bản production (bao gồm TypeScript project build qua `tsc -b`):
  - `npm --prefix imate_frontend run build`
- Lint:
  - `npm --prefix imate_frontend run lint`
- Xem trước ứng dụng đã build:
  - `npm --prefix imate_frontend run preview`
- Lint một file đơn lẻ:
  - `npm --prefix imate_frontend exec eslint src/pages/staff/AddSystemQuestion.tsx`
- Chỉ kiểm tra type:
  - `npm --prefix imate_frontend exec tsc -b`

## Tests

- Hiện tại chưa có test script trong `imate_frontend/package.json` và không phát hiện file `*.test`/`*.spec` nào.
- Lệnh "chạy test đơn lẻ" chưa khả dụng cho đến khi thêm test runner.

## Kiến trúc tổng quan

### Khởi tạo App và các Provider toàn cục

- Điểm khởi đầu (entry point) là `imate_frontend/src/main.tsx`.
- `BrowserRouter` được mount trong `main.tsx`, sau đó `App` mount các provider toàn cục theo thứ tự:
  - `QueryClientProvider` (TanStack Query)
  - `GoogleOAuthProvider`
  - `AppProvider`
  - `AuthProvider`
- `SignalRProvider` tồn tại (`src/store/SignalRContext.tsx`) nhưng hiện đang bị comment out trong `App.tsx`.

### Mô hình Routing

- Bảng route được tổ hợp trong `src/routes/index.tsx` bằng cách nối:
  - `AuthRouter` (đăng nhập/đăng ký, xác minh/đặt lại mật khẩu)
  - `CommonRouter` (trang khách + một số trang câu hỏi của staff)
  - `AuthenticatedRouter` (được bọc trong `ProtectedRoute` và `MainLayout`)
- `AuthenticatedRouter` hiện lồng các trang xác thực dưới `/` với `MainLayout` và các route con như `profile`, `submit-mentor-application`, `pending-application`.

### Phân quyền và kiểm soát vai trò

- Logic xác thực/phân quyền cốt lõi được chia giữa:
  - `src/routes/ProtectedRoute.tsx`
  - `src/layout/MainLayout.tsx`
- Cả hai file đều duy trì danh sách cho phép/từ chối role-route được hardcode.
- Luồng Mentor `PendingVerification` được xử lý đặc biệt: chuyển hướng đến `pending-application` hoặc `submit-mentor-application` dựa trên các trường giống mentor-profile trên `user`.
- Admin được phép truy cập các route của staff trong các kiểm tra vai trò.

### Tầng API và giao tiếp Backend

- Tất cả các lời gọi HTTP đều đi qua `src/services/apiClient.ts` (instance Axios).
- Base URL lấy từ `VITE_API_BASE_URL`.
- Request interceptor:
  - Thêm `Authorization: Bearer <authToken>` từ `localStorage`.
  - Mặc định `Content-Type: application/json` trừ khi là FormData.
- Response interceptor:
  - Xử lý `401` với luồng refresh-token (`POST /refresh-token`).
  - Xếp hàng các request thất bại đồng thời trong quá trình refresh và thử lại sau khi đổi token.
  - Xóa trạng thái auth cục bộ và chuyển hướng đến `/sign-in` nếu refresh thất bại.
- Các hằng số endpoint được tập trung trong `src/config/apiConfig.ts`.
- Các module service theo domain trong `src/services/` (auth, account, mentor, question, common) bọc các lời gọi endpoint.
- Một số endpoint danh sách phụ thuộc vào response header `x-pagination` và cấu trúc payload `response.data.data`.

### Mô hình Xác thực

- Firebase được sử dụng để khởi tạo xác thực phía client (`src/lib/firebaseConfig.ts`) và sau đó trao đổi token với backend.
- Luồng đăng nhập email:
  1. Firebase `signInWithEmailAndPassword`
  2. Gửi Firebase ID token đến backend (`/login-email`)
  3. Lưu lại backend tokens (`authToken`, `refreshToken`) và gọi `/profile`
- Luồng đăng nhập Google tương tự qua trao đổi token với endpoint `/google`.
- Trạng thái auth nằm trong `src/store/AuthContext.tsx` và đồng bộ dữ liệu user vào `localStorage` với key `user`.

### UI Stack và quy ước

- React 19 + Vite + TypeScript.
- Tailwind CSS v4 qua `@tailwindcss/vite`.
- Các UI primitive chủ yếu nằm trong `src/components/ui/*` (kiểu Radix/shadcn).
- Hệ thống Toast: sử dụng cả `react-toastify` và `sonner`.
- Nhãn route/văn bản UI chủ yếu bằng tiếng Việt.

## Biến môi trường

- File `.env` hiện tại chứa:
  - `VITE_PORT`
  - `VITE_API_BASE_URL`
- `App.tsx` đọc Google client ID từ `import.meta.env.REACT_APP_GOOGLE_CLIENT_ID` (lưu ý tiền tố không phải `VITE_`). Hãy ghi nhớ điều này khi cấu hình giá trị env cho local/dev/prod.

## Quy ước viết code

- **Components:** PascalCase, thường lưu trong `src/components/...` hoặc `src/pages/...`.
- **Styling:** Sử dụng Tailwind CSS với tiện ích `cn()` (`clsx` + `tailwind-merge`) từ `@/lib/utils` cho class có điều kiện.
- **UI Primitives:** Sử dụng các component kiểu Radix/shadcn nằm trong `src/components/ui/*`.
- **Gọi API:** Không sử dụng `fetch` hoặc `axios` trực tiếp bên trong React component. Định nghĩa các method API trong `src/services/*` sử dụng instance `apiClient.ts` đã cấu hình để đảm bảo interceptor xử lý token đúng cách.
- **Quản lý State:** Sử dụng `@tanstack/react-query` cho state API (caching, fetching, updating) và React Context (`src/store/*`) cho state client toàn cục khi cần.
- **Ngôn ngữ:** Text và Label trên giao diện chủ yếu bằng tiếng Việt.
- **Phần mở rộng file:** Sử dụng `.tsx` cho React UI component và `.ts` cho file TypeScript thuần và định nghĩa domain.

- **Sử dụng hằng số (Constants):** Khi code bất kỳ màn hình nào, **bắt buộc** kiểm tra và sử dụng các biến `const` đã được định nghĩa trong thư mục `src/constants/`. Các file constant hiện có bao gồm:
  - `common.ts` – các hằng số dùng chung (role, status, v.v.)
  - `messages.ts` – các thông báo hệ thống (MSG01, MSG02, ...)
  - `enum.ts` – các enum dùng chung
  - `role.ts` – các hằng số vai trò
  - `menu.ts` – cấu hình menu
  - `code.ts` – các mã code
  - `other.ts` – các hằng số khác
  
  **Không hardcode** các giá trị đã có sẵn trong các file constant. Luôn import từ `@/constants/...` để đảm bảo tính nhất quán và dễ bảo trì.

- **Button Variants:** Tất cả các button trong hệ thống **phải sử dụng** component `Button` từ `src/components/ui/button.tsx` với một trong các variant đã định nghĩa sẵn để đảm bảo đồng nhất giao diện:
  - `primary` – Gradient tím-xanh, có shadow, dùng cho hành động chính (CTA)
  - `secondary` – Nền slate tối, viền, dùng cho hành động phụ
  - `danger` – Tông đỏ, dùng cho hành động nguy hiểm (xóa, hủy, v.v.)
  - `ghost` – Không nền, chỉ text, dùng cho hành động ít quan trọng
  - `outline` – Chỉ viền, dùng cho hành động thay thế
  - `default` – Style mặc định của hệ thống
  
  **Không tự style button bằng Tailwind CSS thủ công.** Luôn sử dụng `<Button variant="..." size="...">` để giữ giao diện thống nhất toàn hệ thống.
