"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MentorDashboard() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || role !== "MENTOR") {
            router.push("/login");
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        router.push("/login");
    };

    const createSession = async () => {
        const token = localStorage.getItem("token");

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/sessions/create`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title }),
            }
        );

        const data = await res.json();

        console.log("STATUS:", res.status);
        console.log("DATA:", data);

        if (res.ok) {
            const code = data.code; // ✅ NOW it's defined

            //     // ✅ Optional: mentor joins session too
            //     // await fetch(
            //     //     `${process.env.NEXT_PUBLIC_BASE_URL}/api/sessions/join/${code}`,
            //     //     {
            //     //         method: "POST",
            //     //         headers: {
            //     //             Authorization: `Bearer ${token}`,
            //     //         },
            //     //     }
            //     // );

            setLink(data.joinLink);
            //     // session /
            // ✅ redirect to session page
            router.push(`/session/${code}`);
        } else {
            alert(data.message || "Something went wrong");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Create Session</h2>
                <h2>Mentor Dashboard</h2>

                <input
                    className="w-full border p-2 rounded mb-3"
                    placeholder="Session Title"
                    onChange={(e) => setTitle(e.target.value)}
                />

                <button className="w-full bg-blue-500 text-white p-2 rounded" disabled={!title} onClick={createSession}>
                    Create Session
                </button>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded mb-4"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
            {link && (
                <div>
                    <p>Share this link:</p>
                    <a href={link}>{link}</a>
                </div>
            )}
        </div>
    );
}