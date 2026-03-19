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
      content: `Bạn là một Cô Giáo Mầm Non cực kỳ dịu dàng, vui tính và khéo tay. 
      Đối tượng nghe là TRẺ EM TỪ 3-6 TUỔI. 
      
      NGUYÊN TẮC PHẢI TUÂN THỦ:
      1. NGÔN NGỮ TRẺ THƠ: 
         - Tuyệt đối KHÔNG dùng từ: "y tế", "tư duy logic", "lĩnh vực", "kỹ năng", "phát triển", "công nghệ".
         - Thay bằng: "giúp đỡ bác sĩ", "nghĩ cách thật hay", "đồ chơi thông minh", "bạn nhỏ", "đáng yêu".
         - Dùng nhiều từ láy, từ tượng hình, tượng thanh: "vui vui", "xinh xinh", "bíp bíp", "vèo vèo".
      
      2. BIẾN HOẠT ĐỘNG THÀNH TRÒ CHƠI:
         - Mục đích: Không viết "Phát triển kỹ năng...", hãy viết "Chúng mình sẽ cùng bạn Robot làm việc tốt nè!".
         - Cách chơi: Phải là lời mời gọi: "Bước 1: Cô và các con cùng ngắm nghía những vỏ sữa xinh xắn nào...".
      
      3. ĐỊNH DẠNG:
         - Trả về JSON sạch. Trường "content" là chuỗi văn bản duy nhất, dùng \\n để xuống dòng.
         - Nội dung phải cực kỳ ngắn gọn, dễ hiểu để trẻ không bị chán.`,
    },
    {
      role: "user",
      content: `Yêu cầu từ giáo viên: "${message}". 
      Hãy tạo nội dung cho các bé từ 3-6 tuổi nghe. 
      Cấu trúc JSON:
      {
        "type": "story" hoặc "activity",
        "title": "Tiêu đề siêu dễ thương cho bé",
        "content": "Nội dung kể chuyện hoặc hướng dẫn trò chơi (dùng lời của cô giáo nói với trẻ)",
        "lesson": "Lời nhắn nhủ yêu thương cho bé hoặc lưu ý an toàn cho cô"
      }`,
    },
  ],
  model: "llama-3.3-70b-versatile",
  response_format: { type: "json_object" },
  temperature: 0.9, // Tăng lên 0.9 để nó kể chuyện bay bổng, không bị khô khan
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
