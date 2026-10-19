TÀI LIỆU THIẾT KẾ TRÒ CHƠI(GAME DESIGN DOCUMENT - GDD)
DỰ ÁN: LÀNG TIỀN AN
Thể loại:
Vertical Farming / Idle Simulation kết hợp Kinh tế Bất đồng bộ
Phong cách nghệ thuật:
Tranh dân gian Đông Hồ trên nền Giấy Điệp kết hợp Văn học hiện thực Việt Nam
Mô hình phát hành:
Web Game HTML5, PWA 
Mô hình doanh thu:
100% Free-to-Play hỗ trợ bằng Quảng cáo phần thưởng (Rewarded Ads) & không nạp tiền (Zero-IAP)

1. GIỚI THIỆU (INTRODUCTION)
1.1. Tuyên ngôn Dự án (Vision Statement)
"Làng Vũ Đại 2.0" là tựa game mô phỏng nông trại và sản xuất truyền thống dạng màn hình dọc, kế thừa cơ chế cuốn hút và gây nghiện kinh điển của Khu Vườn Trên Mây (Sky Garden). Trò chơi đưa game thủ bước vào không gian văn hóa Bắc Bộ xưa thông qua ngôn ngữ tạo hình mộc bản tranh Đông Hồ và chất liệu văn học hiện thực Nam Cao. Dự án tập trung 100% vào vòng lặp gameplay cốt lõi (Core Loop), trải nghiệm mượt mà không cần cài đặt (Instant Play), giao diện tối ưu màn hình dọc, hệ sinh thái cân bằng phi Pay-to-Win và kiến trúc máy chủ chống gian lận tuyệt đối.
1.2. Mục tiêu Thiết kế (Core Design Pillars)
Dễ tiếp cận & Gây nghiện (Accessible & Habit-Forming): Cơ chế điều khiển một chạm (One-tap), màn hình dọc trực quan, vòng lặp gieo trồng - thu hoạch - chế biến quen thuộc nhưng mang chiều sâu tiến trình đa tầng.
Bản sắc Văn hóa Đậm nét (Vietnamese Cultural Immersion): Từng nét vẽ, bảng màu tự nhiên (điệp, chàm, vàng hoa hòe, son sỏi) và nhân vật đều gợi nhắc đời sống làng quê Việt Nam thế kỷ 20 một cách hóm hỉnh, sâu sắc.
Kinh tế Công bằng & Thân thiện (Fair Rewarded Economy): Không cơ chế "Nạp tiền để thắng" (No Pay-to-Win, No IAP). Mọi tài nguyên quý đều có thể đạt được thông qua thời gian canh tác, tính toán chuỗi sản xuất và lựa chọn xem quảng cáo tự nguyện để nhận thưởng.
Hạ tầng Tinh gọn & An toàn (Resilient Solo-Dev Architecture): Hệ thống máy chủ kiểm soát toàn quyền (Server-Authoritative) xử lý qua Supabase/PostgreSQL nhằm triệt tiêu hoàn toàn gian lận thay đổi dữ liệu máy khách.
2. TỔNG QUAN TRÒ CHƠI (GAME OVERVIEW)
2.1. Thể loại & Đối tượng Mục tiêu
Thể loại: Casual Vertical Farming / Time-Management / Idle Simulation.
Nền tảng: Web HTML5 (PWA), Zalo Mini App, Telegram Webview, Mobile Browser (Responsive 9:16).
Độ tuổi: 12+ (Phù hợp đại chúng, học sinh, sinh viên, nhân viên văn phòng tìm kiếm trải nghiệm thư giãn ngắn hạn nhưng có tiến trình tích lũy dài hạn).
2.2. Vòng lặp Cốt lõi (Core Gameplay Loop)
[1. Gieo trồng / Nuôi thả / Khởi động lò]│▼[2. Đếm ngược thời gian chờ](Tùy chọn: Xem Rewarded Video để tăng tốc)│▼[3. Thu hoạch Nông sản & Bán thành phẩm]│▼[4. Tích lũy Vàng Nén, Giấy Điệp, Danh Vọng]│▼[5. Nâng cấp Bậc Mộc Bản, Mở Tầng, Mở Công Thức Mới]

