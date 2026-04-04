"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function ChatPanel({ sessionId }) {
    const [myId, setMyId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        setMyId(userId);

        const newSocket = io(process.env.NEXT_PUBLIC_BASE_URL, {
            auth: { token },
        });

        setSocket(newSocket);

        newSocket.emit("join-room", sessionId);

        newSocket.on("chat-history", (msgs) => {
            setMessages(msgs);
        });

        newSocket.on("receive-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        newSocket.on("system-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [sessionId]);

    const sendMessage = () => {
        if (!input.trim() || !socket) return;

        socket.emit("send-message", {
            sessionId,
            content: input,
        });

        setInput("");
    };

    return (
        <div className="flex flex-col h-full ">
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${String(msg.senderId) === String(myId)

                        ? "justify-end"
                        : "justify-start"
                        }`}>
                        <div
                            className={`px-3 py-2 rounded-xl max-w-[70%] shadow ${String(msg.senderId) === String(myId)
                                ? "bg-blue-500 text-white"
                                : "bg-white"
                                }`}
                        >
                            <div>{msg.content}</div>
                            <div className="text-[10px] opacity-60 text-right mt-1">
                                {msg.createdAt
                                    ? new Date(msg.createdAt).toLocaleTimeString() : ""}
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            <div className="flex border-t">
                <input className="flex-1 p-2 outline-none" value={input}
                    onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." />
                <button className="bg-blue-500 text-white px-4" onClick={sendMessage}>
                    Send
                </button>
            </div>
        </div>
    );
}