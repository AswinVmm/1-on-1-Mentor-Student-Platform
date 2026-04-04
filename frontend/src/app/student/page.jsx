"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
    const [code, setCode] = useState("");
    const [sessions, setSessions] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchSessions = async () => {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/sessions/active`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            setSessions(data);
        };

        fetchSessions();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    const joinSession = async () => {
        const token = localStorage.getItem("token");

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/sessions/join/${code}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (res.ok) {
            router.push(`/session/${code}`);
        } else {
            const data = await res.json();
            alert(data.message);
        }
    };

    const joinSessionByCode = async (code) => {
        const token = localStorage.getItem("token");

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/sessions/join/${code}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (res.ok) {
            router.push(`/session/${code}`);
        } else {
            const data = await res.json();
            alert(data.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Student Dashboard</h2>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-1 rounded">
                        Logout
                    </button>
                </div>
                {/* <div className="flex gap-2 mb-6">
                    <input
                        className="flex-1 border p-2 rounded"
                        placeholder="Enter Join Code"
                        onChange={(e) => setCode(e.target.value)}
                    />

                    <button onClick={joinSession} className="bg-blue-500 text-white px-4 rounded">
                        Join
                    </button>
                </div> */}
                <h3 className="font-semibold mb-3">Active Sessions</h3>

                {sessions.length === 0 ? (
                    <p className="text-gray-500">No active sessions</p>
                ) : (
                    sessions.map((session, index) => (
                        <div key={index} className="flex justify-between items-center border p-3 rounded mb-2">
                            <p className="font-medium"><b>{session.title}</b></p>

                            <button
                                onClick={() => joinSessionByCode(session.joinCode)}
                                className="bg-green-500 text-white px-3 py-1 rounded"
                            >
                                Join
                            </button>
                        </div>
                    ))
                )}

            </div>
        </div>
    );
}