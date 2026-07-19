# Test case website Future Studio

## Các test case E2E đã tự động hóa

| Mã | Chức năng | Các bước thực hiện | Kết quả mong đợi | File test tự động |
| --- | --- | --- | --- | --- |
| PROD-001 | Tất cả sản phẩm | Mở `/#/all-products` với dữ liệu sản phẩm Supabase giả lập. | Tất cả sản phẩm trả về từ Supabase đều được hiển thị. | `products.spec.ts` |
| PROD-002 | Phân loại sản phẩm | Mở `/#/tvc`. | Chỉ những sản phẩm có danh mục `tvc` được hiển thị. | `products.spec.ts` |
| PROD-003 | Quick View | Bấm vào ảnh thumbnail của một sản phẩm. | Quick View mở đúng tiêu đề và nội dung media của sản phẩm được chọn. | `products.spec.ts` |
| PROD-004 | Quick View | Nhấn phím Escape khi Quick View đang mở. | Quick View đóng lại và trang Products tiếp tục sử dụng được. | `products.spec.ts` |
| AUTH-001 | Phân quyền | Mở trang Products khi chưa đăng nhập admin. | Các nút Tạo dự án, Sửa và Xóa không được hiển thị. | `products.spec.ts` |
| NAV-001 | Điều hướng | Lần lượt mở các trang Products, Team và Contact. | Mỗi đường dẫn hiển thị đúng nội dung chính của trang tương ứng. | `products.spec.ts` |
| RESP-001 | Responsive điện thoại | Mở Products bằng kích thước màn hình điện thoại và cuộn xuống. | Trang cuộn dọc bình thường, các card không chặn thao tác cảm ứng. | `products.mobile.spec.ts` |
| RESP-002 | Quick View điện thoại | Mở Quick View bằng kích thước màn hình điện thoại. | Modal nằm gọn trong màn hình và có thể đóng bằng phím Escape. | `products.mobile.spec.ts` |
| VIS-001 | Giao diện Products desktop | Chụp toàn bộ trang All Products trên desktop. | Giao diện khớp với ảnh chuẩn desktop đã được duyệt. | `visual.spec.ts` |
| VIS-002 | Giao diện Quick View desktop | Mở và chụp modal Quick View trên desktop. | Giao diện khớp với ảnh chuẩn Quick View desktop. | `visual.spec.ts` |
| VIS-003 | Giao diện Products mobile | Chụp toàn bộ trang All Products bằng thiết bị Pixel 7. | Giao diện khớp với ảnh chuẩn mobile đã được duyệt. | `visual.mobile.spec.ts` |
| VIS-004 | Giao diện Quick View mobile | Mở và chụp Quick View bằng thiết bị Pixel 7. | Giao diện khớp với ảnh chuẩn Quick View mobile. | `visual.mobile.spec.ts` |

## Test case admin cần dự án Supabase thử nghiệm riêng

Những test case dưới đây chưa tự động ghi dữ liệu để tránh làm thay đổi database production.

| Mã | Chức năng | Các bước thực hiện | Kết quả mong đợi |
| --- | --- | --- | --- |
| ADMIN-001 | Đăng nhập | Đăng nhập bằng tài khoản admin hợp lệ. | Mục Login chuyển thành Admin và các nút quản lý xuất hiện. |
| ADMIN-002 | Thêm sản phẩm | Điền thông tin dự án, thêm các block media, xác nhận và lưu. | Sản phẩm được lưu và xuất hiện trong danh mục đã chọn. |
| ADMIN-003 | Sửa sản phẩm | Thay đổi tiêu đề, ảnh bìa, logo đối tác và các block Quick View rồi lưu. | Nội dung mới vẫn được giữ nguyên sau khi tải lại trang. |
| ADMIN-004 | Xóa sản phẩm | Bấm Xóa và xác nhận cảnh báo. | Sản phẩm bị xóa và không xuất hiện lại sau khi tải trang. |
| ADMIN-005 | Kiểm tra dữ liệu đầu vào | Bỏ trống trường bắt buộc hoặc nhập URL không được hỗ trợ rồi gửi form. | Hệ thống hiển thị thông báo rõ ràng và không ghi dữ liệu sai vào Supabase. |
| ADMIN-006 | Bảo mật RLS | Thử thêm, sửa hoặc xóa sản phẩm khi chưa đăng nhập. | Supabase từ chối yêu cầu. |

## Các câu lệnh chạy test

Chạy toàn bộ test chức năng và giao diện:

```powershell
npm.cmd test
```

Chạy test và hiển thị trình duyệt:

```powershell
npm.cmd run test:e2e:headed
```

Mở giao diện quản lý Playwright:

```powershell
npm.cmd run test:e2e:ui
```

Mở báo cáo test HTML:

```powershell
npm.cmd run test:e2e:report
```

Cập nhật ảnh giao diện chuẩn khi thay đổi thiết kế có chủ ý:

```powershell
npm.cmd run test:e2e -- --update-snapshots
```

Chỉ cập nhật snapshot sau khi đã kiểm tra và chấp nhận giao diện mới.
