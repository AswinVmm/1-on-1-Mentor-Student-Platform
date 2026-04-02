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
        // localStorage.removeItem("token");
        // localStorage.removeItem("role");
        // localStorage.removeItem("userId");
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
        <div>
            <h2>Student Dashboard</h2>
            <button onClick={handleLogout}>Logout</button>

            <br /><br />
            <input
                placeholder="Enter Join Code"
                onChange={(e) => setCode(e.target.value)}
            />

            <button onClick={joinSession}>
                Join Session
            </button>

            <h3>Active Sessions</h3>

            {sessions.length === 0 ? (
                <p>No active sessions</p>
            ) : (
                sessions.map((session, index) => (
                    <div key={index} style={{ marginBottom: "10px" }}>
                        <p><b>{session.title}</b></p>

                        <button
                            onClick={() => joinSessionByCode(session.joinCode)}
                        // onClick={() => router.push(`/session/${session.code}`)}
                        >
                            Join
                        </button>
                    </div>
                ))
            )}

            {/* <button onClick={joinSession}>
                Join Session
            </button> */}
        </div>
    );
}