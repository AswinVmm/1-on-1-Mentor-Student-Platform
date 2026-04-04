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
        <div className="relative h-[300px] bg-black">
            {/* Remote video (BIG) */}
            <h3>Video Call</h3>

            <video
                ref={remoteVideo}
                autoPlay
                playsInline
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

                <button onClick={toggleMic}>Mic
                    {micOn ? "Mute Mic" : "Unmute Mic"}
                </button>
                <button onClick={toggleCam}>Camera
                    {camOn ? "Turn Off Cam" : "Turn On Cam"}
                </button>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => {

                        socketRef.current?.emit("end-call", sessionId);
                        window.location.href = "/";
                    }}
                >
                    End Call
                </button>
            </div>
        </div>
    );
}