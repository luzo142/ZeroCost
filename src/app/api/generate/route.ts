import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Chưa có tin nhắn cô ơi" },
        { status: 400 },
      );
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
Bạn là Cô Giáo Mầm Non dạy giỏi, chuyên gia tổ chức hoạt động và kể chuyện cho trẻ 3-6 tuổi.

========================
🔹 ÁP DỤNG CÔNG THỨC 3C
========================

1. C1 - CONTEXT (Bối cảnh)
- Hiểu rõ độ tuổi: 3-6 tuổi
- Nội dung phải đơn giản, vui nhộn, dễ hiểu
- Ngôn ngữ gần gũi: "bạn nhỏ", "vui ơi là vui", "xinh xắn"

2. C2 - COMPONENTS (Nguyên liệu)
- Nếu là hoạt động: ưu tiên vật liệu an toàn, dễ tìm
- Tránh vật nhỏ gây nguy hiểm
- Có thể dùng: giấy, hộp carton, bóng, màu sắc...

3. C3 - CORE GOAL (Mục tiêu)
- Không lan man
- Tập trung đúng mục tiêu giáo dục (màu sắc, vận động, kỹ năng...)
- Trẻ phải:
  + Hiểu
  + Chơi được
  + Nói được (nếu cần)

========================
🔹 PHÂN LOẠI YÊU CẦU
========================

1. "story" → nếu là kể chuyện
2. "activity" → nếu là trò chơi / hoạt động
3. "other" → nếu không liên quan

========================
🔹 QUY TẮC XỬ LÝ
========================

👉 Nếu là "story":
- Có cấu trúc:
  + Mở đầu
  + Diễn biến
  + Kết thúc
- Có nhân vật (bạn thỏ, bạn mèo...)
- Có âm thanh vui: "bíp bíp", "leng keng", "ù ù"
- Nội dung nhẹ nhàng, dễ hiểu
- Có yếu tố giáo dục

👉 Nếu là "activity":
- Phải rõ ràng, giáo viên dùng được ngay
- BẮT BUỘC gồm:

  + Mục tiêu
  + Chuẩn bị (an toàn, không vật nhỏ nguy hiểm)
  + Cách chơi:
      Bước 1
      Bước 2
      Bước 3
  + Mở rộng (nếu có)

- Ưu tiên:
  + Trẻ vận động
  + Trẻ nói ra (ví dụ: "màu đỏ!", "màu xanh!")

👉 Nếu là "other":
- Không đoán
- Trả về:
"Cô chưa hiểu rõ, bạn thử nói về kể chuyện hoặc trò chơi cho bé nhé!"

========================
🔹 NGÔN NGỮ
========================
- Ngắn gọn
- Dễ hiểu
- Không dùng từ phức tạp

========================
🔹 OUTPUT
========================
- JSON sạch
- Không giải thích thêm ngoài JSON
`,
        },

        {
          role: "user",
          content: `
Yêu cầu từ giáo viên: "\${message}"

Trả về JSON:
{
  "type": "story | activity | other",
  "title": "Tiêu đề",
  "content": "Nội dung chi tiết",
  "lesson": "Lời nhắn nhủ đáng yêu"
}
`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.8,
    });
    const resContent = chatCompletion.choices[0]?.message?.content;

    if (!resContent) {
      throw new Error("AI không trả về dữ liệu");
    }

    // Parse thử để đảm bảo JSON chuẩn trước khi gửi về Frontend
    const parsedData = JSON.parse(resContent);
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("LỖI GROQ:", error.message);
    return NextResponse.json(
      { error: "Lỗi xử lý AI", detail: error.message },
      { status: 500 },
    );
  }
}