3. CƠ CHẾ TRÒ CHƠI CHI TIẾT (GAMEPLAY MECHANICS)
3.1. Hệ thống Tài nguyên In-game
Hệ thống hiển thị cố định tại thanh trạng thái trên cùng bên trái màn hình:
Vàng Nén (Gold): Tiền tệ lưu thông cơ bản. Kiếm được từ việc bán nông sản, gạch nung, giấy điệp qua Tiệm Tạp Hóa hoặc hoàn thành đơn đặt hàng của dân làng. Dùng để mua giống cây, phôi gạch, nâng cấp công trình.
Phú Ông / Danh Vọng (Reputation / Fame): Chỉ số cấp bậc xã hội của người chơi trong làng (từ Bần Nông, Trung Nông, Địa Chủ đến Phú Ông). Tích lũy khi thu hoạch sản phẩm cấp cao và hoàn thành thành tích. Danh vọng càng cao, người chơi càng mở khóa được nhiều tầng và công thức chế tác phức tạp.
Giấy Điệp (Shell Paper Currency): Tài nguyên quý hiếm đặc biệt (đóng vai trò như Gem/Kim cương trong các game khác, nhưng hoàn toàn nhận được miễn phí qua chuỗi nhiệm vụ ngày, xưởng làm giấy Tầng 4 hoặc xem Quảng cáo nhận thưởng). Dùng để đổi phôi khắc gỗ quý, hồi phục đất nhanh hoặc mua trang trí mộc bản độc quyền.
3.2. Cơ chế Canh tác & Sản xuất Phân Tầng (Vertical Tier Production)
Bản đồ phân bổ thành 5 khu vực sản xuất dọc:
[Tầng 5: Sân Đình]   ──> Sự kiện Hội Làng, Rước Tiến Sĩ, Đổi lễ vật[Tầng 4: Xưởng Giấy] ──> Chế biến Vỏ Dó, Điệp sò ──> Giấy Điệp quý[Tầng 3: Lò Gạch Cũ] ──> Đốt than sét ──> Gạch Bát Tràng, Ngói Mũi Hài[Tầng 2: Vườn Chuối] ──> Trồng Chuối Tiêu, Ngô Nếp, Khoai Lang[Tầng 1: Ao Bèo]     ──> Thả Cá Chép, Bắt Ốc, Vớt Rong Bèo

Bảng Tham số Cân bằng Canh tác Cơ bản (Balancing Table v2.0):
Tầng
Tên Sản Phẩm
Thời gian sinh trưởng (T)
Chi phí gieo/nung (Cin)
Sản lượng (Q)
Giá bán Chợ (Pout)
Tỉ suất lợi nhuận (ROI)
T1: Ao Bèo
Bèo Hoa Dâu
1 phút (60s)
5 Vàng
1 Bụi
8 Vàng
+60%
T1: Ao Bèo
Cá Chép Vàng
15 phút (900s)
50 Vàng
1 Con
110 Vàng
+120%
T1: Ao Bèo
Ốc Mít Rãnh Nước
45 phút (2700s)
120 Vàng
3 Con
320 Vàng
+166%
T2: Vườn Chuối
Chuối Ngự Nam Sang
5 phút (300s)
20 Vàng
2 Nải
45 Vàng
+125%
T2: Vườn Chuối
Ngô Nếp Bãi Bồi
30 phút (1800s)
80 Vàng
3 Bắp
210 Vàng
+162%
T3: Lò Gạch Cũ
Gạch Nung Đất Sét
20 phút (1200s)
60 Vàng + 1 Củi
10 Viên
180 Vàng
+200%
T3: Lò Gạch Cũ
Gạch Bát Tràng Men Tro
2 giờ (7200s)
250 Vàng + 3 Củi
8 Viên
850 Vàng
+240%
T4: Xưởng Giấy
Giấy Dó Thô
1 giờ (3600s)
150 Vàng + 2 Vỏ Cây
5 Xấp
480 Vàng
+220%
T4: Xưởng Giấy
Giấy Điệp Ánh Bạc
4 giờ (14400s)
350 Vàng + 2 Bột Điệp
3 Tờ
15 Giấy Điệp
Tài nguyên quý

