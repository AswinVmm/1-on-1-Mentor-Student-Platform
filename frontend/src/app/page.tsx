import Image from "next/image";
import Login from "./login/page.jsx";
import { redirect } from "next/navigation";
// style = {{ display: "flex", gap: "10px" }}
// className = "h-full w-full"
export default function Home() {
  return redirect("/login");
}
