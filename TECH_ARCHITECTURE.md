# 🏛️ TÀI LIỆU KIẾN TRÚC KỸ THUẬT (TECH_ARCHITECTURE)
**Dự án**: Làng Tiền An - Game Nông Trại Mộc Bản Đông Hồ (PWA)  
**Ngôn ngữ & Framework**: TypeScript 5+, Phaser 3 (HTML5 Canvas/WebGL Engine), Vite 5  
**Hạ tầng Dữ liệu**: Supabase (PostgreSQL 15+, Row-Level Security, RPC Functions)  
**Tiêu chuẩn Vận hành**: Server-Authoritative Logic, Offline-first Fallback, Progressive Web App (PWA)  

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

Làng Tiền An áp dụng mô hình **Server-Authoritative** kết hợp **Client Predictive Simulation** (Mô phỏng máy khách song hành xác thực máy chủ). Máy khách chịu trách nhiệm render mượt mà 60 FPS, phản hồi cử chỉ người dùng ngay lập tức, trong khi mọi logic tăng giảm tiền tệ, thời gian thu hoạch nông sản đều được kiểm soát và phê chuẩn độc quyền bởi PostgreSQL Database trên Supabase.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TRÌNH DUYỆT NGƯỜI DÙNG (PWA)                    │
│                                                                        │
│  ┌────────────────────────┐         ┌───────────────────────────────┐  │
│  │     HUDOverlayScene    │         │        FarmWorldScene         │  │
│  │ (Camera cố định 0,0)   │         │ (Camera cuộn dọc Y: 0..2200)  │  │
│  │  - TopStatusBar        │         │  - T5: Sân Đình Cổ Kính       │  │
│  │  - BottomDock          │         │  - T4: Xưởng Giấy Dó          │  │
│  │  - Popups / Modals     │         │  - T3: Lò Gạch Cũ (Chí Phèo)  │  │
│  │  - Tiệm Tạp Hóa Drawer │         │  - T2: Vườn Chuối (Bãi Bồi)   │  │
│  │  - Bàn Mộc Bản Studio  │         │  - T1: Ao Bèo & Bến Nước      │  │
│  └───────────┬────────────┘         └───────────────┬───────────────┘  │
│              │                                      │                  │
│              └──────────────────┬───────────────────┘                  │
│                                 ▼                                      │
│                  ┌───────────────────────────────┐                     │
│                  │  GLOBAL EVENT BUS (Phaser)   │                     │
│                  │  - FARM_EVENTS (Plant/Harvest)│                     │
│                  │  - HUD_EVENTS (Gold/Fame/UI)  │                     │
│                  └──────────────┬────────────────┘                     │
│                                 │                                      │
│                  ┌──────────────▼────────────────┐                     │
│                  │     SUPABASE DATA SERVICE     │                     │
│                  │  (Cache + Sync + LocalEngine) │                     │
│                  └──────────────┬────────────────┘                     │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │ HTTPS (RPC / REST)
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND (PostgreSQL)                     │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ BẢNG DỮ LIỆU CỐT LÕI (Row-Level Security Enabled)                │  │
│  │  - profiles (id, username, gold_coins, fame_exp, paper_currency) │  │
│  │  - farm_slots (id, user_id, floor_id, slot_index, harvest_at)    │  │
│  │  - user_inventory (id, user_id, item_code, quantity)             │  │
│  │  - user_woodcuts (id, user_id, woodcut_id, assigned_floor)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ STORED PROCEDURES (Chống Gian Lận Tua Giờ / Hack Tiền)           │  │
│  │  - plant_crop(slot_id, item_type)                                │  │
│  │  - harvest_crop(slot_id) [FOR UPDATE, NOW() >= harvest_at]       │  │
│  │  - craft_woodcut(woodcut_id)                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. PHÂN TÁCH LUỒNG SCENES & QUẢN LÝ VIEWPORT

### 2.1. Cấu hình Canvas Responsive 9:16
- **Kích thước Logic (Virtual Resolution)**: `720 × 1280 px`.
- **Thế giới Canh tác (World Dimension)**: `720 × 2200 px` (cuộn dọc 5 tầng).
- **Chế độ co giãn (Scale Mode)**: `Phaser.Scale.FIT`, tự động canh giữa màn hình thiết bị (`autoCenter: Phaser.Scale.CENTER_BOTH`), bảo đảm tỷ lệ không bị méo trên cả iPhone lẫn Android màn hình dài.