3.3. Hệ thống Khắc Gỗ Mộc Bản (Woodblock Engraving System)
Thay thế cơ chế "Chậu cây trang bị" của Khu Vườn Trên Mây:
Người chơi sử dụng gỗ thị và bột màu tự nhiên để khắc các mộc bản Đông Hồ (Lợn Âm Dương, Đám Cưới Chuột, Vinh Hoa Phú Quý, Gà Dạ Xướng).
Mỗi mộc bản khi hoàn thiện được đóng dấu son ấn định lên một Tầng sản xuất để tạo hiệu ứng gia tăng chỉ số (Passive Buffs):
Mộc bản Gà Đại Cát: Đặt tại Tầng 2, giảm 15% thời gian chín của chuối và ngô.
Mộc bản Cá Chép Trông Trăng: Đặt tại Tầng 1, tăng 25% cơ hội câu được cá hiếm.
Mộc bản Thầy Đồ Cóc: Đặt tại Tầng 4, tăng gấp đôi điểm Danh Vọng khi hoàn thành xấp giấy điệp.
4. CỐT TRUYỆN & NHÂN VẬT (STORY & CHARACTERS)
4.1. Bối cảnh Thế giới
Trò chơi lấy bối cảnh một làng quê Bắc Bộ thu nhỏ thời phong kiến giao thời. Làng Vũ Đại vốn trù phú ven sông Hồng nhưng qua bao năm cảnh vật hoang tàn do quan lại bóc lột, dân cư ly tán. Người chơi trong vai một người con xa xứ trở về quê hương, bắt đầu gầy dựng lại từ bờ ao bèo xơ xác, khai hoang bãi bồi chuối, thổi lại lửa cho lò gạch cũ bị lãng quên, khôi phục xưởng mộc bản giấy điệp và cuối cùng tái lập sự huyên náo chốn đình làng.
4.2. Tuyến Nhân vật Vừa Thơ Vừa Trào Phúng
Chí Phèo (Quản đốc Lò Gạch Cũ): Không còn là kẻ rạch mặt ăn vạ, Chí trở thành thợ nung gạch cần cù với chiếc lò nung đỏ lửa. Lời thoại châm biếm nhưng chân thành; người chơi cung cấp chuối tiêu và nước ngọt để kích hoạt trạng thái "Nhiệt huyết" giúp giảm thời gian nung gạch.
Thị Nở (Chủ Quán Bát Cháo Hành): Phụ trách thu mua nông sản Tầng 1 và Tầng 2 để nấu các món ăn truyền thống, cung cấp năng lượng và điểm kinh nghiệm lớn.
Thầy Đồ Cóc (Giám khảo Xưởng Giấy): Hình tượng chú cóc thông thái trong tranh Đông Hồ ngồi đọc sách, kiểm định chất lượng giấy điệp và hướng dẫn người chơi kỹ thuật in tranh mộc bản.
Bá Kiến (Quan Giám Sát Thu Thuế Đình Làng): Đại diện cho các chuỗi thử thách sự kiện (Milestone Events). Hoàn thành chỉ tiêu dâng cúng lễ vật sân đình đúng hạn cho Bá Kiến sẽ giúp người chơi nhận được sắc phong tăng cấp bậc Danh Vọng Phú Ông.
5. THIẾT KẾ MÀN CHƠI (LEVEL DESIGN)
5.1. Cấu trúc Cuộn Dọc 5 Phân Vùng Không Gian
Bản đồ game có độ phân giải gốc 720 × 2200 px, người chơi di chuyển dọc theo trục Y qua thao tác kéo vuốt mượt mà:
Tầng 1 (Toạ độ Y = 1750 - 2200): Ao Bèo & Bến Nước. Không gian mênh mang sóng nước, cá quẫy đuôi, chiếc bè tre cắm cọc neo đậu sát bờ.
Tầng 2 (Toạ độ Y = 1300 - 1750): Bãi Bồi Vườn Chuối. Vùng phù sa màu mỡ với các ô đất tơi xốp, các bụi chuối ngự trổ buồng xanh tốt đan xen ruộng ngô.
Tầng 3 (Toạ độ Y = 850 - 1300): Lò Gạch Cũ. Vách đất nung đỏ, các vòm lò gạch khói bốc nghi ngút cùng bãi tập kết gạch mộc và than củi.
Tầng 4 (Toạ độ Y = 400 - 850): Xưởng Giấy & Khắc Bản. Căn nhà tranh vách nứa phơi những phên giấy điệp lấp lánh xà cừ dưới ánh nắng, bể ngâm vỏ cây dó và bàn khắc gỗ.
Tầng 5 (Toạ độ Y = 0 - 400): Sân Đình Cổ Kính. Gốc đa đại thụ ngàn năm rủ bóng rễ bện chặt xuống bậc đá; sân đình lát gạch nghiêng, nơi diễn ra cảnh rước đèn, múa rối nước và đám cưới chuột tưng bừng.
5.2. Điều kiện Mở Khóa Tầng (Progression Gates)
Mở Tầng 1 (Ao Bèo): Mặc định có sẵn ngay khi bắt đầu game.
Mở Tầng 2 (Vườn Chuối): Đạt cấp Danh Vọng Nông Dân Chăm Chỉ (Level 3) + 500 Vàng Nén.
Mở Tầng 3 (Lò Gạch Cũ): Đạt cấp Danh Vọng Thợ Thủ Công (Level 8) + 3,000 Vàng Nén + Đốt thành công 50 mẻ than.
Mở Tầng 4 (Xưởng Giấy): Đạt cấp Danh Vọng Nghệ Nhân Làng (Level 15) + 12,000 Vàng Nén + 50 viên Gạch Bát Tràng.
Mở Tầng 5 (Sân Đình): Đạt cấp Danh Vọng Phú Ông Tri Huyện (Level 25) + 50,000 Vàng Nén + 200 Giấy Điệp.
6. NGHỆ THUẬT & HÌNH ẢNH (ART & AESTHETICS)
6.1. Nguyên lý Phong cách Tranh Dân Gian Đông Hồ
Đường viền mộc bản (Woodblock Outlines): Toàn bộ nhân vật, công trình, nông sản đều có nét viền đen đậm (3 - 5 px), gồ ghề nhẹ mô phỏng nét khắc bằng dao mộc trên gỗ thị.
Kỹ thuật Phẳng & Màu sắc Tự nhiên (Flat & Organic Colors):
Màu vàng: Chiết xuất hoa hòe / dành dành (dùng cho rơm rạ, ngô bắp).
Màu đỏ son: Đất son, sỏi son tự nhiên (dùng cho lò gạch, khăn áo lễ).
Màu đen: Than lá tre khô tán mịn (dùng cho nét khắc viền).
Màu xanh chàm: Lá chàm bãi bồi (dùng cho màu vải áo nâu chàm của dân làng).
Nền giấy điệp: Tông màu ngà be ấm áp phủ toàn màn hình, điểm xuyết hạt vẩy xà cừ óng ánh tự nhiên từ bột vỏ điệp.
6.2. Hoạt họa Tối ưu cho Solo Dev (Cutout Skeletal 2D)
Không dùng animation frame-by-frame truyền thống để giảm tối đa chi phí sản xuất.
Toàn bộ nhân vật (Chí Phèo, Thị Nở, chú ếch, đàn chuột diễu hành) được tách thành từng bộ phận (đầu, thân mình, cẳng tay, bàn chân) và gắn xương (Rigging) bằng Spine 2D hoặc Bone2D.
Chu kỳ chuyển động chỉ tập trung vào 3 trạng thái lặp cơ bản:
Idle Loop (Nghỉ): Nhấp nhô thở nhẹ nhàng, ngọn khói lò gạch uốn lượn, mặt nước ao bèo gợn sóng lăn tăn.
Action Loop (Lao động): Động tác quấy bột giấy, gắp thanh gạch nóng, vớt cá lên bè.
Celebration (Hoàn thành): Nhân vật nhảy cẫng vui vẻ khi sản phẩm chế biến hoàn tất.
7. ÂM THANH & ÂM NHẠC (SOUND & MUSIC)
7.1. Định hướng Âm nhạc (Music Direction)
Sử dụng hoàn toàn chất liệu nhạc cụ dân tộc truyền thống kết hợp nhịp điệu Lo-Fi/Chillhop hiện đại tạo cảm giác thư giãn, bình yên.
Nhạc cụ chủ đạo: Tiếng sáo trúc vi vu, đàn nhị véo von mộc mạc, tiếng gõ phách tre rộn rã và tiếng cồng boong ngân dài lúc hoàng hôn.
Nhạc nền tự động thay đổi âm lượng và hòa âm tương ứng với vị trí camera cuộn:
Khi cuộn xuống Tầng 1: Tăng cường tiếng nước chảy róc rách, tiếng cá đớp mồi.
Khi cuộn lên Tầng 3: Tăng tiếng củi nổ lách tách, tiếng thổi bễ rèn gạch.
Khi cuộn lên Tầng 5: Vang vọng tiếng mõ đình làng và tiếng trống hội rộn rã.
7.2. Hiệu ứng Âm thanh (SFX)
Tiếng "Bụp!" giòn tan khi nông sản chín được thu hoạch.
Tiếng "Xèo..." khi gạch nung được nhúng vào vò nước làm nguội.
Tiếng lách cách vui tai của đồng tiền Vàng Nén rơi vào túi đựng.
Nút bấm UI: Giả lập tiếng gõ phách tre cổ truyền đặc trưng.
8. GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UX/UI)
8.1. Bố cục Công thái học (Ergonomic Layout)
Thiết kế tối ưu hóa 100% cho thao tác bằng một ngón tay cái trên điện thoại màn hình dọc:
Khu vực Trực quan (Top Screen - Passive View): Biển hiệu "Làng Vũ Đại", nút Cài đặt, cụm hiển thị 3 tài nguyên chính (Vàng Nén, Danh Vọng, Giấy Điệp).
Khu vực Tương tác Chính (Center Screen - Dynamic Viewport): Cảnh quan nông trại cuộn dọc với các điểm nhấn tương tác trực tiếp (ô đất, lò nung, ao cá).
Khu vực Điều khiển (Bottom Screen - Active Thumb Reach): Thanh Dock 4 nút điều hướng chính:
Bản Đồ (Hội Làng / Danh Mục Tầng): Bấm để di chuyển nhanh camera đến tầng mong muốn.
Tiệm Tạp Hóa (Giao Thương / Đơn Hàng): Nơi ký gửi hàng hóa, nhận hợp đồng giao chuối, gạch cho các làng lân cận.
Khắc Gỗ (Chế Tác Mộc Bản): Giao diện ghép tranh, gắn xương ngọc buff sản lượng.
Thành Tích (Sổ Đinh / Nhiệm Vụ): Xem thành tựu đạt được và nhận thưởng Giấy Điệp.
8.2. Thiết kế Cửa sổ Bật lên (Popup & Modals)
Mọi cửa sổ thông tin (Modal Dialog) được dựng theo dạng Chiếu Thư Cổ hoặc Trang Sách Gỗ Khắc Bản, nền giấy ngà rách mép cổ điển.
Phông chữ: Sử dụng font chữ Thư Pháp Việt hóa chuẩn Web Font, nét bút lông rõ ràng, tương phản cao, dễ đọc trên màn hình di động kích thước nhỏ.
9. THÔNG SỐ KỸ THUẬT & KIẾN TRÚC MÁY CHỦ (TECHNICAL SPECIFICATIONS)
9.1. Client Architecture (Phaser.js 3 + TypeScript)
Kích thước Canvas Logic: 720 × 1280 px (Chế độ Scale Mode: Phaser.Scale.FIT, tự động căn giữa màn hình thiết bị).
Quản lý Scene:
BootScene: Khởi tạo môi trường, tải font và file json cấu hình.
PreloadScene: Tải toàn bộ Spritesheet, Texture Atlas giấy điệp, âm thanh.
FarmWorldScene: Chứa bản đồ 5 tầng, quản lý camera cuộn theo trục Y, các GameObjects tương tác.
HUDOverlayScene: Scene UI chạy song song cố định độc lập với camera của thế giới bên dưới.
Tối ưu hóa Texture Atlas: Gom toàn bộ nông sản, nút bấm, biểu cảm nhân vật vào 1 đến 2 tệp Atlas duy nhất (2048 × 2048 px) để giảm số lượng Draw Call xuống dưới 15 trên mỗi khung hình, duy trì ổn định 60 FPS.
9.2. Server & Backend Architecture (Supabase / PostgreSQL)
Toàn bộ cơ chế mạng hoạt động theo nguyên tắc Server-Authoritative: Máy khách (Client) chỉ là công cụ hiển thị đồ họa và nhận input từ người dùng. Máy khách tuyệt đối không có quyền tự cộng tiền hay tự xác nhận thu hoạch.
Lược đồ Cơ sở Dữ liệu Cốt lõi (Core Database Schema):
[SQL: Core Database Schema]-- 1. Bảng hồ sơ người chơiCREATE TABLE public.profiles (    id UUID PRIMARY KEY REFERENCES auth.users(id),    username TEXT NOT NULL,    gold_coins BIGINT DEFAULT 100 CHECK (gold_coins >= 0),    fame_exp BIGINT DEFAULT 0,    paper_currency INT DEFAULT 10 CHECK (paper_currency >= 0),    unlocked_floors INT DEFAULT 1,    created_at TIMESTAMPTZ DEFAULT NOW(),    last_login TIMESTAMPTZ DEFAULT NOW());-- 2. Bảng quản lý ô canh tác phân tầngCREATE TABLE public.farm_slots (    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,    floor_id INT NOT NULL, -- 1: Ao, 2: Vườn, 3: Lò Gạch, 4: Xưởng Giấy    slot_index INT NOT NULL,    item_type TEXT, -- Tên cây trồng/sản phẩm (ví dụ: 'chuoi_ngu', 'gach_nung')    planted_at TIMESTAMPTZ,    harvest_at TIMESTAMPTZ,    status TEXT DEFAULT 'EMPTY', -- 'EMPTY', 'GROWING', 'READY'    UNIQUE(user_id, floor_id, slot_index));

