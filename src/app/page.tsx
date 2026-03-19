"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  Volume2,
  AlertCircle,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hàm quan trọng: Xử lý nội dung dù AI có trả về Object hay String
  const renderContent = (content: any) => {
    if (typeof content === "string") {
      return (
        <p className="whitespace-pre-line text-slate-700 leading-relaxed">
          {content}
        </p>
      );
    }
    if (typeof content === "object" && content !== null) {
      return (
        <div className="space-y-3">
          {Object.entries(content).map(([key, value]: [string, any]) => (
            <div
              key={key}
              className="bg-slate-50 p-3 rounded-lg border border-slate-100"
            >
              <span className="text-xs font-bold uppercase text-blue-500 block mb-1">
                {key}
              </span>
              <div className="text-slate-700 text-sm">
                {typeof value === "object" ? JSON.stringify(value) : value}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Có lỗi xảy ra rồi cô ơi!",
            isError: true,
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data }]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Không kết nối được server ạ!",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTTS = async (content: any) => {
    // Chuyển nội dung thành chữ để đọc
    const textToRead =
      typeof content === "string" ? content : Object.values(content).join(". ");

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToRead }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (e) {
      console.error("Lỗi âm thanh:", e);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-linear-to-b from-blue-50 to-white text-slate-900 font-sans">
      {/* Header */}
      <header className="p-4 text-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold flex items-center justify-center gap-2 text-blue-600">
          <Sparkles className="text-amber-400" />
          🧸 Trợ Lý Giáo Viên Mầm Non
        </h1>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 max-w-3xl mx-auto w-full text-xl">
        {messages.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p>
              Chào cô! Cô muốn em viết truyện hay gợi ý hoạt động gì cho các bé
              ạ?
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-in fade-in slide-in-from-bottom-2"}`}
          >
            <Card
              className={`p-4 max-w-[85%] rounded-2xl shadow-md border-none ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : msg.isError
                    ? "bg-red-50 text-red-700 border border-red-100"
                    : "bg-white rounded-tl-none ring-1 ring-slate-100"
              }`}
            >
              {msg.role === "assistant" &&
              typeof msg.content === "object" &&
              !msg.isError ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="font-extrabold text-lg text-blue-800 tracking-tight">
                      {msg.content.title}
                    </h2>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">
                      {msg.content.type}
                    </span>
                  </div>

                  {/* Render nội dung chính */}
                  {renderContent(
                    msg.content.content ||
                      msg.content.story ||
                      msg.content.description ||
                      msg.content,
                  )}

                  {msg.content.lesson && (
                    <div className="bg-amber-50 p-3 rounded-xl border-l-4 border-amber-400 text-sm italic shadow-inner">
                      <span className="font-bold text-amber-700 not-italic">
                        📌 Bài học:
                      </span>{" "}
                      {msg.content.lesson}
                    </div>
                  )}

                  {/* <Button
                    size="sm"
                    variant="secondary"
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                    onClick={() =>
                      handleTTS(
                        msg.content.content || msg.content.story || msg.content,
                      )
                    }
                  >
                    <Volume2 size={16} className="mr-2" /> Nghe cô kể chuyện
                  </Button> */}
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  {msg.isError && (
                    <AlertCircle size={18} className="shrink-0 mt-1" />
                  )}
                  <p className="whitespace-pre-line leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              )}
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/50 backdrop-blur p-3 rounded-2xl flex items-center gap-3 text-slate-500 text-sm italic">
              <Loader2 className="animate-spin text-blue-500" size={18} />
              Đang vắt óc suy nghĩ...
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </main>

      {/* Input Area */}
      <footer className="p-4 border-t bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex gap-2 max-w-3xl mx-auto items-center">
          <Input
            placeholder="Cô muốn viết truyện gì...?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="rounded-full bg-slate-100 border-none focus-visible:ring-2 focus-visible:ring-blue-400 h-12 px-6"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-full h-12 w-12 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg transition-all active:scale-95"
          >
            <Send size={20} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
