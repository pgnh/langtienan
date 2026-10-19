-- =========================================================================
-- LÀNG TIỀN AN - SERVER-AUTHORITATIVE DATABASE MIGRATION
-- Phong cách Mộc bản Đông Hồ - Kiến trúc chống gian lận tuyệt đối
-- =========================================================================

-- 1. BẢNG HỒ SƠ NGƯỜI CHƠI (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL DEFAULT 'Dân Làng Mới',
    gold_coins BIGINT DEFAULT 100 CHECK (gold_coins >= 0),
    fame_exp BIGINT DEFAULT 0 CHECK (fame_exp >= 0),
    paper_currency INT DEFAULT 10 CHECK (paper_currency >= 0),
    unlocked_floors INT DEFAULT 1 CHECK (unlocked_floors >= 1 AND unlocked_floors <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Kích hoạt Row-Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Người chơi có thể xem hồ sơ của chính mình"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Người chơi có thể sửa hồ sơ cơ bản của chính mình"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 2. BẢNG Ô CANH TÁC PHÂN TẦNG (FARM_SLOTS)
CREATE TABLE IF NOT EXISTS public.farm_slots (
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

ALTER TABLE public.farm_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Người chơi có thể xem ô đất của chính mình"
ON public.farm_slots FOR SELECT
USING (auth.uid() = user_id);

-- 3. HÀM TỰ ĐỘNG KHỞI TẠO 4 Ô CHO TẦNG 1 KHI TẠO HỒ SƠ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, gold_coins, fame_exp, paper_currency, unlocked_floors)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Dân Làng Vũ Đại'), 100, 0, 10, 1);

    -- Khởi tạo 4 ô canh tác cho Tầng 1 (Ao Bèo)
    FOR s IN 0..3 LOOP
        INSERT INTO public.farm_slots (user_id, floor_id, slot_index, status)
        VALUES (NEW.id, 1, s, 'EMPTY');
    END LOOP;

    RETURN NEW;
END;
$$;

-- 4. HÀM RPC: PLANT_CROP (GIEO TRỒNG / KHỞI ĐỘNG LÒ / THẢ CÁ)
-- Triệt tiêu tua giờ: harvest_at tính hoàn toàn bằng NOW() trên máy chủ
CREATE OR REPLACE FUNCTION public.plant_crop(
    target_slot_id UUID,
    p_item_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_cost_gold INT := 0;
    v_duration_sec INT := 60;
    v_user_gold BIGINT;
    v_current_status TEXT;
    v_harvest_at TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Yêu cầu xác thực tài khoản!';
    END IF;

    -- Khóa dòng ô canh tác chống race-condition
    SELECT status INTO v_current_status
    FROM public.farm_slots
    WHERE id = target_slot_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ô đất không hợp lệ hoặc không thuộc quyền sở hữu của bạn!';
    END IF;

    IF v_current_status <> 'EMPTY' THEN
        RAISE EXCEPTION 'Ô này đang canh tác, không thể gieo trồng thêm!';
    END IF;

    -- Bảng thông số chi phí & thời gian chuẩn theo GDD
    IF p_item_type = 'beo_hoa_dau' THEN
        v_cost_gold := 5;
        v_duration_sec := 60;     -- 1 phút
    ELSIF p_item_type = 'ca_chep' THEN
        v_cost_gold := 50;
        v_duration_sec := 900;    -- 15 phút
    ELSIF p_item_type = 'oc_mit' THEN
        v_cost_gold := 120;
        v_duration_sec := 2700;   -- 45 phút
    ELSIF p_item_type = 'chuoi_ngu' THEN
        v_cost_gold := 20;
        v_duration_sec := 300;    -- 5 phút
    ELSIF p_item_type = 'ngo_nep' THEN
        v_cost_gold := 80;
        v_duration_sec := 1800;   -- 30 phút
    ELSIF p_item_type = 'gach_nung' THEN
        v_cost_gold := 60;
        v_duration_sec := 1200;   -- 20 phút
    ELSIF p_item_type = 'gach_bat_trang' THEN
        v_cost_gold := 250;
        v_duration_sec := 7200;   -- 2 giờ
    ELSIF p_item_type = 'giay_do' THEN
        v_cost_gold := 150;
        v_duration_sec := 3600;   -- 1 giờ
    ELSIF p_item_type = 'giay_diep' THEN
        v_cost_gold := 350;
        v_duration_sec := 14400;  -- 4 giờ
    ELSE
        RAISE EXCEPTION 'Loại giống hoặc sản phẩm (%) không tồn tại!', p_item_type;
    END IF;

    -- Kiểm tra số dư vàng của người chơi
    SELECT gold_coins INTO v_user_gold
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

    IF v_user_gold < v_cost_gold THEN
        RAISE EXCEPTION 'Không đủ Vàng Nén! Bạn cần % Vàng nhưng chỉ có % Vàng.', v_cost_gold, v_user_gold;
    END IF;

    -- Khấu trừ vàng an toàn
    UPDATE public.profiles
    SET gold_coins = gold_coins - v_cost_gold
    WHERE id = v_user_id;

    -- Tính thời điểm thu hoạch theo đồng hồ máy chủ
    v_harvest_at := NOW() + (v_duration_sec || ' seconds')::INTERVAL;

    -- Cập nhật ô canh tác
    UPDATE public.farm_slots
    SET item_type = p_item_type,
        planted_at = NOW(),
        harvest_at = v_harvest_at,
        status = 'GROWING'
    WHERE id = target_slot_id;

    RETURN jsonb_build_object(
        'success', true,
        'slot_id', target_slot_id,
        'item_type', p_item_type,
        'harvest_at', v_harvest_at,
        'cost_gold', v_cost_gold,
        'remaining_gold', v_user_gold - v_cost_gold
    );
END;
$$;

-- 5. HÀM RPC: HARVEST_CROP (THU HOẠCH NÔNG SẢN & BÁN THÀNH PHẨM)
-- Triệt tiêu tua giờ client: Kiểm tra NOW() < harvest_at
CREATE OR REPLACE FUNCTION public.harvest_crop(
    target_slot_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_harvest_at TIMESTAMPTZ;
    v_item_type TEXT;
    v_status TEXT;
    v_reward_gold INT := 0;
    v_reward_fame INT := 0;
    v_reward_paper INT := 0;
    v_current_gold BIGINT;
    v_current_fame BIGINT;
    v_current_paper INT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Yêu cầu xác thực tài khoản!';
    END IF;

    -- Khóa dòng ô đất
    SELECT harvest_at, item_type, status INTO v_harvest_at, v_item_type, v_status
    FROM public.farm_slots
    WHERE id = target_slot_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ô đất không hợp lệ hoặc không thuộc quyền sở hữu.';
    END IF;

    IF v_item_type IS NULL OR v_status = 'EMPTY' THEN
        RAISE EXCEPTION 'Ô đất này hiện đang trống, không có sản phẩm để thu hoạch.';
    END IF;

    -- Kiểm tra thời gian chín hợp lệ từ Server
    IF NOW() < v_harvest_at THEN
        RAISE EXCEPTION 'Sản phẩm chưa chín! Phát hiện can thiệp thời gian!';
    END IF;

    -- Cân bằng phần thưởng theo GDD v2.0
    IF v_item_type = 'beo_hoa_dau' THEN
        v_reward_gold := 8;
        v_reward_fame := 2;
    ELSIF v_item_type = 'ca_chep' THEN
        v_reward_gold := 110;
        v_reward_fame := 25;
    ELSIF v_item_type = 'oc_mit' THEN
        v_reward_gold := 320;
        v_reward_fame := 60;
    ELSIF v_item_type = 'chuoi_ngu' THEN
        v_reward_gold := 45;
        v_reward_fame := 10;
    ELSIF v_item_type = 'ngo_nep' THEN
        v_reward_gold := 210;
        v_reward_fame := 45;
    ELSIF v_item_type = 'gach_nung' THEN
        v_reward_gold := 180;
        v_reward_fame := 35;
    ELSIF v_item_type = 'gach_bat_trang' THEN
        v_reward_gold := 850;
        v_reward_fame := 150;
    ELSIF v_item_type = 'giay_do' THEN
        v_reward_gold := 480;
        v_reward_fame := 90;
    ELSIF v_item_type = 'giay_diep' THEN
        v_reward_gold := 0;
        v_reward_fame := 300;
        v_reward_paper := 15;
    ELSE
        v_reward_gold := 10;
        v_reward_fame := 2;
    END IF;

    -- Cập nhật tài nguyên người chơi
    UPDATE public.profiles
    SET gold_coins = gold_coins + v_reward_gold,
        fame_exp = fame_exp + v_reward_fame,
        paper_currency = paper_currency + v_reward_paper
    WHERE id = v_user_id
    RETURNING gold_coins, fame_exp, paper_currency INTO v_current_gold, v_current_fame, v_current_paper;

    -- Đặt lại ô đất về trạng thái rỗng
    UPDATE public.farm_slots
    SET item_type = NULL,
        planted_at = NULL,
        harvest_at = NULL,
        status = 'EMPTY'
    WHERE id = target_slot_id;

    RETURN jsonb_build_object(
        'success', true,
        'reward_gold', v_reward_gold,
        'reward_fame', v_reward_fame,
        'reward_paper', v_reward_paper,
        'item_type', v_item_type,
        'current_gold', v_current_gold,
        'current_fame', v_current_fame,
        'current_paper', v_current_paper
    );
END;
$$;
