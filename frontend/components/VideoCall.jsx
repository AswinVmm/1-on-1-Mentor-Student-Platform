"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// const socket = io(process.env.BASE_URL);
// const socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
//     auth: {
//         token: localStorage.getItem("token"),
//     },
// });

export default function VideoCall({ sessionId }) {
    const localVideo = useRef();
    const remoteVideo = useRef();
    const peerConnection = useRef();

    const [stream, setStream] = useState(null);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    const videoRef = useRef(null);

    useEffect(() => {
        // let newSocket;
        const init = async () => {
            await startMedia();
            const token = localStorage.getItem("token");

            const newSocket = io(process.env.NEXT_PUBLIC_BASE_URL, {
                auth: { token },
            });

            // setSocket(newSocket);
            socketRef.current = newSocket;


            newSocket.emit("join-session", sessionId);

            newSocket.on("call-ended", () => {
                alert("Call ended");
                window.location.href = "/";
            });

            newSocket.on("offer", async (offer) => {
                await createPeer();
                await peerConnection.current.setRemoteDescription(offer);

                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);

                socketRef.current.emit("answer", { sessionId, answer });
            });

            newSocket.on("answer", async (answer) => {
                await peerConnection.current.setRemoteDescription(answer);
            });

            newSocket.on("ice-candidate", async (candidate) => {
                if (candidate) {
                    await peerConnection.current.addIceCandidate(candidate);
                }
            });
        };

        init();

        return () => socketRef.current?.disconnect();
    }, [sessionId]);

    const startMedia = async () => {
        try {
            const media = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            setStream(media);

            if (localVideo.current) {
                localVideo.current.srcObject = media;
            }
        } catch (err) {
            console.error("Camera error:", err);
        }
    };

    // 🔥 Create peer connection
    const createPeer = async () => {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ],
        });

        stream.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, stream);
        });

        peerConnection.current.ontrack = (event) => {
            remoteVideo.current.srcObject = event.streams[0];
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit("ice-candidate", {
                    sessionId,
                    candidate: event.candidate,
                });
            }
        };
    };
    // send offer
    // 📞 Start Call (Caller)
    const startCall = async () => {
        await createPeer();

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socketRef.current.emit("offer", { sessionId, offer });
    };

    // 🎤 Toggle Mic
    const toggleMic = () => {
        stream.getAudioTracks()[0].enabled = !micOn;
        setMicOn(!micOn);
    };

    // 📷 Toggle Camera
    const toggleCam = () => {
        stream.getVideoTracks()[0].enabled = !camOn;
        setCamOn(!camOn);
    };

    return (
        <div className="relative h-[300px] bg-black">
            {/* Remote video (BIG) */}
            <h3>Video Call</h3>
            {/* 
            <video ref={localVideo} autoPlay muted width="200" />
            <video ref={remoteVideo} autoPlay width="200" /> */}
            <video
                ref={remoteVideo}
                autoPlay
                className="w-full h-full object-cover"
            />

            {/* Local video (SMALL corner) */}
            <video
                ref={localVideo}
                autoPlay
                muted
                className="w-40 h-32 absolute bottom-2 right-2 border-2"
            />
            <div>
                <button onClick={startCall}>Start Call</button>
                <button onClick={toggleMic}>Mic
                    {micOn ? "Mute Mic" : "Unmute Mic"}
                </button>
                <button onClick={toggleCam}>Camera
                    {camOn ? "Turn Off Cam" : "Turn On Cam"}
                </button>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                        socket.emit("end-call", sessionId);
                        window.location.href = "/";
                    }}
                >
                    End Call
                </button>
            </div>
        </div>
    );
}