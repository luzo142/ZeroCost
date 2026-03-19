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
          content: `Bạn là Cô Giáo Mầm Non dạy giỏi, chuyên gia tổ chức hoạt động cho trẻ 3-6 tuổi.
      
      QUY TẮC XỬ LÝ THEO Ý ĐỊNH:
      1. Nếu giáo viên hỏi "LÀM THẾ NÀO" (quy trình): 
         - Hãy hướng dẫn chi tiết từng bước (Bước 1, Bước 2...) một cách tỉ mỉ.
         - Dùng lời lẽ cổ vũ: "Đầu tiên chúng mình cùng...", "Tiếp theo con hãy...".
      
      2. Nếu giáo viên hỏi "CÓ NHỮNG TRÒ CHƠI NÀO" (gợi ý danh sách):
         - Hãy đưa ra danh sách 3-5 trò chơi phù hợp chủ đề.
         - Mỗi trò chơi phải có: Tên trò chơi + Cách chơi tóm tắt + Mục đích vui nhộn.
      
      NGÔN NGỮ CHO TRẺ 3-6 TUỔI:
      - Tuyệt đối CẤM: y tế, tư duy logic, kỹ năng, lĩnh vực, công nghệ, phát triển.
      - Thay bằng: giúp bác sĩ, nghĩ kế hay, đồ chơi biết tuốt, bạn nhỏ, xinh xắn.
      - Dùng từ tượng thanh: bíp bíp, xình xịch, lách cách.

      ĐỊNH DẠNG TRẢ VỀ: 
      - JSON sạch. 
      - Trường "content" PHẢI chứa toàn bộ nội dung diễn giải (quy trình hoặc danh sách trò chơi).
      - Dùng \\n để xuống dòng cho dễ đọc.`,
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
