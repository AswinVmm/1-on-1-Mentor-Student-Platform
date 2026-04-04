"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function VideoCall({ sessionId }) {
    const localVideo = useRef();
    const remoteVideo = useRef();
    const peerConnection = useRef();
    const iceQueue = useRef([]);
    const socketRef = useRef();
    const isCaller = useRef(false);

    const [stream, setStream] = useState(null);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [socket, setSocket] = useState(null);


    const videoRef = useRef(null);

    useEffect(() => {

        const init = async () => {
            // Get Media();
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setStream(stream);

            localVideo.current.srcObject = stream;

            const token = localStorage.getItem("token");
            // 🔌 Socket
            const socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
                auth: {
                    token: localStorage.getItem("token"),
                },
            });
            socketRef.current = socket;

            socket.emit("join-room", sessionId);

            socket.on("call-ended", () => {
                alert("Call ended");
                window.location.href = "/";
            });
            // 🔥 Create peer connection
            const createPeer = () => {
                const peer = new RTCPeerConnection({
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" }
                    ],
                });

                stream.getTracks().forEach((track) => {
                    peer.addTrack(track, stream);
                });

                peer.ontrack = (event) => {

                    remoteVideo.current.srcObject = event.streams[0];

                };
                // ICE
                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("ice-candidate", {
                            roomId: sessionId,
                            candidate: event.candidate,
                        });
                    }
                };
                return peer;
            };
            // 🟢 When both users joined
            socket.on("start-call", async () => {
                if (!isCaller.current) return;
                peerConnection.current = createPeer();

                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);

                socket.emit("offer", {
                    roomId: sessionId,
                    offer,
                });
            });

            // 📩 Receive offer
            socket.on("offer", async (offer) => {
                console.log("Received offer");
                peerConnection.current = createPeer();

                await peerConnection.current.setRemoteDescription(offer);
                iceQueue.current.forEach(async (c) => {
                    await peerConnection.current.addIceCandidate(c);
                });
                iceQueue.current = [];
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);

                socket.emit("answer", {
                    roomId: sessionId,
                    answer,
                });
            });

            // 📩 Receive answer
            socket.on("answer", async (answer) => {
                console.log("Received answer");
                await peerConnection.current.setRemoteDescription(answer);
                iceQueue.current.forEach(async (c) => {
                    await peerConnection.current.addIceCandidate(c);
                });
                iceQueue.current = [];
            });

            // 📩 ICE
            socket.on("ice-candidate", async (candidate) => {
                console.log("ICE received");
                if (!peerConnection.current) return;

                if (peerConnection.current.remoteDescription) {
                    await peerConnection.current.addIceCandidate(candidate);
                } else {
                    iceQueue.current.push(candidate);
                }
            });

            socket.on("init", ({ isCaller: caller }) => {
                isCaller.current = caller;
                console.log("ROLE:", isCaller.current);
            });

        };

        init();

        return () => socketRef.current?.disconnect();
    }, [sessionId]);

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
        <div className="relative bg-black rounded-xl overflow-hidden">
            {/* Remote video (BIG) */}
            <video
                ref={remoteVideo}
                autoPlay
                playsInline
                className="w-full h-[250px] object-cover"
            />

            {/* Local video (SMALL corner) */}
            <video
                ref={localVideo}
                autoPlay
                muted
                className="w-32 h-24 absolute bottom-3 right-3 border-2 rounded-lg"
            />
            <div className="flex justify-center gap-3 p-3 bg-gray-900">

                <button onClick={toggleMic} className="bg-gray-700 text-white px-3 py-1 rounded">Mic
                    {micOn ? "Mute" : "Unmute"}
                </button>
                <button onClick={toggleCam} className="bg-gray-700 text-white px-3 py-1 rounded">Camera
                    {camOn ? "Camera Off" : "Camera On"}
                </button>
                <button
                    className="bg-red-600 text-white px-4 py-1 rounded"
                    onClick={() => {

                        socketRef.current?.emit("end-call", sessionId);
                        window.location.href = "/";
                    }}
                >
                    End
                </button>
            </div>
        </div>
    );
}