"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { io } from "socket.io-client";

export default function CodeEditor({ sessionId }) {
    const [code, setCode] = useState("// Start coding...");
    const [language, setLanguage] = useState("javascript");
    const [socket, setSocket] = useState(null);
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const lastUpdateRef = useRef(0);

    useEffect(() => {
        if (!containerRef.current) return;
        let editor;

        const init = async () => {
            const { MonacoBinding } = await import("y-monaco");

            const ydoc = new Y.Doc();
            const provider = new WebsocketProvider(
                "ws://localhost:1234",
                sessionId,
                ydoc
            );

            const yText = ydoc.getText("monaco");
            editor = editorRef.current;
            if (!editor) return;

            new MonacoBinding(
                yText,
                editor.getModel(),
                new Set([editor]),
                provider.awareness
            );
        };

        init();

        return () => editor?.dispose();


    }, [sessionId]);

    useEffect(() => {

        const token = localStorage.getItem("token");

        const newSocket = io(process.env.NEXT_PUBLIC_BASE_URL, {
            auth: { token },
        });

        setSocket(newSocket);

        newSocket.emit("join-room", sessionId);

        newSocket.on("code-update", (newCode) => {
            setCode(newCode);
        });

        return () => {
            newSocket.off("code-update");
        };
    }, [sessionId]);

    const handleChange = (value) => {
        const now = Date.now();

        if (now - lastUpdateRef.current < 200) return; // throttle 200ms

        lastUpdateRef.current = now;
        if (!socket) return;
        setCode(value);
        socket.emit("code-change", {
            sessionId,
            code: value,
        });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-2 border-b bg-gray-50">
                <select className="border p-1 rounded" onChange={(e) => setLanguage(e.target.value)}>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                </select>
            </div>

            <Editor
                onMount={(editor) => (editorRef.current = editor)}
                className="flex-1"
                language={language}
                value={code}
                onChange={handleChange}
            />
        </div>
    );
}