9.3. Kiến trúc Chống Gian Lận Tuyệt Đối (Anti-Cheat & Anti-Hack Engine)
Triệt tiêu lỗ hổng tua giờ hệ thống (Time Manipulation Vulnerability): Trong các game offline, người chơi chỉnh ngày giờ trên điện thoại để cây chín tức thì. Trong "Làng Vũ Đại 2.0", thời gian chín hoàn toàn căn cứ vào đồng hồ máy chủ qua hàm NOW() trong cơ sở dữ liệu.
Xác thực logic gieo trồng và thu hoạch bằng Stored Procedures (ACID Transaction): Client không thể gửi lệnh "Cộng cho tôi 100 Vàng". Client chỉ gửi yêu cầu: CALL harvest_crop(slot_id).
[PL/pgSQL: Secure Server-Side Stored Procedure]CREATE OR REPLACE FUNCTION public.harvest_crop(target_slot_id UUID)RETURNS JSONBLANGUAGE plpgsqlSECURITY DEFINERAS $$DECLARE    v_user_id UUID;    v_harvest_at TIMESTAMPTZ;    v_item_type TEXT;    v_reward_gold INT;    v_reward_fame INT;BEGIN    v_user_id := auth.uid();    -- Lấy thông tin ô đất và khóa dòng (Row-Level Lock) chống race-condition    SELECT harvest_at, item_type INTO v_harvest_at, v_item_type    FROM public.farm_slots    WHERE id = target_slot_id AND user_id = v_user_id    FOR UPDATE;    IF NOT FOUND THEN        RAISE EXCEPTION 'Ô đất không hợp lệ hoặc không thuộc quyền sở hữu.';    END IF;    -- Kiểm tra thời gian chín hợp lệ từ Server    IF NOW() < v_harvest_at THEN        RAISE EXCEPTION 'Sản phẩm chưa chín, phát hiện can thiệp thời gian!';    END IF;    -- Tính toán phần thưởng theo quy định máy chủ    IF v_item_type = 'chuoi_ngu' THEN        v_reward_gold := 45;        v_reward_fame := 10;    ELSIF v_item_type = 'ca_chep' THEN        v_reward_gold := 110;        v_reward_fame := 25;    ELSE        v_reward_gold := 10;        v_reward_fame := 2;    END IF;    -- Cập nhật số dư tài nguyên an toàn    UPDATE public.profiles    SET gold_coins = gold_coins + v_reward_gold,        fame_exp = fame_exp + v_reward_fame    WHERE id = v_user_id;    -- Reset trạng thái ô đất    UPDATE public.farm_slots    SET item_type = NULL,        planted_at = NULL,        harvest_at = NULL,        status = 'EMPTY'    WHERE id = target_slot_id;    RETURN jsonb_build_object(        'success', true,        'reward_gold', v_reward_gold,        'reward_fame', v_reward_fame    );END;$$;

