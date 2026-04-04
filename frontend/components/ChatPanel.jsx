"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function ChatPanel({ sessionId }) {
    const [myId, setMyId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [socket, setSocket] = useState(null);
    // const myId = typeof window !== "undefined"
    //     ? localStorage.getItem("userId")
    //     : null;

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
            // newSocket.off("chat-history");
            // newSocket.off("receive-message");
            // newSocket.off("system-message");
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
    //     style = {{ width: "300px", borderLeft: "1px solid #ccc" }
    // }
    return (
        <div className="flex flex-col h-full ">
            <div className="flex-1 overflow-y-auto">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${String(msg.senderId) === String(myId)
                        // ? "text-right"
                        // : "text-left"
                        ? "justify-end"
                        : "justify-start"
                        }`}>
                        <div
                            className={`px-3 py-2 rounded-lg max-w-[70%] ${String(msg.senderId) === String(myId)
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-black"
                                }`}
                        >
                            {msg.content}
                            <div className="text-[10px] opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                        {/* <span className="bg-gray-200 px-2 py-1 rounded">
                            {msg.content}
                        </span> */}
                        {/* <b>{msg.senderId || "System"}:</b> {msg.content} */}
                        {/* <div style={{ fontSize: "10px" }}>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                        </div> */}
                    </div>
                ))}
            </div>

            {/* <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type message..."
            />
            <button onClick={sendMessage}>Send</button> */}
            <div className="flex">
                <input className="flex-1 border p-2" value={input}
                    onChange={(e) => setInput(e.target.value)} />
                <button className="bg-blue-500 text-white px-4" onClick={sendMessage}>
                    Send
                </button>
            </div>
        </div>
    );
}