### 2.2. Vòng Đời Các Scenes (Scene Lifecycle)

```
[Khởi động App]
       │
       ▼
┌──────────────┐
│  BootScene   │ ──> Tải Font chữ Thư Pháp (Google Fonts), khởi tạo âm thanh cơ sở,
└──────┬───────┘     chuẩn bị tải Texture Atlas và Logo Mộc Bản.
       │
       ▼
┌──────────────┐
│ PreloadScene │ ──> Tải Texture Atlas tranh Đông Hồ (2048x2048), âm thanh phách tre,
└──────┬───────┘     kiểm tra phiên đăng nhập Supabase / LocalStorage Profile.
       │
       ▼
┌──────────────────────────────────────────────┐
│        KHỞI CHẠY ĐỒNG THỜI (PARALLEL)        │
│                                              │
│  ┌────────────────────┐ ┌─────────────────┐  │
│  │   FarmWorldScene   │ │ HUDOverlayScene │  │
│  │  (World & Camera)  │ │ (Fixed UI/Modal)│  │
│  └────────────────────┘ └─────────────────┘  │
└──────────────────────────────────────────────┘
```

1. **`BootScene`**:
   - Thiết lập cấu hình render ban đầu, nạp web font thư pháp tùy chỉnh.
   - Hiển thị thanh tiến trình tải hạt giấy điệp lấp lánh đặc trưng.
2. **`FarmWorldScene` (Background / Active World)**:
   - Quản lý cảnh quan thế giới nông thôn `720 × 2200px`.
   - Lập trình **Camera cuộn dọc mượt mà (Inertia Drag-to-Scroll)** với giới hạn biên trục Y từ `0` (Sân Đình) đến `2200` (Ao Bèo).
   - Render 5 tầng canh tác, điều khiển các GameObject ô đất, khói lò gạch bay lơ lửng, cá chép quẫy đuôi.
   - Phát hiện tương tác chạm (Touch/Click) vào từng ô đất và phát sự kiện lên Event Bus.
3. **`HUDOverlayScene` (Foreground / Top-layer)**:
   - Chạy song song độc lập trên cùng một canvas nhưng camera cố định hoàn toàn `(X: 0, Y: 0)`.
   - Giữ cố định `TopStatusBar` (hiển thị Vàng Nén, Giấy Điệp, Cấp Phú Ông) và `BottomDock` (4 nút chức năng điều hướng).
   - Đóng vai trò là **Trình quản lý Cửa sổ Bật lên (Modal Window Manager)**: Quản lý hiển thị ngăn kéo Tiệm Tạp Hóa, Sổ Đinh Thành Tích, Chiếu Thư Khai Mở, Bàn Chế Tác Mộc Bản với nền xám mờ (Backdrop tint).

---

## 3. STATE MANAGEMENT & EVENT BUS ARCHITECTURE

Để đảm bảo tính độc lập tuyệt đối giữa **Logic Xử Lý Dữ Liệu (Data Engine)** và **Hiển Thị Đồ Họa (Render Pipeline)**, hệ thống áp dụng cơ chế truyền tin hướng sự kiện (Event-Driven Architecture) thông qua bộ phát sự kiện của Phaser `game.events`:

```typescript
// Định nghĩa danh mục sự kiện chuẩn
export const GAME_EVENTS = {
    // Tương tác ô canh tác
    FARM_SLOT_CLICKED: 'farm:slot_clicked',
    CROP_PLANTED: 'farm:crop_planted',
    CROP_HARVESTED: 'farm:crop_harvested',
    CROP_RIPE_TICK: 'farm:crop_ripe_tick',

    // Cập nhật chỉ số kinh tế
    PROFILE_UPDATED: 'economy:profile_updated',
    GOLD_CHANGED: 'economy:gold_changed',
    FAME_CHANGED: 'economy:fame_changed',
    PAPER_CHANGED: 'economy:paper_changed',

    // Điều hướng & Modal
    NAVIGATE_TO_FLOOR: 'ui:navigate_floor',
    OPEN_STORE_DRAWER: 'ui:open_store',
    OPEN_WOODCUT_STUDIO: 'ui:open_woodcut',
    OPEN_ACHIEVEMENT_LOG: 'ui:open_achievements',
    SHOW_IMPERIAL_DECREE: 'ui:show_decree'
};
```

