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
          content: `Bạn là chuyên gia giáo dục mầm non xuất sắc, am hiểu tâm lý trẻ em từ 2-6 tuổi.
          Nhiệm vụ của bạn là tạo ra nội dung chất lượng cao theo yêu cầu của giáo viên.

          QUY TẮC NỘI DUNG:
          1. Nếu yêu cầu là viết TRUYỆN:
             - Ngôn ngữ: Trong sáng, giàu hình ảnh, dùng nhiều từ láy, từ tượng hình.
             - Cấu trúc: Có mở đầu, diễn biến (có cao trào nhẹ), kết thúc có hậu. Có lời thoại nhân vật sinh động.
          
          2. Nếu yêu cầu là TRÒ CHƠI/HOẠT ĐỘNG:
             - Phải đầy đủ: Mục đích (phát triển kỹ năng gì), Chuẩn bị (đồ dùng), Cách chơi (hướng dẫn từng bước 1, 2, 3), và Lưu ý an toàn.
             - Trò chơi phải mang tính tương tác cao, vui nhộn.

          QUY TẮC ĐỊNH DẠNG (BẮT BUỘC):
          - Luôn trả về JSON sạch.
          - Trường "content" PHẢI là chuỗi (string), sử dụng xuống dòng (\\n) để trình bày. KHÔNG TRẢ VỀ OBJECT CON.`,
        },
        {
          role: "user",
          content: `Dựa trên yêu cầu: "${message}", hãy tạo nội dung phù hợp.
          Cấu trúc JSON:
          {
            "type": "story" hoặc "activity",
            "title": "Tiêu đề thật hay và lôi cuốn",
            "content": "Nội dung truyện hoặc Hướng dẫn trò chơi chi tiết từng bước",
            "lesson": "Bài học rút ra cho bé hoặc Lưu ý quan trọng cho giáo viên"
          }`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.8, // Tăng độ sáng tạo lên một chút cho truyện hay hơn
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
