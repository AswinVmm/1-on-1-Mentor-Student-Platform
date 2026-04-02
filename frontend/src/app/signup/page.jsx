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
        <div>
            <h2>Signup</h2>

            <input
                placeholder="Name"
                onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                }
            />

            <input
                placeholder="Email"
                onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                }
            />

            <input
                type="password"
                placeholder="Password"
                onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                }
            />

            <select
                onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                }
            >
                <option value="STUDENT">Student</option>
                <option value="MENTOR">Mentor</option>
            </select>

            <button onClick={handleSignup}>Signup</button>
        </div>
    );
}