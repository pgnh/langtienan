# 📋 KẾ HOẠCH TRIỂN KHAI DỰ ÁN (PLAN.md)
**Dự án**: Làng Tiền An - Game Nông Trại Mộc Bản Đông Hồ (PWA)  
**Tiến độ mục tiêu**: 5 Phase tuần tự  
**Phương pháp thực thi**: Test-Driven, Tối ưu hóa hiệu năng di động, Server-Authoritative Anti-Cheat  

---

## 🗺️ TỔNG QUAN LỘ TRÌNH TRIỂN KHAI (ROADMAP)

```
[Phase 1: Foundation & Asset Loading]
       │
       ▼
[Phase 2: World Rendering & HUD Scene]
       │
       ▼
[Phase 3: Farming Mechanics & Core Loop]
       │
       ▼
[Phase 4: Crafting Woodcut & Economy]
       │
       ▼
[Phase 5: Supabase Sync, PWA & Polish]
```

---

## 🎯 CHI TIẾT TỪNG GIAI ĐOẠN & DANH SÁCH CÔNG VIỆC (CHECKLIST)

### 📌 PHASE 1: FOUNDATION & ASSET LOADING
> **Mục tiêu**: Chuẩn hóa cấu hình Vite, nạp các thư viện tài nguyên mộc bản, Web Font thư pháp và dựng bộ khung Scene ban đầu.

