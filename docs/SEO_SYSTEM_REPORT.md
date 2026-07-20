# Bao cao SEO va kien truc he thong Future Studio

Ngay lap bao cao: 20/07/2026

Domain chinh thuc: https://futurestudiovn.com/

## 1. Muc tieu trien khai

Giai doan nay tao nen tang de trinh tim kiem nhan dien website ma khong thay doi giao dien, layout, animation, Quick View, luong admin hay du lieu Supabase.

Pham vi da trien khai:

- Khai bao dung ngon ngu tieng Viet cho tai lieu HTML.
- Bo sung title va description mo ta linh vuc hoat dong.
- Bo sung canonical tro ve domain chinh thuc.
- Cho phep bot index va hien thi preview anh, video, snippet lon.
- Bo sung Open Graph cho Facebook, Zalo, LinkedIn va cac nen tang chia se link.
- Bo sung Twitter Card.
- Bo sung structured data Organization va WebSite.
- Tao robots.txt.
- Tao sitemap.xml cho trang chu.
- Bo sung noi dung noscript toi thieu.

## 2. Kien truc he thong hien tai

### Workspace

Repository su dung npm workspaces gom hai phan:

- frontend: giao dien React/Vite duoc build va deploy len Vercel.
- backend: dich vu backend tach rieng trong workspace.

Lenh build tai thu muc goc chay build cua frontend.

### Frontend

Nen tang chinh:

- React 19.
- TypeScript.
- Vite 8.
- React Router voi HashRouter.
- TanStack Query de quan ly truy van va cache.
- Framer Motion cho animation.
- Supabase JavaScript SDK cho Authentication, Database va Storage.

### Routing

Website hien dung HashRouter. Vi du:

- /#/all-products
- /#/tvc
- /#/cartoon-3d
- /#/art
- /#/showreel
- /#/team
- /#/contact
- /#/admin

HashRouter giup ung dung SPA chay ma khong can rewrite tren server. Tuy nhien phan URL sau dau # khong duoc xem la mot tai lieu HTTP doc lap, vi vay sitemap giai doan nay chi nen khai bao trang chu.

### Du lieu va quan tri

San pham duoc doc va ghi qua Supabase.

- Authentication bao ve che do quan tri.
- Bang products luu thong tin project va Quick View layout.
- Supabase Storage bucket product-media luu thumbnail, partner logo, anh, video va media upload.
- React Hook Form va Zod kiem tra du lieu form.
- Uppy/TUS xu ly upload file lon va upload tiep tuc khi ket noi khong on dinh.

### Quick View

Quick View duoc tao tu quick_view_layout trong du lieu san pham. Admin Builder tao cac block image, grid, video, text, embed va model. Phan preview trong admin dung chung cach hien thi voi Quick View cong khai de giam sai lech giao dien.

## 3. Cac file SEO da thay doi

### frontend/index.html

Chua metadata toan website:

- html lang vi.
- title.
- meta description.
- robots directives.
- canonical URL.
- Open Graph.
- Twitter Card.
- JSON-LD Organization va WebSite.

File nay chi thay doi noi dung head va noscript. React root va script khoi dong ung dung duoc giu nguyen.

### frontend/public/robots.txt

Cho phep moi bot crawl website va chi dia chi sitemap chinh thuc.

URL sau deploy:

https://futurestudiovn.com/robots.txt

### frontend/public/sitemap.xml

Hien khai bao trang chu la URL co the index an toan. Sau khi chuyen sang URL sach, sitemap se duoc mo rong cho cac trang danh muc va tung project.

URL sau deploy:

https://futurestudiovn.com/sitemap.xml

## 4. Nhung phan khong bi thay doi

- Khong sua CSS.
- Khong sua component giao dien.
- Khong sua Header.
- Khong sua Quick View.
- Khong sua Product Admin.
- Khong sua animation.
- Khong sua responsive.
- Khong sua schema Supabase.
- Khong sua du lieu san pham.
- Khong thay HashRouter trong giai doan nay.