Xác thực Quảng cáo máy chủ (Server-Side Ad Verification Webhook): Khi người chơi xem xong quảng cáo phần thưởng, hệ thống mạng quảng cáo (Ad Network) gửi một tín hiệu chữ ký mã hóa (Cryptographic Signed Webhook) trực tiếp về Supabase Edge Function để mở khóa vật phẩm thưởng, ngăn chặn việc người chơi dùng công cụ chặn quảng cáo hay giả lập gói tin hoàn thành video.
10. CHIẾN LƯỢC KINH DOANH & TIẾP THỊ (MONETIZATION & MARKETING)
10.1. Mô hình Doanh thu Thuần Quảng cáo (100% Rewarded Ad Ecosystem)
Trò chơi triệt tiêu hoàn toàn rào cản tài chính của người chơi bằng việc nói không với nạp tiền (Zero-IAP). Doanh thu được tối đa hóa thông qua chỉ số eCPM và Tần suất tương tác tự nguyện:
[Người chơi gặp nút thắt thời gian / Thiếu hụt tài nguyên]                                      │                                      ▼                   [Thông báo "Tiếp sức làng quê" hiển thị]                "Xem một thước phim ngắn (15-30s) để nhận ngay?"                                      │                   ┌──────────────────┴──────────────────┐                   ▼                                     ▼              [ĐỒNG Ý XEM]                         [TỪ CHỐI XEM]                   │                                     │                   ▼                                     ▼          Nhận thưởng tức thì                  Tiếp tục canh tác         (Giảm 50% thời gian /                theo thời gian chuẩn     Nhân đôi sản lượng thu hoạch)

