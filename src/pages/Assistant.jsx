import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Typography, message, Card, Popconfirm } from "antd";
import { SendOutlined, DeleteOutlined } from "@ant-design/icons";
import { BotMessageSquare, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FcFaq } from "react-icons/fc";

const { Title } = Typography;

export default function Assistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hai! Aku Gak Tau Siapa,\nTanyakan aja sesuatu seperti:\n“Berapa total eCert In hari ini?”",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [progress, setProgress] = useState(0);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const typeEffect = (text, callback) => {
    setTyping(true);
    let index = 0;
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
        if (navigator.vibrate) navigator.vibrate(50);
        callback && callback();
      }
    }, 60);
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
    setThinking(true);
    setProgress(0);

    let progressValue = 0;
    const progressInterval = setInterval(() => {
      progressValue += 2;
      setProgress(progressValue);
      if (progressValue >= 100) clearInterval(progressInterval);
    }, 60);

    try {
      await new Promise((resolve) => setTimeout(resolve, 4000));
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(error);
      message.error("Gagal memproses pertanyaan.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: "bot",
        text: "Hai! Aku Gak Tau Siapa,\nTanyakan aja sesuatu seperti:\n“Berapa total eCert In hari ini?”",
      },
    ]);
    message.success("Percakapan telah dihapus 🧹");
  };

  return (
    <div className="flex flex-col items-center w-full h-full p-4">
      <Card className="w-full max-w-3xl shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
          <FcFaq size={24} className="text-blue-500 mr-2" />
          <Title level={4} style={{ margin: 0 }}>
            Assistant ESPS
          </Title>
          <Popconfirm
            title="Hapus semua percakapan?"
            okText="Ya"
            cancelText="Batal"
            onConfirm={handleClearChat}
            placement="bottom"
          >
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: "red" }} />}
              title="Clear chat"
            />
          </Popconfirm>
        </div>

        {/* Bar pelangi AI */}
        {thinking && (
          <div className="absolute bottom-0 left-0 w-full h-[3px] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-blue-500 to-green-500 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Chat area */}
        <div className="space-y-3 h-[60vh] overflow-y-auto mb-4 p-4">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-2 ${
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
                  dangerouslySetInnerHTML={{
                    __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>"),
                  }}
                />

                {msg.sender === "user" && (
                  <div className="ml-2 mt-auto">
                    <User
                      size={22}
                      className="text-gray-600 bg-gray-200 p-1 rounded-full"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

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
  );
}