### Luồng tương tác mẫu (Gieo trồng & Thu hoạch):
1. Người chơi chạm vào ô đất số 2 tại Tầng 1 $\rightarrow$ `FarmWorldScene` phát ra `FARM_SLOT_CLICKED({ slotId, floorId: 1, currentStatus })`.
2. `HUDOverlayScene` lắng nghe, nếu ô rỗng $\rightarrow$ trượt mở khay chọn hạt giống tương ứng với Tầng đó.
3. Người chơi chọn giống "Bèo Hoa Dâu" $\rightarrow$ Gửi yêu cầu tới `SupabaseService.plantCrop(slotId, 'beo_hoa_dau')`.
4. Sau khi server trả lời thành công, `SupabaseService` phát ra `CROP_PLANTED` kèm theo mốc thời gian `harvest_at`.
5. `FarmWorldScene` cập nhật sprite sang mầm non và bắt đầu bộ đếm ngược.
6. `TopStatusBar` trên `HUDOverlayScene` tự động cập nhật số dư Vàng Nén bị trừ một cách êm ái.

---

## 4. SCHEMA CƠ SỞ DỮ LIỆU SUPABASE (SERVER-AUTHORITATIVE)

Cấu trúc cơ sở dữ liệu trên Supabase được thiết kế tuân thủ nghiêm ngặt chuẩn toàn vẹn ACID, chống gian lận và tối ưu chỉ mục:

### 4.1. Bảng Hồ Sơ Người Chơi (`public.profiles`)
Quản lý thông tin định danh và tài sản cốt lõi:
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL DEFAULT 'Dân Làng Tiền An',
    gold_coins BIGINT DEFAULT 100 CHECK (gold_coins >= 0),
    fame_exp BIGINT DEFAULT 0 CHECK (fame_exp >= 0),
    paper_currency INT DEFAULT 10 CHECK (paper_currency >= 0),
    unlocked_floors INT DEFAULT 1 CHECK (unlocked_floors >= 1 AND unlocked_floors <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Kích hoạt Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Xem hồ sơ cá nhân" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Sửa hồ sơ cơ bản" ON public.profiles FOR UPDATE USING (auth.uid() = id);
```

### 4.2. Bảng Ô Canh Tác Phân Tầng (`public.farm_slots`)
Quản lý từng ô sản xuất trải dài trên các tầng:
```sql
CREATE TABLE public.farm_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    floor_id INT NOT NULL CHECK (floor_id >= 1 AND floor_id <= 5),
    slot_index INT NOT NULL CHECK (slot_index >= 0 AND slot_index <= 3),
    item_type TEXT DEFAULT NULL,
    planted_at TIMESTAMPTZ DEFAULT NULL,
    harvest_at TIMESTAMPTZ DEFAULT NULL,
    status TEXT DEFAULT 'EMPTY' CHECK (status IN ('EMPTY', 'GROWING', 'READY')),
    UNIQUE(user_id, floor_id, slot_index)
);