Rewarded Speed-Up Ads (Tăng tốc sản xuất): Giảm ngay 30 phút thời gian chờ của mẻ gạch hoặc cây trồng dài hạn. Giới hạn: Tối đa 5 lượt xem tăng tốc mỗi ngày nhằm bảo vệ tính cân bằng của game.
Double Harvest Yield (Nhân đôi mùa vụ): Sau khi thu hoạch một mẻ cá chép hiếm hoặc giấy điệp quý, người chơi có thể chọn xem 1 video quảng cáo ngắn để nhân đôi số lượng nhận được.
Daily Fortune Wheel (Vòng quay Bát Quái may mắn): Mỗi ngày 1 lượt quay miễn phí; các lượt quay tiếp theo (tối đa 3 lượt) yêu cầu xem video quảng cáo để nhận Giấy Điệp hoặc Mộc Bản ngẫu nhiên.
10.2. Kế hoạch Tiếp thị Không Ngân Sách (Zero-Budget Organic Marketing)
Khai thác trào lưu Văn hóa & Tranh Đông Hồ trên TikTok/Shorts: Tạo chuỗi video ngắn dạng timelaspse tái hiện quá trình vẽ mộc bản Chí Phèo, Thị Nở chuyển động theo phong cách tranh cổ trên nền nhạc sáo trúc remix.
Lan tỏa qua cơ chế Mini App (Viral Social Loops): "Mời hàng xóm sang bắt sâu / đuổi chuột": Chia sẻ đường link trực tiếp lên nhóm Zalo/Telegram. Bạn bè bấm vào link sẽ vào thẳng làng của người chơi để giúp tưới cây, cả hai người cùng nhận được phần thưởng Vàng Nén mà không cần cài đặt ứng dụng.
11. KẾ HOẠCH SẢN XUẤT CHO SOLO DEVELOPER (PRODUCTION PLAN)
Lộ trình phát triển được tinh gọn trong vòng 8 tuần nhằm đảm bảo sản phẩm khả thi tối thiểu (MVP) ra mắt công chúng đúng tiến độ:
[Tuần 1 - 2] ──> Thiết lập hạ tầng Phaser.js + Supabase Auth & DB[Tuần 3 - 4] ──> Cắt lát Asset Đông Hồ + Dựng Core Loop Tầng 1 & Tầng 2[Tuần 5]     ──> Hoàn thiện Tầng 3 (Lò Gạch) & Tầng 4 (Xưởng Giấy)[Tuần 6]     ──> Tích hợp SDK Quảng Cáo Rewarded + Anti-Cheat Engine[Tuần 7]     ──> Tối ưu hóa UI/UX, Game Juice, Âm thanh nhạc cụ truyền thống[Tuần 8]     ──> Đóng gói PWA / Zalo Mini App, Playtest cộng đồng & Launch

