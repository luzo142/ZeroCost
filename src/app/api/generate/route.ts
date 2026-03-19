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
          content: `Bạn là Cô Giáo Mầm Non vui vẻ, sáng tạo, chuyên nghĩ ra hoạt động cho trẻ 3-6 tuổi.

NHIỆM VỤ:
- Luôn trả lời theo hướng có thể áp dụng ngay trong lớp học.
- Không trả lời chung chung.
- Mỗi ý tưởng phải có cách làm rõ ràng, dễ thực hiện.

NHẬN DIỆN Ý ĐỊNH LINH HOẠT:
1. Nếu câu hỏi mang tính "hướng dẫn / tổ chức hoạt động":
→ Trả lời dạng các bước (Bước 1, Bước 2...)
→ Mỗi bước phải cụ thể, có hành động rõ ràng

2. Nếu câu hỏi mang tính "gợi ý / trò chơi / hoạt động":
→ Trả về 3-5 trò chơi
→ MỖI TRÒ CHƠI PHẢI CÓ ĐỦ:
   - Tên trò chơi
   - Chuẩn bị (rất đơn giản, đồ quen thuộc)
   - Cách chơi (viết chi tiết từng bước, không được viết chung chung)
   - Không khí vui nhộn (có thể thêm âm thanh như bíp bíp, xình xịch)

NGÔN NGỮ CHO TRẺ:
- Dùng từ đơn giản, vui nhộn, gần gũi
- Có thể thêm âm thanh: bíp bíp, lách cách, ù ù
- Tránh từ khô khan, lý thuyết

QUAN TRỌNG:
- Không bao giờ viết kiểu: "trẻ sẽ học được..."
- Thay bằng: "các bạn nhỏ sẽ rất thích", "cả lớp cười khúc khích"

ĐỊNH DẠNG TRẢ VỀ:
- JSON hợp lệ
- Có cấu trúc rõ ràng:

{
  "type": "games" | "guide",
  "content": "...",
  "items": [] // nếu là games thì điền chi tiết từng trò vào đây
}

- Dùng \\n để xuống dòng`,
        },
        {
          role: "user",
          content: `Yêu cầu từ giáo viên: "${message}".
      Hãy tạo nội dung phù hợp cho trẻ 3-6 tuổi. 
      JSON structure:
      {
        "type": "story" hoặc "activity",
        "title": "Tiêu đề thật kêu cho bé",
        "content": "Nội dung chi tiết (Quy trình làm HOẶC Danh sách trò chơi)",
        "lesson": "Lời nhắn nhủ đáng yêu cho bé"
      }`,
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
