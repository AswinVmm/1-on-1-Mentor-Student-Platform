"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        // localStorage.setItem("userId", data.user.id);

        if (token && role) {
            if (role === "MENTOR") {
                router.push("/mentor");
            } else {
                router.push("/student");
            }
        }
    }, []);

    const handleLogin = async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            }
        );

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("userId", data.id);

            if (data.role === "MENTOR") {
                router.push("/mentor");
            } else if (data.role === "STUDENT") {
                router.push("/student");
            }
        } else {
            alert(data.message);
        }
    };

    return (
        // style = {{ padding: "20px" }}
        <div >
            <h2 className="bg-amber-400">Login</h2>

            <input
                placeholder="Email"
                onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                }
            />

            <br /><br />

            <input
                type="password"
                placeholder="Password"
                onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                }
            />

            <br /><br />

            <button onClick={handleLogin}>Login</button>

            <p style={{ marginTop: "15px" }}>
                New user?{" "}
                <span
                    style={{
                        color: "blue",
                        cursor: "pointer",
                        textDecoration: "underline",
                    }}
                    onClick={() => router.push("/signup")}
                >
                    Register here
                </span>
            </p>
        </div>
    );
}