11.1. Chi tiết Lộ trình Thực thi Từng Tuần
Tuần 1 - 2: Nền tảng Kỹ thuật & Hạ tầng Dữ liệu
Khởi tạo dự án Phaser.js 3 với TypeScript và Vite.
Thiết lập project Supabase: tạo bảng profiles, farm_slots, kích hoạt Row Level Security (RLS) và viết Stored Procedure harvest_crop.
Tuần 3 - 4: Dựng Cảnh quan & Canh tác Nông vụ Cơ bản
Cắt lát tệp đồ họa concept "Làng Vũ Đại": nền đất, cây đa, bậc thang đá, bụi chuối, ao bèo.
Lập trình camera cuộn dọc và tương tác chạm gieo hạt giống / thu hoạch tại Tầng 1 và Tầng 2.
Tuần 5: Chuỗi Chế biến & Hệ thống Mộc Bản
Dựng logic Lò Gạch Tầng 3 và Xưởng Giấy Tầng 4 (Cơ chế chuyển hóa nguyên liệu đầu vào → sản phẩm đầu ra).
Lập trình chức năng Khắc Gỗ Mộc Bản áp dụng chỉ số thụ động cho các tầng.
Tuần 6: Tích hợp Hệ sinh thái Doanh thu & Chống Gian lận
Tích hợp Google AdMob / Unity Ads H5 SDK hoặc Zalo Ads Network SDK.
Thiết lập Server-Side Webhook kiểm duyệt việc xem quảng cáo thưởng trước khi cộng quà.
Kiểm thử các công cụ can thiệp bộ nhớ (Cheat Engine, sửa đổi đồng hồ máy khách) để hoàn thiện hàng rào bảo vệ.
Tuần 7: Đánh bóng Trải nghiệm (Juice & Audio)
Tích hợp các bộ âm thanh sáo trúc, tiếng gõ tre, hiệu ứng nổi hạt xà cừ giấy điệp lấp lánh khi trúng mùa vụ lớn.
Tinh chỉnh font chữ thư pháp và hiệu ứng bung nở tài nguyên khi thu hoạch.
Tuần 8: Triển khai & Phát hành Thử nghiệm (Soft Launch)
Cấu hình file manifest.json và service-worker.js biến game thành ứng dụng PWA có khả năng thêm vào màn hình chính điện thoại.
Mở đợt thử nghiệm khép kín (Closed Beta) cho 100 người dùng cộng đồng yêu thích văn hóa dân gian để ghi nhận phản hồi và cân bằng lại tỉ suất lợi nhuận trước khi mở cổng chính thức.