import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Typography, message, Card } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { BotMessageSquare, User } from "lucide-react";
import axios from "axios";

const { Title } = Typography;

export default function Assistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hai ! Aku Gak Tau Siapa.\nTanyakan aja sesuatu seperti:\n“Berapa total eCert In hari ini?”",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const typeEffect = (text, callback) => {
    setTyping(true);
    let index = 0;
    const tempText = "";
    const interval = setInterval(() => {
      if (index < text.length) {
        const partial = text.slice(0, index + 1);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].text = partial;
          return updated;
        });
        index++;
      } else {
        clearInterval(interval);
        setTyping(false);
        callback && callback();
      }
    }, 25);
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      message.warning("Silakan ketik pertanyaan terlebih dahulu.");
      return;
    }

    const newMsg = { sender: "user", text: question };
    setMessages((prev) => [...prev, newMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.get(`${import.meta.env.VITE_ESPS_BE}/assistant`, {
        params: { q: question },
        headers: { Authorization: `Bearer ${token}` },
      });

      const answer =
        res.data?.status && res.data?.data?.answer
          ? res.data.data.answer
          : "Maaf, saya tidak memahami pertanyaan itu 💬.";

      setMessages((prev) => [...prev, { sender: "bot", text: "" }]);

      typeEffect(answer);
    } catch (error) {
      console.error(error);
      message.error("Gagal memproses pertanyaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="flex justify-center items-center mt-2">
        <Card
          className="shadow-lg w-full max-w-lg flex flex-col"
          style={{
            borderRadius: 16,
            height: "auto",
          }}
        >
          {/* Header */}
          <div className="flex items-center mb-3 border-b pb-2">
            <BotMessageSquare size={28} className="text-blue-500 mr-2" />
            <Title level={4} style={{ margin: 0 }}>
              Assistant
            </Title>
          </div>

          {/* Chat area */}
          <div
            className="flex-1 overflow-y-auto px-2 py-3 space-y-3"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="mr-2 mt-auto">
                    <BotMessageSquare
                      size={22}
                      className="text-blue-500 bg-blue-100 p-1 rounded-full"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === "user" && (
                  <div className="ml-2 mt-auto">
                    <User
                      size={22}
                      className="text-gray-600 bg-gray-200 p-1 rounded-full"
                    />
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="flex items-center space-x-2 ml-8">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex items-center mt-3 gap-2">
            <Input
              placeholder="Ketik pertanyaan kamu..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onPressEnter={handleAsk}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={loading}
              onClick={handleAsk}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