- [x] **Task 1.1**: Chuẩn hóa cấu hình Scale Manager và Game Config cho tỷ lệ màn hình 9:16 (`720 × 1280 px`).
  - *File đã sửa*: [`src/config/gameConfig.ts`](file:///d:/PWA%20Game/langtienan/src/config/gameConfig.ts)
  - *Mô tả*: Cấu hình `Phaser.Scale.FIT`, `autoCenter: Phaser.Scale.CENTER_BOTH`, canvas nền màu giấy điệp `#F4EBD9`.
- [x] **Task 1.2**: Tối ưu hóa và hoàn thiện `BootScene` & Quản lý Assets.
  - *File đã tạo/sửa*: [`src/constants/assets.ts`](file:///d:/PWA%20Game/langtienan/src/constants/assets.ts), [`src/scenes/BootScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/BootScene.ts)
  - *Mô tả*: Khai báo danh mục asset thực tế, hiển thị thanh tiến trình nạp (progress bar), tự động chuyển tiếp sang `FarmWorldScene` và khởi chạy song song `HUDOverlayScene`.
- [x] **Task 1.3**: Xây dựng hệ thống Type Definitions chuẩn mực cho nông trại, mộc bản và tiền tệ.
  - *File đã sửa*: [`src/types/farm.ts`](file:///d:/PWA%20Game/langtienan/src/types/farm.ts), [`src/types/database.ts`](file:///d:/PWA%20Game/langtienan/src/types/database.ts)
  - *Mô tả*: Khai báo đầy đủ enum `CropType`, `CropStage`, `WoodcutBuffType`, `PhuOngRank` cùng các interface `WoodcutRecipe`, `InventoryItem`, `UserInventoryRow`, `UserWoodcutRow`.

---

### 📌 PHASE 2: WORLD RENDERING & HUD SCENE
> **Mục tiêu**: Dựng thế giới cuộn dọc `720 × 2200px` với camera quán tính mượt mà và lớp UI cố định độc lập.

- [x] **Task 2.1**: Dựng các tầng canh tác trong `FarmWorldScene`.
  - *File đã sửa*: [`src/scenes/FarmWorldScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/FarmWorldScene.ts)
  - *Mô tả*: Thiết lập world bounds 720 × 2200px, render nền giấy Điệp trải dài, sắp đặt địa hình theo đúng thứ tự depth: Tầng 1 (Ao Bèo & Bến Nước: bè tre, hiệu ứng cá bơi), Tầng 2 (Vườn Chuối Bãi Bồi: bụi chuối đung đưa, bù nhìn rơm), Tầng 3 (Lò Gạch Cũ: vòm lò, kệ gạch nung, bậc đá, 2 NPC Chí Phèo & Thị Nở có tween nhấp nhô idle nhẹ), Tầng 5 (Cây đa cổ thụ góc trên bên phải).
- [x] **Task 2.2**: Lập trình hệ thống camera cuộn dọc với gia tốc quán tính (Inertia Drag-to-Scroll).
  - *File đã sửa*: [`src/scenes/FarmWorldScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/FarmWorldScene.ts)
  - *Mô tả*: Giới hạn camera bounds `Y: 0..2200`, khóa cứng cuộn ngang trục X, hỗ trợ thao tác vuốt 1 ngón tay cái & cuộn chuột, tích lũy vận tốc kéo thả tức thời và tự động hãm đà êm ái khi dừng vuốt (damping friction ~0.92).
- [x] **Task 2.3**: Dựng thanh trạng thái cố định `TopStatusBar` trên `HUDOverlayScene`.
  - *File đã sửa*: [`src/ui/TopStatusBar.ts`](file:///d:/PWA%20Game/langtienan/src/ui/TopStatusBar.ts), [`src/scenes/HUDOverlayScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/HUDOverlayScene.ts)
  - *Mô tả*: Khung nền cuộn giấy parchment (`stats_parchment.png`) góc trên bên trái, hiển thị avatar tước hiệu Phú Ông, cấp độ động kèm thanh tiến trình kinh nghiệm màu ngọc bích, 2 hộp số dư Vàng Nén & Giấy Điệp, nút Cài Đặt bánh răng gỗ (`btn_setting.png`) góc trên bên phải hỗ trợ bật/tắt âm thanh.
- [x] **Task 2.4**: Dựng thanh điều hướng `BottomDock`.
  - *File đã sửa*: [`src/ui/BottomDock.ts`](file:///d:/PWA%20Game/langtienan/src/ui/BottomDock.ts), [`src/scenes/HUDOverlayScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/HUDOverlayScene.ts)
  - *Mô tả*: Khung đế gỗ mộc bản cố định sát đáy màn hình (`y: 1160`), bố trí 4 nút chức năng dạng mộc bản: Bản Đồ (`btn_map.png`), Tạp Hóa (`btn_shop.png`), Khắc Gỗ (`btn_woodcut.png`), Thành Tích (`btn_achievement.png`) kèm hiệu ứng Button Bounce Tween (co nhỏ 0.95 khi chạm, nảy đàn hồi 1.0 khi thả).
- [x] **Task 2.5**: Tích hợp Modal điều hướng nhanh tầng `TierNavigatorModal`.
  - *File đã sửa*: [`src/ui/TierNavigatorModal.ts`](file:///d:/PWA%20Game/langtienan/src/ui/TierNavigatorModal.ts), [`src/scenes/HUDOverlayScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/HUDOverlayScene.ts), [`src/scenes/FarmWorldScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/FarmWorldScene.ts)
  - *Mô tả*: Lớp phủ tối mờ toàn màn hình (Dark Overlay Alpha), hộp thoại mộc bản giấy Điệp cổ phong với nút đóng "X" dân gian, danh mục 5 tầng xếp từ trên xuống dưới (Sân Đình -> Ao Bèo). Khi bấm vào Bản Đồ mở modal, chọn tầng sẽ tự động đóng modal và phát sự kiện `SCROLL_TO_TIER` điều khiển camera lướt mượt mà (`Cubic.easeInOut`) đến vị trí tầng mục tiêu.

---

### 📌 PHASE 3: FARMING MECHANICS & CORE LOOP
> **Mục tiêu**: Xây dựng toàn diện cơ chế ô canh tác, chu kỳ sinh trưởng, tương tác một chạm và bộ đếm thời gian.

- [x] **Task 3.1**: Xây dựng Component `FarmSlotObject` tương tác đa năng.
  - *File đã tạo/sửa*: [`src/ui/FarmSlotObject.ts`](file:///d:/PWA%20Game/langtienan/src/ui/FarmSlotObject.ts), [`src/scenes/FarmWorldScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/FarmWorldScene.ts)
  - *Mô tả*: Kế thừa `Phaser.GameObjects.Container`, quản lý chặt chẽ 3 trạng thái cốt lõi: `EMPTY` (ô trống chờ gieo hạt/đốt lò), `GROWING` (hiển thị mầm cây/lửa đỏ lò gạch, thanh tiến trình và nhãn đếm ngược timer mm:ss theo từng giây), `READY` (hiển thị tag "CHÍN!" / "RA LÒ!", hiệu ứng nhấp nháy phát sáng Tween Scale/Alpha pulse mời gọi thu hoạch). Hỗ trợ tương tác chạm: `EMPTY` mở khay hạt giống, `READY` thu hoạch.
- [x] **Task 3.2**: Xây dựng Bảng tham số cây trồng & sản phẩm thủ công chuẩn GDD.
  - *File đã sửa*: [`src/constants/crops.ts`](file:///d:/PWA%20Game/langtienan/src/constants/crops.ts), [`src/types/farm.ts`](file:///d:/PWA%20Game/langtienan/src/types/farm.ts)
  - *Mô tả*: Hoàn thiện bảng tham số đầy đủ chuẩn GDD: Bèo Hoa Dâu (60s), Chuối Ngự (300s), Ngô Nếp (1800s), Cá Chép (900s), Ốc Mít (2700s), Gạch Nung (1200s), Gạch Bát Tràng (7200s). Khai báo đầy đủ các trường `id`, `name`, `tierId`, `growthTime`, `cost`, `rewardExp`, `rewardGold` và `assetKeys` liên kết asset thực tế.
- [x] **Task 3.3**: Lập trình khay chọn hạt giống & sản phẩm khi chạm ô trống.
  - *File đã tạo/sửa*: [`src/ui/SeedSelectorDrawer.ts`](file:///d:/PWA%20Game/langtienan/src/ui/SeedSelectorDrawer.ts), [`src/scenes/HUDOverlayScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/HUDOverlayScene.ts), [`src/scenes/FarmWorldScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/FarmWorldScene.ts)
  - *Mô tả*: Khay trượt Bottom Drawer bật lên khi chạm vào ô `EMPTY`, tự động lọc danh sách hạt giống theo tầng hiện tại. Hiển thị thẻ giống (tên, icon, thời gian, chi phí, phần thưởng ROI, nút Gieo trồng / Đốt lò), kiểm tra số dư Vàng Nén (nếu thiếu tiền sẽ rung lắc nút và hiển thị cảnh báo đỏ), gieo thành công đổi trạng thái ô sang `GROWING` và đếm ngược; hỗ trợ nút đóng và bấm dimmer ngoài để đóng.
- [x] **Task 3.4**: Hiệu ứng thu hoạch nổi (Juice & Flying Icons).
  - *File đã tạo/sửa*: [`src/utils/fx.ts`](file:///d:/PWA%20Game/langtienan/src/utils/fx.ts), [`src/ui/TopStatusBar.ts`](file:///d:/PWA%20Game/langtienan/src/ui/TopStatusBar.ts), [`src/scenes/FarmWorldScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/FarmWorldScene.ts), [`src/scenes/HUDOverlayScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/HUDOverlayScene.ts)
  - *Mô tả*: Khi thu hoạch ô `READY`, ô lập tức chuyển về `EMPTY`, kích hoạt hiệu ứng pháo hoa dân gian (confetti + star particles) tại ô đất, sinh chùm icon Vàng Nén & nông sản bay theo đường cong Quadratic Bezier về phía hộp số dư trên `TopStatusBar`. Khi icon chạm đích kích hoạt hiệu ứng nảy nhẹ (Punch Scale Tween) trên hộp vàng/thanh EXP và cộng dồn tài nguyên.

---

### 📌 PHASE 4: CRAFTING WOODCUT & ECONOMY
> **Mục tiêu**: Hiện thực hóa hệ thống Bàn Chế Tác Mộc Bản Đông Hồ, Ngăn Kéo Tiệm Tạp Hóa và Sổ Đinh Thành Tích.

- [x] **Task 4.1**: Xây dựng Modal `Bàn Chế Tác Mộc Bản` (Woodcut Studio).
  - *File đã tạo/sửa*: [`src/ui/WoodcutStudioModal.ts`](file:///d:/PWA%20Game/langtienan/src/ui/WoodcutStudioModal.ts), [`src/scenes/HUDOverlayScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/HUDOverlayScene.ts)
  - *Mô tả*: Giao diện mô phỏng quyển sách cổ mở đôi (dựa theo ảnh mẫu `public/assets/references/6. Bàn chế tác mộc bản.png`). Trang trái hiển thị 3 kho nguyên liệu (Gỗ Thị, Bát Bột Màu, Giấy Điệp), thông tin bản thảo được chọn và nút bấm gỗ đỏ "KHẮC GỖ". Trang phải hiển thị danh sách 4 thẻ tranh mộc bản Đông Hồ (*Lợn Âm Dương*, *Gà Đại Cát*, *Đám Cưới Chuột*, *Cá Chép Trông Trăng*), thanh tiến trình khắc ván in (Progress Bar), con dấu triện son đỏ "ĐÃ ẤN" và nút "ẤN DẤU SON". Nút đóng modal phong cách mộc bản.
- [x] **Task 4.2**: Xây dựng cơ chế Ấn Định Dấu Son & Passive Buffs.
  - *File đã tạo/sửa*: [`src/services/woodcutService.ts`](file:///d:/PWA%20Game/langtienan/src/services/woodcutService.ts), [`src/services/supabase.ts`](file:///d:/PWA%20Game/langtienan/src/services/supabase.ts)
  - *Mô tả*: Quản lý kho nguyên liệu mộc bản, danh mục công thức khắc ván in Đông Hồ: *Lợn Âm Dương* (Tầng 1: +15% cơ hội bắt cá hiếm & tăng sản lượng), *Gà Đại Cát* (Tầng 2: -15% thời gian sinh trưởng), *Đám Cưới Chuột* (Tầng 3: -20% thời gian nung và tiết kiệm củi), *Cá Chép Trông Trăng* (Tầng 1: +20% giá bán). Hàm `stampToFloor()` đóng dấu son đỏ kích hoạt buff vào tầng tương ứng, đấu nối trực tiếp vào `GameService` tự động giảm thời gian `plantCrop` và tăng sản lượng Vàng `harvestCrop`.
- [x] **Task 4.3**: Hoàn thiện `StoreDrawer` (Ngăn Kéo Tiệm Tạp Hóa).
  - *File đã sửa*: [`src/ui/StoreDrawer.ts`](file:///d:/PWA%20Game/langtienan/src/ui/StoreDrawer.ts), [`src/services/supabase.ts`](file:///d:/PWA%20Game/langtienan/src/services/supabase.ts)
  - *Mô tả*: Dựng bảng gỗ cuộn mộc bản chia 3 Tab: Mua hạt/con giống, Bán nông sản trong kho đồ lấy Vàng Nén, và Hợp đồng giao thương đặc biệt của dân làng (Bát Cháo Hành Thị Nở, Lò Than Chí Phèo, Tiến Vua Bá Kiến). Bổ sung nút đỏ mộc bản "ĐÓNG GIAO DỊCH" ở đáy ngăn kéo.
- [x] **Task 4.4**: Xây dựng Modal `Sổ Đinh Thành Tích` (Achievement Log).
  - *File đã tạo/sửa*: [`src/ui/AchievementModal.ts`](file:///d:/PWA%20Game/langtienan/src/ui/AchievementModal.ts), [`src/scenes/HUDOverlayScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/HUDOverlayScene.ts)
  - *Mô tả*: Thiết kế dạng cuốn sổ mở hai trang gáy chỉ cổ truyền (dựa theo ảnh mẫu `public/assets/references/5. Sổ đinh thành tích.jpg`). Cột trái hiển thị Nhiệm Vụ Ngày (vớt bèo, nung gạch, gieo chuối) kèm tiến độ và nút nhận thưởng Vàng/Fame. Cột phải hiển thị Bảng Vàng Phú Ông với các mốc danh vọng, nhận Giấy Điệp và đóng dấu son đỏ "[ĐÃ NHẬN]". Nút đóng modal phong cách mộc bản.
- [x] **Task 4.5**: Xây dựng Modal `Chiếu Thư Khai Mở` (Imperial Decree).
  - *File đã tạo/sửa*: [`src/ui/ImperialDecreeModal.ts`](file:///d:/PWA%20Game/langtienan/src/ui/ImperialDecreeModal.ts), [`src/scenes/HUDOverlayScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/HUDOverlayScene.ts), [`src/scenes/FarmWorldScene.ts`](file:///d:/PWA%20Game/langtienan/src/scenes/FarmWorldScene.ts)
  - *Mô tả*: Cuộn sắc phong hoàng kim hai đầu trục cuốn gỗ dựa theo ảnh mẫu `public/assets/references/4. Chiếu thư khai mở.jpg`. Tuyên cáo điều kiện khai hoang lập tầng mới (Vàng Nén + Cấp độ Phú Ông), nút bấm "🏮 KHAI HOANG LẬP TẦNG" và nút phụ "ĐỂ SAU", kết nối kích hoạt mở tầng qua sự kiện liên Scene.

---

### 📌 PHASE 5: SUPABASE SYNC, PWA & POLISH
> **Mục tiêu**: Đấu nối máy chủ Supabase Server-Authoritative, kích hoạt PWA Cache Offline và hoàn thiện âm thanh sáo trúc cổ truyền.

- [ ] **Task 5.1**: Đồng bộ hóa dữ liệu trực tiếp với Supabase Database & RPCs.
  - *File cần sửa*: [`src/services/supabase.ts`](file:///d:/PWA%20Game/langtienan/src/services/supabase.ts)
  - *Mô tả*: Gọi RPC `plant_crop` và `harvest_crop` kiểm chứng an toàn qua PostgreSQL; đảm bảo cơ chế LocalStorage Fallback tự động khi mất kết nối.
- [ ] **Task 5.2**: Tích hợp toàn diện hiệu ứng âm thanh (Audio Manager).
  - *File cần sửa*: [`src/services/soundService.ts`](file:///d:/PWA%20Game/langtienan/src/services/soundService.ts)
  - *Mô tả*: Phát âm thanh gõ phách tre khi bấm nút, tiếng cá quẫy sóng Tầng 1, tiếng củi than nổ lách tách Tầng 3, tiếng chiêng trống hội Tầng 5.
- [ ] **Task 5.3**: Cấu hình PWA Manifest & Service Worker Cache.
  - *File cần sửa*: [`index.html`](file:///d:/PWA%20Game/langtienan/index.html), [`vite.config.ts`](file:///d:/PWA%20Game/langtienan/vite.config.ts)
  - *Mô tả*: Cấu hình `manifest.webmanifest`, app icon mộc bản, caching asset offline cho phép cài đặt vào màn hình chính điện thoại.
- [ ] **Task 5.4**: Kiểm thử hiệu năng (Playtest & Profiling).
  - *Mô tả*: Đảm bảo duy trì 60 FPS ổn định, Draw Calls $\le 15$, kích thước nạp ban đầu $< 5MB$.