CREATE INDEX idx_farm_slots_user ON public.farm_slots(user_id, floor_id);
ALTER TABLE public.farm_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Xem ô đất cá nhân" ON public.farm_slots FOR SELECT USING (auth.uid() = user_id);
```

### 4.3. Bảng Kho Đồ Người Chơi (`public.user_inventory`)
Quản lý nông sản, gạch nung, giấy đã thu hoạch để phục vụ chế tác tranh và giao thương:
```sql
CREATE TABLE public.user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_code TEXT NOT NULL,
    quantity BIGINT DEFAULT 0 CHECK (quantity >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_code)
);

ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quản lý kho đồ cá nhân" ON public.user_inventory FOR ALL USING (auth.uid() = user_id);
```

### 4.4. Stored Procedure Thu Hoạch Chống Gian Lận (`harvest_crop`)
Khóa dòng (`FOR UPDATE`) và thẩm định mốc thời gian máy chủ `NOW()`:
```sql
CREATE OR REPLACE FUNCTION public.harvest_crop(target_slot_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_slot RECORD;
    v_reward_gold INT := 0;
    v_reward_fame INT := 0;
    v_reward_paper INT := 0;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Yêu cầu đăng nhập tài khoản!';
    END IF;

    -- Khóa dòng chống race condition gặt nhiều lần cùng lúc
    SELECT * INTO v_slot
    FROM public.farm_slots
    WHERE id = target_slot_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ô đất không hợp lệ!';
    END IF;

    IF v_slot.status = 'EMPTY' OR v_slot.item_type IS NULL THEN
        RAISE EXCEPTION 'Ô đất đang rỗng!';
    END IF;

    -- Triệt tiêu hoàn toàn tua giờ client
    IF NOW() < v_slot.harvest_at THEN
        RAISE EXCEPTION 'Sản phẩm chưa đến thời điểm chín! (Phát hiện can thiệp thời gian)';
    END IF;

    -- Cân đối phần thưởng
    IF v_slot.item_type = 'beo_hoa_dau' THEN v_reward_gold := 8; v_reward_fame := 2;
    ELSIF v_slot.item_type = 'chuoi_ngu' THEN v_reward_gold := 45; v_reward_fame := 10;
    ELSIF v_slot.item_type = 'ca_chep' THEN v_reward_gold := 110; v_reward_fame := 25;
    ELSIF v_slot.item_type = 'gach_nung' THEN v_reward_gold := 180; v_reward_fame := 35;
    ELSE v_reward_gold := 10; v_reward_fame := 2;
    END IF;

    -- Cộng thưởng vào Profile
    UPDATE public.profiles
    SET gold_coins = gold_coins + v_reward_gold,
        fame_exp = fame_exp + v_reward_fame,
        paper_currency = paper_currency + v_reward_paper
    WHERE id = v_user_id;

    -- Reset ô đất
    UPDATE public.farm_slots
    SET item_type = NULL, planted_at = NULL, harvest_at = NULL, status = 'EMPTY'
    WHERE id = target_slot_id;

    RETURN jsonb_build_object(
        'success', true,
        'reward_gold', v_reward_gold,
        'reward_fame', v_reward_fame
    );
END;
$$;
```

---

## 5. CHIẾN LƯỢC OFFLINE-FIRST & PWA CACHE

Nhằm đảm bảo trải nghiệm chơi tức thì mượt mà (Instant Web Game) và chơi được ngay cả khi mất kết nối mạng:

### 5.1. Bộ Mô Phỏng Máy Chủ Cục Bộ (Local Storage Fallback Engine)
Khi biến môi trường `VITE_SUPABASE_URL` chưa được cung cấp hoặc khi người dùng mất mạng (Offline), hệ thống tự động kích hoạt class `LocalDatabaseEngine`:
- Mô phỏng toàn bộ bảng `profiles`, `farm_slots`, `inventory` trong `localStorage`.
- Đảm bảo các hàm gọi API `plantCrop()`, `harvestCrop()` trả về cấu trúc dữ liệu y hệt như Supabase RPC.
- Tự động đồng bộ ngược lên Supabase ngay khi có kết nối mạng trở lại (`online` window event listener).

### 5.2. Service Worker & PWA Caching Strategy
Sử dụng Workbox / Vite PWA Plugin với chiến lược phân tầng tài nguyên:
- **Cache-First (Tài nguyên tĩnh nặng)**: 
  - Toàn bộ Texture Atlas, ảnh mộc bản, tranh nền giấy điệp (`/public/assets/*.png, *.jpg`).
  - Âm thanh nhạc cụ dân tộc (`/public/audio/*.mp3`).
  - Font chữ Thư Pháp Việt Hóa.
- **Network-First with Cache Fallback (Dữ liệu người chơi)**:
  - Các lệnh truy vấn dữ liệu hồ sơ và ô đất.
- **Manifest PWA**: Cấu hình `display: "standalone"`, `orientation: "portrait"`, cho phép người chơi bấm "Thêm vào màn hình chính" (Add to Home Screen) để biến thành ứng dụng độc lập không thanh điều hướng trình duyệt.
