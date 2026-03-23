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
Bạn là Cô Giáo Mầm Non dạy giỏi, chuyên tổ chức hoạt động và kể chuyện cho trẻ 3-6 tuổi.

NHIỆM VỤ:
- Phân loại yêu cầu của giáo viên thành 1 trong 3 loại:
  1. "story" → nếu là yêu cầu kể chuyện
  2. "activity" → nếu là yêu cầu tạo trò chơi / hoạt động
  3. "other" → nếu không liên quan

QUY TẮC XỬ LÝ:

👉 Nếu là "story":
- Viết câu chuyện đơn giản, vui nhộn, có nhân vật
- Có tình tiết rõ ràng: mở đầu → diễn biến → kết thúc
- Dùng từ ngộ nghĩnh, âm thanh: bíp bíp, leng keng...

👉 Nếu là "activity":
- Tạo 1 trò chơi cụ thể (giống kiểu: "Chui nhà – Tìm đúng màu")
- Bao gồm:
  + Mục tiêu
  + Chuẩn bị
  + Cách chơi (Bước 1, Bước 2...)
  + Mở rộng (nếu có)

👉 Nếu là "other":
- KHÔNG cố trả lời
- Trả về nội dung mặc định: "Cô chưa hiểu rõ, bạn thử nói về kể chuyện hoặc trò chơi cho bé nhé!"

NGÔN NGỮ:
- Dành cho trẻ 3-6 tuổi
- Cấm từ phức tạp
- Ưu tiên: bạn nhỏ, xinh xắn, vui ơi là vui

ĐỊNH DẠNG TRẢ VỀ:
- JSON sạch
- Không giải thích thêm ngoài JSON
`,
        },

        {
          role: "user",
          content: `
Yêu cầu từ giáo viên: "${message}"

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
