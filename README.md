# 🌾 Làng Tiền An - Game Nông Trại Mộc Bản Đông Hồ (PWA)

> **Thể loại**: Casual Vertical Farming / Idle Simulation  
> **Phong cách nghệ thuật**: Tranh dân gian Đông Hồ trên nền Giấy Điệp kết hợp Văn học hiện thực Việt Nam  
> **Công nghệ**: Phaser 3, TypeScript, Vite, Supabase (Server-Authoritative)

---

## 🎨 Giới Thiệu
**Làng Tiền An** là tựa web game mô phỏng nông trại và chế tác truyền thống dạng màn hình dọc (Responsive 9:16), kế thừa cơ chế gây nghiện kinh điển của *Khu Vườn Trên Mây (Sky Garden)* kết hợp cùng hồn cốt văn hóa Bắc Bộ xưa qua nét vẽ khắc mộc bản tranh Đông Hồ.

---

## 🏗️ Cấu Trúc 5 Tầng Canh Tác Cuộn Dọc (`720 × 2200px`)

| Tầng | Tên Khu Vực | Sản Phẩm Canh Tác | Thời Gian (GDD) | Đặc Điểm |
| :---: | :--- | :--- | :--- | :--- |
| **T5** | **Sân Đình Cổ Kính** | Sự kiện Hội Làng, Dâng cúng | Theo sự kiện | Gốc đa ngàn năm, rước kiệu, múa rối |
| **T4** | **Xưởng Giấy Dó** | Giấy Dó Thô, Giấy Điệp Ánh Bạc | 1 giờ / 4 giờ | Thầy Đồ Cóc kiểm định chất lượng |
| **T3** | **Lò Gạch Cũ** | Gạch Nung Đất Sét, Gạch Bát Tràng | 20 phút / 2 giờ | Bác Chí Phèo nung gạch cần cù |
| **T2** | **Vườn Chuối Bãi Bồi** | Chuối Ngự Nam Sang, Ngô Nếp | 5 phút / 30 phút | Đất phù sa sông Đáy màu mỡ |
| **T1** | **Ao Bèo & Bến Nước** | Bèo Hoa Dâu, Cá Chép, Ốc Mít | 1 phút / 15p / 45p | Bến nước mênh mang, cá quẫy sóng |

---

## 🛡️ Kiến Trúc Server-Authoritative (Supabase)
Hệ thống máy chủ kiểm soát toàn quyền nhằm triệt tiêu hoàn toàn gian lận thay đổi dữ liệu máy khách hoặc tua giờ hệ thống:
- **`plant_crop` (RPC)**: Khấu trừ Vàng an toàn, tính thời điểm thu hoạch `harvest_at = NOW() + INTERVAL` trên server.
- **`harvest_crop` (RPC)**: Khóa dòng (`FOR UPDATE`), xác thực `NOW() >= harvest_at` trước khi cộng thưởng Vàng và Danh Vọng.
- **Smart Local Fallback**: Khi chưa cấu hình API Key, game tự động chuyển sang bộ mô phỏng máy chủ cục bộ trên `localStorage`.

---

## 🚀 Cài Đặt & Chạy Cục Bộ

```bash
# 1. Cài đặt các gói phụ thuộc
pnpm install

# 2. Khởi chạy máy chủ phát triển
pnpm run dev

# 3. Biên dịch phiên bản phát hành PWA
pnpm run build
```

---

## 📜 Thiết Lập Cơ Sở Dữ Liệu Supabase
1. Đăng nhập vào [Supabase](https://supabase.com).
2. Mở **SQL Editor**.
3. Dán và thực thi toàn bộ nội dung file:
   `supabase/migrations/20261019_init_langtienan.sql`
4. Sao chép URL và Anon Key vào `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
