"use client";
import { useParams } from "next/navigation";
import ChatPanel from "../../../../components/ChatPanel";
import CodeEditor from "../../../../components/CodeEditor";
import VideoCall from "../../../../components/VideoCall";
// style = {{ display: "flex", gap: "10px" }}
// className = "h-full w-full"
export default function SessionPage() {
    const { code } = useParams();

    return (
        <div className="h-screen flex bg-gray-100">
            {/* LEFT: Editor */}
            <div className="w-2/3 p-3">
                <div className="h-full rounded-2xl overflow-hidden shadow-lg border bg-white">
                    <CodeEditor sessionId={code} />
                </div>
            </div>
            {/* RIGHT: Video + Chat */}
            <div className="w-1/3 flex flex-col gap-3 p-3">
                <div className="rounded-2xl overflow-hidden shadow-lg border bg-white">
                    <VideoCall sessionId={code} />
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden shadow-lg border bg-white">
                    <ChatPanel sessionId={code} />
                </div>
            </div>
        </div>
    );
}
