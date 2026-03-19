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
          content:
            "Bạn là chuyên gia giáo dục mầm non. Trả về DUY NHẤT định dạng JSON chuẩn không kèm văn bản thừa.",
        },
        {
          role: "user",
          content: `Tạo một nội dung giáo dục dựa trên yêu cầu: "${message}". 
          Cấu trúc JSON bắt buộc:
          {
            "type": "story" hoặc "activity",
            "title": "Tiêu đề",
            "content": "Nội dung chi tiết",
            "lesson": "Bài học hoặc lưu ý"
          }`,
        },
      ],
      // Llama 3.3 70B cực mạnh, ngang ngửa Gemini Pro/GPT-4
      model: "llama-3.3-70b-versatile",
      // Ép kiểu JSON cực chuẩn
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const resContent = chatCompletion.choices[0]?.message?.content;

    if (!resContent) {
      throw new Error("AI không trả về dữ liệu");
    }

    return NextResponse.json(JSON.parse(resContent));
  } catch (error: any) {
    console.error("LỖI GROQ:", error.message);
    return NextResponse.json(
      { error: "Lỗi kết nối Groq", detail: error.message },
      { status: 500 },
    );
  }
}
