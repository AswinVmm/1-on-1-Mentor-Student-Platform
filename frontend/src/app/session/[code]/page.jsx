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
        <div className="flex">
            <div className="w-2/3">
                <CodeEditor sessionId={code} />
            </div>
            <div className="w-1/3">
                <VideoCall sessionId={code} />
                <ChatPanel sessionId={code} />
            </div>
        </div>
    );
}
