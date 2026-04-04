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
            localStorage.setItem("userId", data.userId);

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
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-[350px]">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

                <input
                    className="w-full border p-2 mb-4 rounded"
                    placeholder="Email"
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />

                {/* <br /><br /> */}

                <input
                    type="password"
                    className="w-full border p-2 mb-4 rounded"
                    placeholder="Password"
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                {/* <br /><br /> */}

                <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>

                <p className="text-sm text-center mt-4">
                    New user?{" "}
                    <span
                        className="text-blue-500 cursor-pointer underline"
                        onClick={() => router.push("/signup")}
                    >
                        Register
                    </span>
                </p>
            </div>
        </div>
    );
}