"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
    });

    const handleSignup = async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/register`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            }
        );

        const data = await res.json();

        if (res.ok) {
            alert("Signup successful. Please login.");
            router.push("/login");
        } else {
            alert(data.error || data.message);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-[350px]">
                <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

                <input
                    className="w-full border p-2 mb-3 rounded"
                    placeholder="Name"
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                />

                <input
                    className="w-full border p-2 mb-3 rounded"
                    placeholder="Email"
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />

                <input
                    type="password"
                    className="w-full border p-2 mb-3 rounded"
                    placeholder="Password"
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <select
                    className="w-full border p-2 mb-4 rounded"
                    onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                    }
                >
                    <option value="STUDENT">Student</option>
                    <option value="MENTOR">Mentor</option>
                </select>

                <button onClick={handleSignup} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Signup</button>
            </div>
        </div>
    );
}