## 5. Han che con lai

### HashRouter

Google co the index trang chu, nhung kho quan ly moi route hash nhu mot trang rieng. Cac trang danh muc va project chua co canonical, title va description doc lap.

### Client-side rendering

HTML ban dau van la app shell va noi dung chinh duoc React tai sau. Google co the render JavaScript, nhung toc do phat hien va index co the cham hon prerender hoac server-side rendering.

### Anh chia se

Metadata hien dung images/logo.jpg lam anh chia se tam thoi. Nen thiet ke anh social cover 1200 x 630 px, dung luong nho hon 500 KB va thay URL og:image trong index.html.

### Thong tin doanh nghiep

Structured data chua khai bao dia chi, dien thoai va cac tai khoan mang xa hoi vi can du lieu chinh xac tu chu doanh nghiep.

## 6. Quy trinh deploy va kiem tra

Sau khi day code va deploy Vercel:

1. Mo https://futurestudiovn.com/robots.txt va xac nhan HTTP 200.
2. Mo https://futurestudiovn.com/sitemap.xml va xac nhan XML hien thi.
3. Xem source trang chu va xac nhan title, description, canonical va JSON-LD.
4. Kiem tra preview link bang Facebook Sharing Debugger.
5. Kiem tra structured data bang Google Rich Results Test.

## 7. Google Search Console

Phan nay can tai khoan cua chu domain:

1. Truy cap https://search.google.com/search-console.
2. Chon Add property.
3. Chon Domain.
4. Nhap futurestudiovn.com.
5. Them TXT record Google cung cap vao DNS cua domain.
6. Cho DNS cap nhat va bam Verify.
7. Mo Sitemaps va gui sitemap.xml.
8. Mo URL Inspection, nhap https://futurestudiovn.com/ va chon Request indexing.

Khong dua private key, service role key hoac mat khau vao source code. Ma xac minh Search Console co the dat bang DNS TXT ma khong can thay doi giao dien.

## 8. Giai doan tiep theo de xuat

Giai doan 2 can duoc thuc hien rieng vi co lien quan den routing:

- Chuyen HashRouter sang BrowserRouter.
- Them Vercel rewrite ve index.html.
- Ho tro redirect tu link hash cu sang URL sach.
- Tao URL rieng cho tung project.
- Tao metadata dong cho tung route.
- Mo rong sitemap cho danh muc va project.

Giai doan 3 la prerender cac trang cong khai. Muc tieu la dua noi dung quan trong vao HTML ban dau cho bot va nguoi dung, nhung van giu nguyen giao dien React hien tai.

Moi giai doan routing va prerender can duoc deploy thu, kiem tra direct URL, refresh URL, mobile scrolling, Quick View va admin truoc khi dua len production.

## 9. Cap nhat giai doan 2 - URL sach

Giai doan 2 chuyen ung dung tu HashRouter sang BrowserRouter ma khong thay doi component giao dien.

- URL danh muc khong con dau #.
- Link hash cu tu dong chuyen sang URL moi.
- Moi project co URL dang /projects/ten-project-id.
- Quick View van dung component cu va tu mo theo id trong URL.
- Dong Quick View quay ve route da mo project hoac /all-products khi truy cap truc tiep.
- Moi route cong khai co title, description, canonical va robots rieng.
- Route /admin duoc dat noindex, nofollow.
- Vercel rewrite tra index.html cho route SPA khi refresh hoac truy cap truc tiep.
- Sitemap duoc tao lai truoc moi build va lay project tu Supabase neu bien moi truong kha dung.

File moi: LegacyHashRedirect.tsx, RouteMetadata.tsx, projectRoutes.ts, seo.ts, generate-sitemap.mjs va vercel.json.

Link cu /#/team va /#/all-products se tu dong thanh /team va /all-products. Anchor trang chu dang #about hoac #contact khong bi thay doi.
